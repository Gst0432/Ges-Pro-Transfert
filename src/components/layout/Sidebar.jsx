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
    { path: '/quick-sale', name: 'Vente Rapide', icon: Zap }, // Add Quick Sale
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

  // Rest of the code remains the same...
};

export default Sidebar;