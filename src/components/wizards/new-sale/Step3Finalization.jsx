import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export const Step3Finalization = ({ onBack, onSave, saleData, setSaleData, isLoading }) => {
    const totalAmount = useMemo(() => 
        saleData.items.reduce((total, item) => total + item.quantity * item.unit_price, 0),
        [saleData.items]
    );

    useEffect(() => {
        setSaleData(prev => ({ ...prev, total_amount: totalAmount }));
    }, [totalAmount, setSaleData]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setSaleData(prev => ({ ...prev, [id]: value }));
    }

    const clientName = saleData.client_name || 'Client non spécifié';

    const isCreditOrPartial = saleData.status === 'En attente' || saleData.status === 'Partiel';

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Finalisation de la vente</h3>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                    <Label>Client</Label>
                    <span className="text-gray-800 font-medium">{clientName}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                    <p className="font-semibold text-gray-800 mb-2">Résumé de la vente</p>
                    {saleData.items.map((item, index) => (
                         <div key={index} className="flex justify-between items-center text-sm text-gray-600">
                           <span>{item.name} x {item.quantity}</span>
                           <span>{item.quantity * item.unit_price} FCFA</span>
                         </div>
                    ))}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-lg">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                </div>
            </div>
             <div>
                <Label htmlFor="status">Statut de la vente</Label>
                <Select value={saleData.status} onValueChange={(value) => setSaleData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger id="status">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Payée">Payée (Complétée)</SelectItem>
                        <SelectItem value="En attente">En attente (Crédit)</SelectItem>
                        <SelectItem value="Partiel">Paiement partiel</SelectItem>
                        <SelectItem value="Annulée">Annulée</SelectItem>
                    </SelectContent>
                </Select>
              </div>

            {isCreditOrPartial && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="amount_paid">Montant Payé</Label>
                        <Input id="amount_paid" type="number" placeholder="0" value={saleData.amount_paid} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="due_date">Date d'échéance</Label>
                        <Input id="due_date" type="date" value={saleData.due_date} onChange={handleInputChange} />
                    </div>
                </div>
            )}

            <DialogFooter className="flex justify-between mt-8">
                <Button variant="outline" onClick={onBack} disabled={isLoading}>&larr; Précédent</Button>
                <Button onClick={onSave} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer la vente
                </Button>
            </DialogFooter>
        </div>
    );
};