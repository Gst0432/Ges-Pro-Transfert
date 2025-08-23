import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Filter, Download, MoreHorizontal, Trash2, Edit, Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewSaleWizard } from '@/components/wizards/new-sale/NewSaleWizard';
import { Pagination } from '@/components/ui/Pagination';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import ReceiptPrinter from '@/components/ReceiptPrinter';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';

const ITEMS_PER_PAGE = 10;

const SalesPage = ({ handleActionClick }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { settings: companySettings } = useCompanySettings();

  const fetchSales = useCallback(async (page = 1) => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('sales')
      .select('*, clients(name)', { count: 'exact' })
      .order('sale_date', { ascending: false })
      .range(from, to);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les ventes.",
      });
      setSales([]);
    } else {
      setSales(data);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSales(currentPage);
  }, [fetchSales, currentPage]);

  const handleSaleSaved = () => {
    setCurrentPage(1);
    fetchSales(1);
  };

  const handleDeleteSale = async () => {
    if (!saleToDelete) return;

    const { error } = await supabase.from('sales').delete().eq('id', saleToDelete.id);

    if (error) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de supprimer la vente.",
        });
    } else {
        toast({
            title: "Succès",
            description: "Vente supprimée avec succès.",
        });
        fetchSales(currentPage);
    }
    setSaleToDelete(null);
  };

  const handleExportSales = async () => {
    setLoading(true);
    toast({ title: "Exportation en cours..." });
    const { data: allSales, error } = await supabase
      .from('sales')
      .select('*, clients(name)');

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'exporter les données." });
      setLoading(false);
      return;
    }

    const doc = new jsPDF();
    doc.text("Rapport des Ventes", 14, 16);
    
    const tableColumn = ["ID Vente", "Client", "Date", "Total (FCFA)", "Statut"];
    const tableRows = [];

    allSales.forEach(sale => {
      const saleData = [
        sale.id.substring(0, 8),
        sale.clients?.name || 'N/A',
        new Date(sale.sale_date).toLocaleDateString(),
        sale.total_amount.toLocaleString('fr-FR'),
        sale.status
      ];
      tableRows.push(saleData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save('rapport_ventes.pdf');
    toast({ title: "Succès", description: "Rapport des ventes exporté." });
    setLoading(false);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Payée': return 'bg-green-100 text-green-700';
      case 'En attente': return 'bg-yellow-100 text-yellow-700';
      case 'Partiel': return 'bg-blue-100 text-blue-700';
      case 'Annulée': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Gestion des Ventes</h2>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="outline" onClick={() => handleActionClick('filter_sales')} className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 mr-2" /> Filtre
          </Button>
          <Button variant="outline" onClick={handleExportSales} disabled={loading} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" /> Exporter
          </Button>
          <Button onClick={() => setIsWizardOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" /> Nouvelle Vente
          </Button>
        </div>
      </div>

      <motion.div 
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-medium text-gray-600">ID Vente</th>
                <th className="p-4 font-medium text-gray-600">Client</th>
                <th className="p-4 font-medium text-gray-600">Date</th>
                <th className="p-4 font-medium text-gray-600">Total</th>
                <th className="p-4 font-medium text-gray-600">Statut</th>
                <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8">
                    <div className="flex justify-center items-center space-x-2 text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Chargement des ventes...</span>
                    </div>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                 <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-500">
                    Aucune vente à afficher.
                  </td>
                </tr>
              ) : (
                sales.map((sale, index) => (
                  <motion.tr 
                    key={sale.id} 
                    className="border-t border-gray-200 hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-4 text-gray-800 font-mono text-xs">{sale.id.substring(0,8)}...</td>
                    <td className="p-4 text-gray-600 truncate max-w-[150px]">{sale.clients?.name || 'N/A'}</td>
                    <td className="p-4 text-gray-600">{new Date(sale.sale_date).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-600 font-medium">{sale.total_amount.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleActionClick(`view_sale_${sale.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> Voir Détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleActionClick(`edit_sale_${sale.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ReceiptPrinter saleData={sale} companySettings={companySettings} />
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSaleToDelete(sale)} className="text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
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
      <NewSaleWizard isOpen={isWizardOpen} onOpenChange={setIsWizardOpen} onSaleSaved={handleSaleSaved} />

      <AlertDialog open={!!saleToDelete} onOpenChange={() => setSaleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et supprimera définitivement la vente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSale}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SalesPage;