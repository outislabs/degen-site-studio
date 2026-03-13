ALTER TABLE public.sites ADD COLUMN slug text UNIQUE;
CREATE INDEX idx_sites_slug ON public.sites (slug);