
CREATE POLICY "Anyone uploads report images" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "Staff read report images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'report-images' AND public.is_staff(auth.uid()));
