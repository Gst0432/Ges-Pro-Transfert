import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

export const SupplierFormDialog = ({ isOpen, onOpenChange, supplier, onSupplierSaved }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!supplier;

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          name: supplier.name || '',
          contact_person: supplier.contact_person || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || '',
          notes: supplier.notes || '',
        });
      } else {
        // Reset form for new supplier
        setFormData({
          name: '',
          contact_person: '',
          phone: '',
          email: '',
          address: '',
          notes: '',
        });
      }
    }
  }, [isOpen, isEditing, supplier]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Champ obligatoire",
        description: "Le nom de l'entreprise est requis.",
      });
      return;
    }

    setIsLoading(true);

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase
        .from('suppliers')
        .update(formData)
        .eq('id', supplier.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('suppliers')
        .insert({
          ...formData,
          user_id: user.id,
        });
      error = insertError;
    }

    setIsLoading(false);

    if (error) {
      console.error('Error saving supplier:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de ${isEditing ? 'modifier' : 'ajouter'} le fournisseur. ${error.message}`,
      });
    } else {
      toast({
        title: "Succès !",
        description: `Le fournisseur a été ${isEditing ? 'modifié' : 'ajouté'}.`,
      });
      onSupplierSaved();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl">{isEditing ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Mettez à jour les informations du fournisseur ci-dessous.' : 'Entrez les informations du nouveau fournisseur ci-dessous.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise</Label>
                <Input id="name" value={formData.name} onChange={handleChange} placeholder="Nom du fournisseur" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Nom du contact</Label>
                <Input id="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="Nom de la personne à contacter" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="Numéro de téléphone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="Adresse email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" value={formData.address} onChange={handleChange} placeholder="Adresse complète" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={handleChange} placeholder="Informations supplémentaires" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};