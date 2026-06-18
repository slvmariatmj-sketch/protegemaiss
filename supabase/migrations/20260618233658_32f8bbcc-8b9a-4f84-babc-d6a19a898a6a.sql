
GRANT INSERT ON public.user_roles TO authenticated;
CREATE POLICY "Users self-assign role" ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
