import { createClient } from "npm:@supabase/supabase-js@2";
import { validateApiKey, checkRateLimits, logUsage } from "./apiKey.ts";

export type CliUser = {
  userId: string;
  email: string;
  sessionId: string;
};

function b64urlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(s.length / 4) * 4,
    "=",
  );
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function b64urlEncode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function signCliJWT(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const header = b64urlEncode(
    new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })),
  );
  const body = b64urlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signingInput = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${b64urlEncode(sig)}`;
}

async function verifyJWT(
  token: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(sigB64),
      new TextEncoder().encode(signingInput),
    );
    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(payloadB64)),
    );
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyCliToken(req: Request): Promise<CliUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const jwtSecret = Deno.env.get("CLI_JWT_SECRET");
  if (!jwtSecret) return null;

  const payload = await verifyJWT(token, jwtSecret);
  if (
    !payload ||
    typeof payload.sub !== "string" ||
    payload.role !== "cli"
  ) return null;

  const tokenHash = await hashToken(token);

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: session, error } = await adminClient
    .from("cli_sessions")
    .select("id")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !session) return null;

  // Fire-and-forget last_used_at update
  adminClient
    .from("cli_sessions")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", session.id)
    .then(() => {});

  return {
    userId: payload.sub as string,
    email: payload.email as string,
    sessionId: session.id as string,
  };
}

export type AuthedUser = CliUser & { kind: "cli" | "api_key" };

export async function verifyAnyToken(req: Request): Promise<AuthedUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (token.startsWith("dgt_")) {
    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const apiKey = await validateApiKey(token, svc);
    if (!apiKey) return null;
    const rate = await checkRateLimits(apiKey, svc);
    if (!rate.ok) throw new Error(rate.error ?? "Rate limit exceeded");
    const { data: user } = await svc.auth.admin.getUserById(apiKey.user_id);
    logUsage(apiKey.id, req.url, svc);
    return {
      userId: apiKey.user_id,
      email: user?.user?.email ?? "",
      sessionId: apiKey.id,
      kind: "api_key",
    };
  }

  const cliUser = await verifyCliToken(req);
  if (!cliUser) return null;
  return { ...cliUser, kind: "cli" };
}
