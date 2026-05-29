CREATE TABLE IF NOT EXISTS public.plugins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Infra',
  logo_url text,
  status text NOT NULL DEFAULT 'available',
  enables_blocks text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.plugins TO anon, authenticated;
GRANT ALL ON public.plugins TO service_role;

ALTER TABLE public.plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plugins"
  ON public.plugins FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage plugins"
  ON public.plugins FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.user_plugin_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plugin_slug text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, plugin_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plugin_connections TO authenticated;
GRANT ALL ON public.user_plugin_connections TO service_role;

ALTER TABLE public.user_plugin_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plugin connections"
  ON public.user_plugin_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plugin connections"
  ON public.user_plugin_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plugin connections"
  ON public.user_plugin_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all plugin connections"
  ON public.user_plugin_connections FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.plugins (slug, name, description, category, status, enables_blocks, sort_order) VALUES
  ('jupiter',     'Jupiter',     'Best-price Solana swap aggregator. Powers in-page swap widgets.',         'Trading',    'available',   ARRAY['swap-widget'],                            10),
  ('helius',      'Helius',      'Solana RPC + enriched APIs for holder data and webhooks.',               'Infra',      'available',   ARRAY['holder-gate','holder-leaderboard'],       20),
  ('birdeye',     'Birdeye',     'Real-time token analytics, trending feeds and market data.',             'Analytics',  'available',   ARRAY['trending-feed','live-chart'],             30),
  ('dexscreener', 'DexScreener', 'On-chain DEX charts, liquidity stats and pair data.',                    'Analytics',  'available',   ARRAY['lp-stats','live-chart'],                  40),
  ('bagsfm',      'Bags.fm',     'Launchpad for memecoins with built-in revenue share.',                   'Launchpads', 'available',   ARRAY['claim-page'],                             50),
  ('pumpfun',     'Pump.fun',    'Memecoin launchpad with bonding-curve liquidity.',                       'Launchpads', 'available',   ARRAY['claim-page'],                             60),
  ('magiceden',   'Magic Eden',  'NFT marketplace data for collections, floors and listings.',             'NFTs',       'available',   ARRAY['live-chart'],                             70),
  ('tensor',      'Tensor',      'Pro NFT trading data and floor analytics.',                              'NFTs',       'coming_soon', ARRAY['live-chart'],                             80),
  ('telegram',    'Telegram',    'Connect a Telegram bot for community CTAs and gated access.',            'Social',     'available',   ARRAY['social-cta'],                             90),
  ('discord',     'Discord',     'Connect a Discord server for community CTAs and role gating.',           'Social',     'coming_soon', ARRAY['social-cta'],                            100),
  ('streamflow',  'Streamflow',  'Token vesting and streaming payments on Solana.',                        'Infra',      'coming_soon', ARRAY['claim-page'],                            110)
ON CONFLICT (slug) DO NOTHING;