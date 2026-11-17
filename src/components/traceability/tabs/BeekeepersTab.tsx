import React, { useState } from 'react';
import { BambouMielStore } from '../../../dataStore';
import { BeekeeperOwner } from '../../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Award, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  UserCheck, 
  CreditCard,
  Printer,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Navigation
} from 'lucide-react';
import { readFileAsDataURL, compressImage } from '../../../utils/imageUtils';

interface BeekeepersTabProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onSelectBeekeeperForCard: (beekeeper: BeekeeperOwner) => void;
}

export default function BeekeepersTab({ store, onRefresh, onSelectBeekeeperForCard }: BeekeepersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommune, setFilterCommune] = useState('toutes');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBeekeeper, setEditingBeekeeper] = useState<BeekeeperOwner | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Apiculteur');
  const [phone, setPhone] = useState('+229 ');
  const [commune, setCommune] = useState('Parakou');
  const [village, setVillage] = useState('');
  const [cinOrIdCard, setCinOrIdCard] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const nextMemberNumber = store.generateBeekeeperNumber();

  const handleOpenAdd = () => {
    setEditingBeekeeper(null);
    setFullName('');
    setRoleTitle('Apiculteur');
    setPhone('+229 ');
    setCommune('Parakou');
    setVillage('');
    setCinOrIdCard('');
    setPhotoUrl('');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (bkp: BeekeeperOwner) => {
    setEditingBeekeeper(bkp);
    setFullName(bkp.fullName);
    setRoleTitle(bkp.roleTitle || 'Apiculteur');
    setPhone(bkp.phone);
    setCommune(bkp.commune);
    setVillage(bkp.village);
    setCinOrIdCard(bkp.cinOrIdCard || '');
    setPhotoUrl(bkp.photoUrl || '');
    setJoinDate(bkp.joinDate);
    setNotes(bkp.notes || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !village.trim()) return;

    if (editingBeekeeper) {
      store.updateBeekeeper(editingBeekeeper.id, {
        fullName: fullName.trim(),
        roleTitle: roleTitle.trim() || 'Apiculteur',
        phone: phone.trim(),
        commune,
        village: village.trim(),
        cinOrIdCard: cinOrIdCard.trim(),
        photoUrl: photoUrl.trim() || undefined,
        joinDate,
        notes: notes.trim()
      });
    } else {
      store.addBeekeeper({
        fullName: fullName.trim(),
        roleTitle: roleTitle.trim() || 'Apiculteur',
        phone: phone.trim(),
        commune,
        village: village.trim(),
        cinOrIdCard: cinOrIdCard.trim(),
        photoUrl: photoUrl.trim() || undefined,
        joinDate,
        status: 'actif',
        validationStatus: 'valide',
        validatedBy: 'DG SARKI Yantannou',
        notes: notes.trim()
      });
    }

    setShowAddModal(false);
    onRefresh();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Supprimer l'apiculteur ${name} ?`)) {
      store.deleteBeekeeper(id);
      onRefresh();
    }
  };

  const filteredBeekeepers = store.beekeepers.filter(b => {
    const matchesSearch = b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.village.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCommune = filterCommune === 'toutes' || b.commune === filterCommune;
    return matchesSearch && matchesCommune;
  });

  const uniqueCommunes = Array.from(new Set(store.beekeepers.map(b => b.commune)));

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              SOUS-MENU 1 • IDENTITÉS PERMANENTES
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {store.beekeepers.length} membres enregistrés
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Propriétaires de Ruches & Génération Carte de Membre
          </h2>
          <p className="text-xs text-slate-400">
            Enregistrement unique de chaque apiculteur. Attribution du numéro permanent <code>YAM-PRO-000001</code> et édition de la carte officielle.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Inscrire un Propriétaire</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, n° de membre, village..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={filterCommune}
          onChange={e => setFilterCommune(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="toutes">Toutes les communes</option>
          {uniqueCommunes.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeekeepers.map(beekeeper => {
          const ownerApiaries = store.apiaries.filter(a => a.ownerId === beekeeper.id);
          const ownerHives = store.trackedHives.filter(h => h.ownerId === beekeeper.id);
          const apiaryCount = ownerApiaries.length;
          const hiveCount = ownerHives.length;
          const occupiedCount = ownerHives.filter(h => h.colonizationStatus !== 'vide').length;
          const emptyCount = hiveCount - occupiedCount;
          const primaryGps = ownerApiaries.find(a => a.gpsCoordinates)?.gpsCoordinates || ownerHives.find(h => h.gpsCoordinates)?.gpsCoordinates;
          const hiveNumbersPreview = ownerHives.slice(0, 6).map(h => h.hiveNumber).join(', ');

          return (
            <div 
              key={beekeeper.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Top card row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 rounded-xl bg-slate-800 border border-amber-500/30 overflow-hidden shrink-0">
                      {beekeeper.photoUrl ? (
                        <img src={beekeeper.photoUrl} alt={beekeeper.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Users className="w-6 h-6 text-amber-500/50" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block w-fit">
                        {beekeeper.memberNumber}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1 group-hover:text-amber-400 transition-colors">
                        {beekeeper.fullName}
                      </h3>
                      <p className="text-[10.5px] font-semibold text-amber-300/90 mt-0.5">
                        {beekeeper.roleTitle || 'Apiculteur'}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400/80 shrink-0" />
                        <span>{beekeeper.village}, {beekeeper.commune}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {beekeeper.status}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-slate-800/80 my-2 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-[11px] truncate">{beekeeper.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-[11px]">{beekeeper.joinDate}</span>
                  </div>
                </div>

                {/* Linked assets stats + Hive numbers + GPS */}
                <div className="space-y-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Ruchers : <strong className="text-white">{apiaryCount}</strong></span>
                    <span>
                      Ruches : <strong className="text-amber-400">{hiveCount}</strong>
                      {hiveCount > 0 && (
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({occupiedCount} occ. / {emptyCount} vid.)
                        </span>
                      )}
                    </span>
                  </div>

                  {hiveCount > 0 && (
                    <div className="text-[10px] text-amber-300/90 font-mono truncate" title={ownerHives.map(h => h.hiveNumber).join(', ')}>
                      N° : {hiveNumbersPreview}{ownerHives.length > 6 ? ` (+${ownerHives.length - 6})` : ''}
                    </div>
                  )}

                  {primaryGps && (
                    <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 truncate">
                        <Navigation className="w-3 h-3 text-emerald-400 shrink-0" />
                        GPS : {primaryGps}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(primaryGps)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline font-sans shrink-0"
                      >
                        Carte
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectBeekeeperForCard(beekeeper)}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500 hover:to-amber-600 text-amber-300 hover:text-slate-950 font-bold text-xs rounded-xl border border-amber-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Carte / Télécharger</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(beekeeper)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="Modifier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(beekeeper.id, beekeeper.fullName)}
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

      {/* Modal Add / Edit Beekeeper */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingBeekeeper ? 'Modifier le Propriétaire' : 'Inscrire un Propriétaire de Ruches'}
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
                Numéro automatique permanent attribué : <strong className="font-mono text-white">{editingBeekeeper ? editingBeekeeper.memberNumber : nextMemberNumber}</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nom et Prénom *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ex: Salamatou Gnon"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fonction sur la carte de membre</label>
                  <input
                    type="text"
                    list="member-role-suggestions"
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                    placeholder="Ex: Apiculteur, Responsable Rucher..."
                    maxLength={32}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="member-role-suggestions">
                    <option value="Apiculteur" />
                    <option value="Apicultrice" />
                    <option value="Producteur" />
                    <option value="Responsable de Rucher" />
                    <option value="Technicien Miellerie" />
                    <option value="Tresseur de Ruches" />
                    <option value="Chef d'Atelier Jus & Thés" />
                    <option value="Coopérateur" />
                    <option value="Partenaire" />
                    <option value="Membre Honoraire" />
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Téléphone Mobile</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date d'adhésion</label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={e => setJoinDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Commune *</label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={e => setCommune(e.target.value)}
                    placeholder="Ex: Parakou, Ouidah, Grand-Popo"
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
                    placeholder="Ex: Kpébié, Avlo, Pahou"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Import photo from computer or phone */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Photo de l'Apiculteur (Import depuis ordinateur ou téléphone)
                </label>
                
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    <div className="relative w-16 h-16 rounded-xl bg-slate-800 border-2 border-amber-500/40 overflow-hidden shrink-0 group">
                      <img src={photoUrl} alt="Aperçu" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-red-400 font-bold text-[10px]"
                        title="Supprimer la photo"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 shrink-0">
                      <Camera className="w-6 h-6 text-slate-400 mb-0.5" />
                      <span className="text-[8px] font-bold">Aucune</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{photoUrl ? 'Changer la photo' : 'Importer une photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const rawData = await readFileAsDataURL(file);
                              const compressed = await compressImage(rawData, 500, 500, 0.85);
                              setPhotoUrl(compressed);
                            } catch (err) {
                              console.error('Erreur chargement photo', err);
                            }
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">
                      Prenez une photo avec votre caméra ou sélectionnez un fichier (JPG, PNG).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Notes et observations</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Expérience, ruches gérées, engagement dans la coopérative..."
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
                  {editingBeekeeper ? 'Enregistrer les modifications' : 'Valider l\'adhésion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
