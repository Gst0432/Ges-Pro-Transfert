import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const wizardSteps = [
  { id: 1, name: 'Détails du produit' },
  { id: 2, name: 'Prix et quantité' },
  { id: 3, name: 'Fournisseur' },
];

export const ProductWizard = ({ isOpen, onOpenChange, product, onProductSaved }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const isEditing = !!product;
  
  const initializeFormData = useCallback(async () => {
    let categoryName = '';
    if (product?.category_id) {
        const { data, error } = await supabase
            .from('product_categories')
            .select('name')
            .eq('id', product.category_id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching category name:", error);
        }
        categoryName = data?.name || '';
    }

    const initialData = {
      name: product?.name || '',
      category_name: categoryName,
      is_sellable: product?.is_sellable === false ? false : true,
      quantity: product?.quantity || 0,
      purchase_price: product?.purchase_price || 0,
      sale_price: product?.sale_price || 0,
      supplier_id: product?.supplier_id || '',
      purchase_type: product?.purchase_type || 'Comptant',
    };
    setFormData(initialData);
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      initializeFormData();
      setCurrentStep(1);
    }
  }, [isOpen, initializeFormData]);

  const fetchDropdownData = useCallback(async () => {
    const { data: categoriesData, error: categoriesError } = await supabase.from('product_categories').select('*');
    if (categoriesError) console.error("Error fetching categories", categoriesError);
    else setCategories(categoriesData);

    const { data: suppliersData, error: suppliersError } = await supabase.from('suppliers').select('*');
    if (suppliersError) console.error("Error fetching suppliers", suppliersError);
    else setSuppliers(suppliersData);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen, fetchDropdownData]);

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.name) {
      toast({ variant: 'destructive', title: "Le nom du produit est requis" });
      return;
    }
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let categoryId = null;
    const categoryName = formData.category_name?.trim();

    if (categoryName) {
        // Check if category exists (case-insensitive)
        const { data: existingCategory, error: findError } = await supabase
            .from('product_categories')
            .select('id')
            .ilike('name', categoryName)
            .maybeSingle();

        if (findError) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de vérifier la catégorie." });
            setIsLoading(false);
            return;
        }

        if (existingCategory) {
            categoryId = existingCategory.id;
        } else {
            // Create new category
            const { data: newCategory, error: createError } = await supabase
                .from('product_categories')
                .insert({ name: categoryName, user_id: user.id })
                .select('id')
                .single();
            
            if (createError) {
                toast({ variant: "destructive", title: "Erreur", description: "Impossible de créer la nouvelle catégorie." });
                setIsLoading(false);
                return;
            }
            categoryId = newCategory.id;
        }
    }

    const { category_name, ...productData } = formData;
    const dataToSave = { ...productData, user_id: user.id, category_id: categoryId };
    
    let error;
    if (isEditing) {
      const { error: updateError } = await supabase.from('products').update(dataToSave).eq('id', product.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('products').insert(dataToSave);
      error = insertError;
    }

    setIsLoading(false);

    if (error) {
      console.error('Error saving product:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de sauvegarder le produit. ${error.message}`,
      });
    } else {
      toast({
        title: "Succès !",
        description: `Le produit a été ${isEditing ? 'mis à jour' : 'ajouté'}.`,
      });
      onProductSaved();
      onOpenChange(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nom du produit</Label>
              <Input id="name" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Ex: T-shirt en coton" required />
            </div>
            <div>
              <Label htmlFor="category_name">Catégorie</Label>
              <Input id="category_name" value={formData.category_name || ''} onChange={(e) => handleChange('category_name', e.target.value)} placeholder="Saisir ou sélectionner une catégorie" list="category-suggestions" />
              <datalist id="category-suggestions">
                {categories.map(cat => <option key={cat.id} value={cat.name} />)}
              </datalist>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is_sellable" checked={formData.is_sellable} onCheckedChange={(checked) => handleChange('is_sellable', checked)} />
              <Label htmlFor="is_sellable" className="font-normal cursor-pointer">
                Disponible à la vente
                <p className="text-xs text-gray-500">Ce produit sera visible dans la liste des produits disponibles pour la vente</p>
              </Label>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="quantity">Quantité</Label>
              <Input id="quantity" type="number" value={formData.quantity || 0} onChange={(e) => handleChange('quantity', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchase_price">Prix d'achat (F)</Label>
                <Input id="purchase_price" type="number" value={formData.purchase_price || 0} onChange={(e) => handleChange('purchase_price', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sale_price">Prix de vente (F)</Label>
                <Input id="sale_price" type="number" value={formData.sale_price || 0} onChange={(e) => handleChange('sale_price', e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
            <div className="space-y-6">
                <div>
                    <Label htmlFor="supplier_id">Fournisseur</Label>
                    <Select onValueChange={(value) => handleChange('supplier_id', value)} value={formData.supplier_id || ''}>
                        <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(sup => <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Type d'achat</Label>
                    <RadioGroup defaultValue={formData.purchase_type || 'Comptant'} onValueChange={(value) => handleChange('purchase_type', value)} className="flex items-center space-x-4 pt-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Comptant" id="comptant" />
                            <Label htmlFor="comptant" className="font-normal">Comptant</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Crédit" id="credit" />
                            <Label htmlFor="credit" className="font-normal">Crédit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Partiel" id="partiel" />
                            <Label htmlFor="partiel" className="font-normal">Partiel</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-2xl">{isEditing ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</DialogTitle>
            <DialogDescription>
              Remplissez les détails du produit ci-dessous.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    {wizardSteps.map((step, index) => (
                        <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {step.id}
                            </div>
                        </div>
                        {index < wizardSteps.length - 1 && (
                            <div className={`flex-1 h-0.5 transition-all duration-300 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        )}
                        </React.Fragment>
                    ))}
                </div>
                <div className="text-sm font-medium text-gray-600">Étape {currentStep} sur {wizardSteps.length}</div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderStepContent()}
                </motion.div>
            </AnimatePresence>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t">
            <div className="w-full flex justify-between">
                <div>
                {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Précédent
                    </Button>
                )}
                </div>
                <div>
                {currentStep < wizardSteps.length && (
                    <Button type="button" onClick={handleNext} disabled={isLoading}>
                    Suivant
                    </Button>
                )}
                {currentStep === wizardSteps.length && (
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isEditing ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                )}
                </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};