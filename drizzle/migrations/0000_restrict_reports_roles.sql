CREATE OR REPLACE FUNCTION public.can_view_reports(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('director','pedagogue','coordinator'))
$$;
GRANT EXECUTE ON FUNCTION public.can_view_reports(uuid) TO authenticated;
DROP POLICY IF EXISTS "Staff can read reports" ON public.anonymous_reports;
DROP POLICY IF EXISTS "Staff can update reports" ON public.anonymous_reports;
CREATE POLICY "Report managers can read reports" ON public.anonymous_reports FOR SELECT TO authenticated USING (public.can_view_reports(auth.uid()));
CREATE POLICY "Report managers can update reports" ON public.anonymous_reports FOR UPDATE TO authenticated USING (public.can_view_reports(auth.uid()));
DROP POLICY IF EXISTS "Staff read report images" ON storage.objects;
CREATE POLICY "Report managers read report images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'report-images' AND public.can_view_reports(auth.uid()));