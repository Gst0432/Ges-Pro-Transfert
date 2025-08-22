import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export const Step3PurchaseFinalization = ({ onBack, orderData, setOrderData, onSave, closeWizard }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const totalAmount = useMemo(() =>
    orderData.items.reduce((total, item) => total + item.quantity * item.unit_price, 0),
    [orderData.items]
  );

  const handleSave = async () => {
    setIsLoading(true);

    const itemsWithProductIds = [...orderData.items];
    for (let i = 0; i < itemsWithProductIds.length; i++) {
        const item = itemsWithProductIds[i];
        if (item.product_id === null) {
            let categoryId;
            const { data: existingCategory, error: findCatError } = await supabase.from('product_categories').select('id').ilike('name', item.category_name).maybeSingle();

            if (findCatError) {
                toast({ variant: "destructive", title: "Erreur", description: `Erreur lors de la recherche de catégorie: ${findCatError.message}` });
                setIsLoading(false);
                return;
            }

            if (existingCategory) {
                categoryId = existingCategory.id;
            } else {
                const { data: newCategory, error: catError } = await supabase.from('product_categories').insert({ name: item.category_name, user_id: user.id }).select('id').single();
                if (catError) { toast({ variant: "destructive", title: "Erreur Catégorie" }); setIsLoading(false); return; }
                categoryId = newCategory.id;
            }

            const { data: newProduct, error: prodError } = await supabase.from('products').insert({ user_id: user.id, name: item.name, purchase_price: item.unit_price, sale_price: item.unit_price * 1.25, quantity: 0, is_sellable: true, category_id: categoryId, supplier_id: orderData.supplier_id }).select('id').single();
            if (prodError) { toast({ variant: "destructive", title: "Erreur Produit" }); setIsLoading(false); return; }
            itemsWithProductIds[i].product_id = newProduct.id;
        }
    }

    const { items, ...orderToInsert } = orderData;
    orderToInsert.user_id = user.id;
    orderToInsert.total_amount = totalAmount;
    orderToInsert.status = 'Commandé';

    const { data: newOrder, error: orderError } = await supabase.from('purchase_orders').insert(orderToInsert).select().single();
    if (orderError) { toast({ variant: 'destructive', title: 'Erreur', description: `Impossible d'enregistrer la commande: ${orderError.message}` }); setIsLoading(false); return; }

    const orderItemsToInsert = itemsWithProductIds.map(item => ({ purchase_order_id: newOrder.id, product_id: item.product_id, quantity_ordered: item.quantity, unit_price: item.unit_price }));
    const { error: itemsError } = await supabase.from('purchase_order_items').insert(orderItemsToInsert);
    if (itemsError) { toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'enregistrer les articles." }); await supabase.from('purchase_orders').delete().eq('id', newOrder.id); setIsLoading(false); return; }

    // Generate receipt document
    const docNumber = `ACH-${Date.now()}`;
    await supabase.from('documents').insert({
        user_id: user.id,
        purchase_order_id: newOrder.id,
        type: 'receipt_purchase',
        document_number: docNumber,
        issue_date: newOrder.order_date,
        total_amount: newOrder.total_amount,
        status: newOrder.status,
        document_details: { items: orderItemsToInsert }
    });

    setIsLoading(false);
    toast({ title: 'Succès', description: 'Commande fournisseur enregistrée et reçu généré.' });
    onSave();
    closeWizard();
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-800">Récapitulatif et Paiement</h3>
      
      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
        {orderData.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <p>{item.name} <span className="text-gray-500">x{item.quantity}</span></p>
            <p className="font-medium">{(item.quantity * item.unit_price).toLocaleString('fr-FR')} FCFA</p>
          </div>
        ))}
        <div className="pt-2 border-t flex justify-between items-center">
          <p className="text-lg font-bold">Total</p>
          <p className="text-lg font-bold">{totalAmount.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      <div>
        <Label htmlFor="payment_status">Statut du paiement</Label>
        <Select value={orderData.payment_status} onValueChange={(val) => setOrderData(p => ({ ...p, payment_status: val }))}>
          <SelectTrigger id="payment_status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Non Payé">Non Payé</SelectItem>
            <SelectItem value="Partiel">Paiement Partiel</SelectItem>
            <SelectItem value="Payé">Payé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>&larr; Précédent</Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer la commande
        </Button>
      </DialogFooter>
    </div>
  );
};