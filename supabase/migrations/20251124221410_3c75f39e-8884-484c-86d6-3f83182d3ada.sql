-- Add teaching centers table
CREATE TABLE IF NOT EXISTS public.teaching_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add center_id to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS center_id UUID REFERENCES public.teaching_centers(id);

-- Insert Raduga Creative as first center
INSERT INTO public.teaching_centers (name, address, city, description)
VALUES (
  'Raduga Creative',
  'Address here',
  'Bucharest',
  'Creative learning space in the heart of Bucharest'
);

-- Enable RLS
ALTER TABLE public.teaching_centers ENABLE ROW LEVEL SECURITY;

-- Centers are viewable by everyone
CREATE POLICY "Centers are viewable by everyone"
ON public.teaching_centers FOR SELECT
USING (is_active = true);

-- Only admin can manage centers
CREATE POLICY "Only admin can insert centers"
ON public.teaching_centers FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admin can update centers"
ON public.teaching_centers FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_teaching_centers_updated_at
  BEFORE UPDATE ON public.teaching_centers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();