
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const wizardSteps = [
  { id: 1, name: 'Détails du produit' },
  { id: 2, name: 'Tarifs et Stock' },
  { id: 3, name: 'Fournisseur' },
];

const StepIndicator = ({ currentStep }) => (
    <div className="flex items-center space-x-4">
        {wizardSteps.map((step, index) => (
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
                {index < wizardSteps.length - 1 && (
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


const Step1Details = ({ formData, setFormData, onNext }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const fetchCategories = async () => {
            if (!user) return;
            const { data, error } = await supabase.from('product_categories').select('id, name');
            if (error) console.error("Error fetching categories:", error);
            else setCategories(data || []);
        };
        fetchCategories();
    }, [user]);

    const handleAddCategory = async () => {
        if (!newCategory.trim() || !user) return;
        const { data, error } = await supabase
            .from('product_categories')
            .insert({ name: newCategory, user_id: user.id })
            .select()
            .single();

        if (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'ajouter la catégorie." });
        } else {
            setCategories(prev => [...prev, data]);
            setFormData(prev => ({ ...prev, category_id: data.id }));
            setNewCategory('');
            toast({ title: "Succès", description: `Catégorie "${data.name}" ajoutée.` });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="name">Nom du produit</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Ex: T-shirt en coton"/>
            </div>
            <div>
                <Label>Catégorie</Label>
                <Select value={formData.category_id || ''} onValueChange={value => setFormData(p => ({...p, category_id: value}))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <div className="mt-2 flex items-center space-x-2">
                    <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Ou créer une nouvelle catégorie"/>
                    <Button type="button" size="sm" onClick={handleAddCategory} disabled={!newCategory.trim()}><Plus className="w-4 h-4"/> </Button>
                </div>
            </div>
             <div>
                <RadioGroup value={formData.is_sellable ? "true" : "false"} onValueChange={value => setFormData(p => ({...p, is_sellable: value === "true"}))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="sellable" />
                    <Label htmlFor="sellable">Disponible à la vente</Label>
                  </div>
                   <p className="text-sm text-gray-500 ml-6">Ce produit sera visible dans la liste des produits disponibles pour la vente</p>
                </RadioGroup>
            </div>
            <DialogFooter>
                <Button onClick={onNext} disabled={!formData.name || !formData.category_id}>Suivant &rarr;</Button>
            </DialogFooter>
        </div>
    );
};

const Step2Pricing = ({ formData, setFormData, onNext, onBack }) => {
    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="quantity">Quantité</Label>
                <Input id="quantity" type="number" value={formData.quantity} onChange={e => setFormData(p => ({...p, quantity: parseInt(e.target.value, 10) || 0}))} placeholder="0"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="purchase_price">Prix d'achat (FCFA)</Label>
                    <Input id="purchase_price" type="number" value={formData.purchase_price} onChange={e => setFormData(p => ({...p, purchase_price: parseFloat(e.target.value) || 0}))} placeholder="0"/>
                </div>
                <div>
                    <Label htmlFor="sale_price">Prix de vente (FCFA)</Label>
                    <Input id="sale_price" type="number" value={formData.sale_price} onChange={e => setFormData(p => ({...p, sale_price: parseFloat(e.target.value) || 0}))} placeholder="0"/>
                </div>
            </div>
            <DialogFooter className="flex justify-between mt-8">
                <Button variant="outline" onClick={onBack}>&larr; Précédent</Button>
                <Button onClick={onNext}>Suivant &rarr;</Button>
            </DialogFooter>
        </div>
    );
};

const Step3Supplier = ({ formData, setFormData, onBack, onSave, isLoading }) => {
    const [suppliers, setSuppliers] = useState([]);
    useEffect(() => {
        const fetchSuppliers = async () => {
            const { data } = await supabase.from('suppliers').select('id, name');
            setSuppliers(data || []);
        };
        fetchSuppliers();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <Label>Fournisseur</Label>
                <Select value={formData.supplier_id || ''} onValueChange={value => setFormData(p => ({...p, supplier_id: value}))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fournisseur (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                        {suppliers.map(sup => <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Type d'achat</Label>
                <RadioGroup defaultValue="Comptant" value={formData.purchase_type} onValueChange={value => setFormData(p => ({...p, purchase_type: value}))}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Comptant" id="comptant" />
                        <Label htmlFor="comptant">Comptant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Crédit" id="credit" />
                        <Label htmlFor="credit">Crédit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Partiel" id="partiel" />
                        <Label htmlFor="partiel">Partiel</Label>
                      </div>
                    </div>
                </RadioGroup>
            </div>
            <DialogFooter className="flex justify-between mt-8">
                <Button variant="outline" onClick={onBack} disabled={isLoading}>&larr; Précédent</Button>
                <Button onClick={onSave} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {formData.id ? 'Modifier' : 'Ajouter'}
                </Button>
            </DialogFooter>
        </div>
    );
};


export const ProductWizard = ({ isOpen, onOpenChange, productToEdit, onProductSaved }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const getInitialFormData = useCallback(() => ({
    id: productToEdit?.id || null,
    name: productToEdit?.name || '',
    category_id: productToEdit?.category_id || null,
    is_sellable: productToEdit?.is_sellable ?? true,
    quantity: productToEdit?.quantity ?? 0,
    purchase_price: productToEdit?.purchase_price ?? 0,
    sale_price: productToEdit?.sale_price ?? 0,
    supplier_id: productToEdit?.supplier_id || null,
    purchase_type: productToEdit?.purchase_type || 'Comptant',
    user_id: user?.id
  }), [productToEdit, user]);
  
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData(getInitialFormData());
    }
  }, [isOpen, getInitialFormData]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, wizardSteps.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const handleSave = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Erreur", description: "Utilisateur non authentifié." });
        return;
    }
    setIsLoading(true);
    
    const { id, ...dataToSave } = formData;
    dataToSave.user_id = user.id;
    
    let response;
    if (id) {
        response = await supabase.from('products').update(dataToSave).eq('id', id).select().single();
    } else {
        response = await supabase.from('products').insert(dataToSave).select().single();
    }
    
    setIsLoading(false);

    if (response.error) {
        toast({ variant: "destructive", title: "Erreur", description: `Impossible d'enregistrer le produit: ${response.error.message}` });
    } else {
        toast({ title: "Succès", description: `Produit ${id ? 'modifié' : 'ajouté'} avec succès !` });
        if(onProductSaved) onProductSaved();
        onOpenChange(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Details formData={formData} setFormData={setFormData} onNext={handleNext} />;
      case 2: return <Step2Pricing formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 3: return <Step3Supplier formData={formData} setFormData={setFormData} onBack={handleBack} onSave={handleSave} isLoading={isLoading} />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl">{productToEdit ? 'Modifier un produit' : 'Ajouter un nouveau produit'}</DialogTitle>
          <DialogDescription>
            Remplissez les détails du produit ci-dessous.
          </DialogDescription>
        </DialogHeader>

        <div className="my-8 flex justify-between items-center">
          <StepIndicator currentStep={currentStep} />
          <span className="text-sm font-medium text-gray-500">Étape {currentStep} sur {wizardSteps.length}</span>
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
