import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const expenseCategories = [
  'Loyer', 'Eau', 'Électricité', 'Carburant', 'Alimentation', 'Salaire', 'Divers'
];

export const ExpenseForm = ({ onSubmit, isSubmitting, initialData = {} }) => {
  const { toast } = useToast();
  const [category, setCategory] = useState(initialData.category || '');
  const [amount, setAmount] = useState(initialData.amount || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [expenseDate, setExpenseDate] = useState(initialData.expense_date ? new Date(initialData.expense_date) : new Date());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount || !expenseDate) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    const success = await onSubmit({
      category,
      amount: parseFloat(amount),
      description,
      expense_date: format(expenseDate, 'yyyy-MM-dd'),
    });

    if (success && !initialData.id) {
      // Reset form only on successful creation
      setCategory('');
      setAmount('');
      setDescription('');
      setExpenseDate(new Date());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Choisir une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount">Montant (FCFA)</Label>
        <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="ex: 50000" required />
      </div>
      <div>
        <Label htmlFor="expense_date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {expenseDate ? format(expenseDate, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={expenseDate}
              onSelect={setExpenseDate}
              initialFocus
              locale={fr}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="description">Description (Optionnel)</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Détails sur la charge..." />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : initialData.id ? null : <Plus className="mr-2 h-4 w-4" />}
        {initialData.id ? 'Enregistrer les modifications' : 'Ajouter la charge'}
      </Button>
    </form>
  );
};