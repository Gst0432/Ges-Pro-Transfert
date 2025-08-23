import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Gem, Check, Calendar } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { makePaymentRequest } from '@/services/paymentService';
import { supabase } from '@/lib/customSupabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const currencies = [
  { code: 'FCFA', symbol: 'FCFA' },
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
];

const PremiumPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('FCFA');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly', 'yearly', 'lifetime'
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const fetchSubscriptionAndPlans = useCallback(async () => {
    setLoadingSubscription(true);
    if (user) {
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*, saas_plans(*)')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error("Erreur de récupération de l'abonnement:", subError);
      } else {
        setSubscription(subData);
      }
    }

    const { data: plansData, error: plansError } = await supabase
      .from('saas_plans')
      .select('*')
      .eq('is_active', true)
      .eq('currency', selectedCurrency);

    if (plansError) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les plans.' });
    } else {
      setPlans(plansData);
      if (plansData && plansData.length > 0) {
        if (subscription && subscription.plan_id) {
            setSelectedPlanId(subscription.plan_id);
        } else {
            setSelectedPlanId(plansData[0].id);
        }
      } else {
        setSelectedPlanId(null);
      }
    }
    setLoadingSubscription(false);
  }, [user, selectedCurrency, toast, subscription]);

  useEffect(() => {
    fetchSubscriptionAndPlans();
  }, [fetchSubscriptionAndPlans]);
  
  const handlePremiumPurchase = async () => {
    if (!selectedPlan) {
       toast({ variant: 'destructive', title: 'Action requise', description: "Veuillez sélectionner un plan." });
        return;
    }
    
    if (!selectedPlan.api_url || selectedPlan.api_url.startsWith('YOUR_API_URL')) {
      toast({ variant: 'destructive', title: 'Action requise', description: "L'URL de l'API de paiement n'est pas configurée pour ce plan." });
      return;
    }
      
    setLoading(true);
    let priceToPay = 0;
    let effectiveBillingCycle = billingCycle;

    if (selectedPlan.name === 'Lifetime') {
        priceToPay = selectedPlan.price_yearly;
        effectiveBillingCycle = 'lifetime';
    } else {
        priceToPay = billingCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly;
    }

    const paymentData = {
      totalPrice: priceToPay,
      article: [{ [selectedPlan.name]: priceToPay }],
      numeroSend: profile?.phone || '00000000',
      nomclient: profile?.full_name || 'Utilisateur Pro-GES',
      personal_Info: [{ userId: user.id, orderId: `premium-${Date.now()}` }],
      return_url: `${window.location.origin}/payment-callback`,
    };

    try {
      window.localStorage.setItem('payment_plan_id', selectedPlan.id);
      window.localStorage.setItem('payment_billing_cycle', effectiveBillingCycle);
      const response = await makePaymentRequest(paymentData, selectedPlan.api_url);
      if (response && response.statut && response.url) {
        window.location.href = response.url;
      } else {
        throw new Error(response.message || 'Réponse de paiement invalide');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Échec du Paiement',
        description: error.message,
      });
      setLoading(false);
    }
  };

  const hasActiveSubscription = subscription && (subscription.status === 'active' || subscription.status === 'trial');
  const expirationDate = hasActiveSubscription && subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR') : null;
  
  const displayPrice = selectedPlan ? (
    selectedPlan.name === 'Lifetime' ? selectedPlan.price_yearly :
    (billingCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly)
  ) : 0;
  
  const displayBillingCycleText = selectedPlan?.name === 'Lifetime' ? 'paiement unique' : (billingCycle === 'monthly' ? 'mois' : 'an');
  const features = selectedPlan?.features || [];

  if (loadingSubscription) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
       <AnimatePresence mode="wait">
      {hasActiveSubscription ? (
        <motion.div
            key="active-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg text-center">
            <CardHeader>
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <CardTitle className="text-3xl font-extrabold text-gray-800">
                    {subscription.status === 'trial' ? 'Vous êtes en période d\'essai' : 'Vous êtes Premium !'}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                    Votre abonnement est actif jusqu'au {expirationDate}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-gray-700">Profitez de toutes les fonctionnalités avancées de Pro-GES.</p>
            </CardContent>
        </Card>
        </motion.div>
      ) : (
        <motion.div
            key="inactive-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-indigo-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <Gem className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
              <CardTitle className="text-3xl font-extrabold text-gray-800">Passez à Premium</CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                Débloquez des fonctionnalités avancées pour optimiser votre gestion commerciale.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex justify-center items-center gap-2">
                {currencies.map(c => (
                  <Button
                    key={c.code}
                    variant={selectedCurrency === c.code ? 'default' : 'outline'}
                    onClick={() => setSelectedCurrency(c.code)}
                    className={`transition-all ${selectedCurrency === c.code ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                  >
                    {c.code}
                  </Button>
                ))}
              </div>

              <div className="flex justify-center">
                <Select value={selectedPlanId || ''} onValueChange={setSelectedPlanId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sélectionner un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPlan && selectedPlan.name !== 'Lifetime' && (
                <div className="flex justify-center items-center space-x-4">
                  <Label htmlFor="billing-cycle" className="text-gray-600">Mensuel</Label>
                  <Switch
                    id="billing-cycle"
                    checked={billingCycle === 'yearly'}
                    onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                  />
                  <Label htmlFor="billing-cycle" className="text-gray-600">Annuel</Label>
                   <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full">Économisez !</span>
                </div>
              )}
              
              {selectedPlan ? (
                <>
                <div className="bg-white/70 p-6 rounded-lg shadow-inner text-center">
                    <AnimatePresence mode="wait">
                    <motion.div
                        key={`${displayPrice}-${selectedCurrency}-${displayBillingCycleText}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <p className="text-5xl font-bold text-gray-800">{displayPrice.toLocaleString('fr-FR')} <span className="text-2xl font-medium text-gray-500">{selectedCurrency}</span></p>
                        <p className="text-gray-500">/{displayBillingCycleText}</p>
                    </motion.div>
                    </AnimatePresence>
                </div>

                <ul className="space-y-3 text-gray-700">
                    {features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-1" />
                        <span>{feature}</span>
                    </li>
                    ))}
                    {selectedPlan.trial_days > 0 && (
                        <li className="flex items-start">
                            <Calendar className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-1" />
                            <span>Essai gratuit de {selectedPlan.trial_days} jours inclus</span>
                        </li>
                    )}
                </ul>
                </>
              ) : (
                <div className="text-center text-gray-500 py-10">
                    <p>Aucun plan disponible pour cette devise pour le moment.</p>
                </div>
              )}
              
            </CardContent>
            {selectedPlan && (
                <CardFooter>
                <Button
                    size="lg"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold"
                    onClick={handlePremiumPurchase}
                    disabled={loading || !selectedPlan}
                >
                    {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirection...</>
                    ) : (
                    'Commencer l\'essai et Activer'
                    )}
                </Button>
                </CardFooter>
            )}
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumPage;