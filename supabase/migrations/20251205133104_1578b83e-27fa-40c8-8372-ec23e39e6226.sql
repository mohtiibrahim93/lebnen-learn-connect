-- Create tutor availability table for weekly recurring slots
CREATE TABLE public.tutor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_tutor_slot UNIQUE (tutor_id, day_of_week, start_time, end_time)
);

-- Enable RLS
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;

-- Everyone can view active availability
CREATE POLICY "Anyone can view active availability"
ON public.tutor_availability
FOR SELECT
USING (is_active = true OR tutor_id = auth.uid());

-- Tutors can manage their own availability
CREATE POLICY "Tutors can insert own availability"
ON public.tutor_availability
FOR INSERT
WITH CHECK (auth.uid() = tutor_id AND has_role(auth.uid(), 'tutor'::app_role));

CREATE POLICY "Tutors can update own availability"
ON public.tutor_availability
FOR UPDATE
USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete own availability"
ON public.tutor_availability
FOR DELETE
USING (auth.uid() = tutor_id);

-- Trigger for updated_at
CREATE TRIGGER update_tutor_availability_updated_at
BEFORE UPDATE ON public.tutor_availability
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();