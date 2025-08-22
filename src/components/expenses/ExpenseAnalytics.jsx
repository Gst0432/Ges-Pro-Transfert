import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ExpenseAnalytics = ({ allExpenses }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthlyAnalytics = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const filteredExpenses = allExpenses.filter(exp => {
      const date = new Date(exp.expense_date);
      // Adjust for timezone differences by comparing date strings
      const expenseDateString = format(date, 'yyyy-MM-dd');
      return expenseDateString >= format(monthStart, 'yyyy-MM-dd') && expenseDateString <= format(monthEnd, 'yyyy-MM-dd');
    });

    const analytics = filteredExpenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = 0;
      }
      acc[exp.category] += exp.amount;
      return acc;
    }, {});

    const total = Object.values(analytics).reduce((sum, val) => sum + val, 0);
    
    const sortedAnalytics = Object.entries(analytics)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({ category, amount, percentage: total > 0 ? (amount / total) * 100 : 0 }));

    return { data: sortedAnalytics, total };
  }, [allExpenses, currentMonth]);

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4">Analyse Mensuelle</h3>
      <div className="flex items-center justify-between mb-4">
        <Button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>Mois Précédent</Button>
        <h4 className="font-semibold text-lg capitalize">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h4>
        <Button onClick={() => setCurrentMonth(subMonths(currentMonth, -1))} disabled={new Date() < endOfMonth(currentMonth)}>Mois Suivant</Button>
      </div>
      <div className="space-y-4">
        <div className="text-2xl font-bold text-right">Total: {monthlyAnalytics.total.toLocaleString('fr-FR')} FCFA</div>
        {monthlyAnalytics.data.length > 0 ? (
          monthlyAnalytics.data.map(({ category, amount, percentage }, index) => (
            <div key={category} className="space-y-1">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>{category}</span>
                <span>{amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className={`${colors[index % colors.length]} h-2.5 rounded-full`}
                  style={{ width: `${percentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                ></motion.div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">Aucune charge pour ce mois.</p>
        )}
      </div>
    </div>
  );
};