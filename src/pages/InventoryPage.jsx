import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Package, MoreHorizontal, Edit, Trash2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
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
import { ProductWizard } from '@/components/wizards/ProductWizard';

const ITEMS_PER_PAGE = 12;

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories(name),
        supplier:suppliers(name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les produits.",
      });
      setProducts([]);
    } else {
      setProducts(data);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  const handleProductSaved = () => {
    fetchProducts(currentPage);
  };
  
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productToDelete.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le produit. " + error.message,
      });
    } else {
      toast({
        title: "Succès",
        description: `Le produit "${productToDelete.name}" a été supprimé.`,
      });
      fetchProducts(currentPage);
    }
    setProductToDelete(null);
  };

  const handleActionClick = (action, product = null) => {
    if (action === 'new_product') {
      setEditingProduct(null);
      setIsWizardOpen(true);
    } else if (action === 'edit_product' && product) {
      setEditingProduct(product);
      setIsWizardOpen(true);
    }
  };
  
  const getStatus = (product) => {
    if (!product.is_sellable) return { text: 'Non disponible', icon: <AlertTriangle className="w-5 h-5 text-gray-400" />, color: 'text-gray-400' };
    if (product.quantity > 10) return { text: 'En stock', icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: 'text-green-500' };
    if (product.quantity > 0) return { text: 'Stock faible', icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, color: 'text-yellow-500' };
    return { text: 'Rupture', icon: <AlertTriangle className="w-5 h-5 text-red-500" />, color: 'text-red-500' };
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Inventaire</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Rechercher un produit..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Button onClick={() => handleActionClick('new_product')} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Ajouter Produit
            </Button>
          </div>
        </div>
          {loading ? (
              <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="ml-4 text-lg text-gray-600">Chargement des produits...</p>
              </div>
          ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-xl font-medium text-gray-900">Aucun produit trouvé</h3>
                  <p className="mt-1 text-sm text-gray-500">Commencez par ajouter votre premier produit.</p>
                  <div className="mt-6">
                      <Button onClick={() => handleActionClick('new_product')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter un produit
                      </Button>
                  </div>
              </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((item, index) => {
                  const status = getStatus(item);
                  return (
                  <motion.div 
                    key={item.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                              <div className={`p-3 rounded-lg bg-blue-100 ${status.color}`}>
                                {status.icon}
                              </div>
                              <div>
                                <p className={`text-sm font-semibold ${status.color}`}>{status.text}</p>
                                <h3 className="text-lg font-bold text-gray-800 mt-1 line-clamp-2">{item.name}</h3>
                              </div>
                          </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleActionClick('edit_product', item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setProductToDelete(item)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-blue-600 font-medium mt-2">{item.category?.name || 'Non classé'}</p>
                    </div>
                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Stock</p>
                        <p className="text-2xl font-bold text-gray-800">{item.quantity ?? 0}</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-800">{item.sale_price ? `${item.sale_price} F` : 'N/A'}</p>
                    </div>
                  </motion.div>
                )})}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
         <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le produit "{productToDelete?.name}" sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <ProductWizard 
        isOpen={isWizardOpen} 
        onOpenChange={setIsWizardOpen} 
        productToEdit={editingProduct} 
        onProductSaved={handleProductSaved}
      />
    </>
  );
};

export default InventoryPage;