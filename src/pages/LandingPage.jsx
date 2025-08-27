import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, BarChart3, ShoppingCart, Package, FileText, Truck, Zap, Crown, Infinity, Calendar, Shield, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mainFeatures = [
  { icon: ShoppingCart, title: 'Gestion des Ventes & Clients', description: 'Créez des devis, factures, et suivez vos ventes. Gérez facilement votre base de clients et les paiements à crédit.' },
  { icon: Package, title: 'Contrôle d\'Inventaire', description: 'Gardez un œil sur vos stocks en temps réel, ajoutez de nouveaux produits et gérez vos catégories.' },
  { icon: Truck, title: 'Fournisseurs & Achats', description: 'Gérez vos fournisseurs, créez des bons de commande et suivez la réception de vos marchandises.' },
  { icon: FileText, title: 'Comptabilité & Dépenses', description: 'Suivez vos charges, gérez les paiements et obtenez des rapports financiers clairs pour piloter votre activité.' },
  { icon: Zap, title: 'Vente Rapide (Point de Vente)', description: 'Encaissez rapidement les ventes au comptant avec une interface optimisée pour la vitesse, avec impression de reçus.' },
  { icon: BarChart3, title: 'Rapports & Analyses', description: 'Visualisez vos performances avec des tableaux de bord intuitifs et des rapports détaillés sur vos revenus.' },
];

const PricingSection = () => {
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
            <Button className="w-full rounded-2xl h-11">{tier.cta}</Button>
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
          <Button className="h-12 px-8 rounded-2xl">Créer mon compte</Button>
          <p className="mt-2 text-xs text-muted-foreground">Aucun engagement. Annulation à tout moment.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export const LandingPage = () => {
  return (
    <div className="bg-white">
      <LandingHeader />
      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 sm:pt-32 sm:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gray-50">
            <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_10%,#e0e7ff_0%,transparent_100%)]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight"
            >
              La gestion commerciale, <span className="text-blue-600">simplifiée</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600"
            >
              GES PRO est la solution tout-en-un pour piloter vos ventes, votre inventaire et votre facturation avec une facilité déconcertante.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex justify-center gap-4"
            >
              <Button asChild size="lg" className="text-lg">
                <Link to="/auth">Commencer gratuitement</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <a href="#pricing">Voir les tarifs</a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Tout ce dont vous avez besoin pour réussir</h2>
              <p className="mt-4 text-lg text-gray-600">Concentrez-vous sur votre croissance, nous nous occupons du reste.</p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {mainFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-8 bg-gray-50/50 rounded-2xl shadow-sm border border-gray-100"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;