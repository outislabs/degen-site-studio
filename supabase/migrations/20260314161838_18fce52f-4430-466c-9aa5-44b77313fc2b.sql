CREATE POLICY "Anyone can view generated content"
ON public.generated_content
FOR SELECT
TO anon
USING (image_url IS NOT NULL);