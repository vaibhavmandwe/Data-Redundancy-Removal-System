-- Create contacts table for storing unique user data
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_email UNIQUE (email),
  CONSTRAINT unique_phone UNIQUE (phone)
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read contacts (for display)
CREATE POLICY "Allow public read access"
  ON public.contacts
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert contacts (for form submission)
CREATE POLICY "Allow public insert access"
  ON public.contacts
  FOR INSERT
  WITH CHECK (true);

-- Create index on email and phone for faster duplicate checks
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);