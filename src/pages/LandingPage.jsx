import React from 'react';
import { motion } from "framer-motion";
import { Check, Crown, Infinity, Calendar, Shield, Zap, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { Link } from 'react-router-dom';

const features = [
  {
    title: "Gestion des Ventes",
    bullets: [
      "Suivi des ventes et des paiements",
      "Gestion des crédits clients",
      "Génération de reçus en un clic",
      "Historique illimité des transactions"
    ],
  },
  {
    title: "Contrôle d'Inventaire",
    bullets: [
      "Stocks en temps réel",
      "Alerte de niveau de stock",
      "Variantes & codes-barres",
      "Imports/exports CSV des produits",
    ],
  },
  {
    title: "Facturation & Comptabilité",
    bullets: [
      "Factures pro (TVA, remises, devis)",
      "Suivi des dépenses & marges",
      "Rapports financiers clairs",
      "Export PDF/Excel des rapports",
    ],
  },
];

const tiers = [
  {
    name: "Mensuel",
    price: "10 000 FCFA",
    period: "/mois",
    icon: Calendar,
    highlight: false,
    cta: "Commencer maintenant",
    extras: [
      "1 utilisateur inclus",
      "1000 enregistrements/mois",
      "Support standard (48h)",
      "Sauvegardes hebdomadaires",
    ],
  },
  {
    name: "Annuel",
    price: "100 000 FCFA",
    period: "/an",
    icon: Zap,
    highlight: true,
    badge: "Meilleur rapport qualité/prix",
    cta: "Choisir l’Annuel",
    extras: [
      "3 utilisateurs inclus",
      "Données illimitées",
      "Support prioritaire (24h)",
      "Sauvegardes quotidiennes",
      "1 domaine personnalisé",
    ],
  },
  {
    name: "À vie",
    price: "300 000 FCFA",
    period: "paiement unique",
    icon: Crown,
    highlight: false,
    badge: "Payez une fois",
    cta: "Obtenir l’accès à vie",
    extras: [
      "Utilisateurs illimités",
      "Toutes les fonctionnalités",
      "Support VIP (12h)",
      "Mises à jour à vie",
      "API & intégrations avancées",
    ],
  },
];

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function FeatureList() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {features.map((f) => (
        <Card key={f.title} className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">{f.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {f.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TierCard({ tier }) {
  const Icon = tier.icon;
  return (
    <motion.div variants={item}>
      <Card className={`relative rounded-2xl ${tier.highlight ? "ring-2 ring-black" : ""}`}>
        {tier.badge && (
          <div className="absolute -top-3 left-4 rounded-full px-3 py-1 text-xs bg-black text-white">
            {tier.badge}
          </div>
        )}
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-xl">{tier.name}</CardTitle>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{tier.price}</span>
            <span className="text-sm text-muted-foreground">{tier.period}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Tout ce dont vous avez besoin pour réussir. Concentrez-vous sur votre croissance, nous nous occupons du reste.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {tier.extras.map((x) => (
              <li key={x} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="w-full rounded-2xl h-11"><Link to="/auth">{tier.cta}</Link></Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Shield className="h-4 w-4"/>Sécurisé</div>
            <div className="flex items-center gap-1"><Database className="h-4 w-4"/>Sauvegardé</div>
            <div className="flex items-center gap-1"><Infinity className="h-4 w-4"/>Évolutif</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const PricingPlans = () => {
  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-10">
      <motion.div initial="hidden" animate="show" variants={container} className="space-y-6">
        <motion.div variants={item} className="space-y-3 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold">Plans & Tarifs</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Choisissez l’option qui vous convient : <strong>10 000 FCFA/mois</strong>, <strong>100 000 FCFA/an</strong>, ou <strong>300 000 FCFA à vie</strong>.
          </p>
        </motion.div>

        <motion.div variants={item} className="grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <TierCard key={t.name} tier={t} />
          ))}
        </motion.div>

        <motion.div variants={container} className="space-y-4">
          <h2 className="text-2xl font-semibold">Fonctionnalités incluses</h2>
          <FeatureList />
        </motion.div>

        <motion.div variants={item} className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Questions fréquentes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <p className="font-medium">Puis-je changer de plan plus tard ?</p>
                <p>Oui, vous pouvez passer au plan supérieur à tout moment. La facturation est ajustée au prorata.</p>
              </div>
              <div>
                <p className="font-medium">Les fonctionnalités diffèrent-elles selon les plans ?</p>
                <p>Tous les plans incluent les modules Ventes, Inventaire et Facturation. Les plans supérieurs ajoutent davantage d’utilisateurs, de support et d’avantages.</p>
              </div>
              <div>
                <p className="font-medium">Proposez-vous une démo ?</p>
                <p>Oui, une démo guidée est disponible sur demande afin d’explorer les fonctionnalités clés.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Conformité & Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Chiffrement des données en transit et au repos.</p>
              <p>Rôles & permissions pour contrôler l’accès.</p>
              <p>Journal d’audit et sauvegardes automatiques.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Ce qui est compris</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Onboarding en 24–48h</p>
              <p>Modèles de factures & reçus prêts à l’emploi</p>
              <p>Export PDF/Excel illimité</p>
              <p>Assistance par e‑mail</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="text-center">
          <Button asChild className="h-12 px-8 rounded-2xl"><Link to="/auth">Créer mon compte</Link></Button>
          <p className="mt-2 text-xs text-muted-foreground">Aucun engagement. Annulation à tout moment.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

const LandingPage = () => {
    return (
        <div className="bg-white">
            <LandingHeader />
            <main>
                <PricingPlans />
            </main>
            <LandingFooter />
        </div>
    )
}

export default LandingPage;