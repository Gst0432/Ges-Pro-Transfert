import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';

export const Step2ItemDetails = ({ onNext, onBack, saleData, setSaleData }) => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('*').eq('is_sellable', true);
            if (error) console.error("Error fetching products:", error);
            else setProducts(data || []);
        };
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, products]);

    const handleProductSelect = (product) => {
        setSearchTerm(product.name);
        setSelectedProduct(product);
        setShowDropdown(false);
    };

    const handleAddItem = () => {
        let newItem;
        if (isNewProduct) {
            if (!newProductName || quantity <= 0 || newProductPrice <= 0) return;
            newItem = {
                product_id: null, // Indicates a new product
                name: newProductName,
                quantity: parseInt(quantity, 10),
                unit_price: parseFloat(newProductPrice)
            };
            setNewProductName('');
            setNewProductPrice('');
        } else {
            if (!selectedProduct || quantity <= 0) return;
            newItem = {
                product_id: selectedProduct.id,
                name: selectedProduct.name,
                quantity: parseInt(quantity, 10),
                unit_price: parseFloat(selectedProduct.sale_price)
            };
            setSelectedProduct(null);
            setSearchTerm('');
        }

        setSaleData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setQuantity(1);
    };

    const handleRemoveItem = (index) => {
        setSaleData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleNewProductCheck = (checked) => {
        setIsNewProduct(checked);
        setSelectedProduct(null);
        setNewProductName('');
        setNewProductPrice('');
        setSearchTerm('');
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Détails des articles</h3>
            
            <div className="flex items-center space-x-2">
                <Checkbox id="new-product-checkbox" checked={isNewProduct} onCheckedChange={handleNewProductCheck} />
                <Label htmlFor="new-product-checkbox">Ajouter un nouveau produit</Label>
            </div>
            
            {isNewProduct ? (
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div className="col-span-3 sm:col-span-2">
                        <Label htmlFor="new_product_name">Nom du produit</Label>
                        <Input id="new_product_name" placeholder="Nom du nouveau produit" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
                    </div>
                     <div className="col-span-3 sm:col-span-1">
                        <Label htmlFor="quantity">Quantité</Label>
                        <Input id="quantity" type="number" placeholder="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
                    </div>
                    <div className="col-span-3">
                        <Label htmlFor="new_product_price">Prix de vente unitaire</Label>
                        <Input id="new_product_price" type="number" placeholder="Prix de vente en FCFA" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 relative">
                        <Label htmlFor="product_search">Rechercher un produit</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input 
                                id="product_search" 
                                placeholder="Taper le nom du produit..." 
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                autoComplete="off"
                                className="pl-10"
                            />
                        </div>
                        <AnimatePresence>
                        {showDropdown && filteredProducts.length > 0 && (
                            <motion.div 
                                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {filteredProducts.map(p => (
                                    <div 
                                        key={p.id} 
                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                                        onClick={() => handleProductSelect(p)}
                                    >
                                        <p className="font-medium text-gray-800">{p.name}</p>
                                        <p className="text-sm text-gray-500">{p.sale_price.toLocaleString('fr-FR')} FCFA</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                    <div>
                        <Label htmlFor="quantity">Quantité</Label>
                        <Input id="quantity" type="number" placeholder="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <Button onClick={handleAddItem} disabled={!isNewProduct && !selectedProduct}><Plus className="w-4 h-4 mr-2" /> Ajouter à la vente</Button>
            </div>

            <div className="space-y-2">
                <h4 className="font-medium">Articles ajoutés</h4>
                {saleData.items.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun article ajouté.</p>
                ) : (
                    saleData.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">{item.name} {!item.product_id && <span className="text-xs text-blue-500">(Nouveau)</span>}</p>
                                <p className="text-sm text-gray-500">{item.quantity} x {item.unit_price.toLocaleString('fr-FR')} FCFA</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{(item.quantity * item.unit_price).toLocaleString('fr-FR')} FCFA</span>
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