
-- Drop existing INSERT policy and recreate it scoped to authenticated role
DROP POLICY IF EXISTS "Users can create their own contacts" ON public.emergency_contacts;

CREATE POLICY "Users can create their own contacts"
ON public.emergency_contacts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also fix other policies to be authenticated-only
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.emergency_contacts;
CREATE POLICY "Users can view their own contacts"
ON public.emergency_contacts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own contacts" ON public.emergency_contacts;
CREATE POLICY "Users can update their own contacts"
ON public.emergency_contacts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.emergency_contacts;
CREATE POLICY "Users can delete their own contacts"
ON public.emergency_contacts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
