import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export const AdminPromoteTool = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePromote = async () => {
    if (!email) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez entrer une adresse e-mail.' });
      return;
    }

    setLoading(true);
    try {
      // 1. Find the user ID by email
      const { data: userData, error: userError } = await supabase
        .from('auth.users') // Directly query auth.users table
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        toast({ variant: 'destructive', title: 'Erreur', description: `Utilisateur avec l'e-mail "${email}" non trouvé.` });
        setLoading(false);
        return;
      }

      const userId = userData.id;

      // 2. Call the RPC function to set super admin status
      const { error: rpcError } = await supabase.rpc('set_user_super_admin_status', {
        target_user_id: userId,
        is_admin: true,
      });

      if (rpcError) {
        toast({ variant: 'destructive', title: 'Erreur', description: `Impossible de promouvoir l'utilisateur: ${rpcError.message}` });
      } else {
        toast({ title: 'Succès', description: `L'utilisateur "${email}" a été promu Super Admin. Déconnectez-vous et reconnectez-vous.` });
        setEmail('');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur inattendue', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
      <h3 className="text-xl font-bold text-gray-800">Outil de Promotion Super Admin (Temporaire)</h3>
      <p className="text-gray-600">Entrez l'e-mail d'un utilisateur pour le promouvoir en Super Admin. Cet outil sera retiré une fois que vous aurez confirmé son fonctionnement.</p>
      <div>
        <Label htmlFor="admin-email">E-mail de l'utilisateur</Label>
        <Input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="utilisateur@exemple.com"
          className="mt-1"
          disabled={loading}
        />
      </div>
      <Button onClick={handlePromote} disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Promouvoir en Super Admin
      </Button>
    </div>
  );
};