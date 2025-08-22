import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, MoreHorizontal, Loader2, Truck, CheckCircle, AlertCircle, CreditCard, Edit, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { NewPurchaseOrderWizard } from '@/components/wizards/NewPurchaseOrderWizard';
import { ReceiveOrderDialog } from '@/components/ReceiveOrderDialog';
import { UpdatePurchasePaymentDialog } from '@/components/UpdatePurchasePaymentDialog';
import { Pagination } from '@/components/ui/Pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 10;

const PurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('purchase_orders')
      .select('*, supplier:suppliers(name)', { count: 'exact' })
      .order('order_date', { ascending: false })
      .range(from, to);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les commandes.' });
      setOrders([]);
    } else {
      setOrders(data);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  const handleOrderSaved = () => {
    setCurrentPage(1);
    fetchOrders(1);
  };
  
  const handleOpenReceiveDialog = (order) => {
    setSelectedOrder(order);
    setIsReceiveDialogOpen(true);
  };
  
  const handleOpenPaymentDialog = (order) => {
    setSelectedOrder(order);
    setIsPaymentDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Commandé': 'bg-blue-100 text-blue-700',
      'Partiellement Reçu': 'bg-yellow-100 text-yellow-700',
      'Reçu': 'bg-green-100 text-green-700',
      'Annulé': 'bg-gray-100 text-gray-700',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles['Annulé']}`}>{status}</span>;
  };
  
  const getPaymentStatusBadge = (status) => {
    const styles = {
      'Non Payé': 'bg-red-100 text-red-700',
      'Partiel': 'bg-yellow-100 text-yellow-700',
      'Payé': 'bg-green-100 text-green-700',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Commandes Fournisseurs</h2>
        <div className="flex items-center space-x-4">
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filtre</Button>
          <Button onClick={() => setIsWizardOpen(true)}><Plus className="w-4 h-4 mr-2" /> Nouvelle Commande</Button>
        </div>
      </div>

      <motion.div 
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-medium text-gray-600">Fournisseur</th>
                <th className="p-4 font-medium text-gray-600">Date Commande</th>
                <th className="p-4 font-medium text-gray-600">Total</th>
                <th className="p-4 font-medium text-gray-600">Statut Commande</th>
                <th className="p-4 font-medium text-gray-600">Statut Paiement</th>
                <th className="p-4 font-medium text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-gray-500">Aucune commande.</td></tr>
              ) : (
                orders.map((order, index) => (
                  <motion.tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                    <td className="p-4 text-gray-600 font-medium">{order.supplier?.name || 'N/A'}</td>
                    <td className="p-4 text-gray-600">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-800 font-bold">{order.total_amount.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4">{getPaymentStatusBadge(order.payment_status)}</td>
                    <td className="p-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenReceiveDialog(order)} disabled={order.status === 'Reçu' || order.status === 'Annulé'}>
                            <Truck className="mr-2 h-4 w-4" /> Réceptionner
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenPaymentDialog(order)} disabled={order.payment_status === 'Payé'}>
                            <CreditCard className="mr-2 h-4 w-4" /> Mettre à jour paiement
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: 'Fonctionnalité à venir !' })}>
                            <Edit className="mr-2 h-4 w-4" /> Modifier commande
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </motion.div>
      
      <NewPurchaseOrderWizard isOpen={isWizardOpen} onOpenChange={setIsWizardOpen} onOrderSaved={handleOrderSaved} />
      {selectedOrder && (
        <ReceiveOrderDialog 
          isOpen={isReceiveDialogOpen} 
          onOpenChange={setIsReceiveDialogOpen} 
          order={selectedOrder}
          onReceptionSaved={() => fetchOrders(currentPage)}
        />
      )}
       {selectedOrder && (
        <UpdatePurchasePaymentDialog
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          order={selectedOrder}
          onPaymentUpdated={() => fetchOrders(currentPage)}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersPage;