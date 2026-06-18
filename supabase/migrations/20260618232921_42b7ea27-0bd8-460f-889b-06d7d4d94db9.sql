
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('coordinator','teacher','director','pedagogue');

-- user_roles table (security best practice: separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE POLICY "Users view own role" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Students
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  grade TEXT NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('manhã','tarde','noite','integral')),
  guardian_name TEXT,
  guardian_cpf TEXT,
  performance_grade NUMERIC(4,2) DEFAULT 0,
  performance_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage students" ON public.students FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Occurrences (ocorrências e indisciplinas)
CREATE TABLE public.occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ocorrencia','indisciplina','elogio')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.occurrences TO authenticated;
GRANT ALL ON public.occurrences TO service_role;
ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage occurrences" ON public.occurrences FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Attendance (faltas)
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('falta','presenca','atraso','justificada')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage attendance" ON public.attendance FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Communications (comunicados)
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all','staff','parents','students')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communications TO authenticated;
GRANT ALL ON public.communications TO service_role;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage communications" ON public.communications FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Events
CREATE TABLE public.school_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_events TO authenticated;
GRANT ALL ON public.school_events TO service_role;
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage events" ON public.school_events FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Anonymous reports
CREATE TABLE public.anonymous_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','em_analise','resolvido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anonymous_reports TO authenticated;
GRANT INSERT ON public.anonymous_reports TO anon;
GRANT ALL ON public.anonymous_reports TO service_role;
ALTER TABLE public.anonymous_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit anonymous report" ON public.anonymous_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can read reports" ON public.anonymous_reports FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update reports" ON public.anonymous_reports FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
