import { createClient } from "npm:@supabase/supabase-js@2";

export interface ApiKeyRecord {
  id: string;
  user_id: string;
  requests_per_minute: number;
  requests_per_day: number;
}

export async function hashKey(key: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function validateApiKey(
  rawKey: string,
  svc: ReturnType<typeof createClient>,
): Promise<ApiKeyRecord | null> {
  const hash = await hashKey(rawKey);
  const { data } = await svc
    .from("api_keys")
    .select("id, user_id, requests_per_minute, requests_per_day")
    .eq("key_hash", hash)
    .eq("is_active", true)
    .single();
  return data ?? null;
}

export async function checkRateLimits(
  key: ApiKeyRecord,
  svc: ReturnType<typeof createClient>,
): Promise<{ ok: boolean; error?: string }> {
  const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
  const dayStart = new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";

  const [{ count: minCount }, { count: dayCount }] = await Promise.all([
    svc.from("api_usage_logs").select("*", { count: "exact", head: true })
      .eq("api_key_id", key.id).gte("created_at", oneMinAgo),
    svc.from("api_usage_logs").select("*", { count: "exact", head: true })
      .eq("api_key_id", key.id).gte("created_at", dayStart),
  ]);

  if ((minCount ?? 0) >= key.requests_per_minute)
    return { ok: false, error: `Rate limit exceeded: max ${key.requests_per_minute} requests/minute` };
  if ((dayCount ?? 0) >= key.requests_per_day)
    return { ok: false, error: `Rate limit exceeded: max ${key.requests_per_day} requests/day` };

  return { ok: true };
}

/** Fire-and-forget — never awaited so it doesn't block the response */
export function logUsage(
  keyId: string,
  endpoint: string,
  svc: ReturnType<typeof createClient>,
): void {
  Promise.all([
    svc.from("api_usage_logs").insert({
      api_key_id: keyId,
      tool: endpoint,
      status_code: 200,
      response_time_ms: 0,
      metadata: null,
    }),
    svc.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyId),
  ]).catch(console.error);
}
