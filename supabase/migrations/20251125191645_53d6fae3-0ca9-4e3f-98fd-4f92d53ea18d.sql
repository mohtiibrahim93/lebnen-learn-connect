-- Add payment tracking columns to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2);

-- Add check constraint for payment status
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));