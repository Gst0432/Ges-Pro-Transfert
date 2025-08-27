import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/SupabaseAuthContext';
import { CompanySettingsProvider, useCompanySettings } from '@/contexts/CompanySettingsContext';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layout/MainLayout.jsx';
import UnifiedAuthPage from '@/pages/UnifiedAuthPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import PaymentCallbackPage from '@/pages/PaymentCallbackPage';
import LandingPage from '@/pages/LandingPage'; // Importer la nouvelle page
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { session, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useCompanySettings();
  
  const loading = authLoading || (session && settingsLoading);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/payment-callback" element={<PaymentCallbackPage />} />

      {!session ? (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<UnifiedAuthPage companySettings={settings} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
          <Route path="/*" element={<MainLayout />} />
        </>
      )}
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CompanySettingsProvider>
          <Toaster />
          <AppContent />
        </CompanySettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;