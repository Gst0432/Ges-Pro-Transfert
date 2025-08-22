import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Ajout de cet état

  const handleSession = useCallback(async (session) => {
    setSession(session);
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    // Définir isSuperAdmin basé sur les métadonnées de l'utilisateur
    const adminStatus = currentUser?.user_metadata?.is_super_admin === true;
    setIsSuperAdmin(adminStatus); 
    // console.log('SupabaseAuthContext: User email:', currentUser?.email, 'isSuperAdmin:', adminStatus); // DEBUG LOG - REMOVED
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Échec de l'inscription",
        description: error.message || "Une erreur est survenue",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: error.message || "Une erreur est survenue",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Échec de la déconnexion",
        description: error.message || "Une erreur est survenue",
      });
    }

    return { error };
  }, [toast]);

  // Nouvelle fonction pour envoyer un e-mail de réinitialisation de mot de passe
  const sendPasswordResetEmail = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de réinitialisation",
        description: error.message || "Impossible d'envoyer le lien de réinitialisation.",
      });
    } else {
      toast({
        title: "Lien envoyé",
        description: "Vérifiez votre boîte de réception pour le lien de réinitialisation du mot de passe.",
      });
    }
    return { error };
  }, [toast]);

  // Nouvelle fonction pour mettre à jour le mot de passe de l'utilisateur
  const updateUserPassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour",
        description: error.message || "Impossible de mettre à jour le mot de passe.",
      });
    } else {
      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour.",
      });
    }
    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isSuperAdmin, // Inclure isSuperAdmin dans le contexte
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail, // Inclure la nouvelle fonction
    updateUserPassword,     // Inclure la nouvelle fonction
  }), [user, session, loading, isSuperAdmin, signUp, signIn, signOut, sendPasswordResetEmail, updateUserPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};