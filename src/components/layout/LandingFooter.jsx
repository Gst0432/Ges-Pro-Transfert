import React from 'react';
import { BarChart3 } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center space-x-2">
          <BarChart3 className="h-8 w-8" />
          <span className="text-2xl font-bold">GES PRO</span>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} GES PRO. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};