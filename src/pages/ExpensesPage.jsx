import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseAnalytics } from '@/components/expenses/ExpenseAnalytics';
import { ExpenseHistory } from '@/components/expenses/ExpenseHistory';

const ExpensesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const ITEMS_PER_PAGE = 10;

  const fetchExpenses = useCallback(async (page = 1) => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .order('expense_date', { ascending: false })
      .range(from, to);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les charges.' });
    } else {
      setExpenses(data);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    }
    setLoading(false);
  }, [toast]);

  const fetchAllExpensesForAnalytics = useCallback(async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*');
    if (!error) {
      setAllExpenses(data);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchExpenses(currentPage);
    fetchAllExpensesForAnalytics();
  }, [currentPage, fetchExpenses, fetchAllExpensesForAnalytics]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAddExpense = async (expenseData) => {
    setIsSubmitting(true);
    const expensePayload = {
      ...expenseData,
      user_id: user.id,
    };

    const { data: newExpense, error } = await supabase.from('expenses').insert(expensePayload).select().single();

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `Impossible d'ajouter la charge: ${error.message}` });
      setIsSubmitting(false);
      return false;
    }

    // Generate receipt
    const docNumber = `CHG-${Date.now()}`;
    await supabase.from('documents').insert({
      user_id: user.id,
      expense_id: newExpense.id,
      type: 'receipt_expense',
      document_number: docNumber,
      issue_date: newExpense.expense_date,
      total_amount: newExpense.amount,
      status: 'Payé',
      document_details: {
        items: [{
          name: `Charge: ${newExpense.category}`,
          quantity: 1,
          unit_price: newExpense.amount,
          description: newExpense.description
        }]
      }
    });

    toast({ title: 'Succès', description: 'Charge ajoutée et reçu généré.' });
    setCurrentPage(1);
    refreshData();
    setIsSubmitting(false);
    return true;
  };
  
  const handleUpdateExpense = async (id, updatedData) => {
     const { error } = await supabase
      .from('expenses')
      .update(updatedData)
      .eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `Impossible de modifier la charge: ${error.message}` });
      return false;
    }
    
    toast({ title: 'Succès', description: 'Charge modifiée avec succès.' });
    refreshData();
    return true;
  };


  const handleDeleteExpense = async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la charge.' });
    } else {
      toast({ title: 'Succès', description: 'Charge supprimée.' });
      refreshData();
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <motion.div 
        className="lg:col-span-2 space-y-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ExpenseAnalytics allExpenses={allExpenses} />
        <ExpenseHistory 
          expenses={expenses}
          loading={loading}
          onDelete={handleDeleteExpense}
          onUpdate={handleUpdateExpense}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </motion.div>

      <motion.div 
        className="bg-white p-6 rounded-2xl border border-gray-200 h-fit"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h3 className="text-xl font-bold mb-4">Ajouter une charge</h3>
        <ExpenseForm onSubmit={handleAddExpense} isSubmitting={isSubmitting} />
      </motion.div>
    </div>
  );
};

export default ExpensesPage;