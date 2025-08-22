import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, Loader2 } from 'lucide-react';

import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const steps = [
  { id: 1, name: 'Informations du client' },
  { id: 2, name: 'Détails des articles' },
  { id: 3, name: 'Finalisation' },
];

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center space-x-4">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <motion.div
            animate={currentStep >= step.id ? "active" : "inactive"}
            variants={{
              active: { scale: 1, backgroundColor: '#2563EB', color: '#FFFFFF' },
              inactive: { scale: 1, backgroundColor: '#E5E7EB', color: '#6B7280' },
            }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
          </motion.div>
        </div>
        {index < steps.length - 1 && (
          <div className="flex-1 h-0.5 bg-gray-200 relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: currentStep > step.id ? '100%' : '0%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

const Step1ClientInfo = ({ onNext, saleData, setSaleData }) => {
    const [clients, setClients] = useState([]);
    const [isNewClient, setIsNewClient] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase.from('clients').select('id, name');
            if (error) console.error("Error fetching clients:", error);
            else setClients(data);
        };
        fetchClients();
    }, []);

    const handleClientChange = (clientId) => {
        const selected = clients.find(c => c.id === clientId);
        setSaleData(prev => ({
            ...prev,
            client_id: clientId,
            client_name: selected?.name || '',
            client_phone: '',
            client_email: ''
        }));
        setIsNewClient(false);
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
                <Select onValueChange={handleClientChange} disabled={isNewClient}>
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
                            <Input id="client_email" placeholder="Email (optionnel)" value={saleData.client_email} onChange={handleInputChange} />
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

const Step2ItemDetails = ({ onNext, onBack, saleData, setSaleData }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('*').eq('is_sellable', true);
            if (error) console.error("Error fetching products:", error);
            else setProducts(data);
        };
        fetchProducts();
    }, []);

    const handleAddItem = () => {
        if (!selectedProduct || quantity <= 0) return;
        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const newItem = {
            product_id: product.id,
            name: product.name,
            quantity: parseInt(quantity, 10),
            unit_price: parseFloat(product.sale_price)
        };
        setSaleData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setSelectedProduct('');
        setQuantity(1);
    };

    const handleRemoveItem = (index) => {
        setSaleData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Détails des articles</h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <Label htmlFor="product">Produit</Label>
                    <Select onValueChange={setSelectedProduct} value={selectedProduct}>
                        <SelectTrigger id="product">
                            <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sale_price} FCFA)</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="quantity">Quantité</Label>
                    <Input id="quantity" type="number" placeholder="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleAddItem}><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
            </div>

            <div className="space-y-2">
                <h4 className="font-medium">Articles ajoutés</h4>
                {saleData.items.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun article ajouté.</p>
                ) : (
                    saleData.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.quantity} x {item.unit_price} FCFA</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{item.quantity * item.unit_price} FCFA</span>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <DialogFooter className="flex justify-between mt-8">
                <Button variant="outline" onClick={onBack}>&larr; Précédent</Button>
                <Button onClick={onNext} disabled={saleData.items.length === 0}>Suivant &rarr;</Button>
            </DialogFooter>
        </div>
    );
};

const Step3Finalization = ({ onBack, onSave, saleData, setSaleData, isLoading }) => {
    const totalAmount = saleData.items.reduce((total, item) => total + item.quantity * item.unit_price, 0);

    useEffect(() => {
        setSaleData(prev => ({ ...prev, total_amount: totalAmount }));
    }, [totalAmount, setSaleData]);

    const clientName = saleData.client_name || 'Client non spécifié';

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
                        <span className="font-bold text-lg">{totalAmount} FCFA</span>
                    </div>
                </div>
            </div>
             <div>
                <Label htmlFor="status">Statut de la vente</Label>
                <Select defaultValue={saleData.status} onValueChange={(value) => setSaleData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger id="status">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Payée">Payée (Complétée)</SelectItem>
                        <SelectItem value="En attente">En attente de paiement</SelectItem>
                        <SelectItem value="Annulée">Annulée</SelectItem>
                    </SelectContent>
                </Select>
              </div>
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


export const NewSaleWizard = ({ isOpen, onOpenChange, onSaleSaved }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saleData, setSaleData] = useState({
      client_id: null,
      client_name: '',
      client_phone: '',
      client_email: '',
      items: [],
      total_amount: 0,
      status: 'Payée',
      sale_date: new Date().toISOString(),
  });

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setSaleData({
        client_id: null,
        client_name: '',
        client_phone: '',
        client_email: '',
        items: [],
        total_amount: 0,
        status: 'Payée',
        sale_date: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
      if(isOpen) {
          resetWizard();
      }
  }, [isOpen, resetWizard]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const handleSave = async () => {
    setIsLoading(true);
    let currentClientId = saleData.client_id;
    
    // 1. Create a new client if needed
    if (!currentClientId && saleData.client_name) {
        const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
                user_id: user.id,
                name: saleData.client_name,
                phone: saleData.client_phone,
                email: saleData.client_email,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();
        if (clientError) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de créer le client." });
            setIsLoading(false);
            return;
        }
        currentClientId = newClient.id;
    }

    if (!currentClientId) {
        toast({ variant: "destructive", title: "Erreur", description: "Aucun client sélectionné ou créé." });
        setIsLoading(false);
        return;
    }

    // 2. Create the sale
    const totalAmount = saleData.items.reduce((total, item) => total + item.quantity * item.unit_price, 0);

    const { data: newSale, error: saleError } = await supabase
        .from('sales')
        .insert({
            user_id: user.id,
            client_id: currentClientId,
            sale_date: saleData.sale_date,
            total_amount: totalAmount,
            status: saleData.status,
        })
        .select()
        .single();
    
    if (saleError) {
        toast({ variant: "destructive", title: "Erreur", description: `Impossible d'enregistrer la vente: ${saleError.message}` });
        setIsLoading(false);
        return;
    }

    // 3. Create sale items
    const saleItemsToInsert = saleData.items.map(item => ({
        sale_id: newSale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);

    if (itemsError) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible d'enregistrer les articles de la vente." });
        // Potentially delete the sale record here for consistency
        setIsLoading(false);
        return;
    }

    setIsLoading(false);
    toast({ title: "Succès", description: "Vente enregistrée avec succès !" });
    onSaleSaved();
    onOpenChange(false);
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1ClientInfo onNext={handleNext} saleData={saleData} setSaleData={setSaleData} />;
      case 2:
        return <Step2ItemDetails onNext={handleNext} onBack={handleBack} saleData={saleData} setSaleData={setSaleData} />;
      case 3:
        return <Step3Finalization onBack={handleBack} onSave={handleSave} saleData={saleData} setSaleData={setSaleData} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nouvelle Vente</DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle vente. Suivez les étapes ci-dessous.
          </DialogDescription>
        </DialogHeader>

        <div className="my-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
            >
                {renderStep()}
            </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};