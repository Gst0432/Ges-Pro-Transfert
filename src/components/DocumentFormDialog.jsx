import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const DocumentFormDialog = ({ isOpen, onOpenChange, type, onDocumentSaved, companySettings }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    issue_date: new Date(),
    due_date: null,
    items: [],
    status: type === 'invoice' ? 'Envoyé' : 'Brouillon',
  });

  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    name: '',
    quantity: 1,
    unit_price: 0,
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        const { data: clientsData } = await supabase.from('clients').select('id, name');
        const { data: productsData } = await supabase.from('products').select('id, name, sale_price');
        setClients(clientsData || []);
        setProducts(productsData || []);
        setLoading(false);
      };
      fetchData();
      // Reset form
      setFormData({
        client_id: '',
        issue_date: new Date(),
        due_date: null,
        items: [],
        status: type === 'invoice' ? 'Envoyé' : 'Brouillon',
      });
    }
  }, [isOpen, type]);

  const handleItemProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setCurrentItem(prev => ({
        ...prev,
        product_id: product.id,
        name: product.name,
        unit_price: product.sale_price || 0,
      }));
    }
  };

  const handleAddItem = () => {
    if (!currentItem.name || currentItem.quantity <= 0 || currentItem.unit_price < 0) {
      toast({ variant: 'destructive', title: 'Article invalide' });
      return;
    }
    setFormData(prev => ({ ...prev, items: [...prev.items, currentItem] }));
    setCurrentItem({ product_id: '', name: '', quantity: 1, unit_price: 0 });
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const totalAmount = useMemo(() =>
    formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [formData.items]
  );

  const handleSave = async () => {
    if (!formData.client_id || formData.items.length === 0) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez sélectionner un client et ajouter au moins un article.' });
      return;
    }
    setSaving(true);
    
    const docNumber = `${type.toUpperCase()}-${Date.now()}`;

    const { error } = await supabase.from('documents').insert({
      user_id: user.id,
      client_id: formData.client_id,
      type: type,
      document_number: docNumber,
      issue_date: format(formData.issue_date, 'yyyy-MM-dd'),
      due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
      total_amount: totalAmount,
      status: formData.status,
      document_details: { items: formData.items }
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `Impossible de créer le document: ${error.message}` });
    } else {
      toast({ title: 'Succès', description: `${type === 'invoice' ? 'Facture' : 'Devis'} créé(e).` });
      onDocumentSaved();
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Créer un{type === 'invoice' ? 'e facture' : ' devis'}</DialogTitle>
          <DialogDescription>Remplissez les informations ci-dessous.</DialogDescription>
        </DialogHeader>
        {loading ? <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
          <div className="overflow-y-auto p-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Client</Label>
                <Select value={formData.client_id} onValueChange={val => setFormData(p => ({ ...p, client_id: val }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date d'émission</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.issue_date ? format(formData.issue_date, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.issue_date} onSelect={d => setFormData(p => ({ ...p, issue_date: d }))} /></PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Date d'échéance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.due_date} onSelect={d => setFormData(p => ({ ...p, due_date: d }))} /></PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-4">
              <h4 className="font-semibold">Articles</h4>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <p className="flex-1">{item.name}</p>
                    <p>{item.quantity} x {item.unit_price.toLocaleString('fr-FR')} FCFA</p>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-12 gap-2 items-end pt-4 border-t">
                <div className="col-span-12 sm:col-span-5">
                  <Label>Produit</Label>
                  <Select value={currentItem.product_id} onValueChange={handleItemProductChange}>
                    <SelectTrigger><SelectValue placeholder="Choisir un produit" /></SelectTrigger>
                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <Label>Description</Label>
                  <Input value={currentItem.name} onChange={e => setCurrentItem(p => ({ ...p, name: e.target.value }))} placeholder="Ou description manuelle" />
                </div>
                <div className="col-span-6 sm:col-span-1"><Label>Qté</Label><Input type="number" value={currentItem.quantity} onChange={e => setCurrentItem(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} /></div>
                <div className="col-span-6 sm:col-span-2"><Label>Prix U.</Label><Input type="number" value={currentItem.unit_price} onChange={e => setCurrentItem(p => ({ ...p, unit_price: parseFloat(e.target.value) || 0 }))} /></div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={handleAddItem}><Plus className="w-4 h-4 mr-2" />Ajouter l'article</Button>
              </div>
            </div>
            <div className="text-right font-bold text-xl mt-4">
              Total: {totalAmount.toLocaleString('fr-FR')} FCFA
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};