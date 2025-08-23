-- Update or insert Premium plan
INSERT INTO public.saas_plans (name, price_monthly, price_yearly, currency, features, is_active, trial_days)
VALUES (
  'Premium',
  10000,
  100000,
  'FCFA',
  '["Rapports de ventes avancés", "Analyses et statistiques détaillées", "Support client prioritaire", "Export de données illimité"]'::jsonb,
  TRUE,
  7
)
ON CONFLICT (name) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  currency = EXCLUDED.currency,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  trial_days = EXCLUDED.trial_days,
  updated_at = NOW();

-- Update or insert Lifetime plan
INSERT INTO public.saas_plans (name, price_monthly, price_yearly, currency, features, is_active, trial_days)
VALUES (
  'Lifetime',
  0, -- No monthly price for lifetime
  300000, -- One-time payment stored here
  'FCFA',
  '["Accès à vie à toutes les fonctionnalités Premium", "Mises à jour futures incluses", "Support prioritaire à vie", "Toutes les fonctionnalités du plan Premium"]'::jsonb,
  TRUE,
  0
)
ON CONFLICT (name) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  currency = EXCLUDED.currency,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  trial_days = EXCLUDED.trial_days,
  updated_at = NOW();