-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Create enum for world status
CREATE TYPE public.world_status AS ENUM ('draft', 'published', 'archived');

-- Create enum for subject/theme
CREATE TYPE public.subject_type AS ENUM (
  'mathematik', 
  'deutsch', 
  'englisch', 
  'biologie', 
  'physik', 
  'chemie', 
  'geschichte', 
  'geografie', 
  'kunst', 
  'musik', 
  'sport', 
  'informatik', 
  'allgemein'
);

-- Create enum for moon phase (difficulty levels)
CREATE TYPE public.moon_phase AS ENUM (
  'neumond',      -- easiest
  'zunehmend',    -- medium-easy
  'halbmond',     -- medium
  'vollmond',     -- hard
  'abnehmend'     -- expert
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);

-- Create learning_worlds table
CREATE TABLE public.learning_worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  poetic_name TEXT, -- e.g., "Der Zahlenwald" for math
  description TEXT,
  subject subject_type NOT NULL DEFAULT 'allgemein',
  moon_phase moon_phase NOT NULL DEFAULT 'neumond',
  status world_status NOT NULL DEFAULT 'draft',
  is_public BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url TEXT,
  generated_code TEXT, -- The generated React component code
  source_content TEXT, -- Original input from teacher
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning_sections table (areas within a world)
CREATE TABLE public.learning_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.learning_worlds(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  component_type TEXT DEFAULT 'text', -- text, quiz, drag_drop, matching, etc.
  component_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  world_id UUID REFERENCES public.learning_worlds(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.learning_sections(id) ON DELETE CASCADE,
  stars_collected INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, world_id, section_id)
);

-- Create world_ratings table
CREATE TABLE public.world_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.learning_worlds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (world_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_ratings ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  
  -- Default role is student, can be upgraded to teacher by admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_worlds_updated_at
  BEFORE UPDATE ON public.learning_worlds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for learning_worlds
CREATE POLICY "Anyone can view published public worlds"
  ON public.learning_worlds FOR SELECT
  USING (is_public = true AND status = 'published');

CREATE POLICY "Creators can view their own worlds"
  ON public.learning_worlds FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Teachers can create worlds"
  ON public.learning_worlds FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id 
    AND public.has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "Creators can update their own worlds"
  ON public.learning_worlds FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own worlds"
  ON public.learning_worlds FOR DELETE
  USING (auth.uid() = creator_id);

-- RLS Policies for learning_sections
CREATE POLICY "Anyone can view sections of public worlds"
  ON public.learning_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_worlds 
      WHERE id = world_id 
      AND (is_public = true AND status = 'published' OR creator_id = auth.uid())
    )
  );

CREATE POLICY "Creators can manage sections"
  ON public.learning_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_worlds 
      WHERE id = world_id AND creator_id = auth.uid()
    )
  );

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for world_ratings
CREATE POLICY "Anyone can view ratings"
  ON public.world_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can rate"
  ON public.world_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.world_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_learning_worlds_creator ON public.learning_worlds(creator_id);
CREATE INDEX idx_learning_worlds_status ON public.learning_worlds(status);
CREATE INDEX idx_learning_worlds_subject ON public.learning_worlds(subject);
CREATE INDEX idx_learning_sections_world ON public.learning_sections(world_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_world ON public.user_progress(world_id);