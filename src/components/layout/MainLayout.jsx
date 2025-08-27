import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AppRoutes from '@/components/layout/AppRoutes';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { SettingsDialog } from '@/components/SettingsDialog';

const MainLayout = () => {
  const { isSuperAdmin } = useAuth();
  const { settings } = useCompanySettings();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const modules = [
    { path: '/', name: 'Tableau de bord' },
    { path: '/sales', name: 'Gestion des ventes' },
    { path: '/credit-sales', name: 'Ventes à crédit' },
    { path: '/inventory', name: 'Gestion d\'inventaire' },
    { path: '/purchase-orders', name: 'Commandes Fournisseurs' },
    { path: '/expenses', name: 'Gestion des charges' },
    { path: '/billing', name: 'Facturation avancée' },
    { path: '/suppliers', name: 'Gestion des fournisseurs' },
    { path: '/reports', name: 'Comptabilité' },
    { path: '/premium', name: 'Premium' },
    { path: '/super-admin', name: 'Dashboard Admin' },
    { path: '/super-admin/users', name: 'Gestion Utilisateurs' },
    { path: '/super-admin/saas', name: 'Gestion SaaS' }
  ];

  const activeModule = modules.find(m => location.pathname.startsWith(m.path) && m.path !== '/');
  const pageTitle = `${activeModule ? activeModule.name : 'Tableau de bord'} - ${settings?.company_name || 'Pro-GES'}`;


  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Plateforme SaaS complète avec tableau de bord interactif, gestion des ventes, inventaire, facturation et rapports analytiques" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
        <AnimatePresence>
          {sidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
          )}
        </AnimatePresence>

        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          isMobile={isMobile} 
          setIsSettingsOpen={setIsSettingsOpen}
          isSuperAdmin={isSuperAdmin}
        />

        <div className={`flex flex-col flex-1 transition-all duration-300 ${!sidebarOpen || isMobile ? '' : 'md:ml-72'}`}>
          <Header 
            setSidebarOpen={setSidebarOpen} 
            activeModuleName={activeModule?.name || 'Tableau de bord'}
            setIsSettingsOpen={setIsSettingsOpen}
          />
          <main className="flex-1 p-4 sm:p-6">
            <AppRoutes isSuperAdmin={isSuperAdmin} />
          </main>
          <footer className="p-4 sm:p-6 text-center text-gray-500 text-sm border-t border-gray-200 mt-auto">
            <p>Conçu avec amour ❤️ par <a href="https://gstartup.pro" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">G-STARTUP</a></p>
          </footer>
        </div>
      </div>
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
};

export default MainLayout;