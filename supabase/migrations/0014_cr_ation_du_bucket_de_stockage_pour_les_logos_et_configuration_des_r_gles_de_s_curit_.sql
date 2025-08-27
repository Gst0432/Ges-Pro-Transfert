-- Create a public bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all logos
CREATE POLICY "Public read access for company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- Allow authenticated users to upload their own logo into a folder named after their user ID
CREATE POLICY "Authenticated users can upload their own logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow authenticated users to update their own logo
CREATE POLICY "Authenticated users can update their own logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow authenticated users to delete their own logo
CREATE POLICY "Authenticated users can delete their own logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);