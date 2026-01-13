-- Create storage bucket for coursework documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('coursework', 'coursework', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the coursework bucket
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'coursework' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'coursework' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'coursework' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
