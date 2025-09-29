# Storyline Table & Storage Setup

## Database Table

Run this SQL command in the Supabase SQL editor to create the necessary table:

```sql
-- Create storylines table
CREATE TABLE storylines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  original_video_url TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  segments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_storylines_user_id ON storylines(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_storylines_updated_at BEFORE UPDATE ON storylines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security and define policies
ALTER TABLE public.storylines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own storylines"
ON public.storylines FOR SELECT
TO authenticated
USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'sub') = user_id);

CREATE POLICY "Users can create their own storylines"
ON public.storylines FOR INSERT
TO authenticated
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb ->> 'sub') = user_id);

CREATE POLICY "Users can update their own storylines"
ON public.storylines FOR UPDATE
TO authenticated
USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'sub') = user_id);

CREATE POLICY "Users can delete their own storylines"
ON public.storylines FOR DELETE
TO authenticated
USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'sub') = user_id);
```

## Storage Buckets

Run these SQL commands in the Supabase SQL editor to create the storage buckets:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('storyline-images', 'storyline-images', true, 52428800), -- 50MB limit
  ('storyline-videos', 'storyline-videos', true, 52428800), -- 50MB limit
  ('storyline-originals', 'storyline-originals', true, 104857600) -- 100MB limit
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the buckets
-- Allow public read access to all buckets
CREATE POLICY "Allow public read access to storyline images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'storyline-images');
  
CREATE POLICY "Allow public read access to storyline videos" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'storyline-videos');
  
CREATE POLICY "Allow public read access to storyline originals" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'storyline-originals');

-- Allow authenticated users to upload, update, and delete their own files
CREATE POLICY "Allow authenticated users to manage storyline images" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'storyline-images') WITH CHECK (bucket_id = 'storyline-images');
  
CREATE POLICY "Allow authenticated users to manage storyline videos" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'storyline-videos') WITH CHECK (bucket_id = 'storyline-videos');
  
CREATE POLICY "Allow authenticated users to manage storyline originals" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'storyline-originals') WITH CHECK (bucket_id = 'storyline-originals');
```

## Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## NPM Package

Ensure you have the Supabase client installed:

```bash
npm install @supabase/supabase-js
```

## After Setup

1. Run `npm run db:generate` to generate the Drizzle migrations.
2. Run `npm run db:migrate` to apply the migrations.
3. Run the SQL commands above in your Supabase SQL editor.
4. The storage buckets and table are now ready to use!
