-- TutorX Supabase Initial Schema

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'TEACHER', 'MANAGER', 'STUDENT');

-- 2. Profiles Table (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'STUDENT',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Teachers Table (Tenant Workspace)
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  institute_name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Managers Table (Scoped to Teacher)
CREATE TABLE public.managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  permissions JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Students Table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  whatsapp_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Classes Table (Owned by Teacher)
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  grade TEXT,
  subject TEXT,
  monthly_fee NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enrollments Table (Many-to-Many Student <-> Class)
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, class_id)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Utility Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Public can view profiles, users can edit their own profile
CREATE POLICY "Public can view profiles" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Teachers: Public can view teachers, teachers can edit their own workspace
CREATE POLICY "Public can view teachers" 
ON public.teachers FOR SELECT USING (true);

CREATE POLICY "Teachers can update own workspace" 
ON public.teachers FOR UPDATE 
USING (profile_id = auth.uid());

CREATE POLICY "Superadmins can manage teachers" 
ON public.teachers FOR ALL 
USING (public.get_current_role() = 'SUPERADMIN');

-- Classes: Teachers can view/manage their own classes
CREATE POLICY "Teachers can manage their classes" 
ON public.classes FOR ALL 
USING (teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()));

-- Classes: Enrolled students can view classes
CREATE POLICY "Enrolled students can view classes" 
ON public.classes FOR SELECT 
USING (
  id IN (
    SELECT class_id FROM public.enrollments 
    WHERE student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
  )
);

-- Enrollments: Teachers can manage enrollments for their classes
CREATE POLICY "Teachers can manage enrollments" 
ON public.enrollments FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes 
    WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
  )
);

-- Enrollments: Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" 
ON public.enrollments FOR SELECT 
USING (
  student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
);


-- ==========================================
-- 8. Platform Subscriptions & Payment Plans
-- ==========================================

CREATE TABLE public.payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  max_classes INTEGER DEFAULT 5,
  max_students INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE UNIQUE NOT NULL,
  payment_plan_id UUID REFERENCES public.payment_plans(id) ON DELETE RESTRICT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trial',
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage payment plans" ON public.payment_plans FOR ALL USING (public.get_current_role() = 'SUPERADMIN');
CREATE POLICY "Anyone can select payment plans" ON public.payment_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmins can manage subscriptions" ON public.subscriptions FOR ALL USING (public.get_current_role() = 'SUPERADMIN');
CREATE POLICY "Teachers can view own subscriptions" ON public.subscriptions FOR SELECT USING (teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()));


-- ==========================================
-- 9. Notices / Announcements System
-- ==========================================

CREATE TYPE notice_type AS ENUM ('GENERAL', 'CLASS');

CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type notice_type NOT NULL DEFAULT 'GENERAL',
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers and managers can manage notices" 
ON public.notices FOR ALL 
USING (
  created_by = auth.uid() OR
  public.get_current_role() IN ('TEACHER', 'MANAGER')
);

CREATE POLICY "Enrolled students can view class/general notices" 
ON public.notices FOR SELECT 
USING (
  type = 'GENERAL' OR
  class_id IN (
    SELECT class_id FROM public.enrollments 
    WHERE student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
  )
);


-- ==========================================
-- 10. Recording Library
-- ==========================================

CREATE TABLE public.recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers and managers can manage recordings" 
ON public.recordings FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes 
    WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
  ) OR
  public.get_current_role() = 'MANAGER'
);

CREATE POLICY "Enrolled students can view recordings" 
ON public.recordings FOR SELECT 
USING (
  class_id IN (
    SELECT class_id FROM public.enrollments 
    WHERE student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
  )
);


-- ==========================================
-- 11. Attendance Monitoring Logs
-- ==========================================

CREATE TABLE public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers and managers can view class attendance logs" 
ON public.attendance_logs FOR SELECT 
USING (
  class_id IN (
    SELECT id FROM public.classes 
    WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
  ) OR
  public.get_current_role() = 'MANAGER'
);

CREATE POLICY "Students can log own attendance" 
ON public.attendance_logs FOR INSERT 
WITH CHECK (
  student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
);

CREATE POLICY "Students can view own attendance logs" 
ON public.attendance_logs FOR SELECT 
USING (
  student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
);


-- ==========================================
-- 12. Lesson Packs and Digital Store Products
-- ==========================================

CREATE TABLE public.lesson_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.digital_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'revision_paper', 'book', 'other'
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lesson_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers/Managers manage lesson packs" 
ON public.lesson_packs FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes 
    WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
  ) OR
  public.get_current_role() = 'MANAGER'
);

CREATE POLICY "Anyone can view store items" 
ON public.lesson_packs FOR SELECT 
USING (true);

CREATE POLICY "Teachers/Managers manage digital products" 
ON public.digital_products FOR ALL 
USING (public.get_current_role() IN ('TEACHER', 'MANAGER'));

CREATE POLICY "Anyone can view digital products" 
ON public.digital_products FOR SELECT 
USING (true);


-- ==========================================
-- 13. Fee Verification & Payment Slips
-- ==========================================

CREATE TYPE slip_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE public.payment_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  slip_url TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status slip_status DEFAULT 'PENDING',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_slips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students upload own slips" 
ON public.payment_slips FOR INSERT 
WITH CHECK (
  student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
);

CREATE POLICY "Students view own slips" 
ON public.payment_slips FOR SELECT 
USING (
  student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
);

CREATE POLICY "Teachers/Managers manage slips" 
ON public.payment_slips FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes 
    WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
  ) OR
  public.get_current_role() = 'MANAGER'
);


-- ==========================================
-- 14. Support Desk System
-- ==========================================

CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own support tickets" 
ON public.support_tickets FOR ALL 
USING (profile_id = auth.uid());

CREATE POLICY "Superadmins manage all tickets" 
ON public.support_tickets FOR ALL 
USING (public.get_current_role() = 'SUPERADMIN');


-- ==========================================
-- 8. Teacher Invites Table
-- ==========================================

CREATE TABLE public.teacher_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  institute_name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teacher_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage invites" 
ON public.teacher_invites FOR ALL 
USING (public.get_current_role() = 'SUPERADMIN');

CREATE POLICY "Public can read active invites by code" 
ON public.teacher_invites FOR SELECT 
USING (is_used = false);
