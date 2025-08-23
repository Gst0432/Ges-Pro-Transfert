import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, UserPlus, ShieldCheck } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const AdminRegisterUserPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'L\'e-mail et le mot de passe sont requis.' });
      setLoading(false);
      return;
    }

    const userMetadata = {
      full_name: fullName,
      phone: phone,
      is_super_admin: isSuperAdmin,
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
      },
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur d\'inscription', description: error.message });
    } else if (data.user) {
      toast({ title: 'Succès', description: `L'utilisateur ${email} a été inscrit avec succès. Un e-mail de confirmation a été envoyé.` });
      // Reset form
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
      setIsSuperAdmin(false);
    } else {
      toast({ title: 'Info', description: 'Inscription initiée. Vérifiez la console pour plus de détails.' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Inscrire un nouvel utilisateur</h1>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="utilisateur@exemple.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="fullName">Nom complet (Optionnel)</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nom et prénom"
            />
          </div>
          <div>
            <Label htmlFor="phone">Numéro de téléphone (Optionnel)</Label>
            <PhoneInput
              id="phone"
              placeholder="Entrez le numéro de téléphone"
              value={phone}
              onChange={setPhone}
              defaultCountry="FR"
              className="mt-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSuperAdmin"
              checked={isSuperAdmin}
              onCheckedChange={setIsSuperAdmin}
            />
            <Label htmlFor="isSuperAdmin" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              Promouvoir en Super Admin
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Inscrire l'utilisateur
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegisterUserPage;