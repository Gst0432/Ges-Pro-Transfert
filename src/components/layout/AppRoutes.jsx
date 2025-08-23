import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';
import DashboardPage from '@/pages/DashboardPage';
import SalesPage from '@/pages/SalesPage';
import InventoryPage from '@/pages/InventoryPage';
import BillingPage from '@/pages/BillingPage';
import SuppliersPage from '@/pages/SuppliersPage';
import ReportsPage from '@/pages/ReportsPage';
import CreditSalesPage from '@/pages/CreditSalesPage';
import PurchaseOrdersPage from '@/pages/PurchaseOrdersPage';
import ExpensesPage from '@/pages/ExpensesPage';
import UserManagementPage from '@/pages/UserManagementPage';
import SaasManagementPage from '@/pages/SaasManagementPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminRegisterUserPage from '@/pages/AdminRegisterUserPage'; // Nouvelle importation
import { NewSaleWizard } from '@/components/wizards/new-sale/NewSaleWizard';
import { SupplierFormDialog } from '@/components/SupplierFormDialog';
import { ProductWizard } from '@/components/wizards/ProductWizard';
import PremiumPage from '@/pages/PremiumPage';

const ProtectedRoute = ({ children, adminOnly = false, isSuperAdmin }) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (!session) {
        navigate('/auth', { replace: true });
      } else if (adminOnly && !isSuperAdmin) {
        navigate('/', { replace: true });
      }
    }
  }, [session, loading, navigate, adminOnly, isSuperAdmin]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  return session && (!adminOnly || isSuperAdmin) ? children : null;
};

const AppRoutes = ({ isSuperAdmin }) => {
  const { toast } = useToast();
  const location = useLocation();

  const [isSaleWizardOpen, setIsSaleWizardOpen] = useState(false);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isProductWizardOpen, setIsProductWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const onActionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleToastAction = () => {
    toast({
      title: "🚧 Cette fonctionnalité n'est pas encore implémentée",
      description: "Mais ne vous inquiétez pas ! Vous pouvez la demander dans votre prochaine requête ! 🚀",
      duration: 3000,
    });
  };
  
  const openModal = (type) => {
    switch(type) {
      case 'new_sale': setIsSaleWizardOpen(true); break;
      case 'new_product': setEditingProduct(null); setIsProductWizardOpen(true); break;
      case 'new_supplier': setEditingSupplier(null); setIsSupplierFormOpen(true); break;
      default: handleToastAction(); break;
    }
  };

  const handleProductAction = (action, product = null) => {
    if (action === 'new_product') {
      setEditingProduct(null);
      setIsProductWizardOpen(true);
    } else if (action === 'edit_product' && product) {
      setEditingProduct(product);
      setIsProductWizardOpen(true);
    } else {
       handleToastAction();
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={`${location.pathname}-${refreshTrigger}`}>
          <Route path="/" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><DashboardPage handleActionClick={openModal} /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><SalesPage handleActionClick={openModal} /></ProtectedRoute>} />
          <Route path="/credit-sales" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><CreditSalesPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><InventoryPage handleActionClick={handleProductAction} /></ProtectedRoute>} />
          <Route path="/purchase-orders" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><PurchaseOrdersPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><ExpensesPage /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><BillingPage handleActionClick={openModal} /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><SuppliersPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><ReportsPage handleActionClick={handleToastAction} /></ProtectedRoute>} />
          <Route path="/premium" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><PremiumPage /></ProtectedRoute>} />
          
          <Route path="/super-admin" element={<ProtectedRoute adminOnly={true} isSuperAdmin={isSuperAdmin}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/super-admin/users" element={<ProtectedRoute adminOnly={true} isSuperAdmin={isSuperAdmin}><UserManagementPage /></ProtectedRoute>} />
          <Route path="/super-admin/saas" element={<ProtectedRoute adminOnly={true} isSuperAdmin={isSuperAdmin}><SaasManagementPage /></ProtectedRoute>} />
          <Route path="/super-admin/register-user" element={<ProtectedRoute adminOnly={true} isSuperAdmin={isSuperAdmin}><AdminRegisterUserPage /></ProtectedRoute>} /> {/* Nouvelle route */}
        </Routes>
      </AnimatePresence>
      <NewSaleWizard isOpen={isSaleWizardOpen} onOpenChange={setIsSaleWizardOpen} onSaleSaved={onActionSuccess} />
      <ProductWizard isOpen={isProductWizardOpen} onOpenChange={setIsProductWizardOpen} productToEdit={editingProduct} onProductSaved={onActionSuccess} />
      <SupplierFormDialog isOpen={isSupplierFormOpen} onOpenChange={setIsSupplierFormOpen} supplier={editingSupplier} onSupplierSaved={onActionSuccess} />
    </>
  );
};

export default AppRoutes;