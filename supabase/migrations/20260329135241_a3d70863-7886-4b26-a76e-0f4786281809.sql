
-- Create the site_analytics table
CREATE TABLE public.site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  visitor_id text NOT NULL,
  referrer text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast queries by site
CREATE INDEX idx_site_analytics_site_id ON public.site_analytics(site_id);
CREATE INDEX idx_site_analytics_created_at ON public.site_analytics(created_at);

-- Enable RLS
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Anon users can INSERT (tracking pixel on public sites)
CREATE POLICY "Anon can insert analytics"
  ON public.site_analytics
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can SELECT analytics for their own sites
CREATE POLICY "Owners can view site analytics"
  ON public.site_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = site_analytics.site_id
        AND sites.user_id = auth.uid()
    )
  );

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
  ON public.site_analytics
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
