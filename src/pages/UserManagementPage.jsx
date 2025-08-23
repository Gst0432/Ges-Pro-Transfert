import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ITEMS_PER_PAGE = 10;

const UserManagementPage = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userToDeactivateSubscription, setUserToDeactivateSubscription] = useState(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    
    const { data, error } = await supabase.rpc('get_all_users_with_subscriptions', { page_num: page, page_size: ITEMS_PER_PAGE });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les utilisateurs." });
      console.error("Error fetching users:", error);
      setUsers([]);
      setTotalPages(0);
    } else {
      setUsers(data || []);
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
    fetchData(currentPage);
    fetchPlans();
  }, [currentPage, fetchData, fetchPlans]);

  const handleRoleChange = async (targetUser, isSuperAdmin) => {
    if (targetUser.id === currentUser.id) {
        toast({ variant: 'destructive', title: 'Action impossible', description: "Vous ne pouvez pas modifier votre propre rôle." });
        return;
    }
    
    const { error } = await supabase.rpc('set_user_super_admin_status', {
        target_user_id: targetUser.id,
        is_admin: isSuperAdmin
    });

    if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de modifier le rôle de l'utilisateur." });
        fetchData(currentPage);
    } else {
        toast({ title: 'Succès', description: `Rôle de ${targetUser.email} mis à jour.` });
        fetchData(currentPage);
    }
  };

  const handleActivationChange = async (targetUser, isActive) => {
    if (targetUser.id === currentUser.id) {
        toast({ variant: 'destructive', title: 'Action impossible', description: "Vous ne pouvez pas désactiver votre propre compte." });
        return;
    }

    const { error } = await supabase.rpc('toggle_user_activation', {
        target_user_id: targetUser.id,
        is_active: isActive
    });

    if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de modifier le statut de l'utilisateur." });
        fetchData(currentPage);
    } else {
        toast({ title: 'Succès', description: `Statut de ${targetUser.email} mis à jour.` });
        fetchData(currentPage);
    }
  };

  const handleSubscriptionChange = async (userId, planId) => {
    const { error } = await supabase.from('user_subscriptions').upsert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Assuming yearly for simplicity
        updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if(error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour l\'abonnement.' });
    } else {
        toast({ title: 'Succès', description: 'Abonnement mis à jour.' });
        fetchData(currentPage);
    }
  };

  const handleDeactivateSubscription = async () => {
    if (!userToDeactivateSubscription) return;

    const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', userToDeactivateSubscription.id);

    if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de désactiver l\'abonnement.' });
    } else {
        toast({ title: 'Succès', description: 'Abonnement désactivé.' });
        fetchData(currentPage);
    }
    setUserToDeactivateSubscription(null);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Liste des utilisateurs</h2>
            <p className="text-gray-500 mt-1">Gérez les rôles, l'accès et les abonnements des utilisateurs de la plateforme.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-medium text-gray-600">Email</th>
                <th className="p-4 font-medium text-gray-600">Date d'inscription</th>
                <th className="p-4 font-medium text-gray-600">Plan Actuel</th>
                <th className="p-4 font-medium text-gray-600">Super Admin</th>
                <th className="p-4 font-medium text-gray-600">Compte Actif</th>
                <th className="p-4 font-medium text-gray-600">Actions Abonnement</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-8"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-gray-500">Aucun utilisateur trouvé.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                           {user.is_super_admin && <ShieldCheck className="w-5 h-5 text-green-500" title="Super Administrateur" />}
                           <span>{user.email}</span>
                        </div>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 text-gray-600">{user.plan_name || <span className="text-gray-400">Aucun</span>}</td>
                    <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`role-switch-${user.id}`}
                            checked={user.is_super_admin}
                            onCheckedChange={(checked) => handleRoleChange(user, checked)}
                            disabled={user.id === currentUser?.id}
                          />
                          <Label htmlFor={`role-switch-${user.id}`} className="font-normal">
                            {user.is_super_admin ? 'Oui' : 'Non'}
                          </Label>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`active-switch-${user.id}`}
                            checked={user.is_active}
                            onCheckedChange={(checked) => handleActivationChange(user, checked)}
                            disabled={user.id === currentUser?.id}
                          />
                          <Label htmlFor={`active-switch-${user.id}`} className="font-normal">
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </Label>
                        </div>
                    </td>
                    <td className="p-4 flex items-center space-x-2">
                      <Select 
                        value={user.plan_id || ''}
                        onValueChange={(planId) => handleSubscriptionChange(user.id, planId)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Changer de plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>{plan.name} ({plan.price_monthly}/mois)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {user.plan_id && (
                        <Button variant="ghost" size="icon" onClick={() => setUserToDeactivateSubscription(user)}>
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
      <AlertDialog open={!!userToDeactivateSubscription} onOpenChange={() => setUserToDeactivateSubscription(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver l'abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ceci supprimera l'abonnement de l'utilisateur {userToDeactivateSubscription?.email}. L'utilisateur perdra l'accès aux fonctionnalités payantes. Cette action est réversible en lui assignant un nouveau plan.
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

export default UserManagementPage;