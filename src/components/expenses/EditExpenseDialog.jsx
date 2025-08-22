import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ExpenseForm } from './ExpenseForm';

export const EditExpenseDialog = ({ expense, onExpenseUpdated, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (data) => {
        setIsSubmitting(true);
        const success = await onExpenseUpdated(data);
        if (success) {
            setIsOpen(false);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier la charge</DialogTitle>
                    <DialogDescription>
                        Mettez à jour les informations de la charge.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ExpenseForm 
                        onSubmit={handleUpdate}
                        isSubmitting={isSubmitting}
                        initialData={{
                            id: expense.id,
                            category: expense.category,
                            amount: expense.amount,
                            description: expense.description || '',
                            expense_date: expense.expense_date,
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};