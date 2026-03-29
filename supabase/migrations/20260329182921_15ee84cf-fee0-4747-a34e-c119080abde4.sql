ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS token_gated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS token_gate_wallet text,
  ADD COLUMN IF NOT EXISTS token_gate_last_check timestamp with time zone;