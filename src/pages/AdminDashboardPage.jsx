import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, Briefcase, DollarSign, UserCheck, UserX, BarChart } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color, bgColor, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {loading ? null : (
        change && <span className={`text-sm font-medium ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" /> : <p className="text-2xl font-bold text-gray-800">{value}</p>}
  </motion.div>
);

const AdminDashboardPage = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: { value: 0, change: '+0%' },
    activeSubscriptions: { value: 0, change: '+0%' },
    monthlyRecurringRevenue: { value: 0, change: '+0%' },
    activeUsers: { value: 0 },
    inactiveUsers: { value: 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les statistiques.' });
      console.error(error);
    } else if (data) {
      const statsData = data[0];
      setStats({
        totalUsers: { value: statsData.total_users, change: `+${statsData.new_users_last_30_days}` },
        activeSubscriptions: { value: statsData.active_subscriptions, change: null },
        monthlyRecurringRevenue: { value: `${statsData.mrr.toLocaleString('fr-FR')} FCFA`, change: null },
        activeUsers: { value: statsData.active_users },
        inactiveUsers: { value: statsData.inactive_users }
      });
    }

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    { title: 'Utilisateurs Totaux', value: stats.totalUsers.value, change: `${stats.totalUsers.change} (30j)`, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Abonnements Actifs', value: stats.activeSubscriptions.value, change: stats.activeSubscriptions.change, icon: Briefcase, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Revenus Mensuels (MRR)', value: stats.monthlyRecurringRevenue.value, change: stats.monthlyRecurringRevenue.change, icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  const userStatusCards = [
     { title: 'Utilisateurs Actifs', value: stats.activeUsers.value, icon: UserCheck, color: 'text-teal-600', bgColor: 'bg-teal-100' },
     { title: 'Utilisateurs Inactifs', value: stats.inactiveUsers.value, icon: UserX, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord Administrateur</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <StatCard {...stat} key={index} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {userStatusCards.map((stat, index) => (
          <StatCard {...stat} key={index} loading={loading} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Activité Récente</h3>
        {loading ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
            <div className="text-center py-10 text-gray-500">
                <BarChart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>Les graphiques d'activité récente seront bientôt disponibles.</p>
            </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage;