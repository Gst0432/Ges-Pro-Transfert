import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Mail, Loader2 } from 'lucide-react';
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
        <motion.div 
          className="inline-flex items-center justify-center w-20 h-20 bg-golden-gradient text-white rounded-3xl mb-6 shadow-golden-lg overflow-hidden floating"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {companySettings?.logo_url ? (
            <img src={companySettings.logo_url} alt="Company Logo" className="h-full w-full object-contain" />
          ) : (
            <BarChart3 className="w-10 h-10" />
          )}
        </motion.div>
        <h1 className="text-4xl font-display font-bold text-golden-gradient mb-2 text-shadow-golden">
          {companySettings?.company_name || 'GES PRO'}
        </h1>
        <p className="text-golden-600 text-lg font-medium">
          {isLogin ? 'Connectez-vous à votre compte' : 'Créez un nouveau compte'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label htmlFor="email" className="text-golden-700 font-semibold text-base">Adresse e-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.com"
            className="mt-2 h-12 text-base"
          />
        </motion.div>

        {!isLogin && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="phone" className="text-golden-700 font-semibold text-base">Numéro de téléphone</Label>
            <div className="mt-2">
              <PhoneInput
                id="phone"
                placeholder="Entrez le numéro de téléphone"
                value={phone}
                onChange={setPhone}
                defaultCountry="FR"
                className="h-12"
              />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: isLogin ? 0.2 : 0.3 }}
        >
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-golden-700 font-semibold text-base">Mot de passe</Label>
            {isLogin && (
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-sm font-semibold text-golden-600 hover:text-golden-700 transition-colors duration-200 hover:underline"
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
            className="mt-2 h-12 text-base"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isLogin ? 0.3 : 0.4 }}
        >
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-bold tracking-wide bg-golden-gradient hover:shadow-golden-xl transition-all duration-300" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Chargement...
              </div>
            ) : (isLogin ? 'Se connecter' : 'S\'inscrire')}
          </Button>
        </motion.div>
      </form>

      <motion.p 
        className="mt-8 text-center text-base text-golden-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
        <button 
          onClick={onToggle} 
          className="font-bold text-golden-700 hover:text-golden-800 transition-colors duration-200 underline decoration-golden-300 hover:decoration-golden-500"
        >
          {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
        </button>
      </motion.p>
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
        <motion.div 
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-golden-100 to-golden-200 text-golden-600 rounded-3xl mb-6 shadow-golden floating"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Mail className="w-10 h-10" />
        </motion.div>
        <h1 className="text-4xl font-display font-bold text-golden-gradient mb-2">Mot de passe oublié ?</h1>
        <p className="text-golden-600 text-lg font-medium">
          Entrez votre e-mail pour recevoir un lien de réinitialisation.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label htmlFor="reset-email" className="text-golden-700 font-semibold text-base">Adresse e-mail</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.com"
            className="mt-2 h-12 text-base"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-bold tracking-wide bg-golden-gradient" 
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </Button>
        </motion.div>
      </form>
      <motion.p 
        className="mt-8 text-center text-base text-golden-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button 
          onClick={onBack} 
          className="font-bold text-golden-700 hover:text-golden-800 transition-colors duration-200 underline decoration-golden-300 hover:decoration-golden-500"
        >
          Retour à la connexion
        </button>
      </motion.p>
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

  return (
    <div className="min-h-screen bg-golden-gradient-soft flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-golden-200/30 rounded-full blur-xl floating"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-golden-300/20 rounded-full blur-2xl floating" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-golden-400/20 rounded-full blur-lg floating" style={{animationDelay: '4s'}}></div>
      <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-golden-500/10 rounded-full blur-2xl floating" style={{animationDelay: '1s'}}></div>
      
      {/* Sparkle effect */}
      <div className="absolute inset-0 sparkle pointer-events-none"></div>
      
      <motion.div 
        className="relative w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="modern-card rounded-3xl overflow-hidden hover-lift">
          <div className="w-full p-10 flex flex-col justify-center">
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
      </motion.div>
    </div>
  );
};

export default UnifiedAuthPage;