import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, ShoppingCart, Package, FileText, Truck, BookOpen,
  Menu, X, Settings, LogOut, Home, CreditCard, Shield, UserCog, Users, Layers, LayoutDashboard, Gem, UserPlus, DollarSign
} from 'lucide-react';

const SidebarContent = ({ isSuperAdmin, isMobile, setIsOpen, setIsSettingsOpen }) => {
  const { signOut } = useAuth();
  const { settings } = useCompanySettings();

  const userModules = [
    { path: '/', name: 'Tableau de bord', icon: Home },
    { path: '/sales', name: 'Gestion des ventes', icon: ShoppingCart },
    { path: '/credit-sales', name: 'Ventes à crédit', icon: CreditCard },
    { path: '/inventory', name: 'Gestion d\'inventaire', icon: Package },
    { path: '/purchase-orders', name: 'Commandes Fournisseurs', icon: Truck },
    { path: '/expenses', name: 'Gestion des charges', icon: Shield },
    { path: '/billing', name: 'Facturation avancée', icon: FileText },
    { path: '/suppliers', name: 'Gestion des fournisseurs', icon: Truck },
    { path: '/reports', name: 'Comptabilité', icon: BookOpen },
    { path: '/premium', name: 'Premium', icon: Gem },
  ];

  const adminModules = [
    { path: '/super-admin', name: 'Dashboard Admin', icon: LayoutDashboard },
    { path: '/super-admin/users', name: 'Gestion Utilisateurs', icon: Users },
    { path: '/super-admin/register-user', name: 'Inscrire Utilisateur', icon: UserPlus }, 
    { path: '/super-admin/subscriptions', name: 'Gestion Abonnements', icon: DollarSign }, {/* Nouveau lien */}
    { path: '/super-admin/saas', name: 'Gestion SaaS', icon: Layers },
  ];

  const modulesToDisplay = isSuperAdmin ? adminModules : userModules;
  const logoIcon = settings.logo_url ? <img src={settings.logo_url} alt="Logo" className="w-6 h-6 object-contain" /> : (isSuperAdmin ? <UserCog className="w-6 h-6" /> : <BarChart3 className="w-6 h-6" />);
  const logoBg = isSuperAdmin ? 'bg-sidebar-logo-admin' : 'bg-sidebar-logo-user';

  const NavItem = ({ module }) => {
    const Icon = module.icon;
    const activeClass = isSuperAdmin ? 'bg-sidebar-active-admin text-white shadow-lg' : 'bg-sidebar-active-user text-white shadow-lg';
    const hoverClass = isSuperAdmin ? 'hover:bg-sidebar-hover-admin hover:text-sidebar-text-admin' : 'hover:bg-sidebar-hover-user hover:text-sidebar-text-user';
    const premiumClass = module.path === '/premium' ? `relative overflow-hidden ${isSuperAdmin ? '' : 'bg-yellow-400/10 text-yellow-600'}` : '';

    return (
      <NavLink
        to={module.path}
        end={module.path === '/' || module.path === '/super-admin'}
        onClick={() => isMobile && setIsOpen(false)}
        className={({ isActive }) =>
          `w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${premiumClass} ${
            isActive
              ? activeClass
              : `text-sidebar-text ${hoverClass}`
          }`
        }
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{module.name}</span>
         {module.path === '/premium' && !isSuperAdmin && <span className="absolute top-0 right-0 text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg">PRO</span>}
      </NavLink>
    );
  };

  return (
    <div className="p-4 md:p-6 flex flex-col h-full bg-sidebar-bg text-sidebar-text">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${logoBg} text-white rounded-xl flex items-center justify-center`}>
            {logoIcon}
          </div>
          <span className="text-xl font-bold truncate">{settings.company_name || 'Pro-GES'}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-sidebar-text hover:bg-sidebar-hover-user md:hidden"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <nav className="space-y-2 flex-grow">
        {isSuperAdmin ? (
          <>
            <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-text-muted uppercase tracking-wider">Administration</h3>
            {modulesToDisplay.map((module) => (
              <NavItem key={module.path} module={module} />
            ))}
          </>
        ) : (
           modulesToDisplay.map((module) => (
            <NavItem key={module.path} module={module} />
          ))
        )}
      </nav>

      <div className="mt-8 pt-8 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={() => { setIsSettingsOpen(true); if(isMobile) setIsOpen(false); }}
          className="w-full justify-start text-sidebar-text hover:bg-sidebar-hover-user hover:text-sidebar-text-user"
        >
          <Settings className="w-5 h-5 mr-3" />
          Paramètres
        </Button>
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-sidebar-text hover:bg-sidebar-hover-user hover:text-sidebar-text-user"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen, isMobile, setIsSettingsOpen }) => {
  const { isSuperAdmin } = useAuth();
  return (
    <motion.div
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={{
        open: { x: 0 },
        closed: { x: "-100%" },
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full w-72 bg-sidebar-bg border-r border-sidebar-border z-50 overflow-y-auto"
    >
      <SidebarContent 
        isSuperAdmin={isSuperAdmin} 
        isMobile={isMobile} 
        setIsOpen={setIsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
      />
    </motion.div>
  );
};

export default Sidebar;