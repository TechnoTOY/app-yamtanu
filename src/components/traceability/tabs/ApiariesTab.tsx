import React, { useState } from 'react';
import { BambouMielStore } from '../../../dataStore';
import { Apiary } from '../../../types';
import { 
  MapPin, 
  Plus, 
  Search, 
  Compass, 
  Calendar, 
  User, 
  Layers, 
  Eye, 
  Edit2, 
  Trash2, 
  X,
  Sparkles,
  Navigation
} from 'lucide-react';

interface ApiariesTabProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onSelectApiaryForHives?: (apiaryId: string) => void;
}

export default function ApiariesTab({ store, onRefresh, onSelectApiaryForHives }: ApiariesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState('tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApiary, setEditingApiary] = useState<Apiary | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [ownerId, setOwnerId] = useState(store.beekeepers[0]?.id || '');
  const [gpsCoordinates, setGpsCoordinates] = useState('9.3372, 2.6303');
  const [village, setVillage] = useState('');
  const [commune, setCommune] = useState('Parakou');
  const [installationDate, setInstallationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [accessConditions, setAccessConditions] = useState('Piste 4x4 praticable, sentier ombragé.');
  const [vegetationType, setVegetationType] = useState('Savane arborée mellifère, anacardiers, karité.');
  const [notes, setNotes] = useState('');

  const nextApiaryNumber = store.generateApiaryNumber();

  const handleOpenAdd = () => {
    setEditingApiary(null);
    setName('');
    const firstBkp = store.beekeepers[0];
    if (firstBkp) {
      setOwnerId(firstBkp.id);
      setVillage(firstBkp.village);
      setCommune(firstBkp.commune);
    }
    setGpsCoordinates('9.3372, 2.6303');
    setInstallationDate(new Date().toISOString().split('T')[0]);
    setAccessConditions('Piste 4x4 praticable en toutes saisons.');
    setVegetationType('Anacardiers, néré, karité et fleurs sauvages.');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (apiary: Apiary) => {
    setEditingApiary(apiary);
    setName(apiary.name);
    setOwnerId(apiary.ownerId);
    setGpsCoordinates(apiary.gpsCoordinates);
    setVillage(apiary.village);
    setCommune(apiary.commune);
    setInstallationDate(apiary.installationDate);
    setAccessConditions(apiary.accessConditions);
    setVegetationType(apiary.vegetationType || '');
    setNotes(apiary.notes || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedOwner = store.beekeepers.find(b => b.id === ownerId);
    const ownerName = matchedOwner ? matchedOwner.fullName : 'Inconnu';

    if (editingApiary) {
      store.updateApiary(editingApiary.id, {
        name: name.trim(),
        ownerId,
        ownerName,
        gpsCoordinates: gpsCoordinates.trim(),
        village: village.trim(),
        commune: commune.trim(),
        installationDate,
        accessConditions: accessConditions.trim(),
        vegetationType: vegetationType.trim(),
        notes: notes.trim()
      });
    } else {
      store.addApiary({
        name: name.trim(),
        ownerId,
        ownerName,
        gpsCoordinates: gpsCoordinates.trim(),
        village: village.trim(),
        commune: commune.trim(),
        installationDate,
        accessConditions: accessConditions.trim(),
        vegetationType: vegetationType.trim(),
        status: 'actif',
        notes: notes.trim()
      });
    }

    setShowAddModal(false);
    onRefresh();
  };

  const handleDelete = (id: string, apiaryName: string) => {
    if (window.confirm(`Supprimer le rucher « ${apiaryName} » ?`)) {
      store.deleteApiary(id);
      onRefresh();
    }
  };

  const filteredApiaries = store.apiaries.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.apiaryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwner = filterOwner === 'tous' || a.ownerId === filterOwner;
    return matchesSearch && matchesOwner;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              SOUS-MENU 2 • EMPLACEMENTS GÉOLOCALISÉS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {store.apiaries.length} ruchers recensés
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Ruchers, Conditions d'Accès & Flore Mellifère
          </h2>
          <p className="text-xs text-slate-400">
            Enregistrement automatique <code>YAM-RCR-000001</code>, coordonnées GPS, photos et rattachement aux propriétaires.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Rucher</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom de rucher, numéro, village ou propriétaire..."
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
      </div>

      {/* Apiaries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApiaries.map(apiary => {
          const hivesInApiary = store.trackedHives.filter(h => h.apiaryId === apiary.id);
          const occupiedCount = hivesInApiary.filter(h => h.colonizationStatus !== 'vide').length;

          return (
            <div 
              key={apiary.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {apiary.apiaryNumber}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-amber-400 transition-colors">
                      {apiary.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{apiary.village} ({apiary.commune})</span>
                    </p>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {apiary.status}
                  </span>
                </div>

                {/* Owner info */}
                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Propriétaire : <strong>{apiary.ownerName}</strong></span>
                  </div>
                </div>

                {/* GPS and conditions */}
                <div className="text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <Navigation className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>GPS : {apiary.gpsCoordinates}</span>
                  </div>
                  {apiary.accessConditions && (
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      <strong className="text-slate-300">Accès :</strong> {apiary.accessConditions}
                    </p>
                  )}
                  {apiary.vegetationType && (
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      <strong className="text-amber-400/90">Flore :</strong> {apiary.vegetationType}
                    </p>
                  )}
                </div>

                {/* Hives summary badge */}
                <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-400">Ruches implantées :</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-white">{hivesInApiary.length} total</strong>
                    <span className="text-emerald-400 text-[11px]">({occupiedCount} occupées)</span>
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="pt-3 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectApiaryForHives && onSelectApiaryForHives(apiary.id)}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Voir les ruches</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(apiary)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="Modifier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(apiary.id, apiary.name)}
                    className="p-2 text-red-400/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Apiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingApiary ? 'Modifier le Rucher' : 'Créer un Rucher'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                Numéro automatique attribué : <strong className="font-mono text-white">{editingApiary ? editingApiary.apiaryNumber : nextApiaryNumber}</strong>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nom du Rucher *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Rucher Pilote de Kpébié"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Apiculteur Propriétaire Associé *</label>
                <select
                  value={ownerId}
                  onChange={e => {
                    setOwnerId(e.target.value);
                    const b = store.beekeepers.find(x => x.id === e.target.value);
                    if (b) {
                      setVillage(b.village);
                      setCommune(b.commune);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {store.beekeepers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.memberNumber} - {b.village})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Commune *</label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={e => setCommune(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Village / Localité *</label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Coordonnées GPS</label>
                  <input
                    type="text"
                    value={gpsCoordinates}
                    onChange={e => setGpsCoordinates(e.target.value)}
                    placeholder="9.3372, 2.6303"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
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

              <div>
                <label className="block text-slate-400 font-medium mb-1">Conditions d'accès au site</label>
                <input
                  type="text"
                  value={accessConditions}
                  onChange={e => setAccessConditions(e.target.value)}
                  placeholder="Ex: Piste 4x4 carrossable, sentier sécurisé..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Flore mellifère environnante</label>
                <input
                  type="text"
                  value={vegetationType}
                  onChange={e => setVegetationType(e.target.value)}
                  placeholder="Ex: Anacardiers, karités, nérés, fleurs sauvages..."
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
                  {editingApiary ? 'Enregistrer les modifications' : 'Créer le rucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
