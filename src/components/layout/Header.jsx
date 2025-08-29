
import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, Search, RefreshCw } from 'lucide-react';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { ProfileDialog } from '@/components/ProfileDialog';
import { SettingsDialog } from '@/components/SettingsDialog';

const Header = ({ setSidebarOpen, activeModuleName, setIsSettingsOpen }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    toast({ title: "🔄 Synchronisation en cours...", description: "Mise à jour de vos données." });
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: "✅ Synchronisation terminée !", description: "Vos données sont à jour." });
      window.location.reload();
    }, 2000);
  };
  
  const handleSettingsClick = () => {
    if (setIsSettingsOpen) {
      setIsSettingsOpen(true);
    }
    setIsSettingsDialogOpen(true);
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
              {activeModuleName}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 bg-gray-100 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 md:w-full"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSync}
              className="text-gray-600 hover:bg-gray-100 relative border-gray-200 flex-shrink-0"
              disabled={isSyncing}
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
            
            <NotificationsPanel />
            
            <ProfileDropdown 
              user={user} 
              setIsSettingsOpen={handleSettingsClick}
              setIsProfileOpen={setIsProfileOpen}
            />
          </div>
        </div>
      </header>
      <ProfileDialog isOpen={isProfileOpen} onOpenChange={setIsProfileOpen} />
      <SettingsDialog isOpen={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen} />
    </>
  );
};

export default Header;
