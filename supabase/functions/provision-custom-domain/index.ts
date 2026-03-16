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

    const bodyText = await req.text();
    console.log('Request body:', bodyText);

    if (!bodyText || bodyText.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Empty request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let domain: string, site_id: string, action: string;
    try {
      const parsed = JSON.parse(bodyText);
      domain = parsed.domain;
      site_id = parsed.site_id;
      action = parsed.action || 'add';
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Parsed values:', { domain, site_id, action });

    if (!domain || !site_id) {
      return new Response(JSON.stringify({ error: "Missing domain or site_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();

    const VERCEL_API_TOKEN = Deno.env.get("VERCEL_API_TOKEN")!;
    const VERCEL_PROJECT_ID = Deno.env.get("VERCEL_PROJECT_ID")!;

    if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
      return new Response(JSON.stringify({ error: "Vercel credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vercelHeaders = {
      "Authorization": `Bearer ${VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
    };

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Remove custom domain
    if (action === 'remove') {
      const removeRes = await fetch(
        `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${cleanDomain}`,
        { method: "DELETE", headers: vercelHeaders }
      );

      console.log('Vercel remove response:', removeRes.status);

      await serviceClient
        .from("sites")
        .update({ custom_domain: null })
        .eq("id", site_id)
        .eq("user_id", user.id);

      return new Response(JSON.stringify({ success: true, removed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add custom domain to Vercel
    const vercelRes = await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`,
      {
        method: "POST",
        headers: vercelHeaders,
        body: JSON.stringify({ name: cleanDomain }),
      }
    );

    const vercelText = await vercelRes.text();
    console.log('Vercel response:', vercelRes.status, vercelText);

    let vercelData: any;
    try {
      vercelData = JSON.parse(vercelText);
    } catch {
      throw new Error(`Vercel returned invalid response: ${vercelText}`);
    }

    if (!vercelRes.ok) {
      // Domain already exists on project — that's fine
      if (vercelData?.error?.code !== 'domain_already_in_use') {
        return new Response(
          JSON.stringify({ error: vercelData?.error?.message || "Vercel error" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Save to database
    await serviceClient
      .from("sites")
      .update({
        custom_domain: cleanDomain,
        domain_payment_status: "paid",
      })
      .eq("id", site_id)
      .eq("user_id", user.id);

    // Get DNS configuration instructions from Vercel
    const verification = vercelData?.verification || [];
    const apexVerification = verification.find((v: any) => v.type === 'TXT');

    return new Response(
      JSON.stringify({
        success: true,
        hostname: cleanDomain,
        verified: vercelData?.verified || false,
        dns_instructions: {
          cname: {
            type: 'CNAME',
            name: '@',
            value: 'cname.vercel-dns.com',
          },
          verification: apexVerification || null,
        },
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
