import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';

export const Step2PurchaseItems = ({ onNext, onBack, orderData, setOrderData }) => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemPrice, setItemPrice] = useState(''); // Initialiser à une chaîne vide
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductCategoryName, setNewProductCategoryName] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('*');
            setProducts(data || []);
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProduct && !isNewProduct) {
            setItemPrice(selectedProduct.purchase_price || ''); // Assurer que c'est une chaîne vide si 0
        }
    }, [selectedProduct, isNewProduct]);

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
            if (!newProductName || itemQuantity <= 0 || parseFloat(itemPrice) <= 0 || itemPrice === '' || !newProductCategoryName) return;
            newItem = {
                product_id: null,
                name: newProductName,
                quantity: parseInt(itemQuantity, 10),
                unit_price: parseFloat(itemPrice),
                category_name: newProductCategoryName,
            };
            setNewProductName('');
            setNewProductCategoryName('');
        } else {
            if (!selectedProduct || itemQuantity <= 0 || parseFloat(itemPrice) <= 0 || itemPrice === '') return;
            newItem = {
                product_id: selectedProduct.id,
                name: selectedProduct.name,
                quantity: parseInt(itemQuantity, 10),
                unit_price: parseFloat(itemPrice),
            };
            setSelectedProduct(null);
            setSearchTerm('');
        }
        setOrderData(prev => ({ ...prev, items: [...prev.items, newItem] }));
        setItemQuantity(1);
        setItemPrice('');
    };

    const handleRemoveItem = (index) => {
        setOrderData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleNewProductCheck = (checked) => {
        setIsNewProduct(checked);
        setSelectedProduct(null);
        setNewProductName('');
        setNewProductCategoryName('');
        setItemPrice('');
        setSearchTerm('');
    };

    return (
        <div className="space-y-6">
            <h3 className="font-semibold text-gray-800 mb-4">Ajouter des articles</h3>
            
            <div className="flex items-center space-x-2 mb-4">
                <Checkbox id="new-product-po-checkbox" checked={isNewProduct} onCheckedChange={handleNewProductCheck} />
                <Label htmlFor="new-product-po-checkbox">Ajouter un nouveau produit</Label>
            </div>

            {isNewProduct ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border rounded-lg bg-gray-50">
                    <div>
                        <Label htmlFor="new_product_name_po">Nom du produit</Label>
                        <Input id="new_product_name_po" placeholder="Nom du nouveau produit" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="new_product_category_po">Catégorie</Label>
                        <Input id="new_product_category_po" placeholder="Nom de la catégorie" value={newProductCategoryName} onChange={e => setNewProductCategoryName(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="quantity_po">Quantité</Label>
                        <Input id="quantity_po" type="number" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} min="1" />
                    </div>
                    <div>
                        <Label htmlFor="price_po">Prix d'achat unitaire</Label>
                        <Input id="price_po" type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="Prix" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2 relative">
                        <Label htmlFor="product_search_po">Rechercher un produit</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input 
                                id="product_search_po" 
                                placeholder="Taper le nom du produit..." 
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); }}
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
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            >
                                {filteredProducts.map(p => (
                                    <div key={p.id} className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => handleProductSelect(p)}>
                                        <p className="font-medium text-gray-800">{p.name}</p>
                                        <p className="text-sm text-gray-500">{p.purchase_price?.toLocaleString('fr-FR')} FCFA</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                    <div>
                        <Label htmlFor="quantity">Quantité</Label>
                        <Input id="quantity" type="number" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} min="1" />
                    </div>
                    <div>
                        <Label htmlFor="price">Prix d'achat unitaire</Label>
                        <Input id="price" type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="Prix" />
                    </div>
                </div>
            )}

            <div className="flex justify-end mt-4">
              <Button onClick={handleAddItem}><Plus className="w-4 h-4 mr-2" /> Ajouter à la commande</Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                {orderData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium">{item.name} {!item.product_id && <span className="text-xs text-blue-500">(Nouveau)</span>}</p>
                            <p className="text-sm text-gray-500">{item.quantity} x {item.unit_price.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">{(item.quantity * item.unit_price).toLocaleString('fr-FR')} FCFA</span>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                    </div>
                ))}
            </div>

            <DialogFooter className="flex justify-between mt-8">
                <Button variant="outline" onClick={onBack}>&larr; Précédent</Button>
                <Button onClick={onNext} disabled={orderData.items.length === 0}>Suivant &rarr;</Button>
            </DialogFooter>
        </div>
    );
};