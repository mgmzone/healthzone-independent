-- Relax get_all_users_for_admin's profile_complete check.
--
-- Previously the admin view required target_weight IS NOT NULL, but the
-- profile form has no input for target_weight — it's set when the user
-- creates a Period. That requirement kept new users flagged as incomplete
-- even after they finished every field the profile form actually collects.
--
-- The new check matches the frontend isProfileComplete: demographic fields
-- that the profile form itself collects.

CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
 RETURNS TABLE(lastname text, firstname text, user_id uuid, profile_complete boolean, in_active_period boolean, week_weigh_ins bigint, total_weigh_ins bigint, week_activities bigint, total_activities bigint, week_fasting_days bigint, total_fasting_days bigint, email text, last_sign_in_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  RETURN QUERY
  SELECT
    p.last_name::text AS lastname,
    p.first_name::text AS firstname,
    au.id AS user_id,
    CASE
      WHEN p.id IS NOT NULL
        AND p.first_name IS NOT NULL AND p.first_name <> ''
        AND p.birth_date IS NOT NULL
        AND p.height IS NOT NULL AND p.height > 0
      THEN TRUE
      ELSE FALSE
    END AS profile_complete,

    EXISTS (
      SELECT 1
      FROM periods per
      WHERE per.user_id = au.id
        AND per.start_date <= CURRENT_DATE
        AND (per.end_date IS NULL OR per.end_date >= CURRENT_DATE)
    ) AS in_active_period,

    COALESCE((SELECT COUNT(*) FROM weigh_ins wi WHERE wi.user_id = au.id AND wi.date >= (CURRENT_DATE - INTERVAL '7 days')), 0) AS week_weigh_ins,
    COALESCE((SELECT COUNT(*) FROM weigh_ins wi WHERE wi.user_id = au.id), 0) AS total_weigh_ins,
    COALESCE((SELECT COUNT(*) FROM exercise_logs el WHERE el.user_id = au.id AND el.date >= (CURRENT_DATE - INTERVAL '7 days')), 0) AS week_activities,
    COALESCE((SELECT COUNT(*) FROM exercise_logs el WHERE el.user_id = au.id), 0) AS total_activities,
    COALESCE((SELECT COUNT(*) FROM fasting_logs fl WHERE fl.user_id = au.id AND fl.end_time >= (CURRENT_DATE - INTERVAL '7 days')), 0) AS week_fasting_days,
    COALESCE((SELECT COUNT(*) FROM fasting_logs fl WHERE fl.user_id = au.id), 0) AS total_fasting_days,

    au.email::text,
    au.last_sign_in_at

  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  ORDER BY p.last_name, p.first_name;
END;
$function$;
