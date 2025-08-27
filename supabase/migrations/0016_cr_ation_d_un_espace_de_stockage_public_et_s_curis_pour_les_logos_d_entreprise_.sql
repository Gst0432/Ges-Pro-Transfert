-- Crée un compartiment de stockage public pour les logos, s'il n'existe pas déjà.
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Supprime les anciennes politiques pour éviter les conflits.
DROP POLICY IF EXISTS "Public read access for company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage their own company logos" ON storage.objects;

-- Crée une politique qui autorise tout le monde à voir les logos.
CREATE POLICY "Public read access for company logos" ON storage.objects
FOR SELECT USING (bucket_id = 'company-logos');

-- Crée une politique de sécurité qui permet aux utilisateurs connectés de téléverser,
-- mettre à jour et supprimer uniquement leurs propres logos dans leur dossier personnel.
CREATE POLICY "Authenticated users can manage their own company logos" ON storage.objects
FOR ALL USING (bucket_id = 'company-logos' AND auth.uid() = (storage.foldername(name))[1]::uuid)
WITH CHECK (bucket_id = 'company-logos' AND auth.uid() = (storage.foldername(name))[1]::uuid);