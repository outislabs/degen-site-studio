import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { domain, site_id, action } = await req.json();

    if (!domain || !site_id) {
      return new Response(JSON.stringify({ error: "Missing domain or site_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean domain
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();

    const CLOUDFLARE_ZONE_ID = Deno.env.get("CLOUDFLARE_ZONE_ID")!;
    const CLOUDFLARE_API_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN")!;

    const cfHeaders = {
      "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    };

    // Remove custom domain
    if (action === 'remove') {
      // Find the hostname ID first
      const listRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${cleanDomain}`,
        { headers: cfHeaders }
      );
      const listData = await listRes.json();
      const hostnameId = listData.result?.[0]?.id;

      if (hostnameId) {
        await fetch(
          `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`,
          { method: "DELETE", headers: cfHeaders }
        );
      }

      // Update site in database
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await serviceClient
        .from("sites")
        .update({ custom_domain: null })
        .eq("id", site_id)
        .eq("user_id", user.id);

      return new Response(JSON.stringify({ success: true, removed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add custom domain
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`,
      {
        method: "POST",
        headers: cfHeaders,
        body: JSON.stringify({
          hostname: cleanDomain,
          ssl: {
            method: "http",
            type: "dv",
            settings: {
              http2: "on",
              min_tls_version: "1.2",
            },
          },
        }),
      }
    );

    const cfData = await cfRes.json();
    console.log("Cloudflare response:", JSON.stringify(cfData));

    if (!cfRes.ok && cfData.errors?.[0]?.code !== 1406) {
      // 1406 = hostname already exists, that's fine
      return new Response(
        JSON.stringify({ error: cfData.errors?.[0]?.message || "Cloudflare error" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Save to database
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient
      .from("sites")
      .update({
        custom_domain: cleanDomain,
        domain_payment_status: "paid",
      })
      .eq("id", site_id)
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        hostname: cleanDomain,
        status: cfData.result?.status || "pending",
        ownership_verification: cfData.result?.ownership_verification,
        ssl_verification: cfData.result?.ssl?.validation_records,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("provision-custom-domain error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
