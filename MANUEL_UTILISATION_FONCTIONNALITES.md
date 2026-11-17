# 📖 MANUEL D'UTILISATION ET GUIDE COMPLET DES FONCTIONNALITÉS
## ERP INTÉGRÉ « LES TRIANGLES • YAMTAANU »
**Site agro-écologique & apicole de Komiguéa (Parakou) & Unités du Bénin**

> **Concepteur & Architecte Système :** DG SARKI Yantannou (Direction Générale)  
> **Rédaction du Document :** Thomas Orou Yorou (thomasorouyorou@gmail.com)  
> **Version Logicielle :** ERP v2.6 (SYSCOHADA Révisé - 2026)

---

## 📑 TABLE DES MATIÈRES
1. [Présentation Générale & Vision de la Plateforme](#1-présentation-générale--vision-de-la-plateforme)
2. [Architecture & Principes de Conception](#2-architecture--principes-de-conception)
3. [Module 1 : Espace Général (Tableau de Bord Exécutif)](#3-module-1--espace-général-tableau-de-bord-exécutif)
4. [Module 2 : Ruchers & Suivi Apicole (Apiculture & Bambou)](#4-module-2--ruchers--suivi-apicole-apiculture--bambou)
5. [Module 3 : Miellerie, Décantation & Traçabilité QR Code](#5-module-3--miellerie-décantation--traçabilité-qr-code)
6. [Module 4 : Atelier Jus & Thés (Boissons Naturelles)](#6-module-4--atelier-jus--thés-boissons-naturelles)
7. [Module 5 : Éco-Lodge & Centre de Conférences](#7-module-5--éco-lodge--centre-de-conférences)
8. [Module 6 : Caisse & Ventes au Comptoir (POS Tactile)](#8-module-6--caisse--ventes-au-comptoir-pos-tactile)
9. [Module 7 : Facturation B2B, Proformas & Gestion des Clients](#9-module-7--facturation-b2b-proformas--gestion-des-clients)
10. [Module 8 : Gestion des Stocks & Intrants (Matières Premières)](#10-module-8--gestion-des-stocks--intrants-matières-premières)
11. [Module 9 : Comptabilité SYSCOHADA Révisé & Trésorerie](#11-module-9--comptabilité-syscohada-révisé--trésorerie)
12. [Module 10 : Utilisateurs, Rôles & Configuration des Référentiels](#12-module-10--utilisateurs-rôles--configuration-des-référentiels)
13. [Flux de Données & Automatisations Transversales](#13-flux-de-données--automatisations-transversales)
14. [Guide Pratique des Opérations Clés (Pas-à-Pas)](#14-guide-pratique-des-opérations-clés-pas-à-pas)
15. [Normes Légales, Formats d'Impression & Sécurité](#15-normes-légales-formats-dimpression--sécurité)

---

## 1. PRÉSENTATION GÉNÉRALE & VISION DE LA PLATEFORME

L'ERP **« LES TRIANGLES • YAMTAANU »** est un progiciel de gestion intégré sur-mesure conçu pour piloter de bout en bout les activités agro-écologiques, artisanales, hôtelières et commerciales du complexe :
- **Filière Apicole d'Excellence :** De la construction artisanale de ruches en bambou local jusqu'au conditionnement et à la traçabilité infalsifiable par QR Code de chaque pot de miel sauvage.
- **Filière Agroalimentaire :** Transformation locale de nectars, jus naturels (baobab, mangue, ananas, gingembre) et infusions bien-être (kinkeliba, moringa, hibiscus).
- **Hôtellerie & Éco-Tourisme :** Gestion des hébergements en éco-bungalows traditionnels et organisation de séminaires dans la salle de conférence polyvalente.
- **Commerce & Distribution :** Point de vente tactile (POS), gestion des factures proforma, facturation B2B conforme aux normes béninoises (IFU/NPI), et suivi rigoureux des créances clients.
- **Maîtrise Financière & Comptable :** Comptabilité analytique et générale conforme au plan révisé **SYSCOHADA**, avec suivi de trésorerie multi-caisses et soldes intermédiaires de gestion (SIG).

---

## 2. ARCHITECTURE & PRINCIPES DE CONCEPTION

1. **Synchronisation Réactive en Temps Réel :** Toute action réalisée dans un module (ex: vente au comptoir) met immédiatement à jour les niveaux de stock, le journal comptable SYSCOHADA et les statistiques du tableau de bord.
2. **Double Inventaire Intégré :** Suivi distinct mais interconnecté des *Produits Finis* (prêts à la vente) et des *Matières Premières / Intrants* (bocaux verre, bouchons, cartons, étiquettes, sucre, fruits frais).
3. **Traçabilité Granulaire Décentralisée :** Chaque lot de miel dispose d'un certificat numérique public scannable par le client final, sans nécessiter d'application tierce.
4. **Ergonomie Pensée pour le Terrain :**
   - Écran de caisse POS optimisé pour écrans tactiles et tablettes.
   - Saisie rapide avec ou sans lecteur code-barres.
   - Impression adaptée au format standard **A4** (documents officiels) et compatible tickets de caisse.
5. **Robustesse & Confidentialité :**
   - Mode visiteur verrouillé en lecture seule.
   - Authentification par rôles et codes PIN sécurisés pour les actions d'administration et de comptabilité.

---

## 3. MODULE 1 : ESPACE GÉNÉRAL (TABLEAU DE BORD EXÉCUTIF)

L'**Espace Général** offre une vue d'ensemble instantanée sur la santé opérationnelle et financière de l'ensemble de l'entreprise.

### Fonctionnalités clés :
- **KPIs Consolidés en Temps Réel :**
  - Chiffre d'affaires global cumulé (ventes comptoir + facturation B2B + hôtellerie/conférences).
  - Nombre de ruches peuplées et actives dans les ruchers.
  - Taux d'occupation en direct de l'Éco-Lodge.
  - Valorisation financière totale des stocks (produits finis + intrants au CUMP).
- **Graphiques de Performance Multi-Filières :**
  - Répartition du chiffre d'affaires par filière (Miel & Dérivés, Jus & Nectars, Thés & Tisanes, Éco-Lodge, Conférences).
  - Évolution mensuelle des encaissements et des charges d'exploitation.
- **Panneau des Alertes Prioritaires :**
  - Alertes de rupture imminente sur les produits finis ou emballages critiques.
  - Alertes sanitaires sur les ruches (présence de parasites ou faiblesse de colonie).
  - Liste des factures clients arrivées à échéance ou en retard de paiement.
- **Raccourcis Directs :** Accès en un clic vers la nouvelle vente, la saisie d'inspection apicole, la réservation d'un bungalow ou le journal de caisse.

---

## 4. MODULE 2 : RUCHERS & SUIVI APICOLE (APICULTURE & BAMBOU)

Ce module assure le suivi rigoureux du parc apicole depuis la fabrication artisanale des ruches jusqu'aux récoltes de miel brut.

### Sous-onglets et fonctionnalités :
1. **Atelier Bambou & Préformes :**
   - Suivi de la fabrication locale de ruches écologiques en tiges de bambou tressé.
   - Calcul des coûts unitaires de main-d'œuvre et de matières premières par ruche.
   - Enregistrement des préformes et affectation aux ruchers.
2. **Gestion du Parc de Ruches :**
   - Répertoire cartographique des ruchers (Komiguéa, Allada, sites satellites) avec coordonnées GPS.
   - Fiche d'identité par ruche : identifiant unique (ex: `RUCH-KOM-01`), modèle (Kényane Top-Bar, Dadant, Langstroth, Bambou traditionnel), date de pose, état du peuplement.
   - Statut visuel : *Actif / Productif*, *En colonisation*, *Essaimage*, *En observation*, *Désaffecté*.
3. **Inspections Sanitaires Périodiques :**
   - Enregistrement des visites apicoles : date, apiculteur référent, état sanitaire de la colonie.
   - Contrôle de la présence de la reine, ponte régulière, taux d'infestation varroa, agressivité des abeilles, niveau des réserves de miel et pollen.
   - Historique complet pour chaque ruche avec alertes d'intervention.
4. **Campagnes de Récolte de Miel Brut :**
   - Enregistrement des pesées de miel brut récolté par ruche et par rucher (poids en kg).
   - Identification de la flore mellifère dominante (acacia, néré, karité, baobab, fleurs sauvages).
   - Transfert automatique vers la miellerie pour décantation et maturation.

---

## 5. MODULE 3 : MIELLERIE, DÉCANTATION & TRAÇABILITÉ QR CODE

Le cœur de la différenciation qualitative de Yamtaanu : une extraction douce à froid et une traçabilité inviolable offerte au consommateur.

### Fonctionnalités clés :
1. **Gestion des Cuves de Décantation (Maturateurs) :**
   - Suivi des volumes de miel brut versés en cuve inox/alimentaire.
   - Mesure du taux d'humidité au réfractomètre (garantie < 18-19%).
   - Période de repos et clarification naturelle à froid sans chauffage destructeur d'enzymes.
2. **Création des Lots de Conditionnement :**
   - Numéro de lot normalisé (ex: `LOT-2026-M04`).
   - Raccordement direct à la récolte source, au rucher et à la date de mise en pot.
   - Déclinaison par contenance : pots verre de 250 g, 500 g, 1000 g ou seaux professionnels.
3. **Studio de Génération d'Étiquettes & QR Codes :**
   - Générateur automatique de QR Code haute définition pour chaque lot.
   - Outil de personnalisation de planche d'étiquettes A4 (disposition en grille, marges, prévisualisation à l'échelle réelle).
   - Impression directe prête pour découpage et encollage sur les pots de miel.
4. **Certificat Numérique Public de Pureté & Origine :**
   - En scannant le QR code avec son smartphone, le consommateur accède instantanément à la fiche publique officielle du produit :
     - Nom de l'apiculteur ayant suivi la ruche.
     - Village et coordonnées géographiques de provenance.
     - Flore dominante et date exacte de récolte.
     - Déclaration solennelle d'engagement « Miel 100% Brut Non Chauffé ».
     - Tampon officiel d'approbation qualité Yamtaanu.
     - Bouton d'impression et de téléchargement direct en PDF pour le client.

---

## 6. MODULE 4 : ATELIER JUS & THÉS (BOISSONS NATURELLES)

Ce module encadre la transformation agroalimentaire des fruits et herbes médicinales locales.

### Fonctionnalités clés :
1. **Production de Jus & Nectars Naturels :**
   - Gestion des recettes et fiches de production : Baobab sauvage, Mangue du Borgou, Ananas d'Allada, Gingembre piquant, Cocktail tropical.
   - Enregistrement des lots de pasteurisation : quantité de fruits, sucre de canne brut, eau purifiée, température de pasteurisation et durée.
   - Calcul automatique du rendement et du coût de revient unitaire par bouteille.
2. **Atelier Tisanes & Infusions Locales :**
   - Assemblage et séchage des plantes : Kinkeliba, Moringa oleifera, Citronnelle fraîche, Hibiscus (Bissap).
   - Gestion des mélanges en vrac et conditionnement en sachets kraft ou boîtes hermétiques.
3. **Interconnexion Automatique :**
   - Dès validation d'un lot de jus ou de thé, les matières premières (bouteilles vides, capsules, étiquettes, sucre) sont décrémentées de l'inventaire des intrants.
   - Les bouteilles pleines sont automatiquement ajoutées au catalogue des stocks prêts à la vente.

---

## 7. MODULE 5 : ÉCO-LODGE & CENTRE DE CONFÉRENCES

Gestion intégrée de l'accueil éco-touristique et des événements institutionnels à Komiguéa.

### Fonctionnalités clés :
1. **Hébergement & Bungalows :**
   - Inventaire des chambres et suites éco-construites (Bungalow Bambou, Case Ronde Traditionnelle, Suite Baobab).
   - Planning dynamique des disponibilités avec statuts : *Libre / Propre*, *Occupé*, *En cours de nettoyage*, *En maintenance*.
   - Gestion des commodités, tarifs par nuitée et suppléments (petit-déjeuner bio au miel, lit d'appoint).
2. **Réservations & Séjours Hôteliers :**
   - Saisie rapide des séjours : date d'arrivée (check-in), date de départ (check-out), identité et contact du client.
   - Calcul automatique de la durée du séjour et du montant total facturable.
   - Facturation combinée : hébergement + consommations au bar/restaurant + visites guidées du rucher.
3. **Salle de Conférence & Séminaires :**
   - Fiche technique de la salle polyvalente (capacité assise, sonorisation, vidéoprojecteur HD, climatisation solaire).
   - Planning de réservation par demi-journée ou journée complète.
   - Options de pauses-café bio (infusions Yamtaanu, jus naturels, dégustation de miel et pâtisseries locales).
   - Émission de factures globales d'événement avec bons de commande associés.

---

## 8. MODULE 6 : CAISSE & VENTES AU COMPTOIR (POS TACTILE)

Un terminal point de vente complet, fluide et résistant, conçu pour la boutique du domaine et les stands d'exposition.

### Fonctionnalités clés :
1. **Catalogue Visuel & Grille Tactile :**
   - Affichage des produits avec visuels clairs, prix en FCFA et niveau de stock disponible en temps réel.
   - Filtre rapide par catégorie (Miel, Jus, Tisanes, Hôtellerie, Prestations).
   - Recherche instantanée par nom, variante ou référence code-barres.
2. **Fonctionnalité « + Article Libre » :**
   - Permet d'ajouter instantanément au panier un produit personnalisé ou une prestation ponctuelle hors catalogue (ex: panier dégustation sur mesure, location d'espace, prestation événementielle).
   - Saisie du libellé, du secteur, du prix unitaire et de la quantité, avec possibilité de l'enregistrer définitivement dans le catalogue si souhaité.
3. **Panier Intelligent & Remises :**
   - Ajustement direct des quantités, suppression d'un article par glissement ou clic.
   - Application de remises commerciales globales ou par ligne (en pourcentage % ou en montant forfaitaire FCFA).
4. **Paiements Multi-Modes & Rendu de Monnaie :**
   - **Espèces :** Calcul automatique de la monnaie à rendre à la saisie du montant reçu.
   - **Mobile Money :** Prise en charge des réseaux béninois (MTN MoMo, Moov Money, Wave, Celtiis Cash) avec saisie de la référence de transaction.
   - **Carte Bancaire & Virement.**
   - **Vente à Crédit :** Sélection du client, contrôle du plafond de crédit autorisé, fixation de la date d'échéance et génération de la créance.
5. **Gestion Complète des Sessions de Caisse (Rapport Z) :**
   - **Ouverture de session :** Saisie du fond de caisse initial en espèces.
   - **Indicateur en direct :** Montant cumulé des encaissements par mode de paiement.
   - **Clôture de session & Rapport Z :** Comptage physique des espèces, calcul immédiat de l'écart de caisse (excédent ou manquant), saisie des observations et impression du rapport de clôture officiel.

---

## 9. MODULE 7 : FACTURATION B2B, PROFORMAS & GESTION DES CLIENTS

Module dédié aux commandes de gros, supermarchés, hôtels partenaires, ambassades et institutions.

### Fonctionnalités clés :
1. **Émission & Gestion des Devis / Factures Proforma :**
   - Création de devis détaillés avec conditions de règlement (Comptant, Crédit 15j/30j, Acompte 50%, MoMo à réception).
   - Durée de validité de la proforma, conditions de livraison et remises négociées.
   - Suivi des statuts : *Brouillon*, *Envoyé*, *Accepté*, *Converti en Facture*, *Refusé*, *Expiré*.
   - **Conversion 1-Clic :** Dès acceptation du devis, transformation instantanée en facture définitive avec sortie automatique des stocks et imputation comptable.
2. **Facturation Officielle A4 aux Normes Béninoises :**
   - En-tête officiel de l'entreprise : Coordonnées, IFU, NPI, RCCM, mentions légales.
   - Identification complète de l'acheteur (Nom, Société, Téléphone, Adresse, IFU).
   - Tableau normalisé des articles : désignation, quantité, prix unitaire HT/TTC, remises, net à payer en chiffres et en lettres.
   - Signature, cachet commercial et QR code de contrôle.
   - Impression directe A4 optimisée et téléchargement en PDF.
3. **Gestion des Ventes à Crédit & Encaissements Partiels :**
   - Suivi rigoureux des créances clients : solde total dû, acomptes perçus, reste à payer.
   - Formulaire d'encaissement partiel ou total : génération automatique des écritures de trésorerie (Compte 571/521 débité, Compte 411 crédité).
4. **Bons de Livraison (BL) & Retours Marchandises :**
   - Émission des bons de livraison conformes pour les transporteurs et livreurs.
   - Gestion des retours clients avec motif (casse, non-conformité) et réintégration immédiate en stock.
5. **CRM & Fichier Clients Professionnel :**
   - Fiches clients détaillées avec historique d'achats, coordonnées WhatsApp et adresses de livraison.
   - Plafond de crédit accordé, délai de paiement contractuel, solde débiteur en direct et taux de recouvrement.

---

## 10. MODULE 8 : GESTION DES STOCKS & INTRANTS (MATIÈRES PREMIÈRES)

Une gestion rigoureuse des flux physiques garantissant zéro rupture et une valorisation financière exacte.

### Fonctionnalités clés :
1. **Double Inventaire Produits Finis vs Intrants :**
   - **Produits Finis :** Pots de miel (250g, 500g, 1kg), bouteilles de jus, boîtes de thé, savons au miel, cire pure.
   - **Matières Premières & Intrants :** Bocaux en verre vierges, capsules, couvercles dorés, étiquettes adhésives, cartons d'emballage, bouteilles verre/PET 33cl/50cl, sucre de canne, fruits bruts, tiges de bambou.
2. **Valorisation Permanente au CUMP / CMP :**
   - Calcul automatique du Coût Unitaire Moyen Pondéré pour chaque article.
   - Synthèse de la valeur patrimoniale totale des stocks, ventilée par secteur d'activité.
3. **Journal Exhaustif des Mouvements de Stock :**
   - Enregistrement automatique ou manuel de tout flux physique avec traçabilité complète :
     - `entree_achat` : Réception de commandes fournisseurs d'emballages ou d'intrants.
     - `entree_production` : Fin de lot de mise en pot ou de pasteurisation de jus.
     - `sortie_vente` : Décrémentation automatique lors d'une vente POS ou facture B2B.
     - `perte_avarie` : Déclaration de casse ou de produit déclassé.
     - `ajustement_inventaire` : Régularisation suite au comptage physique.
     - `retour_client` : Réintégration après retour contrôlé.
4. **Alertes de Seuil & Réapprovisionnement :**
   - Définition d'un stock de sécurité pour chaque produit.
   - Badges visuels d'alerte (Normal en vert, Critique en orange, Rupture en rouge).
5. **Inventaire Physique Périodique :**
   - Saisie des comptages réels de magasin.
   - Calcul automatique des écarts d'inventaire (surplus ou manquant) et passage des écritures d'ajustement en un clic.

---

## 11. MODULE 9 : COMPTABILITÉ SYSCOHADA RÉVISÉ & TRÉSORERIE

Une comptabilité professionnelle intégrée, alignée sur le Système Comptable Ouest-Africain (SYSCOHADA).

### Fonctionnalités clés :
1. **Plan Comptable Personnalisé (Classes 1 à 8) :**
   - Plan adapté aux activités agro-apicoles et hôtelières :
     - *Classe 1 :* Capitaux propres et emprunts.
     - *Classe 2 :* Immobilisations (ruches, maturateurs, bâtiments éco-lodge, véhicules).
     - *Classe 3 :* Stocks de miel, jus, intrants et emballages.
     - *Classe 4 :* Créances clients (Compte 411) et dettes fournisseurs (Compte 401).
     - *Classe 5 :* Trésorerie (Caisse principale 5711, Caisses secondaires, Mobile Money 5714, Banques 5211).
     - *Classe 6 :* Charges d'exploitation (achats de matières, salaires, énergie, entretien).
     - *Classe 7 :* Produits et ventes par secteur (Miel 7011, Jus 7012, Éco-Lodge 7061, etc.).
     - *Classe 8 :* Résultats exceptionnels.
2. **Livre-Journal Général Automatisé :**
   - Génération automatique des écritures équilibrées (Débit = Crédit) à chaque vente, achat, règlement ou dépense.
   - Possibilité de passer des Opérations Diverses (OD) manuelles avec contrôle strict d'équilibre.
3. **Grand Livre & Balance Générale :**
   - Consultation détaillée des mouvements et soldes pour chaque compte comptable.
   - Balance à 6 colonnes (Soldes d'ouverture, Mouvements de la période, Soldes de clôture Débiteur/Créditeur).
4. **Soldes Intermédiaires de Gestion (SIG) & Compte de Résultat :**
   - Chiffre d'Affaires net.
   - Marge Brute commerciale et Taux de marge.
   - Valeur Ajoutée (VA).
   - Excédent Brut d'Exploitation (EBE).
   - Résultat d'Exploitation et Résultat Net de l'exercice.
   - Découpage analytique par secteur pour connaître la rentabilité exacte de chaque activité.
5. **Gestion de Trésorerie & Rapprochements Périodiques :**
   - Suivi individualisé des comptes de trésorerie (Caisse espèces, MoMo, Compte bancaire).
   - Procédure de rapprochement de caisse avec justificatif des écarts constatés.
6. **Balance Âgée des Créances Clients :**
   - Classement des impayés par tranche d'ancienneté : *0 à 30 jours*, *31 à 60 jours*, *61 à 90 jours*, *Plus de 90 jours*.
   - Outil indispensable pour le pilotage du recouvrement et la préservation du fonds de roulement.

---

## 12. MODULE 10 : UTILISATEURS, RÔLES & CONFIGURATION DES RÉFÉRENTIELS

Administration sécurisée du système et personnalisation des listes métier.

### Fonctionnalités clés :
1. **Gestion des Utilisateurs & Contrôle d'Accès :**
   - Création de profils avec identifiant, nom complet, téléphone et code d'accès PIN.
   - Rôles prédéfinis avec privilèges adaptés :
     - **Administrateur Général :** Accès illimité à tous les modules, configurations et comptabilité.
     - **Gérant / Responsable d'Exploitation :** Supervision des productions, stocks, réservations et ventes.
     - **Caissier / Vendeur POS :** Accès restreint à la caisse de vente, ouverture/clôture de session et émission de reçus.
     - **Chef Apiculteur :** Gestion exclusive des ruchers, ruches, inspections et récoltes.
     - **Comptable :** Accès aux journaux SYSCOHADA, états financiers, créances et trésorerie.
   - Journal d'audit enregistrant les actions sensibles.
2. **Personnalisation des Listes Métier (Référentiels) :**
   - Configuration sans code des listes de choix de l'application :
     - Emplacements et noms des ruchers.
     - Registre des artisans et apiculteurs locaux.
     - Recettes et parfums de jus de fruits.
     - Formules de thés et mélanges d'infusions.
     - Transporteurs partenaires et zones de livraison.

---

## 13. FLUX DE DONNÉES & AUTOMATISATIONS TRANSVERSALES

L'ERP supprime toute double saisie grâce à ses ponts automatiques :

```
[Récolte Miel Rucher]
        │
        ▼
[Cuve Décantation Miellerie]
        │
        ▼
[Conditionnement en Pots + QR Code] ──► [Entrée automatique en Stock Produit Fini]
                                                          │
                                                          ▼
                                                  [Vente Caisse POS ou Facture B2B]
                                                          │
                                     ┌────────────────────┴────────────────────┐
                                     ▼                                         ▼
                     [Décrémentation Stock Temps Réel]         [Écriture Comptable SYSCOHADA]
                                                                               │
                                                                               ▼
                                                                  [Mise à jour Trésorerie / 411]
```

### Exemples d'enchaînements automatiques :
1. **Vente au comptoir en espèces (10 000 FCFA pour 2 pots de miel) :**
   - Stock de pots de miel 500g : **-2 unités**.
   - Mouvement de stock de type `sortie_vente` consigné au journal des stocks.
   - Écriture comptable : Débit compte `5711` (Caisse Espèces) 10 000 F / Crédit compte `7011` (Ventes Miel) 10 000 F.
   - Session de caisse : Total espèces mis à jour.
2. **Conversion d'une Facture Proforma de 150 000 FCFA acceptée par un hôtel :**
   - Génération immédiate de la commande `CMD-xxx` et du Bon de Livraison.
   - Réservation et sortie des articles du stock disponible.
   - Débit compte `411` (Client Hôtel) / Crédit compte `701` (Ventes).
   - Ajout au tableau de bord des créances en attente d'encaissement.

---

## 14. GUIDE PRATIQUE DES OPÉRATIONS CLÉS (PAS-À-PAS)

### Opération 1 : Réaliser une vente rapide en caisse POS
1. Ouvrir l'onglet **« Caisse & Ventes (POS) »**.
2. Si la caisse est fermée, cliquer sur **« Ouvrir Caisse »**, saisir le fond de roulement en espèces (ex: 25 000 FCFA) et valider.
3. Cliquer sur les articles souhaités dans la grille pour les ajouter au panier (ou utiliser la barre de recherche).
4. Pour une prestation ponctuelle, cliquer sur **« + Article Libre »**, saisir le libellé et le montant.
5. Sélectionner le mode de règlement :
   - *Espèces :* Saisir le montant remis par le client, vérifier le rendu de monnaie affiché en vert.
   - *Mobile Money :* Choisir l'opérateur (MTN MoMo, Moov Money, etc.) et noter la référence.
   - *À Crédit :* Choisir le client dans la liste, vérifier son plafond de crédit, fixer l'échéance.
6. Cliquer sur **« Valider & Encaisser »**. Le ticket/facture s'affiche avec option d'impression immédiate.

### Opération 2 : Créer et imprimer les étiquettes QR Code d'un lot de miel
1. Aller dans l'onglet **« Miellerie & Lots QR »**.
2. Renseigner le formulaire de mise en bouteille (nom du rucher, apiculteur, date de récolte, date de conditionnement, flore dominante).
3. Cliquer sur **« Générer & Enregistrer le Lot »**.
4. Dans le panneau du générateur d'étiquettes, ajuster la taille du QR Code et le format de la planche d'impression A4.
5. Cliquer sur **« Imprimer la Planche d'Étiquettes »**.

### Opération 3 : Clôturer la caisse en fin de journée (Rapport Z)
1. Dans l'onglet **« Caisse & Ventes (POS) »**, cliquer sur le badge vert de caisse active.
2. Vérifier le total théorique calculé par le système.
3. Compter physiquement les billets et pièces dans le tiroir-caisse et saisir le montant dans le champ **« Montant réel d'espèces compté »**.
4. Constater l'écart (l'indicateur confirme l'équilibre parfait ou affiche l'écart à justifier).
5. Saisir d'éventuelles observations puis cliquer sur **« Clôturer la Caisse & Rapport Z »**.
6. Imprimer ou archiver le Rapport Z officiel.

---

## 15. NORMES LÉGALES, FORMATS D'IMPRESSION & SÉCURITÉ

- **Norme Comptable :** Respect strict des principes du **SYSCOHADA Révisé** (partie double, séparation des exercices, valorisation au coût historique et CUMP).
- **Facturation Béninoise :** Présence des mentions obligatoires (IFU de l'émetteur et du client, NPI, détail de la TVA si assujetti, ventilation des remises, montant en toutes lettres).
- **Impression Polyvalente :**
  - Factures, Proformas, Bons de Livraison, Certificats de pureté et Bilans au format **A4 officiel**.
  - Reçus et états de caisse compatibles tickets de caisse.
- **Sécurité des Données :**
  - Mémorisation locale permanente résistant aux coupures de connexion internet.
  - Verrouillage automatique de l'interface d'administration en cas d'inactivité ou par simple clic sur « Déconnexion ».

---
*Document officiel d'exploitation de la plateforme ERP « LES TRIANGLES • YAMTAANU ».*  
- **Concepteur & Architecte Système :** DG SARKI Yantannou (Direction Générale)  
- **Rédaction du Document :** Thomas Orou Yorou (`thomasorouyorou@gmail.com`)  
*Site agro-écologique de Komiguéa (Parakou) • République du Bénin • Tous droits réservés 2026.*
