import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

const QuickSalePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_sellable', true);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les produits.',
        });
      } else {
        setProducts(data || []);
      }
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

    setSaleItems(prev => [...prev, newItem]);
    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setSaleItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const handleQuickSale = async () => {
    if (saleItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez ajouter au moins un article.',
      });
      return;
    }

    setLoading(true);

    try {
      // Create a default "Comptant" client if not exists
      let clientId;
      const { data: existingClient, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('name', 'Vente Comptant')
        .single();

      if (clientError) {
        const { data: newClient, error: insertError } = await supabase
          .from('clients')
          .insert({
            user_id: user.id,
            name: 'Vente Comptant',
            phone: '',
            email: '',
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
        clientId = newClient.id;
      } else {
        clientId = existingClient.id;
      }

      // Create the sale
      const totalAmount = calculateTotal();
      const { data: newSale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          client_id: clientId,
          sale_date: new Date().toISOString(),
          total_amount: totalAmount,
          status: 'Payée',
          amount_paid: totalAmount
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItemsToInsert = saleItems.map(item => ({
        sale_id: newSale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: 'Succès',
        description: 'Vente rapide enregistrée avec succès !',
      });

      // Reset form
      setSaleItems([]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la vente.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Vente Rapide</h1>
      
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label>Produit</Label>
            <Select 
              value={selectedProduct} 
              onValueChange={setSelectedProduct}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.sale_price.toLocaleString('fr-FR')} FCFA)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantité</Label>
            <Input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
              min="1"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleAddItem} disabled={!selectedProduct}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Articles</h4>
          {saleItems.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun article ajouté.</p>
          ) : (
            saleItems.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x {item.unit_price.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {(item.quantity * item.unit_price).toLocaleString('fr-FR')} FCFA
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-bold text-green-600">
            {calculateTotal().toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        <Button 
          className="w-full" 
          onClick={handleQuickSale} 
          disabled={saleItems.length === 0 || loading}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer la vente rapide'}
        </Button>
      </div>
    </div>
  );
};

export default QuickSalePage;