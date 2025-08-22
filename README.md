# Afinex - Plateforme de Gestion Commerciale SaaS

Bienvenue sur Afinex, une solution SaaS complète pour la gestion commerciale, conçue pour aider les entreprises à optimiser leurs opérations de vente, d'inventaire, de facturation et bien plus encore.

## ✨ Fonctionnalités

*   **Tableau de bord intuitif :** Visualisez les métriques clés de votre entreprise en un coup d'œil.
*   **Gestion des ventes et de la facturation :** Créez et suivez des factures, gérez les ventes et les paiements.
*   **Suivi de l'inventaire :** Gardez un œil sur vos niveaux de stock en temps réel.
*   **Gestion des fournisseurs et des achats :** Gérez vos fournisseurs et vos bons de commande.
*   **Rapports et analyses :** Obtenez des informations précieuses sur les performances de votre entreprise.
*   **Système d'abonnement Premium :** Intégration d'une passerelle de paiement pour débloquer des fonctionnalités avancées.
*   **Panel Super Admin :** Gérez les utilisateurs, les plans SaaS et les paramètres globaux de l'application.

## 🚀 Technologies utilisées

*   **Frontend :** React, Vite, TailwindCSS
*   **Composants UI :** shadcn/ui
*   **Animations :** Framer Motion
*   **Backend & Base de données :** Supabase
*   **Passerelle de paiement :** Intégration d'API tierce (ex: MoneyFusion)

---

## 🔧 Guide de Déploiement et d'Installation

Suivez ces étapes pour déployer votre propre instance d'Afinex.

### Étape 1 : Configuration de Supabase

1.  **Créez un projet Supabase :**
    *   Rendez-vous sur [supabase.com](https://supabase.com) et créez un nouveau projet.
    *   Notez bien la **région de la base de données** et le **mot de passe** que vous choisissez.

2.  **Récupérez vos clés d'API :**
    *   Dans le tableau de bord de votre projet Supabase, allez dans `Project Settings` > `API`.
    *   Copiez l'**URL du projet** et la clé **`anon` `public`**.

3.  **Exécutez le script de migration SQL :**
    *   Allez dans l'éditeur SQL de Supabase (`SQL Editor`).
    *   Ouvrez le fichier `supabase/migrations/0_init.sql` de ce projet.
    *   Copiez tout le contenu du fichier et collez-le dans l'éditeur SQL.
    *   Cliquez sur **"RUN"** pour créer toutes les tables, fonctions et politiques de sécurité nécessaires.

### Étape 2 : Configuration du Projet Frontend

1.  **Clonez le projet :**
    ```bash
    git clone <URL_DU_REPOSITORY>
    cd <NOM_DU_DOSSIER>
    ```

2.  **Installez les dépendances :**
    ```bash
    npm install
    ```

3.  **Créez le fichier d'environnement :**
    *   À la racine de votre projet, créez un fichier nommé `.env`.
    *   Ajoutez-y les clés Supabase que vous avez récupérées à l'étape 1 :
    ```env
    VITE_SUPABASE_URL=VOTRE_URL_DE_PROJET_SUPABASE
    VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_PUBLIC_SUPABASE
    ```

### Étape 3 : Configuration de la Passerelle de Paiement

L'application est conçue pour fonctionner avec une API de paiement externe pour gérer les abonnements Premium.

1.  **Obtenez votre URL de paiement :**
    *   Inscrivez-vous auprès d'un fournisseur de services de paiement (comme MoneyFusion, Stripe, etc.).
    *   Suivez leurs instructions pour obtenir une **URL de paiement** unique pour votre compte. L'URL utilisée dans ce projet est `https://www.pay.moneyfusion.net/GS_Money/b625a15aac1daeac/pay/`. Vous devrez la remplacer par la vôtre.

2.  **Mettez à jour l'URL dans Supabase :**
    *   Retournez à votre tableau de bord Supabase.
    *   Allez dans l'éditeur de tables (`Table Editor`).
    *   Sélectionnez la table `saas_plans`.
    *   Pour chaque plan que vous souhaitez activer, modifiez la ligne et collez votre URL de paiement dans la colonne `api_url`.
    *   Vous pouvez également gérer cela depuis le panel Super Admin de l'application une fois que vous avez créé un compte administrateur.

### Étape 4 : Déploiement sur Hostinger

1.  **Compilez le projet pour la production :**
    ```bash
    npm run build
    ```
    Cette commande va créer un dossier `dist` à la racine de votre projet. Ce dossier contient tous les fichiers statiques optimisés de votre application.

2.  **Déployez sur Hostinger :**
    *   Connectez-vous à votre compte Hostinger.
    *   Allez dans le gestionnaire de fichiers (`File Manager`) de votre site web.
    *   Téléversez le **contenu** du dossier `dist` (pas le dossier lui-même) dans le répertoire racine de votre site (généralement `public_html`).

3.  **Configuration finale :**
    *   Assurez-vous que votre domaine pointe correctement vers le répertoire `public_html`.
    *   Votre application Afinex est maintenant en ligne !

---

## 👑 Créer un Super Admin

Pour accéder au panel d'administration, vous devez vous créer un compte Super Admin :

1.  Inscrivez-vous sur votre application via le formulaire normal.
2.  Allez dans votre base de données Supabase, dans la table `users` du schéma `auth`.
3.  Trouvez votre utilisateur et modifiez la colonne `raw_user_meta_data`.
4.  Ajoutez la propriété suivante : `{"is_super_admin": true}`.
5.  Déconnectez-vous et reconnectez-vous. Vous devriez maintenant voir les options du Super Admin dans le menu.
