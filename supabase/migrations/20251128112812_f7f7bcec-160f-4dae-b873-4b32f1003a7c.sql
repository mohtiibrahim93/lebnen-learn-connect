-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  review_text text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar_url text,
  course_level text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_approved = true);

-- Allow admins to manage testimonials
CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update testimonials"
  ON public.testimonials
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();