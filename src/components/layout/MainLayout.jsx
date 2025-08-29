import React, { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ProfileDialog } from '@/components/ProfileDialog';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import Sidebar from '@/components/layout/Sidebar';
import AppRoutes from '@/components/layout/AppRoutes';

const MainLayout = () => {
  const { user, isSuperAdmin } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen yellow-blue-gradient-soft">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isMobile={isMobile}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      
      <div className={`${isMobile ? '' : 'md:ml-72'} min-h-screen`}>
        {/* Header */}
        <header className="nav-yellow-blue sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationsPanel />
              <ProfileDropdown 
                user={user} 
                setIsSettingsOpen={setIsSettingsOpen}
                setIsProfileOpen={setIsProfileOpen}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <AppRoutes isSuperAdmin={isSuperAdmin} />
        </main>
      </div>

      {/* Dialogs */}
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <ProfileDialog isOpen={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </div>
  );
};

export default MainLayout;