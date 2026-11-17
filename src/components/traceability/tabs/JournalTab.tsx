import React, { useState } from 'react';
import { BambouMielStore } from '../../../dataStore';
import { HiveJournalEvent } from '../../../types';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  User, 
  Trash2, 
  X,
  Filter,
  ArrowRight
} from 'lucide-react';

interface JournalTabProps {
  store: BambouMielStore;
  onRefresh: () => void;
}

export default function JournalTab({ store, onRefresh }: JournalTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHive, setFilterHive] = useState('toutes');
  const [filterType, setFilterType] = useState('tous');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states (supports 1 hive OR batch of hives in the same apiary)
  const [selectedHiveIds, setSelectedHiveIds] = useState<string[]>(
    store.trackedHives[0]?.id ? [store.trackedHives[0].id] : []
  );
  const [modalApiaryFilter, setModalApiaryFilter] = useState<string>('tous');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState<HiveJournalEvent['eventType']>('visite');
  const [coupledHiveNumber, setCoupledHiveNumber] = useState('');
  const [colonyStatus, setColonyStatus] = useState<'vide' | 'occupee' | 'recolonisee'>('occupee');
  const [colonyHealth, setColonyHealth] = useState<HiveJournalEvent['colonyHealth']>('vigoureuse');
  const [queenPresent, setQueenPresent] = useState(true);
  const [broodStatus, setBroodStatus] = useState<HiveJournalEvent['broodStatus']>('abondant');
  const [parasitesOrProblems, setParasitesOrProblems] = useState('Aucun parasite détecté');
  const [actionsDone, setActionsDone] = useState('Contrôle des barrettes et nettoyage du plancher');
  const [nextAction, setNextAction] = useState('Visite de contrôle miellée');
  const [nextActionDate, setNextActionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [operatorName, setOperatorName] = useState('Salamatou Gnon & Équipe Yamtãanu');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    const firstHive = store.trackedHives[0];
    setSelectedHiveIds(firstHive ? [firstHive.id] : []);
    setModalApiaryFilter('tous');
    setDate(new Date().toISOString().split('T')[0]);
    setEventType('visite');
    setCoupledHiveNumber('');
    setColonyStatus('occupee');
    setColonyHealth('vigoureuse');
    setQueenPresent(true);
    setBroodStatus('abondant');
    setParasitesOrProblems('Aucun parasite');
    setActionsDone('Visite sanitaire de routine, inspection de ponte.');
    setNextAction('Contrôle miellée avant récolte');
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setNextActionDate(d.toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const modalVisibleHives = store.trackedHives.filter(
    h => modalApiaryFilter === 'tous' || h.apiaryId === modalApiaryFilter
  );

  const toggleHiveSelection = (id: string) => {
    setSelectedHiveIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHiveIds.length === 0) return;

    const basePayload = {
      date,
      eventType,
      coupledHiveNumber: coupledHiveNumber.trim() || undefined,
      colonyStatus,
      colonyHealth,
      queenPresent,
      broodStatus,
      parasitesOrProblems: parasitesOrProblems.trim(),
      actionsDone: actionsDone.trim(),
      nextAction: nextAction.trim(),
      nextActionDate,
      operatorName: operatorName.trim(),
      notes: notes.trim()
    };

    if (selectedHiveIds.length === 1) {
      const hive = store.trackedHives.find(h => h.id === selectedHiveIds[0]);
      if (!hive) return;
      store.addHiveJournalEvent({
        ...basePayload,
        hiveId: hive.id,
        hiveNumber: hive.hiveNumber,
        apiaryId: hive.apiaryId,
        apiaryName: hive.apiaryName
      });
    } else {
      store.addHiveJournalEventsBatch(selectedHiveIds, basePayload);
    }

    setShowAddModal(false);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer cette entrée du journal ?')) {
      store.deleteHiveJournalEvent(id);
      onRefresh();
    }
  };

  const filteredEvents = store.journalEvents.filter(ev => {
    const matchesSearch = ev.hiveNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.apiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.actionsDone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHive = filterHive === 'toutes' || ev.hiveId === filterHive;
    const matchesType = filterType === 'tous' || ev.eventType === filterType;
    return matchesSearch && matchesHive && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              SOUS-MENU 4 • JOURNAL D'ÉVÉNEMENTS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {store.journalEvents.length} événements enregistrés
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Suivi des Ruchers & Journal Chronologique d'Interventions
          </h2>
          <p className="text-xs text-slate-400">
            Journal immuable retraçant toute la vie de la ruche : installation → occupation → visite → intervention → récolte → déplacement.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Consigner un Événement</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par ruche, rucher, action..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={filterHive}
          onChange={e => setFilterHive(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="toutes">Toutes les ruches</option>
          {store.trackedHives.map(h => (
            <option key={h.id} value={h.id}>{h.hiveNumber} ({h.apiaryName})</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="tous">Tous les types d'événements</option>
          <option value="visite">Visite de contrôle</option>
          <option value="installation">Installation</option>
          <option value="appatage">Appâtage / Piège</option>
          <option value="colonisation">Colonisation</option>
          <option value="couplage">Couplage de colonies</option>
          <option value="division">Division / Essaimage artificiel</option>
          <option value="recolonisation">Recolonisation</option>
          <option value="depart_essaim">Départ d'essaim</option>
          <option value="intervention_sanitaire">Intervention sanitaire</option>
          <option value="nourrissement">Nourrissement d'appoint</option>
          <option value="recolte">Récolte</option>
          <option value="deplacement">Déplacement de ruche</option>
          <option value="maintenance">Maintenance &amp; Réparation</option>
        </select>
      </div>

      {/* Events Timeline / List */}
      <div className="space-y-3">
        {filteredEvents.map(event => {
          const isSanitaryProblem = event.parasitesOrProblems && !event.parasitesOrProblems.toLowerCase().includes('aucun');

          return (
            <div 
              key={event.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                {/* Event header line */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                    {event.hiveNumber}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                    {event.eventType.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{event.date}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-500/80" />
                    <span>{event.apiaryName}</span>
                  </span>
                </div>

                {/* Colony status & health pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    event.colonyStatus !== 'vide' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {event.colonyStatus === 'vide' ? 'Ruche vide' : `Colonie ${event.colonyHealth || 'normale'}`}
                  </span>

                  {event.queenPresent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      👑 Reine active
                    </span>
                  )}

                  {event.broodStatus && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                      Couvain : {event.broodStatus}
                    </span>
                  )}

                  {event.coupledHiveNumber && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      Ruche associée : {event.coupledHiveNumber}
                    </span>
                  )}
                </div>

                {/* Actions & Problems */}
                <div className="space-y-1 text-xs">
                  <p className="text-slate-200">
                    <strong className="text-slate-400">Travaux réalisés :</strong> {event.actionsDone}
                  </p>
                  
                  {event.parasitesOrProblems && (
                    <p className={`text-[11px] flex items-center gap-1 ${isSanitaryProblem ? 'text-amber-400 font-semibold' : 'text-slate-400'}`}>
                      {isSanitaryProblem ? <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                      <span>Contrôle sanitaire : {event.parasitesOrProblems}</span>
                    </p>
                  )}
                </div>

                {/* Next action scheduled */}
                {event.nextAction && (
                  <div className="p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs flex items-center gap-2 text-amber-300/90">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Prochaine action : <strong>{event.nextAction}</strong> {event.nextActionDate ? `(prévue le ${event.nextActionDate})` : ''}</span>
                  </div>
                )}
              </div>

              {/* Side info & Delete */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800 text-[11px] text-slate-400 shrink-0">
                <span className="text-slate-500">Par : {event.operatorName}</span>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-1.5 text-red-400/60 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
            Aucun événement ne correspond aux filtres actuels.
          </div>
        )}
      </div>

      {/* Modal Add Event */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Consigner un Événement / Intervention</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Multi-hive selection by apiary */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-amber-300 font-bold">
                    Ruche(s) concernée(s) ({selectedHiveIds.length} sélectionnée{selectedHiveIds.length > 1 ? 's' : ''}) *
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={modalApiaryFilter}
                      onChange={e => setModalApiaryFilter(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                    >
                      <option value="tous">Tous les ruchers</option>
                      {store.apiaries.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setSelectedHiveIds(modalVisibleHives.map(h => h.id))}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10.5px] font-bold cursor-pointer shrink-0"
                    >
                      Tout cocher
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHiveIds([])}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10.5px] cursor-pointer shrink-0"
                    >
                      Vider
                    </button>
                  </div>
                </div>

                <div className="max-h-28 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 pr-1">
                  {modalVisibleHives.map(h => {
                    const checked = selectedHiveIds.includes(h.id);
                    return (
                      <label
                        key={h.id}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] cursor-pointer transition ${
                          checked
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleHiveSelection(h.id)}
                          className="accent-amber-500"
                        />
                        <span className="font-mono truncate">{h.hiveNumber}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date de l'événement</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nature de l'intervention *</label>
                  <select
                    value={eventType}
                    onChange={e => {
                      const val = e.target.value as HiveJournalEvent['eventType'];
                      setEventType(val);
                      if (val === 'appatage' || val === 'depart_essaim') setColonyStatus('vide');
                      else if (val === 'recolonisation') setColonyStatus('recolonisee');
                      else setColonyStatus('occupee');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="visite">Visite d'inspection</option>
                    <option value="appatage">Appâtage (Pose piège à essaim)</option>
                    <option value="colonisation">Colonisation (Arrivée essaim)</option>
                    <option value="couplage">Couplage de colonies</option>
                    <option value="division">Division / Essaimage artificiel</option>
                    <option value="recolonisation">Recolonisation</option>
                    <option value="depart_essaim">Départ de l'essaim</option>
                    <option value="intervention_sanitaire">Intervention sanitaire / Traitement</option>
                    <option value="nourrissement">Nourrissement d'appoint</option>
                    <option value="recolte">Récolte de miel</option>
                    <option value="maintenance">Maintenance / Nettoyage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">État actuel de la colonie</label>
                  <select
                    value={colonyStatus}
                    onChange={e => setColonyStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="occupee">Occupée</option>
                    <option value="recolonisee">Recolonisée</option>
                    <option value="vide">Vide</option>
                  </select>
                </div>
              </div>

              {(eventType === 'couplage' || eventType === 'division') && (
                <div>
                  <label className="block text-amber-300 font-medium mb-1">
                    N° Ruche couplée / Ruche mère associée
                  </label>
                  <input
                    type="text"
                    value={coupledHiveNumber}
                    onChange={e => setCoupledHiveNumber(e.target.value)}
                    placeholder="Ex: YAM/26/002"
                    className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {colonyStatus !== 'vide' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Vigueur</label>
                    <select
                      value={colonyHealth}
                      onChange={e => setColonyHealth(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
                    >
                      <option value="vigoureuse">Vigoureuse</option>
                      <option value="normale">Normale</option>
                      <option value="affaiblie">Affaiblie</option>
                      <option value="sans_reine">Sans reine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Reine vue ?</label>
                    <select
                      value={queenPresent ? 'oui' : 'non'}
                      onChange={e => setQueenPresent(e.target.value === 'oui')}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
                    >
                      <option value="oui">Oui / Ponte visible</option>
                      <option value="non">Non constatée</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Couvain</label>
                    <select
                      value={broodStatus}
                      onChange={e => setBroodStatus(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-white"
                    >
                      <option value="abondant">Abondant & sain</option>
                      <option value="moyen">Moyen</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Travaux & observations réalisés *</label>
                <textarea
                  required
                  rows={2}
                  value={actionsDone}
                  onChange={e => setActionsDone(e.target.value)}
                  placeholder="Détail des actions menées sur la ruche..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Contrôle sanitaire / Problèmes décelés</label>
                <input
                  type="text"
                  value={parasitesOrProblems}
                  onChange={e => setParasitesOrProblems(e.target.value)}
                  placeholder="Ex: Aucun parasite, présence de fausse teigne..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Prochaine action programmée</label>
                  <input
                    type="text"
                    value={nextAction}
                    onChange={e => setNextAction(e.target.value)}
                    placeholder="Ex: Pose de hausse, récolte..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date d'échéance</label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={e => setNextActionDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Intervenant / Responsable</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
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
                  Enregistrer l'événement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
