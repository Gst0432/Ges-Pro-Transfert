
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaasPlanFormDialog } from '@/components/SaasPlanFormDialog';

const SaasManagementPage = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('saas_plans').select('*').order('created_at');
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les plans.' });
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleNewPlan = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (plan) => {
    const { error } = await supabase
      .from('saas_plans')
      .update({ is_active: !plan.is_active })
      .eq('id', plan.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier le statut du plan.' });
    } else {
      toast({ title: 'Succès', description: `Statut du plan ${plan.name} mis à jour.` });
      fetchPlans();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Plans SaaS</h1>
        <Button onClick={handleNewPlan}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nouveau Plan
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-medium">Nom</th>
                <th className="p-4 font-medium">Prix Mensuel</th>
                <th className="p-4 font-medium">Prix Annuel</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Aucun plan trouvé.</td></tr>
              ) : (
                plans.map(plan => (
                  <tr key={plan.id} className="border-t">
                    <td className="p-4 font-semibold">{plan.name}</td>
                    <td className="p-4">{plan.price_monthly} €</td>
                    <td className="p-4">{plan.price_yearly ? `${plan.price_yearly} €` : 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {plan.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleToggleActive(plan)}>
                        {plan.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEditPlan(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <SaasPlanFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        plan={editingPlan}
        onPlanSaved={fetchPlans}
      />
    </div>
  );
};

export default SaasManagementPage;
