-- Add policy to allow users to upload avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
)
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
);
