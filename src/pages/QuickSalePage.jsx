import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Printer } from 'lucide-react';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';

const QuickSalePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings: companySettings } = useCompanySettings();
  const [products, setProducts] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lastSale, setLastSale] = useState(null);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const printReceipt = () => {
    if (!lastSale) return;

    try {
      // Créer une fenêtre d'impression
      const printWindow = window.open('', '_blank');
      const printDocument = printWindow.document;

      // Contenu HTML du reçu
      const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reçu de vente rapide</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              width: 80mm; /* Largeur standard pour les imprimantes thermiques */
            }
            .receipt {
              padding: 10px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 14px;
              font-weight: bold;
            }
            .company-info {
              font-size: 10px;
              margin: 2px 0;
            }
            .title {
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              margin: 10px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .items-table th, .items-table td {
              text-align: left;
              padding: 2px 0;
              font-size: 11px;
            }
            .items-table th {
              border-bottom: 1px solid #000;
            }
            .total-section {
              border-top: 1px dashed #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin: 2px 0;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 15px;
              padding-top: 5px;
              border-top: 1px dashed #000;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="receipt">
            <div class="header">
              <div class="company-name">${companySettings?.company_name || 'Entreprise'}</div>
              <div class="company-info">${companySettings?.address || ''}</div>
              <div class="company-info">Tel: ${companySettings?.phone || ''}</div>
            </div>
            
            <div class="title">REÇU DE VENTE RAPIDE</div>
            
            <div class="info-row">
              <span>Numéro:</span>
              <span>${lastSale.id.substring(0, 8)}</span>
            </div>
            <div class="info-row">
              <span>Date:</span>
              <span>${new Date(lastSale.sale_date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="info-row">
              <span>Client:</span>
              <span>Vente Comptant</span>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Qté</th>
                  <th>P.U</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${saleItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unit_price)}</td>
                    <td>${formatCurrency(item.quantity * item.unit_price)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <span>Total:</span>
                <span>${formatCurrency(lastSale.total_amount)}</span>
              </div>
              <div class="total-row">
                <span>Payé:</span>
                <span>${formatCurrency(lastSale.total_amount)}</span>
              </div>
              <div class="total-row">
                <span>Reste:</span>
                <span>${formatCurrency(0)}</span>
              </div>
            </div>
            
            <div class="footer">
              Merci pour votre confiance !
              <br>
              ${new Date().toLocaleString('fr-FR')}
            </div>
          </div>
        </body>
        </html>
      `;

      // Écrire le contenu dans la fenêtre d'impression
      printDocument.open();
      printDocument.write(receiptContent);
      printDocument.close();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'impression',
        description: 'Impossible d\'imprimer le reçu. Veuillez vérifier votre imprimante.',
      });
      console.error('Erreur d\'impression:', error);
    }
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

      // Stocker la dernière vente pour impression
      setLastSale(newSale);
      
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

        <div className="flex justify-end space-x-2">
          {lastSale && (
            <Button onClick={printReceipt} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Imprimer le dernier reçu
            </Button>
          )}
          <Button 
            onClick={handleQuickSale} 
            disabled={saleItems.length === 0 || loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer la vente rapide'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickSalePage;