import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';

export const Step1SupplierInfo = ({ onNext, orderData, setOrderData }) => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data } = await supabase.from('suppliers').select('id, name');
      setSuppliers(data || []);
    };
    fetchSuppliers();
  }, []);

  const canProceed = orderData.supplier_id && orderData.order_date;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="supplier">Fournisseur</Label>
          <Select value={orderData.supplier_id} onValueChange={(val) => setOrderData(p => ({ ...p, supplier_id: val }))}>
            <SelectTrigger id="supplier"><SelectValue placeholder="Sélectionner un fournisseur" /></SelectTrigger>
            <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="order_date">Date de commande</Label>
          <Input id="order_date" type="date" value={orderData.order_date} onChange={(e) => setOrderData(p => ({ ...p, order_date: e.target.value }))} />
        </div>
      </div>
      <DialogFooter className="flex justify-end mt-8">
        <Button onClick={onNext} disabled={!canProceed}>Suivant &rarr;</Button>
      </DialogFooter>
    </div>
  );
};