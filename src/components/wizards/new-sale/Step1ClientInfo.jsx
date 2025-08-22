import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';

export const Step1ClientInfo = ({ onNext, saleData, setSaleData }) => {
    const [clients, setClients] = useState([]);
    const [isNewClient, setIsNewClient] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase.from('clients').select('id, name');
            if (error) console.error("Error fetching clients:", error);
            else setClients(data || []);
        };
        fetchClients();
    }, []);
    
    useEffect(() => {
        // If an existing client is selected, switch off new client mode
        if(saleData.client_id) {
            setIsNewClient(false);
        }
    }, [saleData.client_id]);

    const handleClientChange = (clientId) => {
        const selected = clients.find(c => c.id === clientId);
        setSaleData(prev => ({
            ...prev,
            client_id: clientId,
            client_name: selected?.name || '',
            client_phone: '',
            client_email: ''
        }));
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setSaleData(prev => ({ ...prev, [id]: value }));
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Informations du client</h3>
            <div className="space-y-2">
                <Label>Client existant</Label>
                <Select onValueChange={handleClientChange} disabled={isNewClient} value={saleData.client_id || ''}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client existant" />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="new-client-checkbox" checked={isNewClient} onCheckedChange={setIsNewClient} />
                <Label htmlFor="new-client-checkbox">Créer un nouveau client</Label>
            </div>
            
            {isNewClient && (
                <div className="space-y-4 pt-4 border-t">
                    <div>
                        <Label htmlFor="client_name">Nom du client</Label>
                        <Input id="client_name" placeholder="Nom du client" value={saleData.client_name} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="client_phone">Téléphone</Label>
                            <Input id="client_phone" placeholder="Numéro de téléphone" value={saleData.client_phone} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="client_email">Email</Label>
                            <Input id="client_email" type="email" placeholder="Email (optionnel)" value={saleData.client_email} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>
            )}
            <DialogFooter className="flex justify-end mt-8">
                <Button onClick={onNext} disabled={!saleData.client_id && !saleData.client_name}>Suivant &rarr;</Button>
            </DialogFooter>
        </div>
    );
};