import React, { useState } from 'react';
import { BambouMielStore } from '../../../dataStore';
import { TrackedHive, Apiary, BeekeeperOwner } from '../../../types';
import { 
  Layers, 
  Plus, 
  Search, 
  MapPin, 
  User, 
  History, 
  ArrowRightLeft, 
  UserCheck, 
  Sparkles, 
  Calendar, 
  Edit2, 
  Trash2, 
  X,
  Activity,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface HivesTabProps {
  store: BambouMielStore;
  onRefresh: () => void;
  selectedApiaryIdFilter?: string | null;
}

export default function HivesTab({ store, onRefresh, selectedApiaryIdFilter }: HivesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApiary, setFilterApiary] = useState(selectedApiaryIdFilter || 'tous');
  const [filterCategory, setFilterCategory] = useState<'toutes' | 'ecolo_artisanale' | 'ciment_barrettes_superieures'>('toutes');
  const [filterOccupation, setFilterOccupation] = useState<'toutes' | 'vide' | 'occupee' | 'recolonisee'>('toutes');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [historyHive, setHistoryHive] = useState<TrackedHive | null>(null);
  const [moveHive, setMoveHive] = useState<TrackedHive | null>(null);
  const [transferOwnerHive, setTransferOwnerHive] = useState<TrackedHive | null>(null);
  const [colonizationHive, setColonizationHive] = useState<TrackedHive | null>(null);

  // Form states: New hive
  const [apiaryId, setApiaryId] = useState(store.apiaries[0]?.id || '');
  const [category, setCategory] = useState<'ecolo_artisanale' | 'ciment_barrettes_superieures'>('ecolo_artisanale');
  const [installationDate, setInstallationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [colonizationStatus, setColonizationStatus] = useState<'vide' | 'occupee' | 'recolonisee'>('occupee');
  const [colonyStrength, setColonyStrength] = useState<'forte' | 'moyenne' | 'faible'>('forte');
  const [notes, setNotes] = useState('');

  // Move hive state
  const [targetApiaryId, setTargetApiaryId] = useState(store.apiaries[0]?.id || '');
  const [moveReason, setMoveReason] = useState('Optimisation de la miellée et ombrage.');
  const [moveAuthor, setMoveAuthor] = useState('DG SARKI Yantannou');

  // Transfer owner state
  const [targetOwnerId, setTargetOwnerId] = useState(store.beekeepers[0]?.id || '');
  const [transferReason, setTransferReason] = useState('Cession mutuelle conventionnée Yamtãanu.');
  const [transferAuthor, setTransferAuthor] = useState('DG SARKI Yantannou');

  // Colonization change state
  const [newColonyStatus, setNewColonyStatus] = useState<'vide' | 'occupee' | 'recolonisee'>('occupee');
  const [colonyEventDate, setColonyEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [colonyEventDetails, setColonyEventDetails] = useState('Capture d’un nouvel essaim sauvage vigoureux.');
  const [newColonyStrength, setNewColonyStrength] = useState<'forte' | 'moyenne' | 'faible'>('forte');

  const nextHiveNumber = store.generateHiveNumber();

  const handleOpenAdd = () => {
    const firstApiary = store.apiaries[0];
    if (firstApiary) setApiaryId(firstApiary.id);
    setCategory('ecolo_artisanale');
    setInstallationDate(new Date().toISOString().split('T')[0]);
    setColonizationStatus('occupee');
    setColonyStrength('forte');
    setNotes('');
    setShowAddModal(true);
  };

  const handleCreateHive = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedApiary = store.apiaries.find(a => a.id === apiaryId);
    if (!matchedApiary) return;

    store.addTrackedHive({
      apiaryId: matchedApiary.id,
      apiaryNumber: matchedApiary.apiaryNumber,
      apiaryName: matchedApiary.name,
      ownerId: matchedApiary.ownerId,
      ownerName: matchedApiary.ownerName,
      category,
      installationDate,
      colonizationStatus,
      colonyStrength,
      status: 'active',
      notes: notes.trim()
    });

    setShowAddModal(false);
    onRefresh();
  };

  const handleExecuteMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveHive) return;
    const targetApiary = store.apiaries.find(a => a.id === targetApiaryId);
    if (!targetApiary) return;

    store.moveTrackedHive(moveHive.id, targetApiary, moveAuthor, moveReason);
    setMoveHive(null);
    onRefresh();
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferOwnerHive) return;
    const targetOwner = store.beekeepers.find(b => b.id === targetOwnerId);
    if (!targetOwner) return;

    store.changeHiveOwner(transferOwnerHive.id, targetOwner, transferAuthor, transferReason);
    setTransferOwnerHive(null);
    onRefresh();
  };

  const handleExecuteColonizationChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colonizationHive) return;

    store.updateHiveColonization(
      colonizationHive.id,
      newColonyStatus,
      colonyEventDate,
      'Responsable Suivi Yamtãanu',
      colonyEventDetails,
      newColonyStrength
    );

    setColonizationHive(null);
    onRefresh();
  };

  const filteredHives = store.trackedHives.filter(h => {
    const matchesSearch = h.hiveNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.apiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApiary = filterApiary === 'tous' || h.apiaryId === filterApiary;
    const matchesCategory = filterCategory === 'toutes' || h.category === filterCategory;
    const matchesOccupation = filterOccupation === 'toutes' || h.colonizationStatus === filterOccupation;
    return matchesSearch && matchesApiary && matchesCategory && matchesOccupation;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              SOUS-MENU 3 • PARC DE RUCHES
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {store.trackedHives.length} ruches répertoriées
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Identité Unique des Ruches & Historique de Vie
          </h2>
          <p className="text-xs text-slate-400">
            Format strict <code>YAM/26/001</code> indépendant du rucher ou propriétaire. Suivi distinct de la ruche et de sa colonie (dates d'occupation et départ).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer une Ruche</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2 md:col-span-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="N° Ruche (ex: YAM/26/001), rucher..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={filterApiary}
          onChange={e => setFilterApiary(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="tous">Tous les ruchers</option>
          {store.apiaries.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.village})</option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="toutes">Toutes les catégories</option>
          <option value="ecolo_artisanale">Écolo-artisanale (Bambou)</option>
          <option value="ciment_barrettes_superieures">Ciment à barrettes supérieures</option>
        </select>

        <select
          value={filterOccupation}
          onChange={e => setFilterOccupation(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="toutes">Tous les états de colonie</option>
          <option value="occupee">Occupée</option>
          <option value="recolonisee">Recolonisée</option>
          <option value="vide">Vide (En attente d'essaim)</option>
        </select>
      </div>

      {/* Hives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHives.map(hive => {
          const isOccupied = hive.colonizationStatus !== 'vide';

          return (
            <div 
              key={hive.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group shadow-sm"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 inline-block shadow-sm">
                      {hive.hiveNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {hive.category === 'ecolo_artisanale' 
                        ? '🌿 Ruche écolo-artisanale (Bambou)' 
                        : '🏛️ Ruche ciment à barrettes sup.'}
                    </span>
                  </div>

                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    hive.colonizationStatus === 'occupee'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : hive.colonizationStatus === 'recolonisee'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-slate-400 bg-slate-800 border-slate-700'
                  }`}>
                    {hive.colonizationStatus === 'vide' ? 'Vide' : hive.colonizationStatus === 'recolonisee' ? 'Recolonisée' : 'Occupée'}
                  </span>
                </div>

                {/* Location & Owner */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Rucher : <strong>{hive.apiaryName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Propriétaire : <strong>{hive.ownerName}</strong></span>
                  </div>
                </div>

                {/* Dates & Colony metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="text-[8.5px] uppercase font-bold text-slate-500 block">INSTALLATION</span>
                    <p className="text-slate-300 font-mono">{hive.installationDate}</p>
                  </div>
                  <div>
                    <span className="text-[8.5px] uppercase font-bold text-slate-500 block">DYNAMIQUE COLONIE</span>
                    <p className={`font-bold ${isOccupied ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {isOccupied ? `Colonie ${hive.colonyStrength || 'forte'}` : 'Ruche propre en attente'}
                    </p>
                  </div>
                </div>

                {/* History events badge */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                  <span>Événements tracés : <strong className="text-white">{hive.history?.length || 1}</strong></span>
                  <button
                    onClick={() => setHistoryHive(hive)}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
                  >
                    <History className="w-3 h-3" />
                    <span>Voir journal de vie</span>
                  </button>
                </div>
              </div>

              {/* Actions footer */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-xs">
                <button
                  onClick={() => {
                    setColonizationHive(hive);
                    setNewColonyStatus(hive.colonizationStatus === 'vide' ? 'occupee' : 'vide');
                  }}
                  className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-[11px] font-medium"
                  title="Déclarer occupation ou départ d'essaim"
                >
                  Colonie
                </button>

                <button
                  onClick={() => {
                    setMoveHive(hive);
                    setTargetApiaryId(store.apiaries.find(a => a.id !== hive.apiaryId)?.id || hive.apiaryId);
                  }}
                  className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-[11px] font-medium flex items-center gap-1"
                  title="Déplacer vers un autre rucher (conserve l'historique)"
                >
                  <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                  <span>Déplacer</span>
                </button>

                <button
                  onClick={() => {
                    setTransferOwnerHive(hive);
                    setTargetOwnerId(store.beekeepers.find(b => b.id !== hive.ownerId)?.id || hive.ownerId);
                  }}
                  className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-[11px] font-medium flex items-center gap-1"
                  title="Changer de propriétaire (conserve l'historique)"
                >
                  <UserCheck className="w-3 h-3 text-amber-400" />
                  <span>Céder</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Add New Hive */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Enregistrer une Nouvelle Ruche</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHive} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                Numéro unique permanent attribué : <strong className="font-mono text-white text-sm">{nextHiveNumber}</strong>
                <p className="text-[11px] text-amber-300/80 mt-1">
                  Ce numéro reste inchangé toute la vie de la ruche, même en cas de déplacement ou de changement de propriétaire.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Rucher d'implantation initial *</label>
                <select
                  value={apiaryId}
                  onChange={e => setApiaryId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {store.apiaries.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.village} - Propriétaire: {a.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Catégorie de Ruche *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ecolo_artisanale">🌿 Ruche écolo-artisanale (Bambou tressé)</option>
                  <option value="ciment_barrettes_superieures">🏛️ Ruche ciment à barrettes supérieures</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date d'installation</label>
                  <input
                    type="date"
                    value={installationDate}
                    onChange={e => setInstallationDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">État de colonisation initial</label>
                  <select
                    value={colonizationStatus}
                    onChange={e => setColonizationStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="occupee">Colonie occupée</option>
                    <option value="recolonisee">Colonie recolonisée</option>
                    <option value="vide">Ruche vide</option>
                  </select>
                </div>
              </div>

              {colonizationStatus !== 'vide' && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Force de la colonie</label>
                  <select
                    value={colonyStrength}
                    onChange={e => setColonyStrength(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="forte">Colonie très vigoureuse (Forte)</option>
                    <option value="moyenne">Colonie moyenne</option>
                    <option value="faible">Colonie faible (À surveiller)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Notes / Détails d'implantation</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Support surélevé, orientation du trou de vol..."
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
                  Valider l'installation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Hive History */}
      {historyHive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  JOURNAL DE VIE PERMANENT
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Ruche {historyHive.hiveNumber} • {historyHive.apiaryName}
                </h3>
              </div>
              <button onClick={() => setHistoryHive(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-300 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[10px]">PROPRIÉTAIRE ACTUEL</span>
                <strong className="text-white">{historyHive.ownerName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">STATUT COLONIE</span>
                <strong className="text-emerald-400">{historyHive.colonizationStatus.toUpperCase()}</strong>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 space-y-4 border-l-2 border-amber-500/30 ml-2 py-2">
              {historyHive.history.map((h, i) => (
                <div key={h.id || i} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-900" />
                  <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                        {h.event.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{h.date}</span>
                    </div>
                    <p className="text-slate-200">{h.details}</p>
                    <span className="text-[10px] text-slate-500 block">Enregistré par : {h.author}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setHistoryHive(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Move Hive to another Apiary */}
      {moveHive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Déplacer la Ruche {moveHive.hiveNumber}</h3>
              </div>
              <button onClick={() => setMoveHive(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMove} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Rucher actuel : <strong className="text-white">{moveHive.apiaryName}</strong>. 
                Le numéro unique <strong>{moveHive.hiveNumber}</strong> est conservé et le transfert sera inscrit à vie dans son historique.
              </p>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nouveau rucher d'accueil *</label>
                <select
                  value={targetApiaryId}
                  onChange={e => setTargetApiaryId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {store.apiaries.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.village})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Motif du déplacement *</label>
                <input
                  type="text"
                  required
                  value={moveReason}
                  onChange={e => setMoveReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMoveHive(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition"
                >
                  Valider le déplacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Transfer Owner */}
      {transferOwnerHive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Changer le Propriétaire de la Ruche {transferOwnerHive.hiveNumber}</h3>
              </div>
              <button onClick={() => setTransferOwnerHive(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Propriétaire actuel : <strong className="text-white">{transferOwnerHive.ownerName}</strong>. 
                Le numéro permanent <strong>{transferOwnerHive.hiveNumber}</strong> reste identique.
              </p>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nouveau Propriétaire Apiculteur *</label>
                <select
                  value={targetOwnerId}
                  onChange={e => setTargetOwnerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {store.beekeepers.map(b => (
                    <option key={b.id} value={b.id}>{b.fullName} ({b.memberNumber} - {b.village})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Motif de la cession / transfert *</label>
                <input
                  type="text"
                  required
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferOwnerHive(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition"
                >
                  Confirmer le transfert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Update Colonization Status */}
      {colonizationHive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Suivi Colonie • Ruche {colonizationHive.hiveNumber}</h3>
              </div>
              <button onClick={() => setColonizationHive(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteColonizationChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nouvel état de la ruche *</label>
                <select
                  value={newColonyStatus}
                  onChange={e => setNewColonyStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="occupee">Occupée (Nouvel essaim installé)</option>
                  <option value="recolonisee">Recolonisée (Retour/recolonisation)</option>
                  <option value="vide">Vide (Départ de l'essaim)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Date de l'événement</label>
                <input
                  type="date"
                  value={colonyEventDate}
                  onChange={e => setColonyEventDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {newColonyStatus !== 'vide' && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Force de la colonie</label>
                  <select
                    value={newColonyStrength}
                    onChange={e => setNewColonyStrength(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="forte">Colonie forte & vigoureuse</option>
                    <option value="moyenne">Colonie moyenne</option>
                    <option value="faible">Colonie faible</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Observations / Motif</label>
                <textarea
                  rows={2}
                  value={colonyEventDetails}
                  onChange={e => setColonyEventDetails(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setColonizationHive(null)}
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
