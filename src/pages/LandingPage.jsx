import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Check, BarChart3, ShoppingCart, Package, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const features = [
  { icon: ShoppingCart, title: 'Gestion des Ventes', description: 'Suivez vos ventes, gérez les crédits clients et générez des reçus en un clic.' },
  { icon: Package, title: 'Contrôle d\'Inventaire', description: 'Gardez un œil sur vos stocks en temps réel et gérez vos produits facilement.' },
  { icon: FileText, title: 'Facturation & Comptabilité', description: 'Créez des factures, suivez les dépenses et consultez des rapports financiers clairs.' },
];

const PricingSection = () => {
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('saas_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');
      if (!error) {
        setPlans(data);
      }
    };
    fetchPlans();
  }, []);

  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Un tarif simple et transparent</h2>
          <p className="mt-4 text-lg text-gray-600">Choisissez le plan qui correspond à la croissance de votre entreprise.</p>
        </div>
        
        <div className="flex justify-center items-center space-x-4 my-10">
          <Label htmlFor="billing-cycle">Mensuel</Label>
          <Switch
            id="billing-cycle"
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <Label htmlFor="billing-cycle">Annuel <span className="text-sm font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">Économisez !</span></Label>
        </div>

        <div className="mt-12 space-y-8 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
          {plans.map((plan) => {
            const isLifetime = plan.name === 'Plan Vital';
            const price = isLifetime ? plan.price_yearly : (billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly);
            const period = isLifetime ? 'à vie' : (billingCycle === 'monthly' ? '/mois' : '/an');

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
                className={`rounded-2xl border-2 p-8 shadow-lg flex flex-col relative ${isLifetime ? 'border-indigo-500' : 'border-gray-200'}`}
              >
                {isLifetime && (
                  <div className="absolute top-0 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Recommandé</div>
                )}
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-gray-600">{plan.features.length > 3 ? "Toutes les fonctionnalités pour booster votre croissance." : "L'essentiel pour bien démarrer."}</p>
                <div className="mt-8">
                  <span className="text-5xl font-extrabold text-gray-900">{price.toLocaleString('fr-FR')}</span>
                  <span className="text-xl font-medium text-gray-500"> FCFA</span>
                  <span className="text-lg font-medium text-gray-500">{period}</span>
                </div>
                <ul className="mt-8 space-y-4 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="flex-shrink-0 h-6 w-6 text-green-500 mr-3" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className={`mt-10 block w-full text-center rounded-lg px-6 py-3 text-lg font-semibold ${isLifetime ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
                  Choisir ce plan
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const LandingPage = () => {
  return (
    <div className="bg-white">
      <LandingHeader />
      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 sm:pt-32 sm:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gray-50">
            <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_10%,#e0e7ff_0%,transparent_100%)]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight"
            >
              La gestion commerciale, <span className="text-blue-600">simplifiée</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600"
            >
              PREMIUM PRO est la solution tout-en-un pour piloter vos ventes, votre inventaire et votre facturation avec une facilité déconcertante.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex justify-center gap-4"
            >
              <Button asChild size="lg" className="text-lg">
                <Link to="/auth">Commencer gratuitement</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <a href="#pricing">Voir les tarifs</a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Tout ce dont vous avez besoin pour réussir</h2>
              <p className="mt-4 text-lg text-gray-600">Concentrez-vous sur votre croissance, nous nous occupons du reste.</p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-8 bg-gray-50/50 rounded-2xl shadow-sm border border-gray-100"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;