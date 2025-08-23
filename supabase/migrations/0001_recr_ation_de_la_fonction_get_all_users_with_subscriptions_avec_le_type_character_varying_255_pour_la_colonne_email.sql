CREATE OR REPLACE FUNCTION public.get_all_users_with_subscriptions(page_num integer, page_size integer)
 RETURNS TABLE(id uuid, email character varying(255), created_at timestamp with time zone, is_super_admin boolean, is_active boolean, plan_id uuid, plan_name text, price_monthly numeric, subscription_status text, total_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  _total_count BIGINT;
BEGIN
  -- Get total count first
  SELECT COUNT(*) INTO _total_count FROM auth.users;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.created_at,
    COALESCE((u.raw_user_meta_data ->> 'is_super_admin')::BOOLEAN, FALSE) AS is_super_admin,
    (u.banned_until IS NULL OR u.banned_until < NOW()) AS is_active,
    us.plan_id,
    sp.name AS plan_name,
    sp.price_monthly,
    us.status AS subscription_status,
    _total_count
  FROM
    auth.users u
  LEFT JOIN
    public.user_subscriptions us ON u.id = us.user_id
  LEFT JOIN
    public.saas_plans sp ON us.plan_id = sp.id
  ORDER BY
    u.created_at DESC
  LIMIT page_size
  OFFSET (page_num - 1) * page_size;
END;
$function$;