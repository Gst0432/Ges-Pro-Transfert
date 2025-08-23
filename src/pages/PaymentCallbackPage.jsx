import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { checkPaymentStatus } from '@/services/paymentService';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const PaymentCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Vérification du paiement en cours...');

  const updateSubscription = useCallback(async (planId, billingCycle) => {
    if (!user || !planId) return;
    
    const now = new Date();
    let expirationDate = null;

    if (billingCycle === 'monthly') {
        expirationDate = new Date(now);
        expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
        expirationDate = new Date(now);
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    } else if (billingCycle === 'lifetime') {
        expirationDate = null;
    }

    const { data: existingSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single();

    let error;

    const subscriptionData = {
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: expirationDate ? expirationDate.toISOString() : null,
        updated_at: now.toISOString()
    };

    if (fetchError && fetchError.code !== 'PGRST116') {
        error = fetchError;
    } else if (existingSubscription) {
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update(subscriptionData)
          .eq('user_id', user.id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: user.id,
                ...subscriptionData
            });
        error = insertError;
    }


    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de mise à jour',
        description: `Impossible de mettre à jour votre abonnement. ${error.message}`,
      });
    } else {
      toast({
        title: 'Félicitations !',
        description: 'Votre abonnement Premium est maintenant actif.',
      });
    }
    
    window.localStorage.removeItem('payment_plan_id');
    window.localStorage.removeItem('payment_billing_cycle');

  }, [user, toast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const planId = window.localStorage.getItem('payment_plan_id');
    const billingCycle = window.localStorage.getItem('payment_billing_cycle');

    if (!token) {
      setStatus('error');
      setMessage('Jeton de paiement manquant. Impossible de vérifier la transaction.');
      setTimeout(() => navigate('/premium'), 4000);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await checkPaymentStatus(token);
        if (response.statut && response.data?.statut === 'paid') {
          setStatus('success');
          setMessage('Paiement réussi ! Votre abonnement est en cours d\'activation.');
          await updateSubscription(planId, billingCycle);
          setTimeout(() => navigate('/premium'), 4000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Le paiement a échoué ou est en attente.');
          setTimeout(() => navigate('/premium'), 4000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue lors de la vérification du paiement.');
        setTimeout(() => navigate('/premium'), 4000);
      }
    };

    verifyPayment();
  }, [location.search, navigate, toast, updateSubscription]);

  const StatusIcon = () => {
    if (status === 'loading') return <Loader2 className="h-16 w-16 animate-spin text-blue-600" />;
    if (status === 'success') return <CheckCircle className="h-16 w-16 text-green-600" />;
    if (status === 'error') return <XCircle className="h-16 w-16 text-red-600" />;
    return null;
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center text-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <StatusIcon />
        <h1 className="text-2xl font-bold mt-6">{status === 'success' ? 'Paiement Traité' : status === 'error' ? 'Erreur de Paiement' : 'Vérification en cours'}</h1>
        <p className="text-gray-600 mt-2">{message}</p>
        <p className="text-sm text-gray-500 mt-8">Vous allez être redirigé dans quelques secondes...</p>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;