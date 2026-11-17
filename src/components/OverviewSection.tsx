import React, { useState } from 'react';
import { BambouMielStore } from '../dataStore';
import yamtaanuBrandLogo from '../assets/images/yamtaanu_official_logo_1790957647714.jpg';
import { 
  Tv, 
  TrendingUp, 
  Sparkles, 
  Database, 
  Home, 
  AlertTriangle, 
  CircleDollarSign, 
  ArrowUpRight, 
  Plus, 
  CheckCircle,
  FileText,
  Droplet,
  Layers,
  Search,
  Coffee,
  ShoppingBag,
  Boxes,
  Lock,
  KeyRound,
  Printer
} from 'lucide-react';
import { generateAllDataReportPdf } from '../utils/allDataPdfGenerator';

interface OverviewSectionProps {
  store: BambouMielStore;
  onNavigate: (tabId: string) => void;
  onRefresh: () => void;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
}

export default function OverviewSection({ 
  store, 
  onNavigate, 
  onRefresh, 
  isAuthenticated = true, 
  onRequireAuth 
}: OverviewSectionProps) {
  const [activeSubView, setActiveSubView] = useState<'dashboard' | 'stocks'>('dashboard');
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDiv, setExpenseDiv] = useState<'miel' | 'jus' | 'the' | 'hotel' | 'general'>('miel');
  const [expenseCat, setExpenseCat] = useState('Apiculture & Suivi');

  // Calculates totals
  const totalHives = store.hives.filter(h => h.status === 'actif').length;
  const bambooInProduction = store.preforms.filter(p => p.status === 'en_cours').length;
  const occupiedRooms = store.rooms.filter(r => r.status === 'occupe').length;
  const cleanRooms = store.rooms.filter(r => r.status === 'en_nettoyage').length;

  const totalSales = store.orders.reduce((sum, o) => sum + (o.status !== 'retourne' ? o.totalAmount : 0), 0);
  const totalHotelBilled = store.bookings.reduce((sum, b) => b.status === 'en_cours' || b.status === 'termine' ? sum + b.totalBilled : sum, 0);
  const totalConfBilled = store.conferenceBookings.reduce((sum, cb) => cb.status === 'en_cours' || cb.status === 'termine' ? sum + cb.totalBilled : sum, 0);
  const totalRevenue = totalSales + totalHotelBilled + totalConfBilled;

  const totalSpent = store.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netEarnings = totalRevenue - totalSpent;

  // Active alarms
  const highHumidityInspections = store.inspections.filter(
    i => i.humidityLevelPercent > 19.0
  );
  
  const alertList = [
    ...highHumidityInspections.map(i => ({
      id: `H-${i.id}`,
      type: 'warning',
      text: `Humidité élevée (${i.humidityLevelPercent}%) sur la ruche ${store.hives.find(h => h.id === i.hiveId)?.code} ! Risque de fermentation du miel.`,
      action: 'Vérifier la ruche'
    })),
    ...store.rooms.filter(r => r.status === 'en_nettoyage').map(r => ({
      id: `R-${r.id}`,
      type: 'info',
      text: `L'éco-lodge "${r.number}" est en attente de nettoyage pour les prochains voyageurs.`,
      action: 'Nettoyer'
    })),
    ...store.orders.filter(o => o.status === 'en_attente').map(o => ({
      id: `O-${o.id}`,
      type: 'order',
      text: `Nouvelle commande de ${o.clientName} en attente de préparation (${o.totalAmount.toLocaleString()} FCFA).`,
      action: 'Préparer commande'
    }))
  ];

  const handleAddQuickExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount) return;
    store.addExpense({
      date: new Date().toISOString().split('T')[0],
      description: expenseDesc,
      amount: parseFloat(expenseAmount),
      category: expenseCat as any,
      division: expenseDiv
    });
    setExpenseDesc('');
    setExpenseAmount('');
    setShowQuickExpense(false);
    onRefresh();
  };

  // Division-specific stats
  const honeySales = store.orders.reduce((sum, o) => {
    let honeySum = 0;
    o.items.forEach(item => {
      const prod = store.products.find(p => p.id === item.productId);
      if (prod && prod.category === 'miel') {
        honeySum += item.quantity * item.price;
      }
    });
    return sum + honeySum;
  }, 0);

  const drinksSales = store.orders.reduce((sum, o) => {
    let drinkSum = 0;
    o.items.forEach(item => {
      const prod = store.products.find(p => p.id === item.productId);
      if (prod && (prod.category === 'jus' || prod.category === 'the')) {
        drinkSum += item.quantity * item.price;
      }
    });
    return sum + drinkSum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Statement */}
      <div className="bg-radial from-brand-green-800 to-brand-green-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-brand-gold-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-32 bg-white rounded-full opacity-5 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative shrink-0 w-24 h-16 sm:w-28 sm:h-20 rounded-2xl bg-[#1c184e] p-1 border-2 border-amber-400/40 shadow-xl overflow-hidden flex items-center justify-center">
              <img 
                src={yamtaanuBrandLogo} 
                alt="Marque Yamtãanu" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-brand-gold-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Marque Yamtãanu • Passion pour la nature depuis 1990
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight leading-none text-white">
                Yamtãanu
              </h1>
              <p className="text-xs sm:text-sm text-brand-green-100/90 max-w-xl">
                Complexe Agro-Écologique LES TRIANGLES (Komiguéa, Bénin) — Traçabilité apicole intégrale, miellerie d'excellence, boissons naturelles & éco-tourisme.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('miel_inspections')}
              className="px-4 py-2 bg-brand-gold-500 hover:bg-brand-gold-600 transition-colors text-brand-green-900 font-semibold rounded-xl text-sm shadow-md shadow-black/10 flex items-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4" /> Traçabilité des Lots
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated && onRequireAuth) {
                  onRequireAuth();
                } else {
                  setShowQuickExpense(true);
                }
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-white font-medium rounded-xl text-sm border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Dépense</span>
              {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-amber-400 ml-1" title="Authentification requise pour ajouter une dépense" />}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated && onRequireAuth) {
                  onRequireAuth();
                } else {
                  void generateAllDataReportPdf(store);
                }
              }}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/35 transition-colors text-emerald-100 font-semibold rounded-xl text-sm border border-emerald-400/40 flex items-center gap-2 cursor-pointer"
              title="Exporter toutes les données saisies dans l'application en dossier papier PDF (A4)"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>Dossier Papier (PDF)</span>
              {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-amber-400 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* VISITOR MODE NOTICE BANNER */}
      {!isAuthenticated && (() => {
        const isPersonalDevUrl = typeof window !== 'undefined' && (
          window.location.hostname.startsWith('ais-dev-') ||
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'
        );
        return (
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-emerald-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-800 space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-extrabold text-amber-950 font-display">
                      Vous êtes actuellement en Mode Visiteur (Espace Général)
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                      Accès Verrouillé
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed max-w-2xl">
                    Pour des raisons de confidentialité et de sécurité, les autres compartiments (<strong>Producteurs &amp; Récoltes</strong>, <strong>Miellerie</strong>, <strong>Atelier Jus &amp; Thés</strong>, <strong>Éco-Lodge</strong>, <strong>Caisse POS</strong>, <strong>Stocks</strong>, <strong>Comptabilité SYSCOHADA</strong>, <strong>👥 Utilisateurs</strong>) nécessitent une connexion personnelle.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onRequireAuth && onRequireAuth()}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-slate-950" />
                  <span>Se connecter à l'ERP</span>
                </button>
              </div>
            </div>

            {isPersonalDevUrl ? (
              <div className="pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-amber-900 bg-amber-500/10 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:px-5 rounded-b-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-950">🔑 Espace Personnel Concepteur :</span>
                  <span>Accès admin initial :</span>
                  <button
                    type="button"
                    onClick={() => onRequireAuth && onRequireAuth()}
                    className="font-mono font-black text-amber-950 bg-amber-200 hover:bg-amber-300 px-2.5 py-0.5 rounded border border-amber-400 cursor-pointer transition-all shadow-2xs"
                  >
                    admin / yamtaanu
                  </button>
                </div>
                <div className="text-amber-800 text-[10.5px]">
                  Visible uniquement sur votre lien personnel de développement
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-amber-900 bg-amber-500/10 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:px-5 rounded-b-2xl">
                <span>
                  🔒 Accès strictement réservé aux collaborateurs autorisés. En cas d'oubli de votre code PIN, veuillez contacter votre Administrateur.
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-gray-200 gap-1 mt-2">
        <button
          onClick={() => setActiveSubView('dashboard')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubView === 'dashboard'
              ? 'border-brand-green-700 text-brand-green-800 bg-brand-green-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-750 hover:bg-gray-100/30'
          }`}
        >
          <Tv className="w-4 h-4" /> Tableau de Bord Général
        </button>
        <button
          onClick={() => {
            if (!isAuthenticated && onRequireAuth) {
              onRequireAuth();
            } else {
              setActiveSubView('stocks');
            }
          }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubView === 'stocks'
              ? 'border-brand-green-700 text-brand-green-800 bg-brand-green-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-750 hover:bg-gray-100/30'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Suivi Complet des Stocks ({store.products.reduce((sum, p) => sum + p.stock, 0) + Math.round(store.tanks.reduce((sum, t) => sum + t.currentWeightKg, 0))} kg/pces)</span>
          {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-amber-500 ml-1" title="Authentification requise" />}
        </button>
      </div>

      {activeSubView === 'dashboard' ? (
        <>
          {/* Main KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-brand-green-100/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ruches Actives</span>
                <div className="p-2 bg-amber-50 rounded-lg text-brand-gold-500">
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold font-mono text-gray-900">{totalHives}</span>
                <span className="text-xs text-gray-400 block mt-1">dans {store.hives.map(h => h.locationName).reduce((acc: string[], name) => acc.includes(name) ? acc : [...acc, name], []).length} ruchers forestiers</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xs border border-brand-green-100/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fabrications Bambou</span>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold font-mono text-gray-900">{bambooInProduction}</span>
                <span className="text-xs text-gray-400 block mt-1">préformes en tressage</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xs border border-brand-green-100/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hôtel Occupé</span>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Home className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold font-mono text-gray-900">{occupiedRooms} <span className="text-xs font-sans text-gray-500">/ {store.rooms.length}</span></span>
                <span className="text-xs text-gray-400 block mt-1">{cleanRooms} bungalow à nettoyer</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xs border border-brand-green-100/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trésorerie Nette</span>
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-bold font-mono ${netEarnings >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {netEarnings.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-xs text-gray-400 block mt-1">Entrées: {totalRevenue.toLocaleString()} FCFA | Dépenses: {totalSpent.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Main Grid Content - Columns layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Performance Dashboard & Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Custom Financial diagram */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-brand-green-100/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-gray-900">Activité & Flux par Segment</h3>
                    <p className="text-xs text-gray-500">Chiffre d'affaires brut généré par chaque pôle d'activité</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-brand-green-50 text-brand-green-700 rounded-full">En continu (2026)</span>
                </div>

                <div className="space-y-5">
                  {/* Product: Honey */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-gray-700">Miel de Bambou (Pots de verre)</span>
                      <span className="font-mono text-gray-900">{honeySales.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (honeySales / (totalRevenue || 1)) * 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Division: Ecolodge / Boutique */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-gray-700">Séjours éco-lodge & Soins bien-être</span>
                      <span className="font-mono text-gray-900">{totalHotelBilled.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalHotelBilled / (totalRevenue || 1)) * 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Product: Teas & Juices */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-gray-700">Herboristerie thés & Jus centrifugés</span>
                      <span className="font-mono text-gray-900">{drinksSales.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (drinksSales / (totalRevenue || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* General Circular Info block */}
                <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-3 text-center">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold tracking-wider">Ventes Totales</span>
                    <p className="text-base font-semibold text-gray-800 font-mono mt-0.5">{totalSales.toLocaleString()} FCFA</p>
                  </div>
                  <div className="border-x border-gray-100">
                    <span className="text-gray-400 text-[10px] uppercase font-semibold tracking-wider">Facturation Hôtel</span>
                    <p className="text-base font-semibold text-gray-800 font-mono mt-0.5">{totalHotelBilled.toLocaleString()} FCFA</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold tracking-wider">Frais Oper</span>
                    <p className="text-base font-semibold text-rose-600 font-mono mt-0.5">-{totalSpent.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-brand-green-100/30">
                <h3 className="font-display font-semibold text-base mb-4 text-gray-900">Actions d'Exploitation Rapides</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <button 
                    onClick={() => onNavigate('pos')}
                    className="p-3 bg-amber-50/70 hover:bg-amber-100/60 text-left rounded-xl transition-all border border-amber-200/80 group cursor-pointer shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-gray-900 block font-sans">Caisse POS</span>
                    <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">Vente tactile direct</span>
                  </button>

                  <button 
                    onClick={() => onNavigate('miel_ruches')}
                    className="p-3 bg-brand-green-50/50 hover:bg-brand-green-50 text-left rounded-xl transition-all border border-brand-green-100/30 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-green-600 text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 block font-sans">Nouvelle Ruche</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Installer préforme</span>
                  </button>

                  <button 
                    onClick={() => onNavigate('miel_ruches')}
                    className="p-3 bg-amber-50/50 hover:bg-amber-50 text-left rounded-xl transition-all border border-amber-100/30 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-gold-500 text-brand-green-900 flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 block font-sans">Suivi & Visite</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Noter inspection</span>
                  </button>

                  <button 
                    onClick={() => onNavigate('hotel')}
                    className="p-3 bg-blue-50/50 hover:bg-blue-50 text-left rounded-xl transition-all border border-blue-100/30 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                      <Home className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 block font-sans">Check-in Client</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Arrivée Éco-lodge</span>
                  </button>

                  <button 
                    onClick={() => onNavigate('finances')}
                    className="p-3 bg-purple-50/50 hover:bg-purple-50 text-left rounded-xl transition-all border border-purple-100/30 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 block font-sans">Facturation B2B</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Saisir commande</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Integrated Stream & Incidents */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-brand-green-100/30 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <span className="font-display font-semibold text-gray-900 text-base">Alertes & Flux Logistique</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold font-mono">
                    {alertList.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {alertList.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 space-y-2">
                      <CheckCircle className="w-8 h-8 mx-auto text-emerald-500" />
                      <p className="text-xs font-semibold">Aucun incident détecté</p>
                      <p className="text-[10px] text-gray-500">Toutes vos opérations sont nominales.</p>
                    </div>
                  ) : (
                    alertList.map(alert => (
                      <div 
                        key={alert.id} 
                        className={`p-3.5 rounded-xl text-xs border flex flex-col justify-between gap-2.5 ${
                          alert.type === 'warning' 
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
                            : alert.type === 'order' 
                            ? 'bg-purple-50/70 border-purple-200 text-purple-900' 
                            : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                        }`}
                      >
                        <div className="flex gap-2">
                          <AlertTriangle className={`w-4 h-4 shrink-0 col mt-0.5 ${alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                          <p className="leading-relaxed font-medium">{alert.text}</p>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (alert.type === 'warning' || alert.type === 'order') {
                                onNavigate(alert.type === 'warning' ? 'miel_ruches' : 'finances');
                              } else {
                                onNavigate('hotel');
                              }
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider text-brand-green-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            {alert.action} <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Summary of Stocks */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-2.5">Stocks critiques</span>
                  <div className="space-y-2">
                    {store.products.slice(0, 3).map(prod => (
                      <div key={prod.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 truncate max-w-[150px]">{prod.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded-full font-mono font-semibold text-[10px] ${prod.stock < 30 ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'}`}>
                            {prod.stock} unités
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary KPI of Stocks */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-250 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">1. Miel Brut Sauvage</span>
                <strong className="text-xl font-bold font-mono text-amber-950 block mt-1.5">
                  {store.harvests.reduce((sum, h) => sum + h.quantityKg, 0).toFixed(1)} kg
                </strong>
              </div>
              <span className="text-[10px] text-amber-700 block mt-2 font-medium">{store.harvests.length} lots traçables en miellerie</span>
            </div>
            
            <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-250 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">2. Miel Égoutté (Cuves)</span>
                <strong className="text-xl font-bold font-mono text-amber-950 block mt-1.5">
                  {store.tanks.reduce((sum, t) => sum + t.currentWeightKg, 0).toFixed(1)} kg
                </strong>
              </div>
              <span className="text-[10px] text-amber-850 block mt-2 font-medium">Réparti sur {store.tanks.filter(t => t.currentWeightKg > 0).length} cuve(s) actives</span>
            </div>

            <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">3. Miel Produit Fini</span>
                <strong className="text-xl font-bold font-mono text-emerald-950 block mt-1.5">
                  {store.products.filter(p => p.category === 'miel').reduce((sum, p) => sum + p.stock, 0)} pots
                </strong>
              </div>
              <span className="text-[10px] text-emerald-700 block mt-2 font-medium">Prêts à la vente en boutique</span>
            </div>

            <div className="bg-teal-50/40 p-4 rounded-2xl border border-teal-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">4. Boissons (Jus & Thés)</span>
                <strong className="text-xl font-bold font-mono text-teal-950 block mt-1.5">
                  {store.products.filter(p => p.category === 'jus' || p.category === 'the').reduce((sum, p) => sum + p.stock, 0)} pces
                </strong>
              </div>
              <span className="text-[10px] text-teal-700 block mt-2 font-medium">Sourcing frais Allada & Parakou</span>
            </div>
          </div>

          {/* Detailed inventory boards */}
          <div className="bg-white p-6 rounded-2xl border border-brand-green-100/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
              <div>
                <h3 className="font-display font-semibold text-gray-900 text-sm">Registre des Stocks d'Exploitation Yamtaanu</h3>
                <p className="text-xs text-gray-500">Mise à jour en temps réel selon les extractions, récoltes et ventes enregistrées</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('stock')}
                  className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0"
                >
                  <Boxes className="w-3.5 h-3.5" /> Gérer Stocks & Intrants (Dédié)
                </button>
                <button
                  onClick={() => onNavigate('config_lists')}
                  className="text-xs font-bold bg-violet-50 hover:bg-violet-100 text-violet-750 px-3.5 py-1.5 rounded-xl border border-violet-150 flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Catalogue Produits
                </button>
              </div>
            </div>

            {/* SECTION 1: MIEL BRUT */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <span className="text-lg">🪵</span>
                <h4 className="font-display font-bold text-xs text-gray-900">1. Pesées de Miel Brut de Brousse (Entrées avant filtration)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold text-[9px] uppercase tracking-wider border-b border-slate-150">
                      <th className="p-2.5">N° Lot</th>
                      <th className="p-2.5">Date Entrée</th>
                      <th className="p-2.5">Provenance Ruche</th>
                      <th className="p-2.5 text-center">Taux d'eau %</th>
                      <th className="p-2.5">Robe / Aspect</th>
                      <th className="p-2.5 text-center">Grade Qualité</th>
                      <th className="p-2.5 text-right">Poids Net (kg)</th>
                      <th className="p-2.5 text-right">État Filtration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {store.harvests.map(h => {
                      const hive = store.hives.find(x => x.id === h.hiveId);
                      return (
                        <tr key={h.id} className="hover:bg-slate-50/40">
                          <td className="p-2.5 font-mono font-bold text-gray-900">{h.id}</td>
                          <td className="p-2.5 font-medium">{h.date}</td>
                          <td className="p-2.5 font-mono font-bold text-brand-green-700">{hive?.code || 'N/A'} ({hive?.locationName})</td>
                          <td className="p-2.5 text-center font-mono font-semibold">{h.moisturePercent}%</td>
                          <td className="p-2.5 capitalize text-amber-700 font-medium">{h.honeyColor.replace('_', ' ')}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-1.5 py-0.5 bg-brand-gold-50 text-brand-gold-800 border border-brand-gold-200 rounded font-bold font-mono text-[9px]">
                              Grade {h.qualityGrade}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-gray-900">{h.quantityKg.toFixed(1)} kg</td>
                          <td className="p-2.5 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              h.status === 'extrait' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {h.status === 'extrait' ? 'Décanté / Extrait' : 'Brut Stocké'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: MIEL EGOUTTE EN CUVES */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <span className="text-lg">🍯</span>
                <h4 className="font-display font-bold text-xs text-gray-900">2. Suivi du Miel Égoutté en Cuves inox de Décantation</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {store.tanks.map(t => {
                  const fillPct = Math.min(100, Math.round((t.currentWeightKg / t.capacityKg) * 100));
                  return (
                    <div key={t.id} className="p-4 border border-gray-150 rounded-xl bg-slate-50/50">
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-gray-400 block">{t.id}</span>
                          <strong className="text-xs font-bold text-gray-900 block truncate">{t.name}</strong>
                        </div>
                        <span className="text-[10px] font-bold font-mono text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded">
                          {fillPct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2.5">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${fillPct}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-500">Miel Égoutté Contenu:</span>
                        <span className="font-mono font-bold text-gray-900">{t.currentWeightKg.toFixed(1)} kg / {t.capacityKg} kg</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: MIEL PRODUIT FINI */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <span className="text-lg">📦</span>
                <h4 className="font-display font-bold text-xs text-gray-900">3. Stockage de Miel Produit Fini (Conditionné en Pots de verre pour boutique)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold text-[9px] uppercase tracking-wider border-b border-slate-150">
                      <th className="p-2.5">Réf Article</th>
                      <th className="p-2.5">Nom de l'Article</th>
                      <th className="p-2.5">Format & Variété</th>
                      <th className="p-2.5 text-right">Prix Public (FCFA)</th>
                      <th className="p-2.5 text-center">Unités en Stock</th>
                      <th className="p-2.5 text-right">Statut Alerte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {store.products.filter(p => p.category === 'miel').map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/40">
                        <td className="p-2.5 font-mono text-gray-500">{p.id}</td>
                        <td className="p-2.5 font-bold text-gray-950">{p.name}</td>
                        <td className="p-2.5 text-gray-600 font-medium">{p.variant}</td>
                        <td className="p-2.5 font-mono text-right font-bold text-brand-green-800">{p.price.toLocaleString()} FCFA</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-mono font-bold inline-block text-xs ${
                            p.stock <= 15 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          }`}>
                            {p.stock} pots
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-semibold">
                          {p.stock <= 15 ? (
                            <span className="text-rose-600 text-[10px] uppercase font-bold animate-pulse">Stock Critique</span>
                          ) : (
                            <span className="text-emerald-600 text-[10px] uppercase font-bold">Disponible</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 4: BOISSONS JUS ET THES */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <span className="text-lg">🍹</span>
                <h4 className="font-display font-bold text-xs text-gray-900">4. Stocks de Boissons Artisanales (Atelier Jus pressés & Thés séchés)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold text-[9px] uppercase tracking-wider border-b border-slate-150">
                      <th className="p-2.5">Réf Article</th>
                      <th className="p-2.5">Nom de l'Article</th>
                      <th className="p-2.5">Pôle / Catégorie</th>
                      <th className="p-2.5">Conditionnement</th>
                      <th className="p-2.5 text-right font-mono">Prix Public (FCFA)</th>
                      <th className="p-2.5 text-center">Unités en Stock</th>
                      <th className="p-2.5 text-right">Statut Alerte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {store.products.filter(p => p.category === 'jus' || p.category === 'the').map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/40">
                        <td className="p-2.5 font-mono text-gray-500">{p.id}</td>
                        <td className="p-2.5 font-bold text-gray-950">{p.name}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            p.category === 'jus' ? 'bg-teal-100 text-teal-800' : 'bg-cyan-100 text-cyan-800'
                          }`}>
                            {p.category === 'jus' ? 'Jus frais' : 'Infusettes Thé'}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-600 font-medium">{p.variant}</td>
                        <td className="p-2.5 font-mono text-right font-bold text-brand-green-800">{p.price.toLocaleString()} FCFA</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-mono font-bold inline-block text-xs ${
                            p.stock <= 15 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-teal-50 text-teal-800 border border-teal-100'
                          }`}>
                            {p.stock} pces
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-semibold">
                          {p.stock <= 15 ? (
                            <span className="text-rose-600 text-[10px] uppercase font-bold animate-pulse">Stock Critique</span>
                          ) : (
                            <span className="text-emerald-600 text-[10px] uppercase font-bold">Disponible</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* QUICK EXPENSE MODAL */}
      {showQuickExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-brand-green-700 to-brand-green-800 px-6 py-4 text-white">
              <h3 className="font-display font-semibold text-lg">Enregistrer une dépense opérationnelle</h3>
              <p className="text-xs text-brand-green-100">Débit immédiat du grand livre</p>
            </div>

            <form onSubmit={handleAddQuickExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Motif</label>
                <input 
                  type="text" 
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  placeholder="ex: Essence pick-up ruchers / Frais de moules thés" 
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-brand-green-600 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Montant (FCFA)</label>
                  <input 
                    type="number" 
                    step="1"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    placeholder="15000" 
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-brand-green-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pôle / Compartiment</label>
                  <select 
                    value={expenseDiv}
                    onChange={e => {
                      setExpenseDiv(e.target.value as any);
                      if (e.target.value === 'jus') setExpenseCat('Fruits & Ingrédients Jus');
                      else if (e.target.value === 'the') setExpenseCat('Feuilles & Arômes Thé');
                      else if (e.target.value === 'hotel') setExpenseCat('Maintenance Hôtel');
                      else setExpenseCat('Apiculture & Suivi');
                    }}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-brand-green-600 focus:outline-hidden"
                  >
                    <option value="miel">Miel de bambou</option>
                    <option value="jus">Jus frais</option>
                    <option value="the">Herboristerie thé</option>
                    <option value="hotel">Hôtel / Écolodge</option>
                    <option value="general">Général / Salaires</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catégorie comptable</label>
                <select 
                  value={expenseCat}
                  onChange={e => setExpenseCat(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-brand-green-600 focus:outline-hidden"
                >
                  <option value="Bambou & Matériel">Bambou & Matériel de fabrication</option>
                  <option value="Transport & Ruches">Transport & Pose de ruches</option>
                  <option value="Apiculture & Suivi">Apiculture & Inspection</option>
                  <option value="Extraction & Miellerie">Extraction & Filtration miellerie</option>
                  <option value="Pots & Étiquettes">Pots de verre & Étiquetage traçabilité</option>
                  <option value="Fruits & Ingrédients Jus">Fruits & Sourcing (Jus)</option>
                  <option value="Feuilles & Arômes Thé">Aromates & Sachets (Thé)</option>
                  <option value="Maintenance Hôtel">Maintenance de l'éco-lodge</option>
                  <option value="Salaires">Salaires & Contrats de brousse</option>
                  <option value="Divers">Frais divers</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowQuickExpense(false)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 text-xs font-semibold text-white bg-brand-green-700 rounded-xl hover:bg-brand-green-800 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
