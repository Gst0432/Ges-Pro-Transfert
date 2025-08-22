import React from 'react';
import { Loader2, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { EditExpenseDialog } from '@/components/expenses/EditExpenseDialog';

export const ExpenseHistory = ({ expenses, loading, onDelete, onUpdate, currentPage, totalPages, onPageChange }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4">Historique des charges</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Date</th>
              <th className="p-2">Catégorie</th>
              <th className="p-2">Montant</th>
              <th className="p-2">Description</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center p-4"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-4 text-gray-500">Aucune charge enregistrée.</td></tr>
            ) : (
              expenses.map(exp => (
                <tr key={exp.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{format(new Date(exp.expense_date), 'dd/MM/yyyy')}</td>
                  <td className="p-2">{exp.category}</td>
                  <td className="p-2 font-semibold">{exp.amount.toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-2 truncate max-w-xs">{exp.description}</td>
                  <td className="p-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <EditExpenseDialog expense={exp} onExpenseUpdated={(data) => onUpdate(exp.id, data)}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                        </EditExpenseDialog>
                        <DropdownMenuItem onClick={() => onDelete(exp.id)} className="text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};