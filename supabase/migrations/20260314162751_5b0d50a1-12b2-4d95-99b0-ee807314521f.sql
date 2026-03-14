CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT plan FROM public.user_subscriptions WHERE user_id = _user_id AND status = 'active' LIMIT 1),
    'free'
  )
$$;