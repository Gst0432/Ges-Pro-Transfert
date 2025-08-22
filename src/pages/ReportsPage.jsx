import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, RefreshCw, ArrowUp, ArrowDown, Package, ShoppingCart, Shield, FileText, DollarSign, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

const StatCard = ({ title, value, icon, color, isLoading }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl shadow-sm flex items-start space-x-4 border"
    whileHover={{ y: -5 }}
  >
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
    </div>
  </motion.div>
);

const ReportsPage = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalSales: 0,
    stockValue: 0,
    operatingCosts: 0,
    debts: 0,
    receivables: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const availableYears = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  const fetchAllStats = useCallback(async (year) => {
    setLoading(true);
    const startDate = format(startOfYear(new Date(parseInt(year), 0, 1)), 'yyyy-MM-dd');
    const endDate = format(endOfYear(new Date(parseInt(year), 11, 31)), 'yyyy-MM-dd');

    try {
      const [
        salesData,
        purchaseOrdersData,
        productsData,
        expensesData,
      ] = await Promise.all([
        supabase.from('sales').select('total_amount, amount_paid, status, sale_date').gte('sale_date', startDate).lte('sale_date', endDate),
        supabase.from('purchase_orders').select('total_amount, amount_paid, payment_status, order_date').gte('order_date', startDate).lte('order_date', endDate),
        supabase.from('products').select('quantity, purchase_price'), // Stock value is independent of year
        supabase.from('expenses').select('amount, expense_date').gte('expense_date', startDate).lte('expense_date', endDate),
      ]);

      if (salesData.error || purchaseOrdersData.error || productsData.error || expensesData.error) {
        throw new Error('Erreur de chargement des données');
      }

      const totalSales = salesData.data.reduce((sum, sale) => sum + sale.total_amount, 0);
      const receivables = salesData.data
        .filter(s => s.status !== 'Payée')
        .reduce((sum, sale) => sum + (sale.total_amount - (sale.amount_paid || 0)), 0);

      const totalExpenses = purchaseOrdersData.data.reduce((sum, po) => sum + po.total_amount, 0);
      const debts = purchaseOrdersData.data
        .filter(po => po.payment_status !== 'Payé')
        .reduce((sum, po) => sum + (po.total_amount - (po.amount_paid || 0)), 0);

      const stockValue = productsData.data.reduce((sum, p) => sum + ((p.quantity || 0) * (p.purchase_price || 0)), 0);
      const operatingCosts = expensesData.data.reduce((sum, e) => sum + e.amount, 0);

      setStats({
        totalSales,
        receivables,
        totalExpenses,
        debts,
        stockValue,
        operatingCosts,
      });

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllStats(selectedYear);
  }, [fetchAllStats, selectedYear]);

  const handleDownloadReport = async (period) => {
    toast({ title: 'Génération du rapport...', description: 'Veuillez patienter.' });
    
    const doc = new jsPDF();
    const title = `Rapport Comptable - ${period === 'monthly' ? `Mois de ${format(new Date(), 'MMMM yyyy', { locale: fr })}` : `Exercice ${selectedYear}`}`;
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Généré le: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28);

    const tableData = [
      ['Indicateur', 'Valeur (FCFA)'],
      ['Total des Ventes', stats.totalSales.toLocaleString('fr-FR')],
      ['Total des Dépenses (Fournisseurs)', stats.totalExpenses.toLocaleString('fr-FR')],
      ['Total des Charges de Fonctionnement', stats.operatingCosts.toLocaleString('fr-FR')],
      ['Valeur du Stock', stats.stockValue.toLocaleString('fr-FR')],
      ['Créances Clients', stats.receivables.toLocaleString('fr-FR')],
      ['Dettes Fournisseurs', stats.debts.toLocaleString('fr-FR')],
    ];

    const profit = stats.totalSales - (stats.totalExpenses + stats.operatingCosts);
    tableData.push(['Bénéfice Brut (Ventes - Dépenses - Charges)', profit.toLocaleString('fr-FR')]);

    doc.autoTable({
      startY: 40,
      head: [['Indicateur', 'Valeur (FCFA)']],
      body: tableData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save(`rapport_comptable_${period}_${period === 'full' ? selectedYear : format(new Date(), 'MM-yyyy')}_${Date.now()}.pdf`);
    toast({ title: 'Succès', description: 'Rapport téléchargé.' });
  };

  const formatCurrency = (value) => `${value.toLocaleString('fr-FR')} FCFA`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Comptabilité</h2>
        <div className="flex items-center space-x-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Choisir un exercice" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>Exercice {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchAllStats(selectedYear)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </Button>
          <Button onClick={() => handleDownloadReport('monthly')}>
            <Download className="w-4 h-4 mr-2" /> Rapport Mensuel
          </Button>
           <Button onClick={() => handleDownloadReport('full')}>
            <Download className="w-4 h-4 mr-2" /> Rapport Exercice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total des Ventes" value={formatCurrency(stats.totalSales)} icon={<ShoppingCart className="w-6 h-6 text-green-600"/>} color="bg-green-100" isLoading={loading}/>
        <StatCard title="Dépenses Fournisseurs" value={formatCurrency(stats.totalExpenses)} icon={<ArrowDown className="w-6 h-6 text-red-600"/>} color="bg-red-100" isLoading={loading}/>
        <StatCard title="Charges de Fonctionnement" value={formatCurrency(stats.operatingCosts)} icon={<Shield className="w-6 h-6 text-orange-600"/>} color="bg-orange-100" isLoading={loading}/>
        <StatCard title="Valeur du Stock" value={formatCurrency(stats.stockValue)} icon={<Package className="w-6 h-6 text-blue-600"/>} color="bg-blue-100" isLoading={loading}/>
        <StatCard title="Créances (Clients)" value={formatCurrency(stats.receivables)} icon={<DollarSign className="w-6 h-6 text-yellow-600"/>} color="bg-yellow-100" isLoading={loading}/>
        <StatCard title="Dettes (Fournisseurs)" value={formatCurrency(stats.debts)} icon={<AlertCircle className="w-6 h-6 text-purple-600"/>} color="bg-purple-100" isLoading={loading}/>
      </div>

      <motion.div
        className="bg-white rounded-2xl p-6 border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Résumé Financier de l'exercice {selectedYear}</h3>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Bénéfice Brut (Ventes - Dépenses - Charges)</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalSales - stats.totalExpenses - stats.operatingCosts)}
              </p>
            </div>
             <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Actifs Circulants (Stock + Créances)</p>
              <p className="text-xl font-semibold text-blue-600">
                {formatCurrency(stats.stockValue + stats.receivables)}
              </p>
            </div>
             <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Passifs (Dettes)</p>
              <p className="text-xl font-semibold text-red-600">
                {formatCurrency(stats.debts)}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportsPage;