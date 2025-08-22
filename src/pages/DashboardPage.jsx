import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  Activity,
  ShoppingCart,
  Settings,
  FileText,
  Package,
  Plus,
  TrendingUp,
  Loader2,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AdminPromoteTool } from '@/components/AdminPromoteTool'; // Import the new tool

const StatCard = ({ title, value, change, icon: Icon, iconColor, iconBgColor, cardBgColor, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`${cardBgColor} rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-white`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      {loading ? null : <span className="text-white text-sm font-medium">{change}</span>}
    </div>
    <h3 className="text-white text-sm font-medium mb-1">{title}</h3>
    {loading ? <Loader2 className="w-6 h-6 animate-spin text-white mt-1" /> : <p className="text-2xl font-bold text-white">{value}</p>}
  </motion.div>
);

const DashboardPage = ({ handleActionClick }) => {
  const [stats, setStats] = useState({
    totalRevenue: { value: 0, change: '+0%' },
    activeClients: { value: 0, change: '+0%' },
    totalSales: { value: 0, change: '+0%' },
    totalProducts: { value: 0, change: '+0%' },
  });
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      const today = new Date();
      const currentMonthStart = startOfMonth(today);
      const previousMonthStart = startOfMonth(subMonths(today, 1));
      const previousMonthEnd = endOfMonth(subMonths(today, 1));

      // Fetch stats
      const { data: salesData, error: salesError } = await supabase.from('sales').select('total_amount, sale_date, client_id');
      const { data: clientsData, error: clientsError } = await supabase.from('clients').select('id');
      const { data: productsData, error: productsError } = await supabase.from('products').select('id');
      
      if (salesError || clientsError || productsError) {
        console.error("Error fetching data", salesError || clientsError || productsError);
        setLoading(false);
        return;
      }

      const currentMonthRevenue = salesData.filter(s => new Date(s.sale_date) >= currentMonthStart).reduce((sum, s) => sum + s.total_amount, 0);
      const previousMonthRevenue = salesData.filter(s => {
          const d = new Date(s.sale_date);
          return d >= previousMonthStart && d <= previousMonthEnd;
      }).reduce((sum, s) => sum + s.total_amount, 0);

      const revenueChange = previousMonthRevenue > 0 ? (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(0) : 100;

      const activeClients = new Set(salesData.map(s => s.client_id)).size;

      setStats({
        totalRevenue: { value: currentMonthRevenue.toLocaleString('fr-FR') + ' FCFA', change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%` },
        activeClients: { value: activeClients, change: '' },
        totalSales: { value: salesData.length, change: '' },
        totalProducts: { value: productsData.length, change: '' },
      });

      // Fetch revenue chart data (last 12 months)
      const monthlyRevenue = Array(12).fill(0);
      const monthLabels = Array(12).fill(0).map((_, i) => format(subMonths(today, 11-i), 'MMM', {locale: fr}));
      
      salesData.forEach(sale => {
        const monthIndex = 11 - ((today.getFullYear() - new Date(sale.sale_date).getFullYear()) * 12 + (today.getMonth() - new Date(sale.sale_date).getMonth()));
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyRevenue[monthIndex] += sale.total_amount;
        }
      });
      const maxRevenue = Math.max(...monthlyRevenue);
      setRevenueData({
        labels: monthLabels,
        values: monthlyRevenue.map(v => maxRevenue > 0 ? (v / maxRevenue) * 100 : 0)
      });


      // Fetch top products
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select('*, product:products(name)')
        .limit(4);

      if(!itemsError){
          const productSales = saleItems.reduce((acc, item) => {
              if(!acc[item.product_id]) {
                  acc[item.product_id] = { name: item.product.name, sales: 0, revenue: 0 };
              }
              acc[item.product_id].sales += item.quantity;
              acc[item.product_id].revenue += item.quantity * item.unit_price;
              return acc;
          }, {});

          const sortedProducts = Object.values(productSales).sort((a,b) => b.revenue - a.revenue).slice(0, 4);
          setTopProducts(sortedProducts);
      }


      setLoading(false);
    };

    fetchDashboardData();
  }, []);


  const statCards = [
    { title: 'Revenus (Mois)', value: stats.totalRevenue.value, change: stats.totalRevenue.change, icon: DollarSign, iconColor: 'text-white', iconBgColor: 'bg-[#005c9e]', cardBgColor: 'bg-[#267ecb]' },
    { title: 'Clients Actifs', value: stats.activeClients.value, change: stats.activeClients.change, icon: Users, iconColor: 'text-white', iconBgColor: 'bg-[#0b9c8b]', cardBgColor: 'bg-[#22c3b2]' },
    { title: 'Total Ventes', value: stats.totalSales.value, change: stats.totalSales.change, icon: ShoppingCart, iconColor: 'text-white', iconBgColor: 'bg-[#d88900]', cardBgColor: 'bg-[#ffb74b]' },
    { title: 'Total Produits', value: stats.totalProducts.value, change: stats.totalProducts.change, icon: Package, iconColor: 'text-white', iconBgColor: 'bg-[#3b6bc4]', cardBgColor: 'bg-[#5b95ff]' }
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard {...stat} key={index} loading={loading} />
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Évolution des revenus</h3>
          </div>
          {loading ? <div className="h-72 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div> : (
          <>
            <div className="h-64 flex items-end justify-between space-x-1 sm:space-x-2">
              {revenueData.values?.map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + index * 0.05 }}
                  className="bg-blue-500 rounded-t-lg flex-1 min-h-[2px]"
                />
              ))}
            </div>
            <div className="flex justify-between text-gray-500 text-xs sm:text-sm mt-4">
                {revenueData.labels?.map((label, index) => <span key={index} className="capitalize text-center">{label}</span>)}
            </div>
          </>
          )}
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Produits populaires</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('view-all-products')}
            >
              Voir tout
            </Button>
          </div>
          <div className="space-y-4">
            {loading ? <div className="h-48 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div> :
            topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                    <div>
                    <p className="text-gray-800 font-medium">{product.name}</p>
                    <p className="text-gray-500 text-sm">{product.sales} ventes</p>
                    </div>
                    <div className="text-right">
                    <p className="text-gray-800 font-bold">{product.revenue.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                </motion.div>
                ))
            ) : <p className="text-center text-gray-500 pt-10">Aucune donnée de produit.</p>}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">Actions rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Nouvelle Vente', slug: 'new_sale', icon: Plus, color: 'text-green-600', bgColor: 'bg-green-100' },
            { name: 'Nouveau Produit', slug: 'new_product', icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100' },
            { name: 'Nouveau Fournisseur', slug: 'new_supplier', icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-100' },
            { name: 'Nouvelle Facture', slug: 'new_invoice', icon: FileText, color: 'text-orange-600', bgColor: 'bg-orange-100' },
            { name: 'Nouveau Client', slug: 'new_client', icon: Users, color: 'text-red-600', bgColor: 'bg-red-100' },
            { name: 'Rapport Mensuel', slug: 'monthly_report', icon: TrendingUp, color: 'text-indigo-600', bgColor: 'bg-indigo-100' }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleActionClick(action.slug)}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group text-center"
              >
                <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <span className="text-gray-600 text-sm font-medium">{action.name}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Temporary Admin Promote Tool */}
      <AdminPromoteTool />
    </div>
  );
};

export default DashboardPage;