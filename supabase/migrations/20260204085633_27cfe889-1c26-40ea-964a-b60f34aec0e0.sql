-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  contact_type TEXT NOT NULL,
  relationship TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notify_on_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alert_notifications table
CREATE TABLE IF NOT EXISTS public.alert_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.emergency_contacts(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent'
);

-- Enable RLS
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can create their own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.emergency_contacts;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.alert_notifications;
DROP POLICY IF EXISTS "Users can create their own notifications" ON public.alert_notifications;

-- Create policies
CREATE POLICY "Users can view their own contacts"
ON public.emergency_contacts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
ON public.emergency_contacts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.emergency_contacts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.emergency_contacts
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications"
ON public.alert_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications"
ON public.alert_notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);
