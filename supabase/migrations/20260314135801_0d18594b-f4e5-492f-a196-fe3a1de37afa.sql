
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS: admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin policies for sites table
CREATE POLICY "Admins can manage all sites"
ON public.sites FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin policies for user_subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all subscriptions"
ON public.user_subscriptions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for generated_content
CREATE POLICY "Admins can view all content"
ON public.generated_content FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all content"
ON public.generated_content FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for sticker_packs
CREATE POLICY "Admins can view all packs"
ON public.sticker_packs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all packs"
ON public.sticker_packs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for sticker_pack_items
CREATE POLICY "Admins can view all pack items"
ON public.sticker_pack_items FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
