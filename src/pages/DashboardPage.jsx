import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, ShoppingCart, Package, DollarSign, TrendingUp, 
  Users, AlertTriangle, Plus, Zap, Loader2 
} from 'lucide-react';
import { NewSaleWizard } from '@/components/wizards/new-sale/NewSaleWizard';
import { ProductWizard } from '@/components/wizards/ProductWizard';
import { AdminPromoteTool } from '@/components/AdminPromoteTool';

const StatCard = ({ title, value, change, icon: Icon, color, bgColor, loading, onClick }) => (
  <motion.div
    className="stat-card-yellow-blue cursor-pointer interactive-yellow-blue"
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {loading ? null : (
        change && <span className={`text-sm font-medium ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
      )}
    </div>
    <h3 className="text-blue-600 text-sm font-medium mb-1">{title}</h3>
    {loading ? <Loader2 className="w-6 h-6 animate-spin text-blue-400 mt-1" /> : <p className="text-2xl font-bold text-blue-800">{value}</p>}
  </motion.div>
);

const QuickActionCard = ({ title, description, icon: Icon, color, bgColor, onClick, disabled = false }) => (
  <motion.div
    className={`feature-card cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'interactive-yellow-blue'}`}
    whileHover={disabled ? {} : { y: -8, scale: 1.02 }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    onClick={disabled ? undefined : onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className={`${bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <h3 className="text-lg font-bold text-blue-800 mb-2">{title}</h3>
    <p className="text-blue-600 text-sm">{description}</p>
  </motion.div>
);

const RecentActivityItem = ({ type, description, time, amount }) => (
  <motion.div
    className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200 hover:shadow-yellow-blue transition-all duration-300"
    whileHover={{ x: 4 }}
  >
    <div className="flex items-center space-x-3">
      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      <div>
        <p className="font-medium text-blue-800">{description}</p>
        <p className="text-xs text-blue-500">{time}</p>
      </div>
    </div>
    {amount && <span className="font-bold text-blue-700">{amount}</span>}
  </motion.div>
);

const DashboardPage = ({ handleActionClick }) => {
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalSales: { value: 0, change: '+0%' },
    totalProducts: { value: 0, change: '+0%' },
    lowStockItems: { value: 0 },
    pendingOrders: { value: 0 },
    monthlyRevenue: { value: 0, change: '+0%' },
    totalClients: { value: 0, change: '+0%' }
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [salesData, productsData, clientsData, ordersData] = await Promise.all([
        supabase.from('sales').select('total_amount, sale_date').eq('user_id', user.id),
        supabase.from('products').select('quantity').eq('user_id', user.id),
        supabase.from('clients').select('id').eq('user_id', user.id),
        supabase.from('purchase_orders').select('status').eq('user_id', user.id).neq('status', 'Reçu')
      ]);

      const totalSales = salesData.data?.length || 0;
      const totalProducts = productsData.data?.length || 0;
      const lowStockItems = productsData.data?.filter(p => p.quantity < 5).length || 0;
      const pendingOrders = ordersData.data?.length || 0;
      const totalClients = clientsData.data?.length || 0;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = salesData.data?.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      }).reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

      setStats({
        totalSales: { value: totalSales, change: '+12%' },
        totalProducts: { value: totalProducts, change: '+5%' },
        lowStockItems: { value: lowStockItems },
        pendingOrders: { value: pendingOrders },
        monthlyRevenue: { value: `${monthlyRevenue.toLocaleString('fr-FR')} FCFA`, change: '+18%' },
        totalClients: { value: totalClients, change: '+8%' }
      });

      // Mock recent activity
      setRecentActivity([
        { type: 'sale', description: 'Nouvelle vente enregistrée', time: 'Il y a 2h', amount: '25,000 FCFA' },
        { type: 'product', description: 'Stock mis à jour', time: 'Il y a 4h' },
        { type: 'client', description: 'Nouveau client ajouté', time: 'Il y a 6h' },
      ]);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les données du tableau de bord.' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDataRefresh = () => {
    fetchDashboardData();
  };

  const quickActions = [
    {
      title: "Nouvelle Vente",
      description: "Enregistrer une vente rapidement",
      icon: ShoppingCart,
      color: "text-white",
      bgColor: "bg-blue-500",
      onClick: () => setIsNewSaleOpen(true)
    },
    {
      title: "Ajouter Produit",
      description: "Ajouter un nouveau produit",
      icon: Package,
      color: "text-white",
      bgColor: "bg-yellow-500",
      onClick: () => setIsNewProductOpen(true)
    },
    {
      title: "Vente Rapide",
      description: "Mode vente express",
      icon: Zap,
      color: "text-white",
      bgColor: "bg-gradient-to-r from-yellow-500 to-blue-500",
      onClick: () => window.location.href = '/quick-sale'
    }
  ];

  return (
    <div className="space-y-8 page-transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-display font-bold heading-yellow-blue">
            Tableau de bord
          </h1>
          <p className="text-blue-600 text-lg mt-2">
            Bienvenue, {user?.email?.split('@')[0]} ! Voici un aperçu de votre activité.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button 
            onClick={handleDataRefresh} 
            disabled={loading}
            className="btn-yellow-blue"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Actualiser
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Ventes totales"
          value={stats.totalSales.value}
          change={stats.totalSales.change}
          icon={ShoppingCart}
          color="text-blue-600"
          bgColor="bg-blue-100"
          loading={loading}
          onClick={() => window.location.href = '/sales'}
        />
        <StatCard
          title="Produits"
          value={stats.totalProducts.value}
          change={stats.totalProducts.change}
          icon={Package}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
          loading={loading}
          onClick={() => window.location.href = '/inventory'}
        />
        <StatCard
          title="Stock faible"
          value={stats.lowStockItems.value}
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-100"
          loading={loading}
          onClick={() => window.location.href = '/inventory'}
        />
        <StatCard
          title="Commandes en cours"
          value={stats.pendingOrders.value}
          icon={TrendingUp}
          color="text-purple-600"
          bgColor="bg-purple-100"
          loading={loading}
          onClick={() => window.location.href = '/purchase-orders'}
        />
        <StatCard
          title="Revenus du mois"
          value={stats.monthlyRevenue.value}
          change={stats.monthlyRevenue.change}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-100"
          loading={loading}
          onClick={() => window.location.href = '/reports'}
        />
        <StatCard
          title="Clients"
          value={stats.totalClients.value}
          change={stats.totalClients.change}
          icon={Users}
          color="text-indigo-600"
          bgColor="bg-indigo-100"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-yellow-blue">
            <h3 className="text-xl font-bold text-blue-800 mb-6">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-yellow-blue">
            <h3 className="text-xl font-bold text-blue-800 mb-6">Activité récente</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <RecentActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Admin Tool - Only show for development */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AdminPromoteTool />
        </motion.div>
      )}

      {/* Modals */}
      <NewSaleWizard 
        isOpen={isNewSaleOpen} 
        onOpenChange={setIsNewSaleOpen} 
        onSaleSaved={handleDataRefresh}
      />
      <ProductWizard 
        isOpen={isNewProductOpen} 
        onOpenChange={setIsNewProductOpen} 
        onProductSaved={handleDataRefresh}
      />
    </div>
  );
};

export default DashboardPage;