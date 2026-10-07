ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;
UPDATE public.user_roles SET approved = true;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND approved) $$;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role AND approved) $$;
CREATE OR REPLACE FUNCTION public.can_view_reports(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND approved AND role IN ('director','pedagogue','coordinator')) $$;
DROP POLICY IF EXISTS "Users self-assign role" ON public.user_roles;
CREATE POLICY "Users self-request role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND approved = false);