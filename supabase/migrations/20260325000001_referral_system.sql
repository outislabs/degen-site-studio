-- referral_codes: one row per user, holds their unique code and click count
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- referrals: one row per referred signup
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- affiliate_earnings: one row per conversion payout
CREATE TABLE public.affiliate_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount numeric(12, 4) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payout_wallet text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common lookups
CREATE INDEX referral_codes_code_idx ON public.referral_codes (code);
CREATE INDEX referrals_referrer_id_idx ON public.referrals (referrer_id);
CREATE INDEX affiliate_earnings_referrer_id_idx ON public.affiliate_earnings (referrer_id);

-- RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

-- referral_codes: users can read their own
CREATE POLICY "Users can view own referral code"
ON public.referral_codes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- referrals: referrers can read their own referrals
CREATE POLICY "Users can view own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (referrer_id = auth.uid());

-- affiliate_earnings: referrers can read their own earnings
CREATE POLICY "Users can view own earnings"
ON public.affiliate_earnings FOR SELECT
TO authenticated
USING (referrer_id = auth.uid());
