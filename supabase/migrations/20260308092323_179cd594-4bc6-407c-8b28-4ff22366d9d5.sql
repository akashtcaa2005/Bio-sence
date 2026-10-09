-- Drop existing restrictive policies and recreate as permissive with TO authenticated
DROP POLICY IF EXISTS "Users can create their own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.emergency_contacts;

-- Recreate as permissive policies explicitly targeting authenticated role
CREATE POLICY "Users can create their own contacts"
  ON public.emergency_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own contacts"
  ON public.emergency_contacts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON public.emergency_contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON public.emergency_contacts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);