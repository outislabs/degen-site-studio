INSERT INTO public.template_settings (template_id, is_pro)
VALUES
  ('nft-blueprint', true),
  ('nft-luxury', true)
ON CONFLICT (template_id) DO UPDATE SET is_pro = EXCLUDED.is_pro;