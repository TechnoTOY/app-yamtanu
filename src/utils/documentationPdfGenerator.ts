import { jsPDF } from 'jspdf';

interface FeatureItem {
  name: string;
  desc: string;
}

interface ChapterData {
  id: string;
  num: number;
  badge: string;
  title: string;
  summary: string;
  features: FeatureItem[];
  workflows?: string[];
  tips?: string[];
}

async function loadOfficialStampDataUrl(): Promise<string | null> {
  try {
    const res = await fetch('/assets/aistudio/image_8866b669.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateDocumentationPdf() {
  const stampDataUrl = await loadOfficialStampDataUrl();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = 22;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('LES TRIANGLES • YAMTAANU — Manuel d\'Utilisation ERP v2.6 (Komiguéa, Bénin)', margin, 12);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  const drawRunningFooters = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.text('Système Intégré de Gestion Agro-Écologique & Commerciale', margin, pageHeight - 7);
      const pageStr = `Page ${i} sur ${totalPages}`;
      doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - 7);
    }
  };

  // ================= PAGE 1 : COUVERTURE OFFICIELLE =================
  // Top decorative band
  doc.setFillColor(16, 48, 29); // #10301d
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setFillColor(217, 119, 6); // amber-600 gold
  doc.rect(0, 48, pageWidth, 2.5, 'F');

  // Header texts inside dark band
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(245, 158, 11);
  doc.text('RÉPUBLIQUE DU BÉNIN • DÉPARTEMENT DU BORGOU • KOMIGUÉA (PARAKOU)', margin, 16);

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('LES TRIANGLES • YAMTAANU', margin, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(200, 230, 210);
  doc.text('Complexe Agro-Écologique, Apicole, Artisanal & Éco-Touristique', margin, 34);
  doc.text('Unité Pilote de Traçabilité Directe Sans Intermédiaire', margin, 41);

  cursorY = 62;

  // Title Box
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, cursorY, contentWidth, 36, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(120, 53, 15); // amber-900
  doc.text('MANUEL COMPLET DES FONCTIONNALITÉS', margin + 6, cursorY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('Guide Opérationnel & Référentiel Technique de l\'Application ERP', margin + 6, cursorY + 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 70, 50);
  doc.text('Couverture exhaustive des 10 modules métiers : Ruchers, Miellerie QR, Boissons, Éco-Lodge, POS,', margin + 6, cursorY + 26);
  doc.text('Stocks en temps réel, Facturation normalisée, Comptabilité SYSCOHADA Révisé & Administration.', margin + 6, cursorY + 31);

  cursorY += 46;

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, cursorY, contentWidth, 31, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('INFORMATIONS DE PUBLICATION & CONCEPTION', margin + 5, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('• Version Logicielle : ERP v2.6 (Mise à jour Septembre 2026)', margin + 5, cursorY + 11.5);
  doc.text('• Document rédigé par : Thomas Orou Yorou (thomasorouyorou@gmail.com)', margin + 5, cursorY + 17.5);
  doc.text('• Norme Comptable : Système Comptable Ouest-Africain (SYSCOHADA Révisé)', margin + 5, cursorY + 23.5);

  cursorY += 38;

  // Executive Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 48, 29);
  doc.text('1. VISION & PRINCIPES FONDATEURS DE LA PLATEFORME', margin, cursorY);
  cursorY += 5;

  const introText = [
    "L'ERP « LES TRIANGLES • YAMTAANU » est une plateforme de gestion intégrée sur-mesure développée pour orchestrer l'ensemble des activités économiques du domaine de Komiguéa au Bénin.",
    "Le système unifie dans une même interface résiliente :",
    "1. L'apiculture durable : de la confection locale des ruches en bambou jusqu'au pesage des récoltes.",
    "2. La miellerie et le conditionnement avec génération de QR codes uniques garantissant au consommateur final un miel 100% pur, extrait à froid et non adultéré.",
    "3. La valorisation fruitière et médicinale : production de jus naturels et infusions bien-être.",
    "4. L'éco-tourisme et les conférences : hébergement en bungalows écologiques et séminaires.",
    "5. Le commerce B2C et B2B : caisse POS tactile, facturation aux normes béninoises (IFU/NPI) et gestion rigoureuse des créances clients.",
    "6. La synchronisation automatique des stocks et la comptabilité générale SYSCOHADA en partie double sans aucune ressaisie manuelle."
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  introText.forEach(line => {
    const lines = doc.splitTextToSize(line, contentWidth);
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 4.3;
  });

  cursorY += 4;

  // Interconnection highlight banner
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(52, 211, 153); // emerald-400
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 78, 59);
  doc.text('⚡ INTERCONNEXION DIRECTE ENTRE LA VENTE ET LE STOCK :', margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text('Toute vente validée en caisse POS ou sur facture B2B décrémente immédiatement les quantités en stock,', margin + 4, cursorY + 11);
  doc.text('génère un mouvement officiel de type "sortie_vente" et impute les comptes comptables 571/411 et 701.', margin + 4, cursorY + 16);

  // ================= MODULE CHAPTERS DATA =================
  const chapters: ChapterData[] = [
    {
      id: 'overview',
      num: 1,
      badge: 'Supervision',
      title: 'Espace Général & Tableau de Bord Exécutif',
      summary: 'Tour de contrôle consolidant en temps réel tous les flux opérationnels et financiers du complexe.',
      features: [
        { name: 'KPIs Consolidés en Temps Réel', desc: 'Chiffre d\'affaires global cumulé (ventes comptoir + B2B + hôtellerie/séminaires), nombre de ruches actives connectées, taux d\'occupation de l\'éco-lodge, valorisation financière globale des stocks au CUMP.' },
        { name: 'Graphiques de Performance Multi-Filières', desc: 'Répartition analytique du CA par filière (Miel, Jus, Thé, Éco-Lodge, Conférences) et historique mensuel des encaissements.' },
        { name: 'Panneau des Alertes d\'Exploitation', desc: 'Signalement visuel des ruptures de stock imminentes, anomalies sanitaires sur les ruches et créances clients arrivées à échéance.' },
        { name: 'Raccourcis Directs', desc: 'Démarrage instantané en un clic d\'une vente POS, d\'une inspection de rucher ou d\'un enregistrement de séjour.' }
      ]
    },
    {
      id: 'apiculture',
      num: 2,
      badge: 'Filière Apicole',
      title: 'Ruchers & Suivi Apicole (Bambou, Ruches & Récoltes)',
      summary: 'Gestion rigoureuse du parc apicole, depuis la fabrication locale de ruches jusqu\'au pesage des récoltes.',
      features: [
        { name: 'Atelier Bambou & Préformes', desc: 'Suivi de la fabrication artisanale des ruches en tiges de bambou local tressé, calcul des coûts unitaires de confection et affectation aux ruchers.' },
        { name: 'Registre Cartographique des Ruches', desc: 'Fiches détaillées par ruche (modèles Kényanes, Dadant, Langstroth, Bambou), coordonnées GPS, localisation des ruchers (Komiguéa, Allada) et statuts (Actif, Essaimage, En colonisation).' },
        { name: 'Inspections Sanitaires Périodiques', desc: 'Fiches de visite : santé de la colonie, contrôle de la reine et de la ponte, surveillance du varroa, agressivité et niveau des réserves.' },
        { name: 'Campagnes de Récolte de Miel Brut', desc: 'Pesées précises en kg par ruche et rucher, identification de la flore dominante (acacia, néré, karité) et transfert automatique vers la miellerie.' }
      ],
      workflows: [
        'Fabrication ruche bambou ➔ Pose au rucher ➔ Inspections périodiques ➔ Pesée récolte brute ➔ Transfert en cuve miellerie'
      ]
    },
    {
      id: 'transformation',
      num: 3,
      badge: 'Traçabilité & Qualité',
      title: 'Miellerie, Décantation & Traçabilité QR Code',
      summary: 'Extraction douce à froid, maturation naturelle et génération de certificats numériques infalsifiables.',
      features: [
        { name: 'Cuves de Décantation (Maturateurs)', desc: 'Suivi des volumes de miel brut, contrôle de l\'humidité au réfractomètre (<18-19%) et clarification naturelle sans surchauffe.' },
        { name: 'Lots de Conditionnement', desc: 'Création de lots normalisés (ex: LOT-2026-M04) raccordés à la récolte source et au rucher pour pots de 250g, 500g, 1kg.' },
        { name: 'Studio de Génération d\'Étiquettes & QR Codes', desc: 'Générateur de QR Codes haute définition et outil de mise en page de planches A4 pour impression et collage sur les pots.' },
        { name: 'Certificat Numérique Public d\'Origine', desc: 'Page web officielle scannée par le client final affichant apiculteur, rucher, garantie "Miel Brut Non Chauffé", tampon officiel Yamtaanu et téléchargement PDF du certificat.' }
      ]
    },
    {
      id: 'beverages',
      num: 4,
      badge: 'Agroalimentaire',
      title: 'Atelier Jus & Thés (Boissons Naturelles)',
      summary: 'Transformation artisanale de fruits sauvages et plantes médicinales du terroir béninois.',
      features: [
        { name: 'Jus & Nectars Naturels', desc: 'Fiches recettes (Baobab sauvage, Mangue, Ananas, Gingembre), lots de pasteurisation et calcul du coût de revient par bouteille.' },
        { name: 'Atelier Tisanes & Infusions', desc: 'Assemblage et séchage de plantes locales (Kinkeliba, Moringa, Citronnelle, Hibiscus / Bissap) en sachets ou boîtes hermétiques.' },
        { name: 'Synchronisation Automatique des Stocks', desc: 'Décrémentation immédiate des intrants consommés (bouteilles vides, capsules, étiquettes, sucre) et ajout des bouteilles finies au stock de vente.' }
      ]
    },
    {
      id: 'hotel',
      num: 5,
      badge: 'Éco-Tourisme',
      title: 'Éco-Lodge & Centre de Conférences',
      summary: 'Gestion intégrée de l\'hébergement éco-responsable et des séminaires institutionnels à Komiguéa.',
      features: [
        { name: 'Bungalows & Chambres Éco-Lodge', desc: 'Planning dynamique des chambres (Bungalow Bambou, Case ronde, Suite) avec statuts (Libre, Occupé, Nettoyage, Maintenance) et tarifs nuitée.' },
        { name: 'Gestion des Séjours & Réservations', desc: 'Enregistrement des check-in/check-out, coordonnées des résidents, calcul automatique de la durée et du montant du séjour.' },
        { name: 'Salle de Conférences Polyvalente', desc: 'Réservation par demi-journée/journée, gestion des équipements (vidéoprojecteur, sonorisation) et formules pauses-café bio Yamtaanu.' },
        { name: 'Facturation Combinée', desc: 'Regroupement sur un seul document du séjour, des consommations bar/restaurant, des achats boutique et de la salle.' }
      ]
    },
    {
      id: 'pos',
      num: 6,
      badge: 'Vente au Comptoir',
      title: 'Caisse & Ventes au Comptoir (POS Tactile)',
      summary: 'Terminal point de vente tactile rapide et fluide pour la boutique du domaine et les foires.',
      features: [
        { name: 'Grille Tactile & Recherche Rapide', desc: 'Affichage visuel avec prix en FCFA, niveau de stock disponible en direct et filtrage instantané par catégorie.' },
        { name: 'Bouton « + Article Libre »', desc: 'Ajout direct au panier d\'un produit personnalisé ou d\'une prestation ponctuelle hors catalogue (dégustation, location, atelier) avec mémorisation optionnelle au catalogue.' },
        { name: 'Calcul des Remises & Rendu de Monnaie', desc: 'Remises commerciales en % ou montant fixe, calcul automatique de la monnaie à rendre sur les règlements en espèces.' },
        { name: 'Multi-Paiement Intégré', desc: 'Espèces, Mobile Money (MTN MoMo, Moov Money, Wave, Celtiis Cash avec référence), Carte bancaire et Ventes à crédit.' },
        { name: 'Sessions de Caisse & Rapport Z', desc: 'Ouverture avec fond de caisse initial, suivi en direct des encaissements, comptage physique lors de la clôture, calcul d\'écart et édition du Rapport Z.' }
      ]
    },
    {
      id: 'sales_b2b',
      num: 7,
      badge: 'Commerce B2B',
      title: 'Facturation B2B, Proformas & CRM Clients',
      summary: 'Gestion des devis proforma, factures normalisées béninoises, livraisons et suivi des créances.',
      features: [
        { name: 'Devis & Factures Proforma', desc: 'Édition de devis avec conditions de règlement et délais de validité ; suivi des statuts (Brouillon, Envoyé, Accepté, Refusé).' },
        { name: 'Conversion 1-Clic en Facture', desc: 'Validation transformant immédiatement la proforma en vente définitive avec sortie automatique des stocks et imputation comptable.' },
        { name: 'Facturation A4 aux Normes Béninoises', desc: 'Document officiel avec IFU, NPI, mentions légales, tableau complet des articles, montant en toutes lettres, signature et cachet.' },
        { name: 'Suivi des Ventes à Crédit & Règlements', desc: 'Gestion des acomptes et règlements différés, alertes de dépassement de plafond de crédit et suivi du reste à payer.' },
        { name: 'CRM & Fichier Clients', desc: 'Fiches clients détaillées avec historique d\'achats, solvabilité, coordonnées WhatsApp et taux de recouvrement.' }
      ]
    },
    {
      id: 'stock',
      num: 8,
      badge: 'Stocks & Intrants',
      title: 'Gestion des Stocks & Intrants (Double Inventaire)',
      summary: 'Maîtrise complète des flux physiques : produits finis et matières premières valorisés au CUMP.',
      features: [
        { name: 'Double Inventaire Produits Finis vs Intrants', desc: 'Gestion séparée des produits prêts à la vente et des emballages vierges (bocaux en verre, capsules, étiquettes, cartons, sucre de canne, bouteilles).' },
        { name: 'Valorisation Permanente au CUMP', desc: 'Calcul automatique du Coût Unitaire Moyen Pondéré et valorisation patrimoniale globale ventilée par secteur.' },
        { name: 'Journal Exhaustif des Mouvements', desc: 'Traçabilité intégrale : entrées achats, entrées production, sorties ventes automatiques, pertes/avaries et retours clients.' },
        { name: 'Alertes & Inventaire Physique', desc: 'Seuils minimaux d\'alerte, fiches de comptage physique périodique et régularisation immédiate des écarts d\'inventaire.' }
      ]
    },
    {
      id: 'finances',
      num: 9,
      badge: 'Comptabilité OHADA',
      title: 'Comptabilité Générale SYSCOHADA & Trésorerie',
      summary: 'Système comptable complet conforme au SYSCOHADA Révisé avec écriture en partie double et soldes intermédiaires.',
      features: [
        { name: 'Plan Comptable Adapté (Classes 1 à 8)', desc: 'Comptes spécifiques aux activités agro-apicoles, artisanales et hôtelières (classes 1 à 8).' },
        { name: 'Livre-Journal Général Automatisé', desc: 'Génération automatique des écritures équilibrées lors des ventes, achats et règlements, avec saisie libre d\'Opérations Diverses (OD).' },
        { name: 'Grand Livre & Balance Générale', desc: 'Consultation détaillée des comptes et balance à 6 colonnes téléchargeable ou imprimable.' },
        { name: 'Soldes Intermédiaires de Gestion (SIG)', desc: 'Calcul automatique de la Marge Brute, Valeur Ajoutée, EBE, Résultat d\'Exploitation et Résultat Net par secteur.' },
        { name: 'Rapprochement de Trésorerie', desc: 'Suivi individualisé des comptes (Caisse 5711, Mobile Money 5714, Banque 5211) et contrôle des soldes réels.' },
        { name: 'Balance Âgée des Créances Clients', desc: 'Ventilation des créances par tranche (0-30j, 31-60j, 61-90j, >90j) pour optimiser les encaissements.' }
      ]
    },
    {
      id: 'admin',
      num: 10,
      badge: 'Sécurité & Référentiels',
      title: 'Utilisateurs, Sécurité & Configuration des Listes',
      summary: 'Contrôle d\'accès par rôles (Admin, Gérant, Caissier, Apiculteur, Comptable) et personnalisation des référentiels.',
      features: [
        { name: 'Gestion des Profils & Codes PIN', desc: 'Attribution des droits selon les prérogatives métier et verrouillage sécurisé des fonctions sensibles.' },
        { name: 'Mode Visiteur Sécurisé', desc: 'Verrouillage automatique en lecture seule pour protéger les données financières des regards non autorisés.' },
        { name: 'Journal d\'Audit des Opérations', desc: 'Traçabilité des suppressions, annulations de ventes et ajustements de stock.' },
        { name: 'Personnalisation des Référentiels Métier', desc: 'Ajout dynamique sans code d\'emplacements de ruchers, apiculteurs, parfums de jus, mélanges de thés et transporteurs.' }
      ]
    }
  ];

  // Render Each Chapter on a Dedicated/Structured Page Flow
  chapters.forEach(chap => {
    doc.addPage();
    cursorY = 22;
    drawRunningHeader();

    // Chapter Header Banner
    doc.setFillColor(16, 48, 29); // dark green
    doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(245, 158, 11); // gold
    doc.text(`MODULE ${chap.num} • ${chap.badge.toUpperCase()}`, margin + 4, cursorY + 5.5);

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(chap.title, margin + 4, cursorY + 10.5);

    cursorY += 19;

    // Summary box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cursorY, contentWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const sumLines = doc.splitTextToSize(chap.summary, contentWidth - 8);
    doc.text(sumLines, margin + 4, cursorY + 5);

    cursorY += 17;

    // Features detailed list
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 48, 29);
    doc.text('FONCTIONNALITÉS CLÉS DU MODULE :', margin, cursorY);
    cursorY += 5;

    chap.features.forEach((feat, fIdx) => {
      checkPageBreak(22);

      // Card for feature
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);

      const titleText = `${fIdx + 1}. ${feat.name}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 118, 110); // teal-700
      const splitTitle = doc.splitTextToSize(titleText, contentWidth - 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const splitDesc = doc.splitTextToSize(feat.desc, contentWidth - 8);

      const cardHeight = splitTitle.length * 4.5 + splitDesc.length * 4 + 7;
      doc.roundedRect(margin, cursorY, contentWidth, cardHeight, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 118, 110);
      doc.text(splitTitle, margin + 4, cursorY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(splitDesc, margin + 4, cursorY + 5 + splitTitle.length * 4.5);

      cursorY += cardHeight + 3;
    });

    // Workflows if present
    if (chap.workflows && chap.workflows.length > 0) {
      checkPageBreak(18);
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(margin, cursorY, contentWidth, 14, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(6, 95, 70);
      doc.text('FLUX OPÉRATIONNEL INTÉGRÉ :', margin + 4, cursorY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(4, 120, 87);
      doc.text(chap.workflows[0], margin + 4, cursorY + 9.5);

      cursorY += 17;
    }
  });

  // Final Page: Workflows, Step-by-Step & Certification
  doc.addPage();
  cursorY = 22;
  drawRunningHeader();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 48, 29);
  doc.text('GUIDE PRATIQUE DES OPÉRATIONS FRÉQUENTES', margin, cursorY);
  cursorY += 7;

  const quickGuides = [
    {
      title: 'Opération 1 : Enregistrer une vente en caisse POS',
      steps: '1. Ouvrir la session de caisse avec le fond de roulement en espèces.\n2. Sélectionner les produits dans la grille ou cliquer sur "+ Article Libre" pour une prestation.\n3. Choisir le mode de paiement (Espèces avec rendu calculé, Mobile Money MTN/Moov, Carte, Crédit).\n4. Valider l\'encaissement : le stock est décrémenté et l\'écriture comptable SYSCOHADA est enregistrée.'
    },
    {
      title: 'Opération 2 : Traiter une facture proforma B2B et la convertir',
      steps: '1. Créer le devis proforma avec les conditions de paiement et l\'échéance.\n2. Dès validation par le client, cliquer sur "Valider & Convertir en Facture Définitive".\n3. La commande est créée, les stocks sont déduits et le compte client 411 est débité.'
    },
    {
      title: 'Opération 3 : Clôturer la caisse et éditer le Rapport Z',
      steps: '1. Cliquer sur l\'indicateur de caisse active dans le module POS.\n2. Compter physiquement les billets et pièces et saisir le montant dans "Montant réel compté".\n3. Vérifier l\'écart automatique (parfait, excédent ou manquant).\n4. Valider la clôture : le Rapport Z officiel est généré et archivé.'
    }
  ];

  quickGuides.forEach(q => {
    checkPageBreak(28);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(q.title, margin + 4, cursorY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const stepLines = doc.splitTextToSize(q.steps, contentWidth - 8);
    doc.text(stepLines, margin + 4, cursorY + 11);

    cursorY += 27;
  });

  // Official Stamp & Signature Block
  cursorY += 5;
  checkPageBreak(44);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, cursorY, contentWidth, 40, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9);
  doc.text('ATTESTATION DE CONFORMITÉ & SIGNATURE OFFICIELLE', margin + 6, cursorY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Le présent manuel a été généré de manière certifiée pour l\'ERP « LES TRIANGLES • YAMTAANU ».', margin + 6, cursorY + 13);
  doc.text('Ets LES TRIANGLES AGROBUSINESS • BP 662 Parakou • Tél : 96285420 • Bénin.', margin + 6, cursorY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 48, 29);
  doc.text('• Direction : DG SARKI Yantannou', margin + 6, cursorY + 25);
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('• Montage technique : Thomas Orou Yorou (thomasorouyorou@gmail.com)', margin + 6, cursorY + 31);

  if (stampDataUrl) {
    doc.addImage(stampDataUrl, 'PNG', margin + contentWidth - 48, cursorY + 3, 44, 31);
  }

  // Apply running footers with total pages to all pages
  drawRunningFooters();

  // Trigger browser download of genuine PDF binary
  doc.save('Manuel_Fonctionnalites_LES_TRIANGLES_YAMTAANU.pdf');
}
