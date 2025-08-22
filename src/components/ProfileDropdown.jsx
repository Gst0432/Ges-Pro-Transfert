
import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut } from 'lucide-react';

export function ProfileDropdown({ user, setIsSettingsOpen, setIsProfileOpen }) {
  const { signOut } = useAuth();

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} alt="User avatar" />
            <AvatarFallback className="bg-blue-600 text-white font-bold">
              {getInitials(user?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <p className="font-semibold">{user?.user_metadata?.full_name || 'Utilisateur'}</p>
          <p className="text-xs text-gray-500 font-normal truncate">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
          <User className="mr-2 h-4 w-4" />
          <span>Mon Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
