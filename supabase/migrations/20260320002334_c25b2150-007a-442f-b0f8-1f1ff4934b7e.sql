CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  max_uses integer NOT NULL DEFAULT 50,
  uses_count integer NOT NULL DEFAULT 0,
  plan text NOT NULL DEFAULT 'degen',
  duration_days integer NOT NULL DEFAULT 30,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active promo codes" ON public.promo_codes
  FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Service role can manage promo codes" ON public.promo_codes
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

INSERT INTO public.promo_codes (code, max_uses, uses_count, plan, duration_days)
VALUES ('DEGEN50', 50, 0, 'degen', 30);