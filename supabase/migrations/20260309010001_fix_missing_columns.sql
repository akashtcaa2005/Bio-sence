-- Add missing columns to emergency_contacts
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) NOT NULL;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS relationship text;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS contact_type text;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS notify_on_alerts boolean DEFAULT true;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- Add missing columns to alert_notifications
ALTER TABLE public.alert_notifications ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) NOT NULL;
ALTER TABLE public.alert_notifications ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.emergency_contacts(id);
ALTER TABLE public.alert_notifications ADD COLUMN IF NOT EXISTS alert_type text;
ALTER TABLE public.alert_notifications ADD COLUMN IF NOT EXISTS alert_message text;
ALTER TABLE public.alert_notifications ADD COLUMN IF NOT EXISTS sent_at timestamp DEFAULT now();
ALTER TABLE public.alert_notifications ADD COLUMN IF NOT EXISTS status text;

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
