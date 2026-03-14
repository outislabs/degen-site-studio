
-- Sticker packs table
CREATE TABLE public.sticker_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Pack',
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sticker_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packs" ON public.sticker_packs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own packs" ON public.sticker_packs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own packs" ON public.sticker_packs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own packs" ON public.sticker_packs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Junction table for pack membership
CREATE TABLE public.sticker_pack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES public.sticker_packs(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.generated_content(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pack_id, content_id)
);

ALTER TABLE public.sticker_pack_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pack items" ON public.sticker_pack_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sticker_packs WHERE id = pack_id AND user_id = auth.uid()));
CREATE POLICY "Users can add to own packs" ON public.sticker_pack_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.sticker_packs WHERE id = pack_id AND user_id = auth.uid()));
CREATE POLICY "Users can remove from own packs" ON public.sticker_pack_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sticker_packs WHERE id = pack_id AND user_id = auth.uid()));
