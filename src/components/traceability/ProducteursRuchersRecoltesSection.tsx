import React, { useState } from 'react';
import { BambouMielStore } from '../../dataStore';
import { BeekeeperOwner, BottledJar } from '../../types';
import BeekeepersTab from './tabs/BeekeepersTab';
import ApiariesTab from './tabs/ApiariesTab';
import HivesTab from './tabs/HivesTab';
import JournalTab from './tabs/JournalTab';
import CampaignsTab from './tabs/CampaignsTab';
import HarvestsBucketsTab from './tabs/HarvestsBucketsTab';
import DashboardTab from './tabs/DashboardTab';
import MiellerieTab from './tabs/MiellerieTab';
import CustomLabelGenerator from './CustomLabelGenerator';
import MemberCardModal from './MemberCardModal';
import ConsumerTraceModal from './ConsumerTraceModal';
import yamtaanuLogo from '../../assets/images/yamtaanu_logo_1783692830472.jpg';
import { 
  Users, 
  MapPin, 
  Layers, 
  ClipboardList, 
  CalendarDays, 
  Scale, 
  BarChart3, 
  Droplet,
  Award,
  Sparkles,
  QrCode,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface ProducteursRuchersRecoltesSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
}

export type TraceabilitySubTab = 
  | 'beekeepers' 
  | 'apiaries' 
  | 'hives' 
  | 'journal' 
  | 'campaigns' 
  | 'harvests' 
  | 'dashboard'
  | 'miellerie'
  | 'labels';

