import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, DollarSign, ListChecks, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl shadow-sm flex items-start space-x-4 border"
    whileHover={{ y: -5 }}
  >
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </motion.div>
);

const ITEMS_PER_PAGE = 10;

const CreditSalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalDue: 0, count: 0 });
  const [selectedSale, setSelectedSale] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ newStatus: '', amountPaid: 0, notes: ''});
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCreditSales = useCallback(async (page = 1) => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('sales')
      .select('*, clients(name)', { count: 'exact' })
      .in('status', ['En attente', 'Partiel'])
      .order('due_date', { ascending: true, nullsFirst: false })
      .range(from, to);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les ventes à crédit.' });
      setSales([]);
    } else {
      setSales(data);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      
      // Recalculate stats based on ALL credit sales, not just the current page
      const { data: allCreditSales, error: allError } = await supabase
        .from('sales')
        .select('total_amount, amount_paid')
        .in('status', ['En attente', 'Partiel']);
      
      if (!allError) {
        const totalDue = allCreditSales.reduce((acc, sale) => acc + (sale.total_amount - (sale.amount_paid || 0)), 0);
        setStats({ totalDue, count });
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCreditSales(currentPage);
  }, [fetchCreditSales, currentPage]);

  const handleOpenUpdateModal = (sale) => {
    setSelectedSale(sale);
    setUpdateFormData({
        newStatus: sale.status,
        amountPaid: 0,
        notes: ''
    });
    setIsUpdateModalOpen(true);
  };
  
  const handleUpdateSale = async () => {
    if (!selectedSale) return;
    
    const newAmountPaid = (selectedSale.amount_paid || 0) + parseFloat(updateFormData.amountPaid || 0);
    const isPaid = newAmountPaid >= selectedSale.total_amount;
    const newStatus = isPaid ? 'Payée' : updateFormData.newStatus;
    
    const { error } = await supabase
      .from('sales')
      .update({ 
        status: newStatus, 
        amount_paid: newAmountPaid 
      })
      .eq('id', selectedSale.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'La mise à jour a échoué.' });
    } else {
      toast({ title: 'Succès', description: 'La vente a été mise à jour.' });
      setIsUpdateModalOpen(false);
      setSelectedSale(null);
      fetchCreditSales(currentPage);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'En attente': return 'bg-yellow-100 text-yellow-700';
      case 'Partiel': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Gestion des Ventes à Crédit</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Montant total dû" value={`${stats.totalDue.toLocaleString('fr-FR')} FCFA`} icon={<DollarSign className="w-6 h-6 text-green-600"/>} color="bg-green-100"/>
        <StatCard title="Ventes en attente" value={stats.count} icon={<ListChecks className="w-6 h-6 text-blue-600"/>} color="bg-blue-100"/>
        <StatCard title="Taux de retard" value="À calculer" icon={<TrendingUp className="w-6 h-6 text-red-600"/>} color="bg-red-100"/>
      </div>

       <motion.div 
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-medium text-gray-600">Client</th>
                <th className="p-4 font-medium text-gray-600">Date Échéance</th>
                <th className="p-4 font-medium text-gray-600">Total Vente</th>
                <th className="p-4 font-medium text-gray-600">Montant Payé</th>
                <th className="p-4 font-medium text-gray-600">Solde Dû</th>
                <th className="p-4 font-medium text-gray-600">Statut</th>
                <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-8 text-gray-500">Aucune vente à crédit.</td></tr>
              ) : (
                sales.map((sale, index) => {
                  const dueAmount = sale.total_amount - (sale.amount_paid || 0);
                  return (
                    <motion.tr key={sale.id} className="border-t border-gray-200 hover:bg-gray-50"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                      <td className="p-4 text-gray-600">{sale.clients?.name || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{sale.due_date ? new Date(sale.due_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4 text-gray-600 font-medium">{sale.total_amount.toLocaleString('fr-FR')} FCFA</td>
                      <td className="p-4 text-gray-600">{sale.amount_paid?.toLocaleString('fr-FR') || 0} FCFA</td>
                      <td className="p-4 text-red-600 font-bold">{dueAmount.toLocaleString('fr-FR')} FCFA</td>
                      <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(sale.status)}`}>{sale.status}</span></td>
                      <td className="p-4 text-right">
                        <Button size="sm" onClick={() => handleOpenUpdateModal(sale)}>Mettre à jour</Button>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </motion.div>
      
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Mettre à jour la vente</DialogTitle>
                <DialogDescription>
                    Client: {selectedSale?.clients.name} - Total: {selectedSale?.total_amount.toLocaleString('fr-FR')} FCFA
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                    <Label htmlFor="amountPaid">Montant encaissé</Label>
                    <Input id="amountPaid" type="number" value={updateFormData.amountPaid} onChange={(e) => setUpdateFormData({...updateFormData, amountPaid: e.target.value})} />
                </div>
                 <div>
                    <Label htmlFor="newStatus">Nouveau Statut</Label>
                    <Select value={updateFormData.newStatus} onValueChange={(value) => setUpdateFormData({...updateFormData, newStatus: value})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En attente">En attente (Crédit)</SelectItem>
                        <SelectItem value="Partiel">Paiement partiel</SelectItem>
                        <SelectItem value="Payée">Payée</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" value={updateFormData.notes} onChange={(e) => setUpdateFormData({...updateFormData, notes: e.target.value})} placeholder="Ex: Paiement en espèces"/>
                 </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Annuler</Button>
                <Button onClick={handleUpdateSale}>Enregistrer</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditSalesPage;