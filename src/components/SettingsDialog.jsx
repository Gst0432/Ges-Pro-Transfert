
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const SettingsDialog = ({ isOpen, onOpenChange }) => {
  const { user } = useAuth();
  const { settings: currentSettings, refreshSettings } = useCompanySettings();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: '',
    address: '',
    phone: '',
    email: '',
    tax_id: '',
    logo_url: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setSettings(data);
      setLogoPreview(data.logo_url);
    } else if (error && error.code !== 'PGRST116') {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les paramètres.' });
    } else {
      setSettings(prev => ({...prev, company_name: currentSettings.company_name || 'Mon Entreprise'}));
    }
    setLoading(false);
  }, [user, toast, currentSettings.company_name]);

  useEffect(() => {
    if (isOpen && user) {
      fetchSettings();
    }
  }, [isOpen, user, fetchSettings]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    let newLogoUrl = settings.logo_url;

    if (logoFile) {
      const filePath = `${user.id}/${Date.now()}_${logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        toast({ variant: 'destructive', title: 'Erreur Upload', description: "Impossible d'uploader le logo." });
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);
      
      newLogoUrl = urlData.publicUrl;
    }

    const updates = {
      ...settings,
      user_id: user.id,
      logo_url: newLogoUrl,
      updated_at: new Date().toISOString(),
    };

    const { error: dbError } = await supabase
      .from('company_settings')
      .upsert(updates, { onConflict: 'user_id' });

    if (dbError) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder les paramètres.' });
    } else {
      toast({ title: 'Succès', description: 'Paramètres sauvegardés.' });
      await refreshSettings();
      onOpenChange(false);
    }
    setSaving(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paramètres de l'entreprise</DialogTitle>
          <DialogDescription>
            Gérez les informations de votre entreprise et votre logo.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={logoPreview} alt="Logo" />
                  <AvatarFallback className="text-3xl">
                    {settings.company_name?.charAt(0) || 'E'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <Label>Logo de l'entreprise</Label>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Changer
                        </Button>
                        <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/svg+xml" />
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, SVG. Max 2MB.</p>
                </div>
            </div>
          
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Nom de l'entreprise</Label>
                <Input id="company_name" value={settings.company_name || ''} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="tax_id">Numéro d'identification fiscale</Label>
                <Input id="tax_id" value={settings.tax_id || ''} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea id="address" value={settings.address || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" value={settings.phone || ''} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={settings.email || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
