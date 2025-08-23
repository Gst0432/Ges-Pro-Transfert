import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

// Import the new QuickSalePage
import QuickSalePage from '@/pages/QuickSalePage';

// Other existing imports remain the same...
import DashboardPage from '@/pages/DashboardPage';
import SalesPage from '@/pages/SalesPage';
// ... other imports

const ProtectedRoute = ({ children, adminOnly = false, isSuperAdmin }) => {
  // Existing ProtectedRoute component remains the same
};

const AppRoutes = ({ isSuperAdmin }) => {
  // Existing state and other code remains the same...

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={`${location.pathname}-${refreshTrigger}`}>
          {/* Existing routes remain the same */}
          <Route path="/" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><DashboardPage handleActionClick={openModal} /></ProtectedRoute>} />
          
          {/* Add the new QuickSalePage route */}
          <Route path="/quick-sale" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><QuickSalePage /></ProtectedRoute>} />
          
          <Route path="/sales" element={<ProtectedRoute isSuperAdmin={isSuperAdmin}><SalesPage handleActionClick={openModal} /></ProtectedRoute>} />
          
          {/* Other routes remain the same */}
        </Routes>
      </AnimatePresence>
      
      {/* Existing modal components remain the same */}
    </>
  );
};

export default AppRoutes;