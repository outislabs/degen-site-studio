ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS site_type text NOT NULL DEFAULT 'memecoin';

CREATE TABLE IF NOT EXISTS public.nft_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  mint_price numeric,
  total_supply integer,
  mint_status text NOT NULL DEFAULT 'upcoming',
  mint_date timestamp with time zone,
  is_whitelist boolean NOT NULL DEFAULT false,
  team jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  source text,
  source_url text,
  collection_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(site_id)
);

ALTER TABLE public.nft_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own nft collections"
ON public.nft_collections FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nft collections"
ON public.nft_collections FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nft collections"
ON public.nft_collections FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own nft collections"
ON public.nft_collections FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view nft collections"
ON public.nft_collections FOR SELECT TO anon
USING (true);

CREATE POLICY "Admins can manage all nft collections"
ON public.nft_collections FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_nft_collections_updated_at
  BEFORE UPDATE ON public.nft_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();