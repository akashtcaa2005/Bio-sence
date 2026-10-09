CREATE TABLE IF NOT EXISTS public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
CREATE POLICY "Users can view their own medications"
  ON public.medications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own medications" ON public.medications;
CREATE POLICY "Users can create their own medications"
  ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
CREATE POLICY "Users can update their own medications"
  ON public.medications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;
CREATE POLICY "Users can delete their own medications"
  ON public.medications FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_medications_updated_at ON public.medications;
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();