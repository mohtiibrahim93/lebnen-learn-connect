-- Update the handle_new_user function to use the role from metadata if provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  selected_role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Get the role from metadata, default to 'student' if not provided
  selected_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'student'::app_role
  );
  
  -- Assign the selected role (only allow student or tutor, not admin)
  IF selected_role IN ('student', 'tutor') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, selected_role);
  ELSE
    -- Fallback to student if invalid role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
  END IF;
  
  -- If tutor, also create a tutor_profile
  IF selected_role = 'tutor' THEN
    INSERT INTO public.tutor_profiles (user_id, expertise, hourly_rate, specialties)
    VALUES (NEW.id, 'Lebanese Arabic', 25, ARRAY['Conversational Lebanese']);
  END IF;
  
  RETURN NEW;
END;
$function$;