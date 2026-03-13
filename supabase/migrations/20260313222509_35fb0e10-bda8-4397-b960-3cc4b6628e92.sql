CREATE POLICY "Anyone can view published sites" ON public.sites FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Users can view their own sites" ON public.sites;
CREATE POLICY "Users can view all sites" ON public.sites FOR SELECT TO authenticated USING (true);