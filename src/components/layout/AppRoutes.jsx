import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

// Import all the page components
import DashboardPage from '@/pages/DashboardPage';
import SalesPage from '@/pages/SalesPage';
import CreditSalesPage from '@/pages/CreditSalesPage';
import InventoryPage from '@/pages/InventoryPage';
import PurchaseOrdersPage from '@/pages/PurchaseOrdersPage';
import ExpensesPage from '@/pages/ExpensesPage';
import BillingPage from '@/pages/BillingPage';
import SuppliersPage from '@/pages/SuppliersPage';
import ReportsPage from '@/pages/ReportsPage';
import PremiumPage from '@/pages/PremiumPage';
import SuperAdminPage from '@/pages/SuperAdminPage';
import UserManagementPage from '@/pages/UserManagementPage';
import SaasManagementPage from '@/pages/SaasManagementPage';
import AdminRegisterUserPage from '@/pages/AdminRegisterUserPage';
import SubscriptionManagementPage from '@/pages/SubscriptionManagementPage';
import QuickSalePage from '@/pages/QuickSalePage';

const ProtectedRoute = ({ children, isSuperAdmin, requiresAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (requiresAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = ({ isSuperAdmin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openModal = (action) => {
    toast({
      title: "Action déclenchée",
      description: `Action: ${action}`,
    });
    // This is a placeholder function - in a real app, this would open modals
    console.log("Modal action triggered:", action);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={`${location.pathname}-${refreshTrigger}`}>
          <Route path="/" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <DashboardPage handleActionClick={openModal} />
            </ProtectedRoute>
          } />
          
          <Route path="/quick-sale" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <QuickSalePage />
            </ProtectedRoute>
          } />
          
          <Route path="/sales" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <SalesPage handleActionClick={openModal} />
            </ProtectedRoute>
          } />
          
          <Route path="/credit-sales" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <CreditSalesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/inventory" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <InventoryPage />
            </ProtectedRoute>
          } />
          
          <Route path="/purchase-orders" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <PurchaseOrdersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/expenses" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <ExpensesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/billing" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <BillingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/suppliers" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <SuppliersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <ReportsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/premium" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin}>
              <PremiumPage />
            </ProtectedRoute>
          } />
          
          <Route path="/super-admin" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin} requiresAdmin={true}>
              <SuperAdminPage />
            </ProtectedRoute>
          } />
          
          <Route path="/super-admin/users" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin} requiresAdmin={true}>
              <UserManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/super-admin/saas" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin} requiresAdmin={true}>
              <SaasManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/super-admin/register-user" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin} requiresAdmin={true}>
              <AdminRegisterUserPage />
            </ProtectedRoute>
          } />
          
          <Route path="/super-admin/subscriptions" element={
            <ProtectedRoute isSuperAdmin={isSuperAdmin} requiresAdmin={true}>
              <SubscriptionManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default AppRoutes;