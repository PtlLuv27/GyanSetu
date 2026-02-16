
-- CREATE TABLE users (
--     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--     full_name TEXT,
--     email TEXT UNIQUE,
--     role TEXT CHECK (role IN ('admin', 'student', 'expert', 'interviewer')) DEFAULT 'student',
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
-- );

-- CREATE TABLE materials (
--     id SERIAL PRIMARY KEY,
--     title TEXT NOT NULL,
--     category TEXT CHECK (category IN ('prelims', 'mains', 'interview')),
--     subject TEXT,
--     file_url TEXT, 
--     is_premium BOOLEAN DEFAULT false,
--     uploaded_by UUID REFERENCES users(id),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
-- );

-- CREATE TABLE tests (
--     id SERIAL PRIMARY KEY,
--     title TEXT NOT NULL,
--     type TEXT CHECK (type IN ('daily_quiz', 'weekly_mock', 'full_syllabus')),
--     total_marks INT DEFAULT 100,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
-- );

-- CREATE TABLE test_attempts (
--     id SERIAL PRIMARY KEY,
--     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--     test_id INT REFERENCES tests(id) ON DELETE CASCADE,
--     score INT NOT NULL,
--     accuracy DECIMAL(5,2),
--     completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
-- );

-- CREATE TABLE interviews (
--     id SERIAL PRIMARY KEY,
--     student_id UUID REFERENCES users(id),
--     interviewer_id UUID REFERENCES users(id),
--     scheduled_at TIMESTAMP WITH TIME ZONE,
--     meet_link TEXT,
--     status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
-- );

-- -- ==========================================
-- -- 2. AUTOMATIC USER SYNC (AUTH TRIGGER)
-- -- ==========================================

-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.users (id, full_name, email, role)
--   VALUES (
--     new.id, 
--     new.raw_user_meta_data->>'full_name', 
--     new.email, 
--     COALESCE(new.raw_user_meta_data->>'role', 'student')
--   );
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -- ==========================================
-- -- 3. SECURITY (RLS POLICIES)
-- -- ==========================================

-- -- Enable RLS on all tables
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- -- Users can read their own profile
-- CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

-- -- Everyone can see materials, but only admins/experts can upload
-- CREATE POLICY "Anyone can view materials" ON materials FOR SELECT USING (true);
-- CREATE POLICY "Admins/Experts can upload" ON materials FOR INSERT 
-- WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'expert')));

-- -- Students can only see their own test attempts
-- CREATE POLICY "Students view own attempts" ON test_attempts FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Students insert own attempts" ON test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.users (id, full_name, email, role)
--   VALUES (
--     new.id, 
--     new.raw_user_meta_data->>'full_name', 
--     new.email, 
--     'student' -- Hardcoded 'student' for public signups
--   );
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ALTER TABLE materials 
-- ADD COLUMN content_type TEXT CHECK (content_type IN ('material', 'syllabus')) DEFAULT 'material',
-- ADD COLUMN topics_count INTEGER DEFAULT 0; -- Useful specifically for syllabus items

-- CREATE TABLE videos (
--     id SERIAL PRIMARY KEY,
--     title TEXT NOT NULL,
--     description TEXT,
--     category TEXT CHECK (category IN ('prelims', 'mains', 'interview')),
--     subject TEXT,
--     video_url TEXT NOT NULL, 
--     is_youtube BOOLEAN DEFAULT true,
--     thumbnail_url TEXT,
--     uploaded_by UUID REFERENCES users(id),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
-- );

-- -- Enable RLS
-- ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- -- Policy: Everyone (Logged in or Guest) can watch videos
-- CREATE POLICY "Anyone can view videos" 
-- ON videos FOR SELECT 
-- USING (true);

-- -- Policy: Only Admins and Experts can add new videos
-- CREATE POLICY "Admins/Experts can upload videos" 
-- ON videos FOR INSERT 
-- WITH CHECK (
--   EXISTS (
--     SELECT 1 FROM users 
--     WHERE id = auth.uid() 
--     AND role IN ('admin', 'expert')
--   )
-- );

-- -- Policy: Only Admins and Experts can update/delete videos
-- CREATE POLICY "Admins/Experts can modify videos" 
-- ON videos FOR ALL 
-- USING (
--   EXISTS (
--     SELECT 1 FROM users 
--     WHERE id = auth.uid() 
--     AND role IN ('admin', 'expert')
--   )
-- );

-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.users (id, full_name, email, role)
--   VALUES (
--     new.id, 
--     new.raw_user_meta_data->>'full_name', 
--     new.email, 
--     'student' -- This ensures everyone who signs up is a student by default
--   );
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- Drop the old policy if it exists to avoid conflicts
-- DROP POLICY IF EXISTS "Admins/Experts can upload" ON materials;

-- -- Create a clean policy that allows authenticated experts to upload
-- CREATE POLICY "Experts can upload materials" 
-- ON materials FOR INSERT 
-- TO authenticated 
-- WITH CHECK (
--   EXISTS (
--     SELECT 1 FROM public.users 
--     WHERE id = auth.uid() 
--     AND role = 'expert'
--   )
-- );

-- -- Ensure content is publically viewable by all logged in users
-- CREATE POLICY "Public Select" ON materials FOR SELECT TO authenticated USING (true);

