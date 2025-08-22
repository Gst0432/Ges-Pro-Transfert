import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { KeyRound } from 'lucide-react';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUserPassword, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Session invalide",
        description: "Vous devez être connecté pour mettre à jour votre mot de passe. Veuillez vous reconnecter.",
      });
      navigate('/auth');
    }
  }, [session, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await updateUserPassword(password);
    if (!error) {
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Réinitialiser le mot de passe</h1>
          <p className="text-gray-500 mt-2">
            Entrez votre nouveau mot de passe ci-dessous.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;