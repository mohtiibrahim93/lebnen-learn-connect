-- Create a function that allows users to assign their own role during signup
-- This uses SECURITY DEFINER to bypass RLS policies
CREATE OR REPLACE FUNCTION public.assign_initial_role(_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user already has a role
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'User already has a role assigned';
  END IF;
  
  -- Insert the role for the current user
  INSERT INTO user_roles (user_id, role)
  VALUES (auth.uid(), _role);
END;
$$;