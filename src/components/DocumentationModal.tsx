import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Printer, 
  Download, 
  CheckCircle2, 
  MapPin, 
  Droplet, 
  Coffee, 
  Home, 
  ShoppingBag, 
  Boxes, 
  Calculator, 
  ShieldCheck, 
  Tv, 
  Sparkles, 
  ArrowRight, 
  ChevronRight,
  HelpCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { generateDocumentationPdf } from '../utils/documentationPdfGenerator';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DocChapter {
  id: string;
  title: string;
  icon: any;
  color: string;
  badge: string;
  summary: string;
  features: { name: string; desc: string }[];
  workflows?: string[];
  tips?: string[];
}

export default function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
  const [activeChapterId, setActiveChapterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      // Small timeout to let the UI update spinner
      setTimeout(() => {
        generateDocumentationPdf();
        setIsGeneratingPdf(false);
      }, 100);
    } catch (err) {
      console.error('Erreur lors de la génération du PDF :', err);
      setIsGeneratingPdf(false);
      alert('Une erreur est survenue lors de la génération du PDF. Vous pouvez également utiliser l\'option Imprimer A4 / Enregistrer en PDF.');
    }
  };

  const chapters: DocChapter[] = useMemo(() => [
    {
      id: 'overview',
      title: 'Espace Général & Tableau de Bord Exécutif',
      icon: Tv,
      color: 'text-brand-green-600',
      badge: 'Pilotage Global',
      summary: 'Tour de contrôle de l\'ensemble du domaine Les Triangles • Yamtaanu avec consolidation en temps réel des indicateurs clés.',
      features: [
        { name: 'KPIs Consolidés en Temps Réel', desc: 'Chiffre d\'affaires global cumulé (ventes comptoir + B2B + hôtellerie/conférences), ruches actives, taux d\'occupation de l\'éco-lodge, valorisation financière totale des stocks.' },
        { name: 'Graphiques de Performance Multi-Filières', desc: 'Répartition analytique du CA par filière (Miel, Jus, Thé, Éco-Lodge, Conférences) et évolution mensuelle.' },
        { name: 'Panneau des Alertes d\'Exploitation', desc: 'Signalement immédiat des ruptures de stock, anomalies sanitaires sur les ruches et retards d\'échéances clients.' },
        { name: 'Raccourcis Opérationnels', desc: 'Accès rapide en 1 clic pour démarrer une vente POS, inspecter un rucher ou enregistrer une réservation.' }
      ],
      tips: [
        'Consultez ce tableau de bord au démarrage de chaque journée pour prioriser les récoltes et les réapprovisionnements.'
      ]
    },
    {
      id: 'apiculture',
      title: 'Ruchers & Suivi Apicole (Bambou & Ruches)',
      icon: MapPin,
      color: 'text-amber-500',
      badge: 'Production Apicole',
      summary: 'Suivi de la chaîne apicole depuis la fabrication artisanale des ruches en bambou jusqu\'aux récoltes de miel brut en brousse.',
      features: [
        { name: 'Atelier Bambou & Préformes', desc: 'Suivi de la fabrication locale de ruches écologiques en tiges de bambou, coûts unitaires de confection et affectation aux ruchers.' },
        { name: 'Registre Cartographique des Ruches', desc: 'Fiches détaillées par ruche (modèles Kényanes, Dadant, Langstroth, Bambou), coordonnées GPS, localisation des ruchers (Komiguéa, etc.) et statuts de colonisation.' },
        { name: 'Inspections Sanitaires Périodiques', desc: 'Suivi de la santé de la colonie, contrôle de la reine, ponte, taux de varroa, agressivité et réserves de miel.' },
        { name: 'Campagnes de Récolte de Miel Brut', desc: 'Pesées précises en kg par ruche et rucher, identification de la flore dominante (acacia, néré, karité) et transfert automatique vers la miellerie.' }
      ],
      workflows: [
        'Fabrication ruche bambou ➔ Installation au rucher ➔ Inspections sanitaires régulières ➔ Pesée de récolte brute ➔ Transfert en cuve'
      ]
    },
    {
      id: 'transformation',
      title: 'Miellerie, Lots & Traçabilité QR Code',
      icon: Droplet,
      color: 'text-amber-600',
      badge: 'Traçabilité & Qualité',
      summary: 'Extraction douce à froid, décantation en maturateurs et génération de QR Codes garantissant l\'authenticité auprès du client final.',
      features: [
        { name: 'Cuves de Décantation & Maturateurs', desc: 'Gestion des volumes de miel brut, contrôle de l\'humidité au réfractomètre (<18-19%) et clarification naturelle sans surchauffe.' },
        { name: 'Conditionnement & Numérotation de Lots', desc: 'Création des lots de mise en pot (250g, 500g, 1kg) raccordés à la récolte d\'origine et au rucher source.' },
        { name: 'Générateur de QR Codes & Étiquettes A4', desc: 'Studio intégré pour générer et imprimer des planches d\'étiquettes avec QR Code haute résolution prêt à coller.' },
        { name: 'Certificat Numérique Public d\'Origine', desc: 'Fiche publique responsive scannée par le client : apiculteur référent, village d\'origine, tampon officiel Yamtaanu et téléchargement PDF du certificat.' }
      ]
    },
    {
      id: 'beverages',
      title: 'Atelier Agroalimentaire (Jus & Thés)',
      icon: Coffee,
      color: 'text-teal-650',
      badge: 'Transformation Locale',
      summary: 'Production artisanale et pasteurisation de jus naturels et conditionnement d\'infusions médicinales et bien-être.',
      features: [
        { name: 'Jus & Nectars Naturels', desc: 'Recettes de baobab sauvage, mangue, ananas, gingembre et cocktails ; suivi des lots de pasteurisation et calcul du coût unitaire.' },
        { name: 'Atelier Tisanes & Infusions', desc: 'Assemblage de plantes médicinales locales (kinkeliba, moringa, citronnelle, hibiscus) et conditionnement en sachets ou boîtes.' },
        { name: 'Synchronisation Automatique des Stocks', desc: 'Décrémentation immédiate des intrants (bouteilles, étiquettes, sucre) et ajout des bouteilles prêtes en stock de vente.' }
      ]
    },
    {
      id: 'hotel',
      title: 'Éco-Lodge & Centre de Conférences',
      icon: Home,
      color: 'text-indigo-600',
      badge: 'Hôtellerie & Événements',
      summary: 'Accueil éco-touristique en bungalows traditionnels et organisation de séminaires institutionnels à Komiguéa.',
      features: [
        { name: 'Gestion des Bungalows & Chambres', desc: 'Statut en direct (libre, occupé, nettoyage, maintenance), commodités, tarifs par nuitée et suppléments dégustation.' },
        { name: 'Planning des Réservations Hôtelières', desc: 'Enregistrement des check-in/check-out, coordonnées des hôtes, calcul automatique de la durée et du séjour global.' },
        { name: 'Salle de Conférences & Séminaires', desc: 'Planning de réservation par demi-journée/journée, gestion des équipements (vidéoprojecteur, sonorisation) et pauses-café bio.' },
        { name: 'Facturation Combinée', desc: 'Émission d\'une facture unique regroupant séjour, restauration, achats boutique et location de salle.' }
      ]
    },
    {
      id: 'pos',
      title: 'Caisse & Ventes au Comptoir (POS Tactile)',
      icon: ShoppingBag,
      color: 'text-amber-500',
      badge: 'Terminal Point de Vente',
      summary: 'Interface de vente ultra-fluide pour boutique et stands avec multi-paiement, article libre et gestion des sessions.',
      features: [
        { name: 'Catalogue Visuel & Recherche Rapide', desc: 'Grille tactile avec stock disponible en temps réel, filtres par filière et recherche par nom.' },
        { name: 'Bouton « + Article Libre »', desc: 'Ajout direct de prestations ou produits hors catalogue (ex: formule sur-mesure, location, atelier) avec mémorisation optionnelle au catalogue.' },
        { name: 'Gestion des Remises & Taxes', desc: 'Remises commerciales en % ou montant fixe, calcul dynamique du net à payer et récapitulatif clair.' },
        { name: 'Paiements Multi-Modes', desc: 'Espèces avec calcul automatique du rendu de monnaie, Mobile Money (MTN MoMo, Moov, Wave, Celtiis), Carte bancaire et Ventes à crédit.' },
        { name: 'Gestion de Session & Rapport Z', desc: 'Ouverture avec fond de caisse, suivi des encaissements en direct, comptage physique lors de la clôture et calcul d\'écart de caisse.' }
      ]
    },
    {
      id: 'sales_b2b',
      title: 'Facturation B2B, Proformas & Clients (CRM)',
      icon: FileText,
      color: 'text-blue-600',
      badge: 'Commerce & Grands Comptes',
      summary: 'Gestion des devis proforma, conversion 1-clic en facture officielle A4/PDF, bons de livraison et encaissement des créances.',
      features: [
        { name: 'Devis & Factures Proforma', desc: 'Édition de proformas détaillées avec conditions de paiement et délais de validité ; suivi des statuts (Brouillon, Envoyé, Accepté).' },
        { name: 'Conversion 1-Clic en Facture', desc: 'Validation immédiate transformant la proforma en vente définitive avec sortie de stock et écriture comptable.' },
        { name: 'Facture A4 aux Normes Béninoises', desc: 'Document officiel avec IFU, NPI, mentions légales, tableau complet des articles, montant en lettres et cachet.' },
        { name: 'Suivi des Ventes à Crédit', desc: 'Enregistrement des règlements partiels ou totaux, alertes de dépassement de plafond de crédit et suivi du solde dû.' },
        { name: 'Fichier Clients (CRM)', desc: 'Historique d\'achats, solvabilité, coordonnées de livraison et taux de recouvrement par client.' }
      ]
    },
    {
      id: 'stock',
      title: 'Gestion des Stocks & Intrants (Double Inventaire)',
      icon: Boxes,
      color: 'text-amber-600',
      badge: 'Stocks & Approvisionnements',
      summary: 'Maîtrise complète des flux physiques : produits finis et emballages/matières premières avec valorisation au CUMP.',
      features: [
        { name: 'Double Inventaire Produits Finis vs Intrants', desc: 'Gestion séparée mais coordonnée des pots/bouteilles finis et des emballages vierges (pots, capsules, étiquettes, cartons, sucre).' },
        { name: 'Valorisation Permanente au CUMP', desc: 'Calcul dynamique du Coût Unitaire Moyen Pondéré et valorisation patrimoniale globale par secteur.' },
        { name: 'Journal Exhaustif des Mouvements', desc: 'Traçabilité intégrale : entrées achats, entrées production, sorties ventes automatiques, pertes/avaries et retours clients.' },
        { name: 'Alertes & Inventaire Physique', desc: 'Seuils minimaux d\'alerte, fiches de comptage physique et régularisation immédiate des écarts d\'inventaire.' }
      ]
    },
    {
      id: 'finances',
      title: 'Comptabilité Générale SYSCOHADA & Trésorerie',
      icon: Calculator,
      color: 'text-emerald-700',
      badge: 'Finance & Normes OHADA',
      summary: 'Système comptable complet conforme au SYSCOHADA Révisé avec écriture en partie double et soldes intermédiaires de gestion.',
      features: [
        { name: 'Plan Comptable Adapté (Classes 1 à 8)', desc: 'Comptes spécifiques aux activités agro-apicoles, artisanales et hôtelières (classes 1 à 8).' },
        { name: 'Livre-Journal Automatisé', desc: 'Génération automatique des écritures équilibrées lors des ventes, achats et règlements, plus saisie libre d\'Opérations Diverses.' },
        { name: 'Grand Livre & Balance Générale', desc: 'Consultation des soldes et balance à 6 colonnes téléchargeable ou imprimable.' },
        { name: 'Soldes Intermédiaires de Gestion (SIG)', desc: 'Calcul automatique de la Marge Brute, Valeur Ajoutée, EBE, Résultat d\'Exploitation et Résultat Net par secteur.' },
        { name: 'Rapprochement de Trésorerie', desc: 'Suivi multi-caisses (Caisse 5711, Mobile Money 5714, Banque 5211) et contrôle des soldes réels.' },
        { name: 'Balance Âgée des Créances Clients', desc: 'Ventilation des impayés par tranches (0-30j, 31-60j, 61-90j, >90j) pour accélérer les recouvrements.' }
      ]
    },
    {
      id: 'admin',
      title: 'Utilisateurs, Sécurité & Configuration des Listes',
      icon: ShieldCheck,
      color: 'text-violet-600',
      badge: 'Administration & Rôles',
      summary: 'Contrôle d\'accès par rôles (Admin, Gérant, Caissier, Apiculteur, Comptable) et personnalisation des référentiels.',
      features: [
        { name: 'Gestion des Profils & Codes PIN', desc: 'Attribution de droits selon les prérogatives métier et verrouillage sécurisé des fonctions sensibles.' },
        { name: 'Journal d\'Audit des Opérations', desc: 'Traçabilité des suppressions, annulations de ventes et ajustements de stock.' },
        { name: 'Personnalisation des Référentiels Métier', desc: 'Ajout dynamique d\'emplacements de ruchers, d\'apiculteurs, de parfums de jus, de mélanges de thés et de transporteurs.' }
      ]
    }
  ], []);

  const filteredChapters = useMemo(() => {
    return chapters.filter(chap => {
      const matchesChapter = activeChapterId === 'all' || chap.id === activeChapterId;
      if (!matchesChapter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = chap.title.toLowerCase().includes(q);
      const matchSummary = chap.summary.toLowerCase().includes(q);
      const matchFeatures = chap.features.some(f => f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));
      return matchTitle || matchSummary || matchFeatures;
    });
  }, [chapters, activeChapterId, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      {/* Printable CSS style sheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-documentation, #printable-documentation * {
            visibility: visible !important;
          }
          #printable-documentation {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Manuel Officiel des Fonctionnalités
                </h2>
                <span className="text-[10px] uppercase font-black tracking-widest bg-brand-gold-500/20 text-brand-gold-400 px-2 py-0.5 rounded-md border border-brand-gold-500/30">
                  ERP v2.6
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Concepteur &amp; Architecte Système : <strong className="text-slate-200">DG SARKI Yantannou</strong> • Document rédigé par : <strong className="text-slate-200">Thomas Orou Yorou</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-brand-gold-500 to-amber-500 hover:from-brand-gold-400 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              title="Télécharger directement le manuel officiel au format PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Génération PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-950" />
                  <span className="whitespace-nowrap">Télécharger en PDF</span>
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold hidden sm:flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Imprimer ce guide au format A4 ou enregistrer en PDF via votre imprimante"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>Imprimer A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 shrink-0 space-y-3 no-print">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher une fonctionnalité (ex: article libre, QR code, SYSCOHADA, proforma, stock, rapport Z)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-brand-gold-500"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Module Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-medium scrollbar-thin">
            <button
              onClick={() => setActiveChapterId('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${
                activeChapterId === 'all'
                  ? 'bg-brand-gold-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-750'
              }`}
            >
              Tous les Modules ({chapters.length})
            </button>
            {chapters.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChapterId(ch.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeChapterId === ch.id
                    ? 'bg-brand-gold-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-750'
                }`}
              >
                <ch.icon className="w-3.5 h-3.5" />
                <span>{ch.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MODAL BODY (CONTENT & PRINTABLE TARGET) */}
        <div id="printable-documentation" className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs font-sans">
          
          {/* Printable Watermark & Header for Physical Printing */}
          <div className="hidden print:block border-b-2 border-amber-800 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-amber-950 tracking-tight">LES TRIANGLES • YAMTAANU</h1>
                <p className="text-xs text-slate-600 font-semibold uppercase">Système Intégré de Gestion Agro-Écologique &amp; Commerciale</p>
                <p className="text-[10px] text-slate-500">Komiguéa (Parakou) • République du Bénin</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono text-amber-900 block">MANUEL DE RÉFÉRENCE 2026</span>
                <span className="text-[10px] text-slate-500 block">Documentation Exhaustive des Modules</span>
              </div>
            </div>
          </div>

          {filteredChapters.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-500" />
              <p className="text-sm font-semibold">Aucune fonctionnalité trouvée pour « {searchQuery} »</p>
              <p className="text-xs text-slate-500">Essayez un autre mot-clé comme <em>miel, facture, caisse, stock ou SYSCOHADA</em>.</p>
            </div>
          ) : (
            filteredChapters.map((chap, idx) => {
              const Icon = chap.icon;
              return (
                <div 
                  key={chap.id}
                  className="bg-slate-850/90 border border-slate-750 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm print:bg-white print:border-slate-300 print:text-black print:p-0 print:mb-8 print:break-inside-avoid"
                >
                  {/* Chapter Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3 print:border-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 print:border-slate-300 print:bg-slate-100">
                        <Icon className={`w-5 h-5 ${chap.color} print:text-black`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold-400 bg-brand-gold-500/10 px-2 py-0.5 rounded-md border border-brand-gold-500/20 print:border-slate-400 print:text-slate-800">
                            Module {idx + 1} • {chap.badge}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white mt-1 print:text-black">
                          {chap.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed print:text-slate-700">
                    {chap.summary}
                  </p>

                  {/* Key Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {chap.features.map((feat, fIdx) => (
                      <div 
                        key={fIdx}
                        className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5 print:bg-slate-50 print:border-slate-200"
                      >
                        <h4 className="text-xs font-bold text-teal-300 flex items-center gap-2 print:text-teal-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{feat.name}</span>
                        </h4>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed print:text-slate-700">
                          {feat.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Workflow / Steps if any */}
                  {chap.workflows && chap.workflows.length > 0 && (
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-[11px] text-emerald-300 print:bg-emerald-50 print:border-emerald-200 print:text-emerald-950 space-y-1">
                      <span className="font-bold uppercase tracking-wider block text-[9.5px]">Flux Opérationnel Intégré :</span>
                      {chap.workflows.map((wf, wIdx) => (
                        <p key={wIdx} className="font-mono text-xs">{wf}</p>
                      ))}
                    </div>
                  )}

                  {/* Tips if any */}
                  {chap.tips && chap.tips.length > 0 && (
                    <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 print:bg-amber-50 print:border-amber-200 print:text-amber-950 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        {chap.tips.map((t, tIdx) => (
                          <p key={tIdx}>{t}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* FOOTER ACTIONS */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs no-print">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-gold-400 shrink-0" />
              <span>Document officiel source : <strong>MANUEL_UTILISATION_FONCTIONNALITES.md</strong></span>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                title="Imprimer ou enregistrer via la boîte de dialogue d'impression du navigateur"
              >
                <Printer className="w-4 h-4 text-teal-400" />
                <span>Imprimer A4</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2.5 bg-gradient-to-r from-brand-gold-500 to-amber-500 hover:from-brand-gold-400 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Télécharger le Guide Complet (.PDF)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
