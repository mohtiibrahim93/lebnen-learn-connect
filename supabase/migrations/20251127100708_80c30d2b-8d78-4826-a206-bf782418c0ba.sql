-- Create enrollments table for storing course enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  study_center TEXT NOT NULL,
  course_level TEXT NOT NULL,
  preferred_tutor TEXT,
  message TEXT,
  enrollment_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert enrollments (public form)
CREATE POLICY "Anyone can submit enrollments"
ON public.enrollments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can view enrollments
CREATE POLICY "Authenticated users can view enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();