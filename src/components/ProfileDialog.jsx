
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function ProfileDialog({ isOpen, onOpenChange }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore "exact one row" error if profile doesn't exist yet
          toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger le profil.' });
        } else if (data) {
          setFullName(data.full_name || '');
          setUsername(data.username || '');
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [isOpen, user, toast]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, username })
      .eq('id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'La mise à jour a échoué.' });
    } else {
      toast({ title: 'Succès', description: 'Votre profil a été mis à jour.' });
      onOpenChange(false);
    }
    setUpdating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Mettez à jour vos informations personnelles ici.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" value={user?.email || ''} disabled className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">
                  Nom complet
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Nom d'utilisateur
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
