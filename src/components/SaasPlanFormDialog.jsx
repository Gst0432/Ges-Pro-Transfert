
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const SaasPlanFormDialog = ({ isOpen, onOpenChange, plan, onPlanSaved }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: 'Premium',
    price_monthly: '',
    price_yearly: '',
    currency: 'FCFA',
    features: '[]',
    is_active: true,
    api_url: '',
    trial_days: 7,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || 'Premium',
        price_monthly: plan.price_monthly || '',
        price_yearly: plan.price_yearly || '',
        currency: plan.currency || 'FCFA',
        features: JSON.stringify(plan.features || [], null, 2),
        is_active: plan.is_active,
        api_url: plan.api_url || '',
        trial_days: plan.trial_days || 7,
      });
    } else {
      setFormData({
        name: 'Premium',
        price_monthly: '',
        price_yearly: '',
        currency: 'FCFA',
        features: '["Rapports de ventes avancés", "Analyses et statistiques détaillées", "Support client prioritaire", "Export de données illimité"]',
        is_active: true,
        api_url: '',
        trial_days: 7,
      });
    }
  }, [plan, isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, currency: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let featuresArray;
    try {
      featuresArray = JSON.parse(formData.features);
      if (!Array.isArray(featuresArray)) {
        throw new Error('Features must be a JSON array.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de format',
        description: 'Les fonctionnalités doivent être un tableau JSON valide.',
      });
      setLoading(false);
      return;
    }

    const planData = {
      ...formData,
      price_monthly: parseFloat(formData.price_monthly),
      price_yearly: parseFloat(formData.price_yearly),
      trial_days: parseInt(formData.trial_days, 10),
      features: featuresArray,
    };

    let error;
    if (plan) {
      const { error: updateError } = await supabase
        .from('saas_plans')
        .update(planData)
        .eq('id', plan.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('saas_plans').insert([planData]);
      error = insertError;
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de sauvegarder le plan. ${error.message}`,
      });
    } else {
      toast({
        title: 'Succès',
        description: `Plan ${plan ? 'mis à jour' : 'créé'} avec succès.`,
      });
      onPlanSaved();
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{plan ? 'Modifier le plan' : 'Créer un nouveau plan'}</DialogTitle>
          <DialogDescription>
            Remplissez les détails du plan SaaS.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="name">Nom du plan</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="currency">Devise</Label>
                <Select onValueChange={handleSelectChange} defaultValue={formData.currency}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choisir une devise" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FCFA">FCFA</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_monthly">Prix Mensuel</Label>
              <Input id="price_monthly" type="number" step="0.01" value={formData.price_monthly} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="price_yearly">Prix Annuel</Label>
              <Input id="price_yearly" type="number" step="0.01" value={formData.price_yearly} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <Label htmlFor="api_url">URL de l'API de paiement</Label>
            <Input id="api_url" value={formData.api_url} onChange={handleChange} placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="features">Fonctionnalités (JSON Array)</Label>
            <Textarea id="features" value={formData.features} onChange={handleChange} rows={4} placeholder='["Fonctionnalité 1", "Fonctionnalité 2"]' />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="is_active">Plan Actif</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Label htmlFor="trial_days">Jours d'essai</Label>
                <Input id="trial_days" type="number" className="w-20" value={formData.trial_days} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
