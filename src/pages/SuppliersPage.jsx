import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Truck, Mail, Phone, MoreHorizontal, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/ui/Pagination';
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
import { SupplierFormDialog } from '@/components/SupplierFormDialog';

const ITEMS_PER_PAGE = 8;

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const fetchSuppliers = useCallback(async (page = 1) => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les fournisseurs.",
      });
      setSuppliers([]);
    } else {
      setSuppliers(data);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSuppliers(currentPage);
  }, [fetchSuppliers, currentPage]);

  const handleSupplierSaved = () => {
    fetchSuppliers(currentPage);
  };

  const handleOpenForm = (supplier = null) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierToDelete.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le fournisseur. " + error.message,
      });
    } else {
      toast({
        title: "Succès",
        description: `Le fournisseur "${supplierToDelete.name}" a été supprimé.`,
      });
      fetchSuppliers(currentPage);
    }
    setSupplierToDelete(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Gestion des Fournisseurs</h2>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter Fournisseur
        </Button>
      </div>

      <motion.div 
        className="bg-white rounded-2xl border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="p-8 flex justify-center items-center space-x-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Chargement des fournisseurs...</span>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">Aucun fournisseur trouvé.</p>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter votre premier fournisseur
            </Button>
          </div>
        ) : (
          <>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {suppliers.map((supplier, index) => (
                <motion.div
                  key={supplier.id}
                  className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-blue-500/50 hover:bg-white transition-all duration-300 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg"><Truck className="w-6 h-6 text-blue-600" /></div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{supplier.name}</h3>
                          {supplier.contact_person && <p className="text-sm text-blue-600 font-medium">{supplier.contact_person}</p>}
                        </div>
                      </div>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenForm(supplier)}>
                                <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSupplierToDelete(supplier)} className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="space-y-2 text-sm">
                      {supplier.email && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {supplier.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{supplier.notes}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </motion.div>

      <SupplierFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        supplier={editingSupplier} 
        onSupplierSaved={handleSupplierSaved} 
      />

      <AlertDialog open={!!supplierToDelete} onOpenChange={() => setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce fournisseur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le fournisseur "{supplierToDelete?.name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSupplier} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuppliersPage;