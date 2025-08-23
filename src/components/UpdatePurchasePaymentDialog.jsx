import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export const UpdatePurchasePaymentDialog = ({ isOpen, onOpenChange, order, onPaymentUpdated }) => {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [amountPaid, setAmountPaid] = useState(''); // Initialiser à une chaîne vide
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.payment_status || 'Non Payé');
      setAmountPaid(order.amount_paid === 0 ? '' : order.amount_paid); // Initialiser à une chaîne vide si 0
    }
  }, [order]);

  const handleSave = async () => {
    setIsLoading(true);

    let finalAmountPaid = parseFloat(amountPaid || '0'); // Gérer la chaîne vide
    if (paymentStatus === 'Payé') {
      finalAmountPaid = order.total_amount;
    }

    if (isNaN(finalAmountPaid) || finalAmountPaid < 0 || finalAmountPaid > order.total_amount) {
      toast({
        variant: 'destructive',
        title: 'Montant invalide',
        description: 'Veuillez saisir un montant payé valide.',
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from('purchase_orders')
      .update({
        payment_status: paymentStatus,
        amount_paid: finalAmountPaid,
      })
      .eq('id', order.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le paiement.',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Le statut du paiement a été mis à jour.',
      });
      onPaymentUpdated();
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mettre à jour le paiement</DialogTitle>
          <DialogDescription>
            Modifier le statut du paiement pour la commande #{order.id.substring(0, 8)}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="payment_status">Statut du paiement</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger id="payment_status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Non Payé">Non Payé</SelectItem>
                <SelectItem value="Partiel">Paiement Partiel</SelectItem>
                <SelectItem value="Payé">Payé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {paymentStatus === 'Partiel' && (
            <div>
              <Label htmlFor="amount_paid">Montant Payé</Label>
              <Input
                id="amount_paid"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Ex: 50000"
              />
            </div>
          )}
          <div className="text-sm font-medium">
            Total de la commande: {order.total_amount.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};