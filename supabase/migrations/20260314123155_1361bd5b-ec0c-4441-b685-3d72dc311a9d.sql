
-- Content table for generated memes, stickers, social posts, marketing copy
CREATE TABLE public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('meme', 'sticker', 'social_post', 'marketing_copy')),
  title TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  content_text TEXT,
  image_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content"
  ON public.generated_content FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own content"
  ON public.generated_content FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content"
  ON public.generated_content FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-content', 'generated-content', true);

CREATE POLICY "Users can upload generated content"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'generated-content' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own generated content"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'generated-content' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view generated content"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'generated-content');

CREATE POLICY "Users can delete own generated content"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'generated-content' AND (storage.foldername(name))[1] = auth.uid()::text);
