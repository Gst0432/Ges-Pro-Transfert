import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const AdminAuthForm = ({ isLogin, onSubmit, onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(email, password);
    setLoading(false);
  };

  return (
    <motion.div
      key={isLogin ? 'login' : 'signup'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Email Administrateur</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@exemple.com"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
          {loading ? 'Chargement...' : (isLogin ? 'Connexion Admin' : 'Créer Admin')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        {isLogin ? 'Besoin de créer un compte admin ?' : 'Déjà un compte admin ?'}{' '}
        <button onClick={onToggle} className="font-medium text-red-600 hover:text-red-500">
          {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
        </button>
      </p>
    </motion.div>
  );
};

const AdminAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp, checkAdminStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdminSignIn = async (email, password) => {
    const { error } = await signIn(email, password);
    if (!error) {
      const isAdmin = await checkAdminStatus();
      if (isAdmin) {
        navigate('/super-admin/users', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  const handleAdminSignUp = async (email, password) => {
    const { error } = await signUp(email, password, {
      data: { 
        admin_key: 'SUPER_SECRET_ADMIN_KEY'
      }
    });
    if (!error) {
      toast({
        title: "Compte admin créé !",
        description: "Vous pouvez maintenant vous connecter.",
      });
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-2xl mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Accès Administrateur</h1>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Connectez-vous pour continuer' : 'Créez un nouveau compte admin'}
            </p>
          </div>
          
          <AdminAuthForm
            isLogin={isLogin}
            onSubmit={isLogin ? handleAdminSignIn : handleAdminSignUp}
            onToggle={() => setIsLogin(!isLogin)}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuthPage;