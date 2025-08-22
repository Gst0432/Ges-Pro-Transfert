import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, CheckCircle, XCircle, Loader2, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/ui/Pagination';
import { DocumentFormDialog } from '@/components/DocumentFormDialog';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ITEMS_PER_PAGE = 10;

const BillingPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState('invoice'); // 'invoice' or 'quote'
  const [companySettings, setCompanySettings] = useState(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();

  const fetchDocuments = useCallback(async (page = 1) => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('documents')
      .select('*, client:clients(name)', { count: 'exact' })
      .order('issue_date', { ascending: false })
      .range(from, to);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les documents.' });
    } else {
      setDocuments(data);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    }
    setLoading(false);
  }, [toast]);

  const fetchCompanySettings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setCompanySettings(data);
  }, [user]);

  useEffect(() => {
    fetchDocuments(currentPage);
    fetchCompanySettings();
  }, [currentPage, fetchDocuments, fetchCompanySettings]);

  const handleOpenForm = (type) => {
    setFormType(type);
    setIsFormOpen(true);
  };

  const handleDocumentSaved = () => {
    fetchDocuments(1);
    setCurrentPage(1);
  };

  const generatePdf = (doc) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text(companySettings?.company_name || 'Votre Entreprise', 14, 22);
    pdf.setFontSize(10);
    pdf.text(companySettings?.address || '', 14, 30);
    pdf.text(`${companySettings?.phone || ''} | ${companySettings?.email || ''}`, 14, 35);

    // Document Info
    pdf.setFontSize(16);
    pdf.text(doc.type === 'invoice' ? 'FACTURE' : 'DEVIS', 150, 22);
    pdf.setFontSize(10);
    pdf.text(`Numéro: ${doc.document_number}`, 150, 30);
    pdf.text(`Date: ${new Date(doc.issue_date).toLocaleDateString()}`, 150, 35);
    if(doc.due_date) pdf.text(`Échéance: ${new Date(doc.due_date).toLocaleDateString()}`, 150, 40);

    // Client Info
    pdf.text(`Client: ${doc.client?.name || 'N/A'}`, 14, 50);

    // Items Table
    const tableColumn = ["Description", "Quantité", "Prix Unitaire", "Total"];
    const tableRows = [];
    doc.document_details?.items?.forEach(item => {
        const itemData = [
            item.name,
            item.quantity,
            `${item.unit_price?.toLocaleString('fr-FR')} FCFA`,
            `${(item.quantity * item.unit_price).toLocaleString('fr-FR')} FCFA`
        ];
        tableRows.push(itemData);
    });

    pdf.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60,
    });

    // Total
    const finalY = pdf.previousAutoTable.finalY;
    pdf.setFontSize(12);
    pdf.text(`Total: ${doc.total_amount.toLocaleString('fr-FR')} FCFA`, 150, finalY + 10);

    pdf.save(`${doc.type}-${doc.document_number}.pdf`);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Envoyé': case 'Commandé': return { icon: <Clock className="w-4 h-4 text-blue-500" />, color: 'text-blue-500' };
      case 'Payée': case 'Payé': case 'Reçu': return { icon: <CheckCircle className="w-4 h-4 text-green-500" />, color: 'text-green-500' };
      case 'En retard': return { icon: <XCircle className="w-4 h-4 text-red-500" />, color: 'text-red-500' };
      case 'Accepté': case 'Partiel': case 'Partiellement Reçu': return { icon: <CheckCircle className="w-4 h-4 text-teal-500" />, color: 'text-teal-500' };
      default: return { icon: <FileText className="w-4 h-4 text-gray-500" />, color: 'text-gray-500' };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Facturation & Reçus</h2>
        <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:space-x-4">
          <Button onClick={() => handleOpenForm('invoice')} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Facture
          </Button>
          <Button variant="outline" onClick={() => handleOpenForm('quote')} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Devis
          </Button>
        </div>
      </div>

      <motion.div 
        className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">Documents Récents</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : documents.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Aucun document à afficher.</p>
          ) : (
            documents.map((doc, index) => {
              const statusInfo = getStatusInfo(doc.status);
              return (
                <motion.div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-lg hidden sm:block">{statusInfo.icon}</div>
                    <div>
                      <p className="font-bold text-gray-800">{doc.document_number}</p>
                      <p className="text-sm text-gray-500">pour {doc.client?.name || 'N/A'} - {new Date(doc.issue_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-gray-800">{doc.total_amount.toLocaleString('fr-FR')} FCFA</p>
                      <p className={`font-semibold text-sm ${statusInfo.color}`}>{doc.status}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => generatePdf(doc)} disabled={!doc.document_details}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </motion.div>
      <DocumentFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        type={formType} 
        onDocumentSaved={handleDocumentSaved}
        companySettings={companySettings}
      />
    </div>
  );
};

export default BillingPage;