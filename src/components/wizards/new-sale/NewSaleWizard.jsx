import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StepIndicator } from './StepIndicator';
import { Step1ClientInfo } from './Step1ClientInfo';
import { Step2ItemDetails } from './Step2ItemDetails';
import { Step3Finalization } from './Step3Finalization';

const getInitialSaleData = () => ({
    client_id: null,
    client_name: '',
    client_phone: '',
    client_email: '',
    items: [],
    total_amount: 0,
    amount_paid: '', // Initialiser à une chaîne vide
    status: 'Payée',
    sale_date: new Date().toISOString().split('T')[0],
    due_date: null,
});

export const NewSaleWizard = ({ isOpen, onOpenChange, onSaleSaved }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saleData, setSaleData] = useState(getInitialSaleData());

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setSaleData(getInitialSaleData());
  }, []);

  useEffect(() => {
      if(isOpen) {
          resetWizard();
      }
  }, [isOpen, resetWizard]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const handleSave = async () => {
    setIsLoading(true);
    let currentClientId = saleData.client_id;
    
    // 1. Create new client if needed
    if (!currentClientId && saleData.client_name) {
        const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
                user_id: user.id,
                name: saleData.client_name,
                phone: saleData.client_phone,
                email: saleData.client_email,
            })
            .select('id')
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

    // 2. Create new products if any and update stock for existing ones
    const itemsWithProductIds = [...saleData.items];
    for (let i = 0; i < itemsWithProductIds.length; i++) {
        const item = itemsWithProductIds[i];
        if (item.product_id === null) { // This is a new product
            const { data: newProduct, error: productError } = await supabase
                .from('products')
                .insert({
                    user_id: user.id,
                    name: item.name,
                    sale_price: item.unit_price,
                    quantity: 0, // Start with 0, sale will be deducted by trigger
                    is_sellable: true
                })
                .select('id')
                .single();
            
            if (productError) {
                toast({ variant: "destructive", title: "Erreur", description: `Impossible de créer le produit "${item.name}".` });
                setIsLoading(false);
                return;
            }
            itemsWithProductIds[i].product_id = newProduct.id;
        }
    }


    // 3. Create the sale
    const { items, client_name, client_phone, client_email, ...saleToInsert } = saleData;
    saleToInsert.client_id = currentClientId;
    saleToInsert.user_id = user.id;
    
    // Ensure due_date is null if empty string
    if (saleToInsert.due_date === '') {
        saleToInsert.due_date = null;
    }

    if (saleData.status === 'Payée') {
      saleToInsert.amount_paid = saleData.total_amount;
    } else {
      saleToInsert.amount_paid = parseFloat(saleData.amount_paid || '0'); // Gérer la chaîne vide
    }

    const { data: newSale, error: saleError } = await supabase
        .from('sales')
        .insert(saleToInsert)
        .select()
        .single();
    
    if (saleError) {
        toast({ variant: "destructive", title: "Erreur", description: `Impossible d'enregistrer la vente: ${saleError.message}` });
        setIsLoading(false);
        return;
    }

    // 4. Create sale items (triggers will handle stock update)
    const saleItemsToInsert = itemsWithProductIds.map(item => ({
        sale_id: newSale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);

    if (itemsError) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible d'enregistrer les articles de la vente." });
        await supabase.from('sales').delete().eq('id', newSale.id); // Rollback sale
        setIsLoading(false);
        return;
    }

    // 5. Generate receipt document
    const docNumber = `REC-${Date.now()}`;
    await supabase.from('documents').insert({
        user_id: user.id,
        client_id: currentClientId,
        sale_id: newSale.id,
        type: 'receipt_sale',
        document_number: docNumber,
        issue_date: newSale.sale_date,
        due_date: newSale.due_date,
        total_amount: newSale.total_amount,
        status: newSale.status,
        document_details: { items: saleItemsToInsert }
    });

    setIsLoading(false);
    toast({ title: "Succès", description: "Vente enregistrée et reçu généré !" });
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