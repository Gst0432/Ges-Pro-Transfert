import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useToast } from '@/components/ui/use-toast';
import PhoneInput from 'react-phone-number-input';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const AuthForm = ({ isLogin, onSubmit, onToggle, onForgotPasswordClick, companySettings }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchSettingsForLogin } = useCompanySettings();
  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    if (isLogin && debouncedEmail) {
      fetchSettingsForLogin(debouncedEmail);
    }
  }, [debouncedEmail, isLogin, fetchSettingsForLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      await onSubmit(email, password);
    } else {
      await onSubmit(email, password, phone);
    }
    setLoading(false);
  };

  const accentColor = 'blue';

  return (
    <motion.div
      key={isLogin ? 'login' : 'signup'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4 shadow-md overflow-hidden`}>
          {companySettings?.logo_url ? (
            <img src={companySettings.logo_url} alt="Company Logo" className="h-full w-full object-contain" />
          ) : (
            <BarChart3 className="w-8 h-8" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          {companySettings?.company_name || 'GES PRO'}
        </h1>
        <p className="text-gray-500 mt-2">
          {isLogin ? 'Connectez-vous à votre compte' : 'Créez un nouveau compte'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.com"
            className="mt-1"
          />
        </div>

        {!isLogin && (
          <div>
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <PhoneInput
              id="phone"
              placeholder="Entrez le numéro de téléphone"
              value={phone}
              onChange={setPhone}
              defaultCountry="FR"
              className="mt-1"
            />
          </div>
        )}

        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Mot de passe</Label>
            {isLogin && (
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Mot de passe oublié ?
              </button>
            )}
          </div>
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
        <Button type="submit" className={`w-full bg-${accentColor}-600 hover:bg-${accentColor}-700`} disabled={loading}>
          {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
        <button onClick={onToggle} className={`font-medium text-${accentColor}-600 hover:text-${accentColor}-500`}>
          {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
        </button>
      </p>
    </motion.div>
  );
};

const ForgotPasswordForm = ({ onBack, companySettings }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendPasswordResetEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await sendPasswordResetEmail(email);
    setLoading(false);
  };

  return (
    <motion.div
      key="forgot-password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
          <Mail className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Mot de passe oublié ?</h1>
        <p className="text-gray-500 mt-2">
          Entrez votre e-mail pour recevoir un lien de réinitialisation.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="reset-email">Adresse e-mail</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.com"
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        <button onClick={onBack} className="font-medium text-blue-600 hover:text-blue-500">
          Retour à la connexion
        </button>
      </p>
    </motion.div>
  );
};

const UnifiedAuthPage = ({ companySettings }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (email, password) => {
    const { error } = await signIn(email, password);
    if (error) {
       toast({
        variant: "destructive",
        title: "La connexion a échoué",
        description: error.message,
      });
    }
  };

  const handleSignUp = async (email, password, phone) => {
    const { error } = await signUp(email, password, { phone: phone }); 
    if (!error) {
      toast({
        title: "Compte créé avec succès !",
        description: "Veuillez vérifier vos e-mails pour confirmer votre inscription, puis connectez-vous.",
      });
      setIsLogin(true);
    } else {
      toast({
        variant: "destructive",
        title: "L'inscription a échoué",
        description: error.message,
      });
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md flex bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="w-full p-8 flex flex-col justify-center">
           <AnimatePresence mode="wait">
            {showForgotPassword ? (
              <ForgotPasswordForm
                key="forgot"
                onBack={() => setShowForgotPassword(false)}
                companySettings={companySettings}
              />
            ) : (
              <AuthForm
                key="auth"
                isLogin={isLogin}
                onSubmit={isLogin ? handleSignIn : handleSignUp}
                onToggle={() => setIsLogin(!isLogin)}
                onForgotPasswordClick={() => setShowForgotPassword(true)}
                companySettings={companySettings}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAuthPage;