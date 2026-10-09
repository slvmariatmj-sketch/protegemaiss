CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_students_grade_name ON public.students(grade, full_name);
CREATE INDEX IF NOT EXISTS idx_students_reg ON public.students(registration_number);
CREATE INDEX IF NOT EXISTS idx_occ_created ON public.occurrences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_occ_student ON public.occurrences(student_id);
CREATE INDEX IF NOT EXISTS idx_att_date ON public.attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_att_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_comm_created ON public.communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.anonymous_reports(created_at DESC);