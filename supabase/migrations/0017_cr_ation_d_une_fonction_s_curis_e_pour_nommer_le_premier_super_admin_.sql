CREATE OR REPLACE FUNCTION make_first_super_admin(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  admin_count INTEGER;
  target_user_id UUID;
BEGIN
  -- Vérifie si un Super Admin existe déjà
  SELECT count(*) INTO admin_count FROM auth.users WHERE raw_user_meta_data->>'is_super_admin' = 'true';

  IF admin_count > 0 THEN
    RETURN 'Un Super Admin existe déjà. Aucune action effectuée.';
  END IF;

  -- Trouve l'utilisateur à promouvoir
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RETURN 'Utilisateur non trouvé avec cet e-mail. Assurez-vous que l''utilisateur est bien inscrit.';
  END IF;

  -- Promeut l'utilisateur
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || '{"is_super_admin": true}'::jsonb
  WHERE id = target_user_id;

  RETURN 'Utilisateur promu Super Admin avec succès ! Veuillez vous déconnecter et vous reconnecter.';
END;
$$;