export default function ProducteursRuchersRecoltesSection({ store, onRefresh }: ProducteursRuchersRecoltesSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<TraceabilitySubTab>('dashboard');
  const [selectedApiaryFilter, setSelectedApiaryFilter] = useState<string | null>(null);

  // Modals state
  const [memberCardBeekeeper, setMemberCardBeekeeper] = useState<BeekeeperOwner | null>(null);
  const [consumerTraceJar, setConsumerTraceJar] = useState<BottledJar | null>(null);
  const [selectedLabelJar, setSelectedLabelJar] = useState<BottledJar | null>(null);

  const subMenuItems = [
    { id: 'dashboard', label: '7. Tableau de bord', icon: BarChart3, badge: `${store.trackedHives.length} ruches` },
    { id: 'beekeepers', label: '1. Propriétaires de ruches', icon: Users, badge: `${store.beekeepers.length}` },
    { id: 'apiaries', label: '2. Ruchers', icon: MapPin, badge: `${store.apiaries.length}` },
    { id: 'hives', label: '3. Ruches', icon: Layers, badge: `${store.trackedHives.length}` },
    { id: 'journal', label: '4. Suivi et interventions', icon: ClipboardList, badge: `${store.journalEvents.length}` },
    { id: 'campaigns', label: '5. Campagnes de récolte', icon: CalendarDays, badge: `${store.traceCampaigns.length}` },
    { id: 'harvests', label: '6. Récoltes et seaux', icon: Scale, badge: `${store.bucketSubLots.length}` },
    { id: 'miellerie', label: 'Miellerie & Bocaux', icon: Droplet, badge: `${store.bottledJars.length}` },
    { id: 'labels', label: 'Étiquettes & QR (Import)', icon: QrCode, badge: 'Personnalisé' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Brand Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 border border-amber-500/30 p-5 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                CHAÎNE DE TRAÇABILITÉ INTÉGRALE
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                100% PURETÉ NATURELLE
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Traçabilité LES TRIANGLES – Yamtãanu
            </h1>
            
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Propriétaire de ruches → rucher → ruche unique → récolte de campagne → seaux physiques → miellerie « égoutté avec mousse » → bocal identifié & QR sur la table du consommateur.
            </p>
          </div>

          {/* Quick Actions / Dual Logo Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 bg-slate-900/90 p-2 rounded-2xl border border-amber-500/30">
              <div className="w-14 h-10 rounded-xl bg-[#1c184e] p-0.5 border border-amber-400/40 overflow-hidden flex items-center justify-center shadow" title="Marque Yamtãanu (Depuis 1990)">
                <img src={yamtaanuLogo} alt="Marque Yamtãanu" className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-10 rounded-xl bg-[#09090b] p-0.5 border border-amber-400/50 overflow-hidden flex items-center justify-center shadow" title="Complexe LES TRIANGLES (Komiguéa)">
                <img src="/assets/aistudio/image_467966f7.png" alt="Les Triangles" className="w-full h-full object-contain" />
              </div>
            </div>

            <button
              onClick={() => {
                setActiveSubTab('beekeepers');
                if (store.beekeepers[0]) {
                  setMemberCardBeekeeper(store.beekeepers[0]);
                }
              }}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              title="Accéder aux fiches membres et télécharger une carte officielle"
            >
              <CreditCard className="w-4 h-4" />
              <span>Cartes de Membre</span>
            </button>

            <button
              onClick={() => {
                if (store.bottledJars[0]) {
                  setConsumerTraceJar(store.bottledJars[0]);
                }
              }}
              className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              title="Tester la vue QR public du consommateur"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Démo Scan Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menus Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {subMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id as TraceabilitySubTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-Menu Views */}
      <div className="pt-2">
        {activeSubTab === 'dashboard' && (
          <DashboardTab
            store={store}
            onNavigateToTab={(tabId) => setActiveSubTab(tabId as TraceabilitySubTab)}
          />
        )}

        {activeSubTab === 'beekeepers' && (
          <BeekeepersTab
            store={store}
            onRefresh={onRefresh}
            onSelectBeekeeperForCard={(bkp) => setMemberCardBeekeeper(bkp)}
          />
        )}

        {activeSubTab === 'apiaries' && (
          <ApiariesTab
            store={store}
            onRefresh={onRefresh}
            onSelectApiaryForHives={(apiaryId) => {
              setSelectedApiaryFilter(apiaryId);
              setActiveSubTab('hives');
            }}
          />
        )}

        {activeSubTab === 'hives' && (
          <HivesTab
            store={store}
            onRefresh={onRefresh}
            selectedApiaryIdFilter={selectedApiaryFilter}
          />
        )}

        {activeSubTab === 'journal' && (
          <JournalTab
            store={store}
            onRefresh={onRefresh}
          />
        )}

        {activeSubTab === 'campaigns' && (
          <CampaignsTab
            store={store}
            onRefresh={onRefresh}
            onSelectCampaignForHarvest={() => setActiveSubTab('harvests')}
          />
        )}

        {activeSubTab === 'harvests' && (
          <HarvestsBucketsTab
            store={store}
            onRefresh={onRefresh}
          />
        )}

        {activeSubTab === 'miellerie' && (
          <MiellerieTab
            store={store}
            onRefresh={onRefresh}
            onOpenConsumerTrace={(jar) => setConsumerTraceJar(jar)}
            onOpenLabelGenerator={(jar) => {
              setSelectedLabelJar(jar);
              setActiveSubTab('labels');
            }}
          />
        )}

        {activeSubTab === 'labels' && (
          <CustomLabelGenerator
            store={store}
            onRefresh={onRefresh}
            selectedJar={selectedLabelJar}
          />
        )}
      </div>

      {/* MODAL 1 : Printable Member Card */}
      {memberCardBeekeeper && (
        <MemberCardModal
          beekeeper={memberCardBeekeeper}
          onClose={() => setMemberCardBeekeeper(null)}
          onUpdatePhoto={(newPhotoUrl) => {
            store.updateBeekeeper(memberCardBeekeeper.id, { photoUrl: newPhotoUrl });
            setMemberCardBeekeeper({ ...memberCardBeekeeper, photoUrl: newPhotoUrl });
            onRefresh();
          }}
          onUpdateRole={(newRoleTitle) => {
            store.updateBeekeeper(memberCardBeekeeper.id, { roleTitle: newRoleTitle });
            setMemberCardBeekeeper({ ...memberCardBeekeeper, roleTitle: newRoleTitle });
            onRefresh();
          }}
        />
      )}

      {/* MODAL 2 : Consumer Trace Passport */}
      {consumerTraceJar && (
        <ConsumerTraceModal
          jarData={consumerTraceJar}
          onClose={() => setConsumerTraceJar(null)}
        />
      )}

    </div>
  );
}
