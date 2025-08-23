import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, ShoppingCart, Package, FileText, Truck,
  Menu, X, Settings, LogOut, Home, CreditCard, Shield, UserCog, Users, Layers, LayoutDashboard, Gem, UserPlus, DollarSign, Zap
} from 'lucide-react';

const SidebarContent = ({ isSuperAdmin, isMobile, setIsOpen, setIsSettingsOpen }) => {
  const { signOut } = useAuth();
  const { settings } = useCompanySettings();

  const userModules = [
    { path: '/', name: 'Tableau de bord', icon: Home },
    { path: '/quick-sale', name: 'Vente Rapide', icon: Zap },
    { path: '/sales', name: 'Gestion des ventes', icon: ShoppingCart },
    { path: '/credit-sales', name: 'Ventes à crédit', icon: CreditCard },
    { path: '/inventory', name: 'Gestion d\'inventaire', icon: Package },
    { path: '/purchase-orders', name: 'Commandes Fournisseurs', icon: Truck },
    { path: '/expenses', name: 'Gestion des charges', icon: Shield },
    { path: '/billing', name: 'Facturation avancée', icon: FileText },
    { path: '/suppliers', name: 'Gestion des fournisseurs', icon: Truck },
    { path: '/reports', name: 'Comptabilité', icon: LayoutDashboard },
    { path: '/premium', name: 'Premium', icon: Gem },
  ];

  const adminModules = [
    { path: '/super-admin', name: 'Dashboard Admin', icon: BarChart3 },
    { path: '/super-admin/users', name: 'Gestion Utilisateurs', icon: Users },
    { path: '/super-admin/saas', name: 'Gestion SaaS', icon: Layers },
    { path: '/super-admin/register-user', name: 'Inscrire Utilisateur', icon: UserPlus },
    { path: '/super-admin/subscriptions', name: 'Abonnements', icon: DollarSign },
  ];

  const isActive = (path) => {
    // Special handling for root path
    if (path === '/') {
      return window.location.pathname === '/';
    }
    // For other paths, check if current path starts with the module path
    return window.location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="bg-sidebar-logo-user text-white p-2 rounded-lg">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{settings?.company_name || 'Pro-GES'}</h2>
            <p className="text-sidebar-text-muted text-xs">Gestion Commerciale</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          <h3 className="px-4 text-xs font-semibold text-sidebar-text-muted uppercase tracking-wider">Navigation</h3>
          {userModules.map((module) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.path}
                to={module.path}
                onClick={() => isMobile && setIsOpen(false)}
                className={({ isActive: isRouteActive }) =>
                  `flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(module.path) || isRouteActive
                      ? 'bg-sidebar-active-user text-white'
                      : 'text-sidebar-text hover:bg-sidebar-hover-user'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{module.name}</span>
              </NavLink>
            );
          })}
        </div>

        {isSuperAdmin && (
          <div className="mt-8 space-y-1 px-2">
            <h3 className="px-4 text-xs font-semibold text-sidebar-text-muted uppercase tracking-wider">Administration</h3>
            {adminModules.map((module) => {
              const Icon = module.icon;
              return (
                <NavLink
                  key={module.path}
                  to={module.path}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={({ isActive: isRouteActive }) =>
                    `flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(module.path) || isRouteActive
                        ? 'bg-sidebar-active-admin text-white'
                        : 'text-sidebar-text hover:bg-sidebar-hover-admin'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{module.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-text hover:bg-sidebar-hover-user"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-5 w-5 mr-3" />
          Paramètres
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-text hover:bg-sidebar-hover-user"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen, isMobile, setIsSettingsOpen }) => {
  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <motion.div
          className="hidden md:block fixed inset-y-0 left-0 z-30 w-72 border-r border-sidebar-border"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SidebarContent 
            isSuperAdmin={true} 
            isMobile={isMobile} 
            setIsOpen={setIsOpen} 
            setIsSettingsOpen={setIsSettingsOpen} 
          />
        </motion.div>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
          )}
          <motion.div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg border-r border-sidebar-border transform ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            initial={false}
            animate={{ x: isOpen ? 0 : '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-sidebar-text"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="pt-12">
              <SidebarContent 
                isSuperAdmin={true} 
                isMobile={isMobile} 
                setIsOpen={setIsOpen} 
                setIsSettingsOpen={setIsSettingsOpen} 
              />
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default Sidebar;