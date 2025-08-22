import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export const ReceiveOrderDialog = ({ isOpen, onOpenChange, order, onReceptionSaved }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchOrderItems = useCallback(async () => {
    if (!order) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('purchase_order_items')
      .select('*, product:products(name)')
      .eq('purchase_order_id', order.id);
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les articles.' });
      setItems([]);
    } else {
      // Initialize quantity to receive with remaining quantity
      const itemsWithReceiveQty = data.map(item => ({
        ...item,
        quantity_to_receive: item.quantity_ordered - (item.quantity_received || 0)
      }));
      setItems(itemsWithReceiveQty);
    }
    setLoading(false);
  }, [order, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchOrderItems();
    }
  }, [isOpen, fetchOrderItems]);

  const handleQuantityChange = (itemId, value) => {
    const newItems = items.map(item => {
      if (item.id === itemId) {
        const remaining = item.quantity_ordered - (item.quantity_received || 0);
        const newQty = Math.max(0, Math.min(remaining, parseInt(value, 10) || 0));
        return { ...item, quantity_to_receive: newQty };
      }
      return item;
    });
    setItems(newItems);
  };

  const handleSaveReception = async () => {
    setIsSaving(true);

    const itemsToUpdate = items.filter(item => item.quantity_to_receive > 0);

    if (itemsToUpdate.length === 0) {
        toast({ title: 'Info', description: 'Aucune quantité à réceptionner.' });
        setIsSaving(false);
        onOpenChange(false);
        return;
    }

    // The trigger will handle stock updates. We just need to update the received quantity.
    const updates = itemsToUpdate.map(item => 
        supabase
            .from('purchase_order_items')
            .update({ quantity_received: (item.quantity_received || 0) + item.quantity_to_receive })
            .eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some(res => res.error);

    if (hasError) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue lors de la mise à jour du stock.' });
        setIsSaving(false);
        return;
    }
    
    // Check if all items are fully received to update order status
    const { data: updatedItems } = await supabase.from('purchase_order_items').select('quantity_ordered, quantity_received').eq('purchase_order_id', order.id);
    const allReceived = updatedItems.every(item => item.quantity_received >= item.quantity_ordered);
    const newStatus = allReceived ? 'Reçu' : 'Partiellement Reçu';

    await supabase.from('purchase_orders').update({ status: newStatus }).eq('id', order.id);

    toast({ title: 'Succès', description: 'Stock mis à jour avec succès.' });
    setIsSaving(false);
    onReceptionSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Réceptionner la Commande</DialogTitle>
          <DialogDescription>
            Confirmez les quantités reçues pour la commande #{order?.id.substring(0, 8)}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            items.map(item => (
              <div key={item.id} className="grid grid-cols-3 items-center gap-4">
                <Label className="col-span-1">{item.product.name}</Label>
                <div className="col-span-1 text-sm text-center">
                  {item.quantity_received || 0} / {item.quantity_ordered} reçus
                </div>
                <div className="col-span-1">
                  <Input 
                    type="number" 
                    value={item.quantity_to_receive}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    max={item.quantity_ordered - (item.quantity_received || 0)}
                    min="0"
                    placeholder="Qté reçue"
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSaveReception} disabled={loading || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmer la Réception
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};