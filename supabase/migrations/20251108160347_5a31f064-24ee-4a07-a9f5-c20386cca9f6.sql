-- Add INSERT policy to user_roles table to prevent privilege escalation
-- Only service role can insert roles (through the trigger)
CREATE POLICY "Only service role can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Create a policy for service role (this allows the trigger to work)
CREATE POLICY "Service role can insert roles"
ON public.user_roles
FOR INSERT
TO service_role
WITH CHECK (true);