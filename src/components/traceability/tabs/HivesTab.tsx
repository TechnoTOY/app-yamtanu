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
  HelpCircle,
  Navigation,
  Link2
} from 'lucide-react';

interface HivesTabProps {
  store: BambouMielStore;
  onRefresh: () => void;
  selectedApiaryIdFilter?: string | null;
}

export default function HivesTab({ store, onRefresh, selectedApiaryIdFilter }: HivesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState('tous');
  const [filterApiary, setFilterApiary] = useState(selectedApiaryIdFilter || 'tous');
  const [filterCategory, setFilterCategory] = useState<'toutes' | 'ecolo_artisanale' | 'ciment_barrettes_superieures'>('toutes');
  const [filterOccupation, setFilterOccupation] = useState<'toutes' | 'vide' | 'occupee' | 'recolonisee'>('toutes');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [historyHive, setHistoryHive] = useState<TrackedHive | null>(null);
  const [moveHive, setMoveHive] = useState<TrackedHive | null>(null);
  const [transferOwnerHive, setTransferOwnerHive] = useState<TrackedHive | null>(null);
  const [colonizationHive, setColonizationHive] = useState<TrackedHive | null>(null);

  // Form states: New hive (supports batch creation of N hives in 1 click)
  const [apiaryId, setApiaryId] = useState(store.apiaries[0]?.id || '');
  const [batchQuantity, setBatchQuantity] = useState<number>(1);
  const [useCustomNumbering, setUseCustomNumbering] = useState(false);
  const [customPrefix, setCustomPrefix] = useState('YAM/26/');
  const [customStartSeq, setCustomStartSeq] = useState<number>(1);
  const [hiveGps, setHiveGps] = useState('');
  const [isLocatingHive, setIsLocatingHive] = useState(false);
  const [originMode, setOriginMode] = useState<'piege_appatee' | 'essaimage_naturel' | 'couplage' | 'division' | 'transvasement'>('piege_appatee');
  const [coupledWithHive, setCoupledWithHive] = useState('');
  const [category, setCategory] = useState<'ecolo_artisanale' | 'ciment_barrettes_superieures'>('ecolo_artisanale');
  const [installationDate, setInstallationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [colonizationStatus, setColonizationStatus] = useState<'vide' | 'occupee' | 'recolonisee'>('vide');
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

  // Colonization / Couplage change state
  const [newColonyStatus, setNewColonyStatus] = useState<'vide' | 'occupee' | 'recolonisee'>('occupee');
  const [colonyEventKind, setColonyEventKind] = useState<'colonisation' | 'recolonisation' | 'depart' | 'appatage' | 'couplage' | 'division'>('colonisation');
  const [colonyCoupledHive, setColonyCoupledHive] = useState('');
  const [colonyEventDate, setColonyEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [colonyEventDetails, setColonyEventDetails] = useState('Capture d’un nouvel essaim sauvage vigoureux.');
  const [newColonyStrength, setNewColonyStrength] = useState<'forte' | 'moyenne' | 'faible'>('forte');

  const nextHiveNumber = store.generateHiveNumber();

  const computeEndHiveNumber = (startNum: string, qty: number): string => {
    const match = startNum.match(/^(.*?)(\d+)$/);
    if (!match || qty <= 1) return startNum;
    const startSeq = parseInt(match[2], 10);
    const padLen = match[2].length;
    return `${match[1]}${String(startSeq + qty - 1).padStart(padLen, '0')}`;
  };

  const previewStartNum = useCustomNumbering
    ? `${customPrefix}${String(customStartSeq).padStart(3, '0')}`
    : nextHiveNumber;

  const handleCaptureHiveGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setIsLocatingHive(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHiveGps(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setIsLocatingHive(false);
      },
      () => {
        setIsLocatingHive(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleOpenAdd = (defaultQty = 1) => {
    const firstApiary =
      (filterApiary !== 'tous' ? store.apiaries.find(a => a.id === filterApiary) : null) ||
      (filterOwner !== 'tous' ? store.apiaries.find(a => a.ownerId === filterOwner) : null) ||
      store.apiaries[0];
    if (firstApiary) {
      setApiaryId(firstApiary.id);
      setHiveGps(firstApiary.gpsCoordinates || '');
    }
    setBatchQuantity(defaultQty);
    setUseCustomNumbering(false);
    setOriginMode('piege_appatee');
    setCoupledWithHive('');
    setCategory('ecolo_artisanale');
    setInstallationDate(new Date().toISOString().split('T')[0]);
    setColonizationStatus('vide');
    setColonyStrength('forte');
    setNotes('');
    setShowAddModal(true);
  };

  const handleCreateHive = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedApiary = store.apiaries.find(a => a.id === apiaryId);
    if (!matchedApiary) return;

    const qty = Math.max(1, Math.min(200, Math.floor(batchQuantity || 1)));
    const payload = {
      apiaryId: matchedApiary.id,
      apiaryNumber: matchedApiary.apiaryNumber,
      apiaryName: matchedApiary.name,
      ownerId: matchedApiary.ownerId,
      ownerName: matchedApiary.ownerName,
      gpsCoordinates: hiveGps.trim() || matchedApiary.gpsCoordinates,
      originMode,
      coupledWithHive: coupledWithHive.trim() || undefined,
      category,
      installationDate,
      colonizationStatus,
      colonyStrength,
      status: 'active' as const,
      notes: notes.trim()
    };

    if (qty === 1) {
      store.addTrackedHive({
        ...payload,
        customHiveNumber: useCustomNumbering ? previewStartNum : undefined
      });
    } else {
      store.addTrackedHivesBatch(
        {
          ...payload,
          customPrefix: useCustomNumbering ? customPrefix : undefined,
          customStartSeq: useCustomNumbering ? customStartSeq : undefined
        },
        qty
      );
    }

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
      newColonyStrength,
      colonyEventKind,
      colonyCoupledHive
    );

    setColonizationHive(null);
    onRefresh();
  };

  const filteredHives = store.trackedHives.filter(h => {
    const matchesSearch = h.hiveNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.apiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwner = filterOwner === 'tous' || h.ownerId === filterOwner;
    const matchesApiary = filterApiary === 'tous' || h.apiaryId === filterApiary;
    const matchesCategory = filterCategory === 'toutes' || h.category === filterCategory;
    const matchesOccupation = filterOccupation === 'toutes' || h.colonizationStatus === filterOccupation;
    return matchesSearch && matchesOwner && matchesApiary && matchesCategory && matchesOccupation;
  });

  const filteredOccupied = filteredHives.filter(h => h.colonizationStatus !== 'vide').length;
  const filteredEmpty = filteredHives.length - filteredOccupied;
  const activeGpsList = Array.from(
    new Set(
      filteredHives
        .map(h => h.gpsCoordinates || store.apiaries.find(a => a.id === h.apiaryId)?.gpsCoordinates)
        .filter((g): g is string => Boolean(g))
    )
  );

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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenAdd(1)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter 1 ou Lot de Ruches</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="N° Ruche (ex: YAM/26/001)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={filterOwner}
          onChange={e => setFilterOwner(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="tous">Tous les apiculteurs</option>
          {store.beekeepers.map(b => (
            <option key={b.id} value={b.id}>{b.fullName}</option>
          ))}
        </select>

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
          <option value="vide">Vide (Piège / En attente)</option>
        </select>
      </div>

      {/* Live Summary Strip for Selected Beekeeper / Apiary */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
            Nombre de ruches : <strong className="font-mono text-white">{filteredHives.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
            Occupées : <strong>{filteredOccupied}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
            Vides / Pièges : <strong>{filteredEmpty}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
          {filteredHives.length > 0 && (
            <span className="font-mono text-amber-300/90 truncate max-w-md" title={filteredHives.map(h => h.hiveNumber).join(', ')}>
              Numéros : {filteredHives.slice(0, 6).map(h => h.hiveNumber).join(', ')}
              {filteredHives.length > 6 ? ` (+${filteredHives.length - 6})` : ''}
            </span>
          )}
          {activeGpsList.length > 0 && (
            <a
              href={`https://www.google.com/maps?q=${encodeURIComponent(activeGpsList[0])}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono underline shrink-0"
            >
              <Navigation className="w-3 h-3" />
              <span>GPS : {activeGpsList[0]}{activeGpsList.length > 1 ? ` (+${activeGpsList.length - 1})` : ''}</span>
            </a>
          )}
        </div>
      </div>

      {/* Hives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHives.map(hive => {
          const isOccupied = hive.colonizationStatus !== 'vide';
          const resolvedGps = hive.gpsCoordinates || store.apiaries.find(a => a.id === hive.apiaryId)?.gpsCoordinates;

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

                {/* Location, Owner & GPS */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Rucher : <strong>{hive.apiaryName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Propriétaire : <strong>{hive.ownerName}</strong></span>
                  </div>
                  {resolvedGps && (
                    <div className="flex items-center justify-between gap-1 text-[10.5px] text-slate-400 font-mono pt-0.5">
                      <span className="flex items-center gap-1 truncate">
                        <Navigation className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{resolvedGps}</span>
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(resolvedGps)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-sans underline shrink-0"
                      >
                        Carte
                      </a>
                    </div>
                  )}
                  {(hive.originMode || hive.coupledWithHive) && (
                    <div className="flex items-center gap-1.5 text-[10.5px] text-amber-300 pt-0.5">
                      <Link2 className="w-3 h-3 shrink-0" />
                      <span>
                        {hive.originMode === 'couplage'
                          ? 'Couplage'
                          : hive.originMode === 'division'
                          ? 'Division'
                          : hive.originMode === 'piege_appatee'
                          ? 'Ruche piège appâtée'
                          : hive.originMode === 'transvasement'
                          ? 'Transvasement'
                          : 'Essaimage naturel'}
                        {hive.coupledWithHive ? ` (${hive.coupledWithHive})` : ''}
                      </span>
                    </div>
                  )}
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
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition cursor-pointer"
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
                    const nextStatus = hive.colonizationStatus === 'vide' ? 'occupee' : 'vide';
                    setNewColonyStatus(nextStatus);
                    setColonyEventKind(nextStatus === 'vide' ? 'depart' : 'colonisation');
                    setColonyCoupledHive(hive.coupledWithHive || '');
                    setColonyEventDetails(
                      nextStatus === 'vide'
                        ? 'Départ / essaimage constaté lors de la visite.'
                        : 'Capture et installation d’un essaim actif.'
                    );
                  }}
                  className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-[11px] font-medium cursor-pointer"
                  title="Déclarer colonisation, appâtage, couplage ou départ"
                >
                  Colonie / Couplage
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

            <form onSubmit={handleCreateHive} className="space-y-4 text-xs max-h-[78vh] overflow-y-auto pr-1">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 space-y-1">
                <div>
                  {batchQuantity > 1 ? 'Numéros séquentiels générés :' : 'Numéro unique permanent attribué :'}{' '}
                  <strong className="font-mono text-white text-sm">
                    {batchQuantity > 1
                      ? `${previewStartNum} → ${computeEndHiveNumber(previewStartNum, batchQuantity)} (${batchQuantity} ruches)`
                      : previewStartNum}
                  </strong>
                </div>
                <p className="text-[11px] text-amber-300/80">
                  Chaque ruche reçoit son propre numéro permanent indépendant (1 ruche = 1 fiche individuelle).
                </p>
              </div>

              {/* Quantité à créer d'un coup */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-slate-300 font-bold">
                    Nombre de ruches à ajouter dans ce rucher :
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(Math.max(1, Math.min(200, parseInt(e.target.value || '1', 10) || 1)))}
                    className="w-20 bg-slate-800 border border-amber-500/50 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 5, 10, 15, 20, 30, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBatchQuantity(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        batchQuantity === preset
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {preset === 1 ? '1 ruche' : `+${preset} ruches`}
                    </button>
                  ))}
                </div>

                {/* Optional custom physical tag prefix */}
                <div className="pt-1 border-t border-slate-800/80">
                  <label className="inline-flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomNumbering}
                      onChange={(e) => setUseCustomNumbering(e.target.checked)}
                      className="rounded border-slate-600 accent-amber-500"
                    />
                    <span>Personnaliser le préfixe / numéro de départ (si vos ruches ont déjà des étiquettes)</span>
                  </label>
                  {useCustomNumbering && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        value={customPrefix}
                        onChange={(e) => setCustomPrefix(e.target.value)}
                        placeholder="Ex: KPE-"
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono"
                      />
                      <input
                        type="number"
                        min={1}
                        value={customStartSeq}
                        onChange={(e) => setCustomStartSeq(Math.max(1, parseInt(e.target.value || '1', 10) || 1))}
                        placeholder="N° départ"
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Rucher d'implantation initial *</label>
                <select
                  value={apiaryId}
                  onChange={e => {
                    setApiaryId(e.target.value);
                    const matched = store.apiaries.find(a => a.id === e.target.value);
                    if (matched?.gpsCoordinates) setHiveGps(matched.gpsCoordinates);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {store.apiaries.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.village} - Propriétaire: {a.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Géolocalisation GPS (héritée du rucher ou capturée sur le terrain) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-medium">Géolocalisation GPS</label>
                  <button
                    type="button"
                    onClick={handleCaptureHiveGps}
                    disabled={isLocatingHive}
                    className="text-[10.5px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{isLocatingHive ? 'Capture...' : 'Capturer GPS exact'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={hiveGps}
                  onChange={e => setHiveGps(e.target.value)}
                  placeholder="Hérité automatiquement du rucher..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Catégorie de Ruche *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ecolo_artisanale">🌿 Écolo-artisanale (Bambou)</option>
                    <option value="ciment_barrettes_superieures">🏛️ Ciment à barrettes sup.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date d'installation</label>
                  <input
                    type="date"
                    value={installationDate}
                    onChange={e => setInstallationDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Mode de mise en place (Installation / Appâtage / Colonisation / Couplage / Division) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Mode d'installation / origine</label>
                  <select
                    value={originMode}
                    onChange={e => {
                      const val = e.target.value as typeof originMode;
                      setOriginMode(val);
                      if (val === 'piege_appatee') {
                        setColonizationStatus('vide');
                      } else {
                        setColonizationStatus('occupee');
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="piege_appatee">🪤 Ruche piège appâtée (Vide en attente)</option>
                    <option value="essaimage_naturel">🐝 Déjà colonisée (Essaim naturel)</option>
                    <option value="couplage">🔗 Couplage de colonies</option>
                    <option value="division">✂️ Division / Essaimage artificiel</option>
                    <option value="transvasement">📦 Transvasement colonie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">État actuel de colonie</label>
                  <select
                    value={colonizationStatus}
                    onChange={e => setColonizationStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="vide">Ruche vide (Appâtée / En attente)</option>
                    <option value="occupee">Colonie occupée</option>
                    <option value="recolonisee">Colonie recolonisée</option>
                  </select>
                </div>
              </div>

              {(originMode === 'couplage' || originMode === 'division') && (
                <div>
                  <label className="block text-amber-300 font-medium mb-1">
                    N° de ruche couplée / ruche mère (optionnel)
                  </label>
                  <input
                    type="text"
                    value={coupledWithHive}
                    onChange={e => setCoupledWithHive(e.target.value)}
                    placeholder="Ex: YAM/26/002"
                    className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

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
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition cursor-pointer"
                >
                  {batchQuantity > 1 ? `Installer les ${batchQuantity} ruches` : 'Valider l\'installation'}
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
                <label className="block text-slate-400 font-medium mb-1">Nature de l&apos;opération *</label>
                <select
                  value={colonyEventKind}
                  onChange={e => {
                    const kind = e.target.value as typeof colonyEventKind;
                    setColonyEventKind(kind);
                    if (kind === 'depart' || kind === 'appatage') {
                      setNewColonyStatus('vide');
                    } else if (kind === 'recolonisation') {
                      setNewColonyStatus('recolonisee');
                    } else {
                      setNewColonyStatus('occupee');
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="appatage">🪤 Appâtage / Pose de piège à essaim (Vide)</option>
                  <option value="colonisation">🐝 Colonisation (Arrivée d&apos;essaim)</option>
                  <option value="couplage">🔗 Couplage (Réunion / Renforcement de colonies)</option>
                  <option value="division">✂️ Division / Essaimage artificiel</option>
                  <option value="recolonisation">🔄 Recolonisation après départ</option>
                  <option value="depart">⚠️ Départ / Désertion d&apos;essaim (Ruche vide)</option>
                </select>
              </div>

              {(colonyEventKind === 'couplage' || colonyEventKind === 'division') && (
                <div>
                  <label className="block text-amber-300 font-medium mb-1">
                    N° Ruche couplée / Ruche mère associée
                  </label>
                  <input
                    type="text"
                    value={colonyCoupledHive}
                    onChange={e => setColonyCoupledHive(e.target.value)}
                    placeholder="Ex: YAM/26/002"
                    className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Date de l&apos;événement</label>
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
                    <option value="forte">Colonie forte &amp; vigoureuse</option>
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
