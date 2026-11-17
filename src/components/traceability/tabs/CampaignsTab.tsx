import React, { useState } from 'react';
import { BambouMielStore } from '../../../dataStore';
import { HarvestCampaignRecord } from '../../../types';
import { 
  CalendarDays, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles, 
  Edit2, 
  X,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';

interface CampaignsTabProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onSelectCampaignForHarvest?: (campaignId: string) => void;
}

export default function CampaignsTab({ store, onRefresh, onSelectCampaignForHarvest }: CampaignsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<HarvestCampaignRecord | null>(null);

  // Form states
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [campaignType, setCampaignType] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState(() => `${new Date().getFullYear()}-05-01`);
  const [plannedEndDate, setPlannedEndDate] = useState(() => `${new Date().getFullYear()}-06-30`);
  const [targetedApiaries, setTargetedApiaries] = useState<string[]>(store.apiaries.map(a => a.id));
  const [responsibles, setResponsibles] = useState('DG SARKI Yantannou & Équipe Technique Yamtãanu');
  const [status, setStatus] = useState<HarvestCampaignRecord['status']>('ouverte');
  const [totalTargetKg, setTotalTargetKg] = useState('500');
  const [notes, setNotes] = useState('');

  const nextCampaignNumber = store.generateCampaignNumber(year, campaignType);

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    const curYear = new Date().getFullYear();
    setYear(curYear);
    setCampaignType(1);
    setName(`Grande Campagne de Printemps ${curYear}`);
    setPlannedStartDate(`${curYear}-05-01`);
    setPlannedEndDate(`${curYear}-06-30`);
    setTargetedApiaries(store.apiaries.map(a => a.id));
    setResponsibles('DG SARKI Yantannou & Équipe Technique');
    setStatus('ouverte');
    setTotalTargetKg('500');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (camp: HarvestCampaignRecord) => {
    setEditingCampaign(camp);
    setYear(camp.year);
    setCampaignType(camp.campaignType);
    setName(camp.name);
    setPlannedStartDate(camp.plannedStartDate);
    setPlannedEndDate(camp.plannedEndDate);
    setTargetedApiaries(camp.targetedApiaries);
    setResponsibles(camp.responsibles);
    setStatus(camp.status);
    setTotalTargetKg(String(camp.totalTargetKg || 0));
    setNotes(camp.notes || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCampaign) {
      store.updateTraceCampaign(editingCampaign.id, {
        year,
        campaignType,
        name: name.trim(),
        plannedStartDate,
        plannedEndDate,
        targetedApiaries,
        responsibles: responsibles.trim(),
        status,
        totalTargetKg: Number(totalTargetKg) || 0,
        notes: notes.trim()
      });
    } else {
      store.addTraceCampaign({
        year,
        campaignType,
        name: name.trim(),
        plannedStartDate,
        plannedEndDate,
        targetedApiaries,
        responsibles: responsibles.trim(),
        status,
        totalTargetKg: Number(totalTargetKg) || 0,
        notes: notes.trim()
      });
    }

    setShowAddModal(false);
    onRefresh();
  };

  const handleToggleStatus = (camp: HarvestCampaignRecord) => {
    const nextStatus = camp.status === 'preparee' ? 'ouverte' : (camp.status === 'ouverte' ? 'cloturee' : 'ouverte');
    store.updateTraceCampaign(camp.id, { 
      status: nextStatus,
      actualEndDate: nextStatus === 'cloturee' ? new Date().toISOString().split('T')[0] : camp.actualEndDate
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              SOUS-MENU 5 • CYCLES DE RÉCOLTE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {store.traceCampaigns.length} campagnes enregistrées
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Campagnes de Récolte (Campagne 1 & Campagne 2)
          </h2>
          <p className="text-xs text-slate-400">
            Format <code>YAM-CAM-2026-01</code>. Regroupe l'ensemble des récoltes réelles de chaque ruche et permet la comparaison des rendements.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Campagne</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {store.traceCampaigns.map(camp => {
          const harvestsInCamp = store.hiveHarvests.filter(h => h.campaignId === camp.id);
          const totalNetHarvested = harvestsInCamp.reduce((sum, h) => sum + h.totalNetWeightKg, 0);
          const percentDone = camp.totalTargetKg ? Math.min(100, Math.round((totalNetHarvested / camp.totalTargetKg) * 100)) : 0;

          return (
            <div 
              key={camp.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      {camp.campaignNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Campagne {camp.campaignType} • {camp.year}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">
                    {camp.name}
                  </h3>
                </div>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  camp.status === 'ouverte'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 animate-pulse'
                    : camp.status === 'cloturee'
                    ? 'text-slate-400 bg-slate-800 border-slate-700'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}>
                  {camp.status.toUpperCase()}
                </span>
              </div>

              {/* Progress & Target */}
              <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progression de récolte :</span>
                  <span className="font-bold text-white font-mono">
                    {Math.round(totalNetHarvested * 10) / 10} kg / {camp.totalTargetKg || 0} kg ({percentDone}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500" 
                    style={{ width: `${percentDone}%` }}
                  />
                </div>
              </div>

              {/* Campaign details */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">PÉRIODE PRÉVUE</span>
                  <p className="font-mono text-slate-200">{camp.plannedStartDate} au {camp.plannedEndDate}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">RUCHES RÉCOLTÉES</span>
                  <p className="font-bold text-amber-400">{harvestsInCamp.length} ruches</p>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">RESPONSABLE(S)</span>
                <p className="text-slate-300">{camp.responsibles}</p>
              </div>

              {/* Actions footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStatus(camp)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    camp.status === 'ouverte'
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {camp.status === 'ouverte' ? 'Clôturer la campagne' : 'Ouvrir la campagne'}
                </button>

                <button
                  onClick={() => handleOpenEdit(camp)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Modifier"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Campaign */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingCampaign ? 'Modifier la Campagne' : 'Créer une Campagne de Récolte'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                Numérotation automatique : <strong className="font-mono text-white">{editingCampaign ? editingCampaign.campaignNumber : nextCampaignNumber}</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Année *</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Numéro de Campagne *</label>
                  <select
                    value={campaignType}
                    onChange={e => setCampaignType(Number(e.target.value) as 1 | 2)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>Campagne 1 (Printemps / Principale)</option>
                    <option value={2}>Campagne 2 (Automne / Secondaire)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Désignation de la campagne *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Grande Récolte de Brousse 2026"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date début prévue</label>
                  <input
                    type="date"
                    value={plannedStartDate}
                    onChange={e => setPlannedStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date fin prévue</label>
                  <input
                    type="date"
                    value={plannedEndDate}
                    onChange={e => setPlannedEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Objectif cible (kg net)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={totalTargetKg}
                    onChange={e => setTotalTargetKg(e.target.value)}
                    placeholder="500"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Statut initial</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="preparee">Préparée</option>
                    <option value="ouverte">Ouverte (En cours)</option>
                    <option value="cloturee">Clôturée</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Responsables de campagne</label>
                <input
                  type="text"
                  value={responsibles}
                  onChange={e => setResponsibles(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition"
                >
                  {editingCampaign ? 'Enregistrer les modifications' : 'Créer la campagne'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
