import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 10;

const SubscriptionManagementPage = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [subToDeactivate, setSubToDeactivate] = useState(null);

  const fetchSubscriptions = useCallback(async (page = 1) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_subscriptions_with_details', { page_num: page, page_size: ITEMS_PER_PAGE });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les abonnements." });
      console.error("Error fetching subscriptions:", error);
      setSubscriptions([]);
      setTotalPages(0);
    } else {
      setSubscriptions(data || []);
      if (data && data.length > 0 && data[0].total_count) {
        setTotalPages(Math.ceil(data[0].total_count / ITEMS_PER_PAGE));
      } else {
        setTotalPages(0);
      }
    }
    setLoading(false);
  }, [toast]);

  const fetchPlans = useCallback(async () => {
    const { data, error } = await supabase.from('saas_plans').select('*').eq('is_active', true);
    if(error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les plans.' });
    } else {
        setPlans(data || []);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubscriptions(currentPage);
    fetchPlans();
  }, [currentPage, fetchSubscriptions, fetchPlans]);

  const handlePlanChange = async (subscriptionId, userId, newPlanId) => {
    const selectedPlan = plans.find(p => p.id === newPlanId);
    if (!selectedPlan) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Plan sélectionné invalide.' });
        return;
    }

    const now = new Date();
    let expirationDate = null;

    if (selectedPlan.name === 'Plan Vital') {
        expirationDate = null; // Lifetime subscriptions have no end date
    } else {
        // Assuming yearly subscription for simplicity, adjust if billing cycle is dynamic
        expirationDate = new Date(now);
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); 
    }

    const { data: existingSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();

    let error;

    const subscriptionData = {
        plan_id: newPlanId,
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
          .eq('id', subscriptionId); // Use subscriptionId to update the specific subscription
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                ...subscriptionData
            });
        error = insertError;
    }


    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de mise à jour',
        description: `Impossible de mettre à jour l'abonnement: ${error.message}`,
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Abonnement mis à jour.',
      });
    }
    fetchSubscriptions(currentPage);
  };

  const handleDeactivateSubscription = async () => {
    if (!subToDeactivate) return;

    const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('id', subToDeactivate.subscription_id);

    if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de désactiver l\'abonnement.' });
    } else {
        toast({ title: 'Succès', description: 'Abonnement désactivé.' });
        fetchSubscriptions(currentPage);
    }
    setSubToDeactivate(null);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Gestion des Abonnements</h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Liste des abonnements</h2>
            <p className="text-gray-500 mt-1">Gérez les abonnements des utilisateurs à vos plans SaaS.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-medium text-gray-600">Utilisateur</th>
                <th className="p-4 font-medium text-gray-600">Plan Actuel</th>
                <th className="p-4 font-medium text-gray-600">Statut</th>
                <th className="p-4 font-medium text-gray-600">Début Période</th>
                <th className="p-4 font-medium text-gray-600">Fin Période</th>
                <th className="p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-8"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : subscriptions.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-gray-500">Aucun abonnement trouvé.</td></tr>
              ) : (
                subscriptions.map(sub => (
                  <tr key={sub.subscription_id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{sub.user_email}</td>
                    <td className="p-4 text-gray-600">{sub.plan_name || <span className="text-gray-400">Aucun</span>}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        sub.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
                        sub.subscription_status === 'trial' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {sub.subscription_status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{sub.current_period_start ? format(new Date(sub.current_period_start), 'dd/MM/yyyy') : 'N/A'}</td>
                    <td className="p-4 text-gray-600">
                      {sub.current_period_end ? format(new Date(sub.current_period_end), 'dd/MM/yyyy') : 
                       (sub.plan_name === 'Plan Vital' ? 'À vie' : 'N/A')}
                    </td>
                    <td className="p-4 flex items-center space-x-2">
                      <Select 
                        value={sub.plan_id || ''}
                        onValueChange={(newPlanId) => handlePlanChange(sub.subscription_id, sub.user_id, newPlanId)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Changer de plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} ({plan.name === 'Plan Vital' ? `${plan.price_yearly}/paiement unique` : `${plan.price_monthly}/mois`})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sub.plan_id && (
                        <Button variant="ghost" size="icon" onClick={() => setSubToDeactivate(sub)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        )}
      </div>
      <AlertDialog open={!!subToDeactivate} onOpenChange={() => setSubToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver l'abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ceci supprimera l'abonnement de l'utilisateur {subToDeactivate?.user_email} au plan {subToDeactivate?.plan_name}. L'utilisateur perdra l'accès aux fonctionnalités payantes. Cette action est réversible en lui assignant un nouveau plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateSubscription} className="bg-red-600 hover:bg-red-700">Désactiver</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionManagementPage;