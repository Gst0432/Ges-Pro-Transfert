import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';

export const LandingHeader = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">PREMIUM PRO</span>
          </Link>
        </div>
        <div className="flex lg:flex-1 lg:justify-end space-x-4">
          <Button asChild variant="ghost">
            <Link to="/auth">Connexion</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">S'inscrire</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};