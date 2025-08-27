-- Fonction pour récupérer tous les utilisateurs avec leurs abonnements pour le panel admin
CREATE OR REPLACE FUNCTION public.get_all_users_with_subscriptions(page_num integer, page_size integer)
RETURNS TABLE(
    id uuid,
    email character varying,
    created_at timestamp with time zone,
    is_super_admin boolean,
    is_active boolean,
    plan_id uuid,
    plan_name text,
    total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH user_counts AS (
        SELECT count(*) AS total FROM auth.users
    )
    SELECT
        u.id,
        u.email,
        u.created_at,
        COALESCE((u.raw_user_meta_data->>'is_super_admin')::boolean, false) AS is_super_admin,
        COALESCE((u.raw_user_meta_data->>'is_active')::boolean, true) AS is_active,
        us.plan_id,
        sp.name AS plan_name,
        uc.total
    FROM
        auth.users u
    LEFT JOIN
        public.user_subscriptions us ON u.id = us.user_id
    LEFT JOIN
        public.saas_plans sp ON us.plan_id = sp.id
    CROSS JOIN
        user_counts uc
    ORDER BY
        u.created_at DESC
    LIMIT
        page_size
    OFFSET
        (page_num - 1) * page_size;
END;
$$;

-- Fonction pour définir le statut de super admin d'un utilisateur
CREATE OR REPLACE FUNCTION public.set_user_super_admin_status(target_user_id uuid, is_admin boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Seuls les super admins peuvent changer les rôles.';
    END IF;

    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('is_super_admin', is_admin)
    WHERE id = target_user_id;
END;
$$;

-- Fonction pour activer/désactiver un utilisateur
CREATE OR REPLACE FUNCTION public.toggle_user_activation(target_user_id uuid, is_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Seuls les super admins peuvent changer le statut des utilisateurs.';
    END IF;

    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('is_active', is_active)
    WHERE id = target_user_id;
END;
$$;

-- Fonction pour récupérer les statistiques du tableau de bord admin
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(
    total_users bigint,
    new_users_last_30_days bigint,
    active_subscriptions bigint,
    mrr numeric,
    active_users bigint,
    inactive_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM auth.users) AS total_users,
        (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '30 days') AS new_users_last_30_days,
        (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'active') AS active_subscriptions,
        (SELECT COALESCE(SUM(sp.price_monthly), 0)
         FROM public.user_subscriptions us
         JOIN public.saas_plans sp ON us.plan_id = sp.id
         WHERE us.status = 'active' AND sp.price_monthly IS NOT NULL) AS mrr,
        (SELECT COUNT(*) FROM auth.users WHERE COALESCE((raw_user_meta_data->>'is_active')::boolean, true) = true) AS active_users,
        (SELECT COUNT(*) FROM auth.users WHERE COALESCE((raw_user_meta_data->>'is_active')::boolean, true) = false) AS inactive_users;
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.get_all_users_with_subscriptions(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_super_admin_status(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_user_activation(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;