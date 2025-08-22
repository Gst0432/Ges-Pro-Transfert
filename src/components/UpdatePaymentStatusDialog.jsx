import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export const UpdatePaymentStatusDialog = ({ isOpen, onOpenChange, order, onPaymentSaved }) => {
  const [newStatus, setNewStatus] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (order) {
      setNewStatus(order.payment_status);
      setAmountPaid(order.amount_paid || 0);
    }
  }, [order]);
  
  const handleSave = async () => {
    if (!order) return;
    
    setIsSaving(true);
    
    let updatedAmountPaid = amountPaid;
    if (newStatus === 'Payé') {
        updatedAmountPaid = order.total_amount;
    }
    
    const { error } = await supabase
      .from('purchase_orders')
      .update({ 
        payment_status: newStatus,
        amount_paid: updatedAmountPaid,
      })
      .eq('id', order.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de mettre à jour le statut: ${error.message}`,
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Statut de paiement mis à jour.',
      });
      onPaymentSaved();
      onOpenChange(false);
    }
    
    setIsSaving(false);
  };

  const remainingAmount = order ? order.total_amount - (order.amount_paid || 0) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mettre à jour le paiement</DialogTitle>
          <DialogDescription>
            Modifier le statut de paiement pour la commande #{order?.id.substring(0, 8)}.
            <br />
            Montant restant à payer: <strong>{remainingAmount.toLocaleString('fr-FR')} FCFA</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="payment-status">Nouveau Statut</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="payment-status">
                <SelectValue placeholder="Choisir un statut" />
              </SelectTrigger>
              <SelectContent>
                {order?.payment_status === 'Non Payé' && <SelectItem value="Non Payé">Non Payé</SelectItem>}
                <SelectItem value="Partiel">Partiel</SelectItem>
                <SelectItem value="Payé">Payé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newStatus === 'Partiel' && (
            <div>
              <Label htmlFor="amount_paid">Montant du versement</Label>
              <Input
                id="amount_paid"
                type="number"
                placeholder="ex: 5000"
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) + (order.amount_paid || 0))}
              />
               <p className="text-sm text-gray-500 mt-1">
                Total payé après ce versement: {(parseFloat(amountPaid) || (order.amount_paid || 0)).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};