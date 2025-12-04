-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'booking_confirmed', 'booking_cancelled', 'new_message', 'lesson_reminder'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID, -- booking_id, message_id, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (via triggers/functions)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify on booking status change
CREATE OR REPLACE FUNCTION public.notify_booking_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tutor_name TEXT;
  student_name TEXT;
BEGIN
  -- Get names
  SELECT full_name INTO tutor_name FROM profiles WHERE id = NEW.tutor_id;
  SELECT full_name INTO student_name FROM profiles WHERE id = NEW.student_id;

  -- Notify student on booking confirmation
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.student_id,
      'booking_confirmed',
      'Booking Confirmed!',
      'Your lesson with ' || COALESCE(tutor_name, 'your tutor') || ' has been confirmed.',
      NEW.id
    );
  END IF;

  -- Notify tutor on new booking
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.tutor_id,
      'new_booking',
      'New Booking Request',
      COALESCE(student_name, 'A student') || ' has requested a lesson.',
      NEW.id
    );
  END IF;

  -- Notify on cancellation
  IF NEW.status = 'cancelled' AND (OLD IS NULL OR OLD.status != 'cancelled') THEN
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.student_id,
      'booking_cancelled',
      'Booking Cancelled',
      'Your lesson has been cancelled.',
      NEW.id
    );
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.tutor_id,
      'booking_cancelled',
      'Booking Cancelled',
      'A lesson has been cancelled.',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for booking notifications
CREATE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_change();