-- -- 1. Enable RLS on the materials table if not already done
-- ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- -- 2. Create/Update Delete Policy for Experts
-- -- This allows users with the 'expert' role to delete rows
-- DROP POLICY IF EXISTS "Experts can delete materials" ON public.materials;

-- CREATE POLICY "Experts can delete materials" 
-- ON public.materials FOR DELETE 
-- TO authenticated 
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.users 
--     WHERE id = auth.uid() 
--     AND role = 'expert'
--   )
-- );

-- -- 3. Ensure Students can see content (SELECT policy)
-- DROP POLICY IF EXISTS "Students can view materials" ON public.materials;

-- CREATE POLICY "Students can view materials" 
-- ON public.materials FOR SELECT 
-- TO authenticated 
-- USING (true);

-- -- 1. Force lowercase 'student' for consistent querying
-- UPDATE public.users 
-- SET role = 'student' 
-- WHERE email = 'student@gmail.com';

-- CREATE POLICY "Experts can view users" 
-- ON public.users FOR SELECT 
-- TO authenticated 
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.users 
--     WHERE id = auth.uid() 
--     AND role = 'expert'
--   )
-- );

-- -- 1. Drop the circular policies
-- DROP POLICY IF EXISTS "Experts can view users" ON public.users;
-- DROP POLICY IF EXISTS "Experts can upload materials" ON public.materials;
-- DROP POLICY IF EXISTS "Experts can delete materials" ON public.materials;

-- -- 2. New User Policy (Breaks Recursion)
-- -- We check the 'role' claim inside the JWT instead of querying the 'users' table
-- CREATE POLICY "Experts can view users" 
-- ON public.users FOR SELECT 
-- TO authenticated 
-- USING (
--   (auth.jwt() ->> 'role' = 'expert') OR (auth.uid() = id)
-- );

-- -- 3. New Materials Policies
-- CREATE POLICY "Experts can manage materials" 
-- ON public.materials FOR ALL 
-- TO authenticated 
-- USING (auth.jwt() ->> 'role' = 'expert')
-- WITH CHECK (auth.jwt() ->> 'role' = 'expert');

-- -- 4. New Videos Policies
-- DROP POLICY IF EXISTS "Experts can manage videos" ON public.videos;
-- CREATE POLICY "Experts can manage videos" 
-- ON public.videos FOR ALL 
-- TO authenticated 
-- USING (auth.jwt() ->> 'role' = 'expert');

-- -- 1. Remove the broken policies causing the crash
-- DROP POLICY IF EXISTS "Experts can view users" ON public.users;
-- DROP POLICY IF EXISTS "Experts can manage materials" ON public.materials;

-- -- 2. Create a clean User policy using JWT metadata (No recursion)
-- CREATE POLICY "Experts can view users" 
-- ON public.users FOR SELECT 
-- TO authenticated 
-- USING (
--   (auth.jwt() -> 'app_metadata' ->> 'role' = 'expert') 
--   OR 
--   (auth.uid() = id)
-- );

-- -- 3. Update existing users to have the role in their JWT metadata
-- UPDATE auth.users 
-- SET raw_app_meta_data = jsonb_set(
--   COALESCE(raw_app_meta_data, '{}'::jsonb), 
--   '{role}', 
--   '"expert"'
-- ) 
-- WHERE email = 'luvpatel2707@gmail.com';

-- UPDATE auth.users 
-- SET raw_app_meta_data = jsonb_set(
--   COALESCE(raw_app_meta_data, '{}'::jsonb), 
--   '{role}', 
--   '"student"'
-- ) 
-- WHERE email = 'student@gmail.com';

-- USERS: Profile information synced from Auth
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT CHECK (role IN ('admin', 'student', 'expert', 'interviewer')) DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- MATERIALS: Unified table for Study Materials and Syllabus
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('prelims', 'mains', 'interview')),
    subject TEXT,
    file_url TEXT, 
    content_type TEXT CHECK (content_type IN ('material', 'syllabus')) DEFAULT 'material',
    topics_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- VIDEOS: Database for video lectures
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('prelims', 'mains', 'interview')),
    subject TEXT,
    video_url TEXT NOT NULL, 
    is_youtube BOOLEAN DEFAULT true,
    thumbnail_url TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TESTS & ATTEMPTS: For GPSC exam practice
CREATE TABLE tests (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('daily_quiz', 'weekly_mock', 'full_syllabus')),
    total_marks INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE test_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    test_id INT REFERENCES tests(id) ON DELETE CASCADE,
    score INT NOT NULL,
    accuracy DECIMAL(5,2),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INTERVIEWS: Mock interview scheduling
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES users(id),
    interviewer_id UUID REFERENCES users(id),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    meet_link TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    'student'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

  -- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- USERS Table: Experts can view the list; users can view themselves
CREATE POLICY "Experts can view all users" ON users 
FOR SELECT TO authenticated 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'expert') 
    OR (auth.uid() = id)
);

-- MATERIALS Table: Everyone views; Experts manage
CREATE POLICY "Anyone can view materials" ON materials 
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Experts can manage materials" ON materials 
FOR ALL TO authenticated 
USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'expert')
WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'expert');

-- VIDEOS Table: Everyone views; Experts manage
CREATE POLICY "Anyone can view videos" ON videos 
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Experts can manage videos" ON videos 
FOR ALL TO authenticated 
USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'expert')
WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'expert');

-- TEST ATTEMPTS: Students manage their own data
CREATE POLICY "Students manage own attempts" ON test_attempts 
FOR ALL TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);