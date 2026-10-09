-- Clean migration for emergency_contacts and alert_notifications

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text,
  email text,
  phone text,
  relationship text,
  contact_type text,
  is_active boolean DEFAULT true,
  notify_on_alerts boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Alert Notifications Table
CREATE TABLE IF NOT EXISTS public.alert_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  contact_id uuid REFERENCES public.emergency_contacts(id),
  alert_type text,
  alert_message text,
  sent_at timestamp DEFAULT now(),
  status text
);

-- Enable Row Level Security
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- Emergency Contacts Policies
DROP POLICY IF EXISTS "Authenticated can select own contacts" ON public.emergency_contacts;
CREATE POLICY "Authenticated can select own contacts"
  ON public.emergency_contacts
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated can insert own contacts" ON public.emergency_contacts;
CREATE POLICY "Authenticated can insert own contacts"
  ON public.emergency_contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated can update own contacts" ON public.emergency_contacts;
CREATE POLICY "Authenticated can update own contacts"
  ON public.emergency_contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated can delete own contacts" ON public.emergency_contacts;
CREATE POLICY "Authenticated can delete own contacts"
  ON public.emergency_contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Alert Notifications Policies
DROP POLICY IF EXISTS "Authenticated can select own alerts" ON public.alert_notifications;
CREATE POLICY "Authenticated can select own alerts"
  ON public.alert_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated can insert own alerts" ON public.alert_notifications;
CREATE POLICY "Authenticated can insert own alerts"
  ON public.alert_notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
