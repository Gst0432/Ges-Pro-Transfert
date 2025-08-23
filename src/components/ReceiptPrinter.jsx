import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ReceiptPrinter = ({ saleData, companySettings }) => {
  const { toast } = useToast();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const printReceipt = () => {
    try {
      // Créer une fenêtre d'impression
      const printWindow = window.open('', '_blank');
      const printDocument = printWindow.document;

      // Contenu HTML du reçu
      const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reçu de vente</title>
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
            
            <div class="title">REÇU DE VENTE</div>
            
            <div class="info-row">
              <span>Numéro:</span>
              <span>${saleData.id.substring(0, 8)}</span>
            </div>
            <div class="info-row">
              <span>Date:</span>
              <span>${new Date(saleData.sale_date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="info-row">
              <span>Client:</span>
              <span>${saleData.clients?.name || 'Comptant'}</span>
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
                ${saleData.items?.map(item => `
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
                <span>${formatCurrency(saleData.total_amount)}</span>
              </div>
              <div class="total-row">
                <span>Payé:</span>
                <span>${formatCurrency(saleData.amount_paid || 0)}</span>
              </div>
              <div class="total-row">
                <span>Reste:</span>
                <span>${formatCurrency((saleData.total_amount - (saleData.amount_paid || 0)) || 0)}</span>
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

  return (
    <Button onClick={printReceipt} variant="outline" size="sm">
      <Printer className="w-4 h-4 mr-2" />
      Imprimer le reçu
    </Button>
  );
};

export default ReceiptPrinter;