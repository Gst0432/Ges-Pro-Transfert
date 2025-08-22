import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ITEMS_PER_PAGE = 10;

const UserManagementPage = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    
    const { data, error } = await supabase.rpc('get_all_users_with_subscriptions', { page_num: page, page_size: ITEMS_PER_PAGE });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de charger les utilisateurs." });
      console.error("Error fetching users:", error); // DEBUG LOG
      setUsers([]);
    } else {
      console.log("Fetched users data:", data); // DEBUG LOG
      setUsers(data || []);
      if (data && data.length > 0 && data[0].total_count) {
        setTotalPages(Math.ceil(data[0].total_count / ITEMS_PER_PAGE));
      } else {
        setTotalPages(0);
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Liste des utilisateurs</h2>
            <p className="text-gray-500 mt-1">Gérez les rôles et l'accès des utilisateurs de la plateforme.</p>
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Aucun utilisateur trouvé.</td></tr>
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
    </div>
  );
};

export default UserManagementPage;