import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ShoppingCart, Package, FileText, TrendingUp, Users, Shield, Zap, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingFooter } from '@/components/layout/LandingFooter';

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <motion.div
    className="feature-card hover:shadow-yellow-blue-lg"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8, scale: 1.02 }}
  >
    <div className="icon-blue mb-4">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-blue-800 mb-3">{title}</h3>
    <p className="text-blue-600 leading-relaxed">{description}</p>
  </motion.div>
);

const StatCard = ({ number, label, delay = 0 }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
  >
    <div className="text-4xl font-bold heading-yellow-blue mb-2">{number}</div>
    <div className="text-blue-600 font-medium">{label}</div>
  </motion.div>
);

const TestimonialCard = ({ name, role, content, rating, delay = 0 }) => (
  <motion.div
    className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-yellow-blue"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -5, shadow: "0 25px 50px -12px hsl(214 100% 50% / 0.25)" }}
  >
    <div className="flex items-center mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
      ))}
    </div>
    <p className="text-gray-700 mb-4 italic">"{content}"</p>
    <div>
      <div className="font-semibold text-blue-800">{name}</div>
      <div className="text-sm text-blue-600">{role}</div>
    </div>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Tableau de bord intelligent",
      description: "Visualisez vos métriques clés en temps réel avec des graphiques interactifs et des analyses prédictives."
    },
    {
      icon: ShoppingCart,
      title: "Gestion des ventes avancée",
      description: "Suivez vos ventes, gérez vos clients et optimisez votre processus commercial avec des outils puissants."
    },
    {
      icon: Package,
      title: "Inventaire intelligent",
      description: "Contrôlez votre stock en temps réel avec des alertes automatiques et une gestion multi-entrepôts."
    },
    {
      icon: FileText,
      title: "Facturation automatisée",
      description: "Créez et envoyez des factures professionnelles en quelques clics avec un suivi des paiements intégré."
    },
    {
      icon: TrendingUp,
      title: "Analyses et rapports",
      description: "Obtenez des insights précieux sur votre business avec des rapports détaillés et des prévisions."
    },
    {
      icon: Shield,
      title: "Sécurité enterprise",
      description: "Vos données sont protégées avec un chiffrement de niveau bancaire et des sauvegardes automatiques."
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Directrice, Boutique Mode",
      content: "GES PRO a révolutionné notre gestion. Nous avons gagné 5 heures par semaine !",
      rating: 5
    },
    {
      name: "Jean Martin",
      role: "Gérant, Épicerie Bio",
      content: "L'interface est intuitive et les rapports nous aident à prendre de meilleures décisions.",
      rating: 5
    },
    {
      name: "Sophie Laurent",
      role: "Propriétaire, Salon de beauté",
      content: "Le support client est exceptionnel et la plateforme est très stable.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen yellow-blue-gradient-soft">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 sparkle pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-blue-gradient text-white rounded-3xl mb-8 shadow-yellow-blue-lg floating">
                <BarChart3 className="w-12 h-12" />
              </div>
              <h1 className="text-6xl md:text-7xl font-display font-bold heading-yellow-blue mb-6 text-shadow-yellow-blue">
                GES PRO
              </h1>
              <p className="text-xl md:text-2xl text-blue-700 font-medium mb-8 max-w-3xl mx-auto leading-relaxed">
                La solution SaaS complète pour transformer votre gestion commerciale et booster votre croissance
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button 
                size="lg" 
                className="btn-yellow-blue text-lg px-8 py-4 hover:shadow-yellow-blue-xl"
                onClick={() => navigate('/auth')}
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white text-lg px-8 py-4"
              >
                Voir la démo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <StatCard number="500+" label="Entreprises actives" delay={0.1} />
              <StatCard number="99.9%" label="Temps de disponibilité" delay={0.2} />
              <StatCard number="24/7" label="Support client" delay={0.3} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold heading-yellow-blue mb-6">
              Fonctionnalités puissantes
            </h2>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto">
              Découvrez tous les outils dont vous avez besoin pour gérer efficacement votre entreprise
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-display font-bold heading-yellow-blue mb-6">
                Pourquoi choisir GES PRO ?
              </h2>
              <div className="space-y-6">
                {[
                  "Interface intuitive et moderne",
                  "Synchronisation en temps réel",
                  "Rapports détaillés et personnalisables",
                  "Support client réactif",
                  "Mises à jour automatiques",
                  "Sécurité de niveau entreprise"
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="icon-yellow">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-lg text-blue-700 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-blue-200 shadow-yellow-blue-lg">
                <div className="text-center">
                  <div className="text-5xl font-bold heading-yellow-blue mb-4">+150%</div>
                  <div className="text-xl text-blue-700 font-semibold mb-2">Croissance moyenne</div>
                  <div className="text-blue-600">des entreprises utilisant GES PRO</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold heading-yellow-blue mb-6">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto">
              Rejoignez des centaines d'entrepreneurs qui ont transformé leur business avec GES PRO
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.name}
                {...testimonial}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/90 backdrop-blur-sm p-12 rounded-3xl border border-blue-200 shadow-yellow-blue-lg"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold heading-yellow-blue mb-6">
              Prêt à transformer votre entreprise ?
            </h2>
            <p className="text-xl text-blue-600 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'entrepreneurs qui ont déjà choisi GES PRO pour optimiser leur gestion commerciale
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-yellow-blue text-lg px-8 py-4 hover:shadow-yellow-blue-xl"
                onClick={() => navigate('/auth')}
              >
                Commencer maintenant
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white text-lg px-8 py-4"
              >
                Planifier une démo
              </Button>
            </div>
            <p className="text-sm text-blue-500 mt-6">
              ✨ Essai gratuit de 14 jours • Aucune carte de crédit requise • Support inclus
            </p>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;