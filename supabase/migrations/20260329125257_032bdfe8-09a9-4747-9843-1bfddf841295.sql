
-- Create template_settings table
CREATE TABLE public.template_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id text UNIQUE NOT NULL,
  is_pro boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.template_settings ENABLE ROW LEVEL SECURITY;

-- SELECT: allow all (anon + authenticated)
CREATE POLICY "Anyone can read template settings"
  ON public.template_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: admin only
CREATE POLICY "Admins can insert template settings"
  ON public.template_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- UPDATE: admin only
CREATE POLICY "Admins can update template settings"
  ON public.template_settings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DELETE: admin only
CREATE POLICY "Admins can delete template settings"
  ON public.template_settings
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_template_settings_updated_at
  BEFORE UPDATE ON public.template_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
