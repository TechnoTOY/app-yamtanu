import React from 'react';
import { BambouMielStore } from '../../../dataStore';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Scale, 
  TrendingUp, 
  Sparkles, 
  Calendar,
  AlertTriangle,
  Award,
  ChevronRight
} from 'lucide-react';

interface DashboardTabProps {
  store: BambouMielStore;
  onNavigateToTab: (subTabId: string) => void;
}

export default function DashboardTab({ store, onNavigateToTab }: DashboardTabProps) {
  // Key Metrics
  const totalMembers = store.beekeepers.length;
  const activeMembers = store.beekeepers.filter(b => b.status === 'actif').length;

  const totalApiaries = store.apiaries.length;
  const totalHives = store.trackedHives.length;
  const occupiedHives = store.trackedHives.filter(h => h.colonizationStatus !== 'vide').length;
  const occupationRate = totalHives > 0 ? Math.round((occupiedHives / totalHives) * 100) : 0;

  const totalHarvestedKg = store.bucketSubLots.reduce((sum, s) => sum + s.netWeightKg, 0);

  // Rendement par ruche occupée
  const yieldPerOccupiedHive = occupiedHives > 0 ? Math.round((totalHarvestedKg / occupiedHives) * 10) / 10 : 0;

  // Interventions à réaliser (nextActionDate in future or today)
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingActions = store.journalEvents
    .filter(ev => ev.nextAction && ev.nextActionDate && ev.nextActionDate >= todayStr)
    .sort((a, b) => (a.nextActionDate || '').localeCompare(b.nextActionDate || ''));

  // Comparaison des campagnes
  const camp1 = store.traceCampaigns.find(c => c.campaignType === 1);
  const camp2 = store.traceCampaigns.find(c => c.campaignType === 2);

  const camp1Harvests = store.hiveHarvests.filter(h => camp1 && h.campaignId === camp1.id);
  const camp1TotalKg = camp1Harvests.reduce((sum, h) => sum + h.totalNetWeightKg, 0);

  const camp2Harvests = store.hiveHarvests.filter(h => camp2 && h.campaignId === camp2.id);
  const camp2TotalKg = camp2Harvests.reduce((sum, h) => sum + h.totalNetWeightKg, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            SOUS-MENU 7 • TABLEAU DE BORD GLOBAL
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {todayStr}
          </span>
        </div>
        <h2 className="text-lg font-bold text-white mt-1">
          Performances Apicoles, Occupation & Comparaison des Campagnes
        </h2>
        <p className="text-xs text-slate-400">
          Vue synthétique de l'écosystème : membres certifiés, taux d'occupation des ruches, rendements nets et actions programmées.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 : Membres */}
        <div 
          onClick={() => onNavigateToTab('beekeepers')}
          className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl space-y-2 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Membres Apiculteurs</span>
            <Users className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalMembers}</span>
            <span className="text-[10px] text-emerald-400 font-bold">{activeMembers} actifs</span>
          </div>
          <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Voir & Télécharger Cartes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Card 2 : Ruches & Occupation */}
        <div 
          onClick={() => onNavigateToTab('hives')}
          className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl space-y-2 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ruches Installées</span>
            <Layers className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalHives}</span>
            <span className="text-[10px] text-emerald-400 font-bold">{occupiedHives} occupées</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${occupationRate}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Taux d'occupation : <strong className="text-emerald-400">{occupationRate}%</strong>
          </span>
        </div>

        {/* Card 3 : Total Récolté & Rendement */}
        <div 
          onClick={() => onNavigateToTab('harvests')}
          className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl space-y-2 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Miel Récolté Net</span>
            <Scale className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {Math.round(totalHarvestedKg * 10) / 10}
            </span>
            <span className="text-xs text-slate-400">kg net</span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Rendement : <strong className="text-white">{yieldPerOccupiedHive} kg / ruche occupée</strong>
          </span>
        </div>

        {/* Card 4 : Interventions à venir */}
        <div 
          onClick={() => onNavigateToTab('journal')}
          className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl space-y-2 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Interventions à Réaliser</span>
            <Clock className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {upcomingActions.length}
            </span>
            <span className="text-xs text-slate-400">programmées</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Suivi sanitaire & miellée
          </span>
        </div>

      </div>

      {/* Main Grid : Comparison of campaigns + Upcoming interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column : Comparison of Campaigns (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Comparaison des Campagnes (Campagne 1 vs Campagne 2)
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('campaigns')}
              className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1"
            >
              <span>Gérer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box Campagne 1 */}
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-300">
                  {camp1 ? camp1.campaignNumber : 'YAM-CAM-2026-01'}
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Campagne 1
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {camp1 ? camp1.name : 'Grande Récolte de Printemps'}
              </h4>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Total récolté net :</span>
                  <strong className="text-emerald-400 font-mono">{Math.round(camp1TotalKg * 10) / 10} kg</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Ruches récoltées :</span>
                  <strong className="text-white font-mono">{camp1Harvests.length} ruches</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Statut :</span>
                  <strong className="text-emerald-400 capitalize">{camp1?.status || 'Ouverte'}</strong>
                </div>
              </div>
            </div>

            {/* Box Campagne 2 */}
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-300">
                  {camp2 ? camp2.campaignNumber : 'YAM-CAM-2025-02'}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-300 bg-slate-700 px-2 py-0.5 rounded">
                  Campagne 2
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {camp2 ? camp2.name : 'Petite Récolte d\'Automne'}
              </h4>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Total récolté net :</span>
                  <strong className="text-emerald-400 font-mono">{Math.round(camp2TotalKg * 10) / 10} kg</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Ruches récoltées :</span>
                  <strong className="text-white font-mono">{camp2Harvests.length} ruches</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Statut :</span>
                  <strong className="text-slate-400 capitalize">{camp2?.status || 'Clôturée'}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Quick analysis notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Règle de calcul agronomique :</strong> Le rendement par ruche est calculé <strong>exclusivement sur les ruches occupées</strong> ({yieldPerOccupiedHive} kg/ruche), évitant le biais des ruches en repos ou en attente d'essaimage.
            </div>
          </div>
        </div>

        {/* Right Column : Upcoming Interventions (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Interventions à Réaliser ({upcomingActions.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('journal')}
              className="text-amber-400 hover:text-amber-300 text-xs font-bold"
            >
              Voir journal
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {upcomingActions.map(action => (
              <div 
                key={action.id}
                className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold">{action.hiveNumber}</span>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-700 px-1.5 py-0.5 rounded">
                    {action.nextActionDate}
                  </span>
                </div>
                <p className="text-white font-medium">{action.nextAction}</p>
                <span className="text-[10px] text-slate-500 block">Rucher : {action.apiaryName}</span>
              </div>
            ))}

            {upcomingActions.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-800/30 rounded-xl">
                Toutes les interventions programmées sont à jour.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
