import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from './SupabaseAuthContext';

const CompanySettingsContext = createContext(undefined);

export const CompanySettingsProvider = ({ children }) => {
  const { user, session, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState({ company_name: 'GES PRO', logo_url: null });
  const [loading, setLoading] = useState(true);

  const fetchSettingsForUser = useCallback(async (userId) => {
    if (!userId || isSuperAdmin) {
      setSettings({ company_name: 'GES PRO', logo_url: null });
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('company_settings')
      .select('company_name, logo_url')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching company settings for user:', error);
      setSettings({ company_name: 'GES PRO', logo_url: null });
    } else {
      setSettings({
        company_name: data?.company_name || 'GES PRO',
        logo_url: data?.logo_url || null
      });
    }
    setLoading(false);
  }, [isSuperAdmin]);

  const fetchSettingsForLogin = useCallback(async (email) => {
    if (!email) {
      setSettings({ company_name: 'GES PRO', logo_url: null });
      return;
    }
    
    setLoading(true);
    // Find user by email to get their ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', email)
      .maybeSingle();

    if (userError || !userData) {
      setSettings({ company_name: 'GES PRO', logo_url: null });
      setLoading(false);
      return;
    }

    // Fetch company settings with the user ID
    const { data, error } = await supabase
      .from('company_settings')
      .select('company_name, logo_url')
      .eq('user_id', userData.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching company settings for login:', error);
      setSettings({ company_name: 'GES PRO', logo_url: null });
    } else {
      setSettings({
        company_name: data?.company_name || 'GES PRO',
        logo_url: data?.logo_url || null
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session && user) {
      fetchSettingsForUser(user.id);
    } else {
      setSettings({ company_name: 'GES PRO', logo_url: null });
      setLoading(false);
    }
  }, [session, user, fetchSettingsForUser]);

  const value = useMemo(() => ({
    settings,
    loading,
    fetchSettingsForLogin,
    refreshSettings: () => user && fetchSettingsForUser(user.id)
  }), [settings, loading, user, fetchSettingsForUser, fetchSettingsForLogin]);

  return (
    <CompanySettingsContext.Provider value={value}>
      {children}
    </CompanySettingsContext.Provider>
  );
};

export const useCompanySettings = () => {
  const context = useContext(CompanySettingsContext);
  if (context === undefined) {
    throw new Error('useCompanySettings must be used within a CompanySettingsProvider');
  }
  return context;
};