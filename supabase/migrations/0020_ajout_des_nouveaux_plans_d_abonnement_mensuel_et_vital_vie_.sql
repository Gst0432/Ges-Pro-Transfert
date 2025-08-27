INSERT INTO public.saas_plans (name, price_monthly, price_yearly, currency, features, is_active, trial_days, api_url)
VALUES
(
  'Plan Mensuel',
  10000,
  100000,
  'FCFA',
  '["Accès à toutes les fonctionnalités de base", "Rapports de ventes standards", "Support par e-mail"]',
  true,
  7,
  'https://www.pay.moneyfusion.net/GS_Money/b625a15aac1daeac/pay/'
),
(
  'Plan Vital',
  null,
  300000,
  'FCFA',
  '["Accès à vie à toutes les fonctionnalités", "Support prioritaire", "Mises à jour incluses", "Frais de maintenance annuels de 5000 FCFA"]',
  true,
  0,
  'https://www.pay.moneyfusion.net/GS_Money/b625a15aac1daeac/pay/'
);