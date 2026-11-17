import React, { useState } from 'react';
import { BambouMielStore } from '../../../dataStore';
import { HiveHarvestRecord, BucketSubLot, PhysicalBucket } from '../../../types';
import { 
  Package, 
  Plus, 
  Search, 
  Scale, 
  Calendar, 
  MapPin, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  History, 
  Edit3, 
  User, 
  Droplets,
  Truck,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';

interface HarvestsBucketsTabProps {
  store: BambouMielStore;
  onRefresh: () => void;
}

export default function HarvestsBucketsTab({ store, onRefresh }: HarvestsBucketsTabProps) {
  const [activeSubView, setActiveSubView] = useState<'harvests' | 'buckets' | 'physical_buckets'>('harvests');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddHarvestModal, setShowAddHarvestModal] = useState(false);
  const [showAddBucketModal, setShowAddBucketModal] = useState(false);
  const [correctingSubLot, setCorrectingSubLot] = useState<BucketSubLot | null>(null);

  // Form: New harvest
  const [campaignId, setCampaignId] = useState(store.traceCampaigns.find(c => c.status === 'ouverte')?.id || store.traceCampaigns[0]?.id || '');
  const [hiveId, setHiveId] = useState(store.trackedHives[0]?.id || '');
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [harvestOperator, setHarvestOperator] = useState('Salamatou Gnon & Jean Orou');
  const [weatherConditions, setWeatherConditions] = useState('Ensoleillé, faible hygrométrie');
  const [notes, setNotes] = useState('');

  // Buckets to fill during this harvest (dynamic array)
  const [harvestBuckets, setHarvestBuckets] = useState<Array<{
    physicalBucketNumber: string;
    grossWeightKg: number;
    tareWeightKg: number;
    weighedMaterial: 'gateaux_de_miel' | 'miel_egoutte';
    destination: 'miellerie_centrale' | 'stockage_tampon' | 'egouttage_immediat';
    observations?: string;
  }>>([
    {
      physicalBucketNumber: store.physicalBuckets[0]?.bucketNumber || 'YAM-SEA-000001',
      grossWeightKg: 15.5,
      tareWeightKg: store.physicalBuckets[0]?.tareWeightKg || 1.25,
      weighedMaterial: 'gateaux_de_miel',
      destination: 'miellerie_centrale',
      observations: 'Rayons très mûrs operculés'
    }
  ]);

  // Form: Add physical bucket
  const [newBucketTare, setNewBucketTare] = useState('1.25');
  const [newBucketMaterial, setNewBucketMaterial] = useState<'plastique_alimentaire_pehd' | 'inox'>('plastique_alimentaire_pehd');
  const [newBucketCapacity, setNewBucketCapacity] = useState('20');

  // Form: Correct SubLot
  const [correctionField, setCorrectionField] = useState<'grossWeightKg' | 'tareWeightKg' | 'weighedMaterial' | 'observations'>('grossWeightKg');
  const [correctionNewValue, setCorrectionNewValue] = useState('');
  const [correctionReason, setCorrectionReason] = useState('Erreur de lecture de tare sur la balance de brousse.');
  const [correctionAuthor, setCorrectionAuthor] = useState('Jean Orou (Resp. Miellerie)');

  const nextBucketNumber = store.generateBucketNumber();

  const handleAddBucketRow = () => {
    // Find next unused or available bucket
    const available = store.physicalBuckets.find(b => !harvestBuckets.some(hb => hb.physicalBucketNumber === b.bucketNumber));
    const bucketNum = available ? available.bucketNumber : store.generateBucketNumber();
    const tare = available ? available.tareWeightKg : 1.25;

    setHarvestBuckets([
      ...harvestBuckets,
      {
        physicalBucketNumber: bucketNum,
        grossWeightKg: 10.0,
        tareWeightKg: tare,
        weighedMaterial: 'gateaux_de_miel',
        destination: 'miellerie_centrale',
        observations: 'Seau supplémentaire pour la même ruche'
      }
    ]);
  };

  const handleRemoveBucketRow = (index: number) => {
    if (harvestBuckets.length <= 1) return;
    setHarvestBuckets(harvestBuckets.filter((_, i) => i !== index));
  };

  const handleUpdateBucketRow = (index: number, updates: Partial<typeof harvestBuckets[0]>) => {
    setHarvestBuckets(harvestBuckets.map((b, i) => {
      if (i === index) {
        const merged = { ...b, ...updates };
        if (updates.physicalBucketNumber) {
          const matched = store.physicalBuckets.find(pb => pb.bucketNumber === updates.physicalBucketNumber);
          if (matched) merged.tareWeightKg = matched.tareWeightKg;
        }
        return merged;
      }
      return b;
    }));
  };

  const handleSubmitHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId || !hiveId) return;

    store.recordHiveHarvest({
      campaignId,
      hiveId,
      date: harvestDate,
      harvestOperator,
      weatherConditions,
      notes,
      buckets: harvestBuckets
    });

    setShowAddHarvestModal(false);
    onRefresh();
  };

  const handleAddPhysicalBucket = (e: React.FormEvent) => {
    e.preventDefault();
    store.addPhysicalBucket({
      tareWeightKg: Number(newBucketTare) || 1.25,
      material: newBucketMaterial,
      capacityLiters: Number(newBucketCapacity) || 20,
      status: 'disponible'
    });
    setShowAddBucketModal(false);
    onRefresh();
  };

  const handleExecuteCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctingSubLot) return;

    store.correctBucketSubLot(
      correctingSubLot.id,
      correctionField,
      correctionNewValue,
      correctionAuthor,
      correctionReason
    );

    setCorrectingSubLot(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              SOUS-MENU 6 • TRAÇABILITÉ PHYSIQUE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {store.hiveHarvests.length} récoltes • {store.bucketSubLots.length} sous-lots seaux
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Récoltes par Ruche, Seaux Dédiés & Pesées
          </h2>
          <p className="text-xs text-slate-400">
            Règle d'or : <strong>Un seau ne contient JAMAIS le miel de deux ruches</strong>. Seaux physiques numérotés <code>YAM-SEA-000001</code>, déduction automatique de tare et historique des corrections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddBucketModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Nouveau Seau Physique</span>
          </button>

          <button
            onClick={() => {
              setHarvestBuckets([{
                physicalBucketNumber: store.physicalBuckets[0]?.bucketNumber || 'YAM-SEA-000001',
                grossWeightKg: 14.5,
                tareWeightKg: store.physicalBuckets[0]?.tareWeightKg || 1.25,
                weighedMaterial: 'gateaux_de_miel',
                destination: 'miellerie_centrale',
                observations: 'Récolte fraîche en rayons'
              }]);
              setShowAddHarvestModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer une Récolte</span>
          </button>
        </div>
      </div>

      {/* Sub-views switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubView('harvests')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubView === 'harvests'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Récoltes de Ruches ({store.hiveHarvests.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('buckets')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubView === 'buckets'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Sous-lots & Seaux Remplis ({store.bucketSubLots.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('physical_buckets')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubView === 'physical_buckets'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Parc des Seaux Physiques ({store.physicalBuckets.length})</span>
        </button>
      </div>

      {/* VIEW 1 : HARVESTS BY HIVE */}
      {activeSubView === 'harvests' && (
        <div className="space-y-4">
          {store.hiveHarvests.map(harvest => {
            const linkedSubLots = store.bucketSubLots.filter(s => s.harvestId === harvest.id);

            return (
              <div 
                key={harvest.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {harvest.harvestNumber}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white">
                        Ruche {harvest.hiveNumber} • {harvest.apiaryName}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        Campagne : {harvest.campaignNumber} • Récolté le {harvest.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">POIDS TOTAL NET</span>
                      <span className="font-mono text-base font-black text-emerald-400">
                        {harvest.totalNetWeightKg} kg net
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sublots for this harvest */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Seau(x) rempli(s) pour cette ruche ({linkedSubLots.length}) :
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {linkedSubLots.map(slot => (
                      <div 
                        key={slot.id}
                        className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-amber-400 font-bold">{slot.subLotNumber}</span>
                          <span className="font-mono text-slate-300 bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                            {slot.physicalBucketNumber}
                          </span>
                        </div>

                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Brut : {slot.grossWeightKg} kg</span>
                          <span>Tare : {slot.tareWeightKg} kg</span>
                          <strong className="text-emerald-400">{slot.netWeightKg} kg net</strong>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-700/40">
                          <span className="capitalize">{slot.weighedMaterial.replace('_', ' ')}</span>
                          <button
                            onClick={() => {
                              setCorrectingSubLot(slot);
                              setCorrectionNewValue(String(slot.grossWeightKg));
                            }}
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Corriger</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corrections badge if any */}
                {harvest.corrections?.length > 0 && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Cette récolte a fait l'objet de <strong>{harvest.corrections.length} correction(s) documentée(s)</strong> (valeurs d'origine conservées).</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2 : ALL BUCKET SUBLOTS */}
      {activeSubView === 'buckets' && (
        <div className="overflow-x-auto bg-slate-900/80 border border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">N° Sous-Lot</th>
                <th className="py-3 px-4">Seau Physique</th>
                <th className="py-3 px-4">Ruche d'Origine</th>
                <th className="py-3 px-4">Apiculteur</th>
                <th className="py-3 px-4">Date Récolte</th>
                <th className="py-3 px-4">Poids Brut</th>
                <th className="py-3 px-4">Tare</th>
                <th className="py-3 px-4 text-emerald-400">Poids Net</th>
                <th className="py-3 px-4">Statut Miellerie</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {store.bucketSubLots.map(slot => (
                <tr key={slot.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{slot.subLotNumber}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{slot.physicalBucketNumber}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{slot.hiveNumber}</td>
                  <td className="py-3 px-4">{slot.ownerName}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{slot.fillDate}</td>
                  <td className="py-3 px-4 font-mono">{slot.grossWeightKg} kg</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{slot.tareWeightKg} kg</td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-400">{slot.netWeightKg} kg</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {slot.receptionStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setCorrectingSubLot(slot);
                        setCorrectionNewValue(String(slot.grossWeightKg));
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold transition"
                    >
                      Corriger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3 : PHYSICAL BUCKETS FLEET */}
      {activeSubView === 'physical_buckets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {store.physicalBuckets.map(pb => (
            <div 
              key={pb.bucketNumber}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-400 font-bold text-sm">{pb.bucketNumber}</span>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  pb.status === 'disponible' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {pb.status}
                </span>
              </div>

              <div className="space-y-1 text-slate-400 text-[11px]">
                <p>Tare enregistrée : <strong className="text-white font-mono">{pb.tareWeightKg} kg</strong></p>
                <p>Contenance : <strong className="text-white">{pb.capacityLiters} Litres</strong></p>
                <p>Matériau : {pb.material === 'inox' ? 'Inox alimentaire' : 'PEHD Alimentaire'}</p>
                <p>Nombre d'utilisations : <strong className="text-amber-400">{pb.totalUsesCount}</strong></p>
              </div>

              {pb.currentSubLotId && (
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                  Contient actuellement : {pb.currentSubLotId}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal 1 : Add New Harvest with Buckets */}
      {showAddHarvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Enregistrer une Récolte de Ruche</h3>
              </div>
              <button onClick={() => setShowAddHarvestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHarvest} className="space-y-4 text-xs">
              
              {/* Campaign and Hive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Campagne de récolte *</label>
                  <select
                    value={campaignId}
                    onChange={e => setCampaignId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {store.traceCampaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.campaignNumber} • {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Ruche récoltée (Unique) *</label>
                  <select
                    value={hiveId}
                    onChange={e => setHiveId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {store.trackedHives.map(h => (
                      <option key={h.id} value={h.id}>{h.hiveNumber} ({h.apiaryName} - {h.ownerName})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date réelle de récolte *</label>
                  <input
                    type="date"
                    required
                    value={harvestDate}
                    onChange={e => setHarvestDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Apiculteur / Intervenant</label>
                  <input
                    type="text"
                    value={harvestOperator}
                    onChange={e => setHarvestOperator(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Strict Rule Notice */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                <strong>Règle d'or de traçabilité Yamtãanu :</strong> Tous les seaux ci-dessous recevront <strong>exclusivement le miel de cette ruche</strong>. Si la récolte est abondante, ajoutez d'autres seaux physiques : chaque seau recevra son sous-lot distinct.
              </div>

              {/* Dynamic Buckets Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    Seaux physiques utilisés ({harvestBuckets.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBucketRow}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un autre seau</span>
                  </button>
                </div>

                {harvestBuckets.map((hb, idx) => {
                  const net = Math.max(0, Math.round((hb.grossWeightKg - hb.tareWeightKg) * 100) / 100);

                  return (
                    <div key={idx} className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 text-xs">Seau #{idx + 1}</span>
                        {harvestBuckets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBucketRow(idx)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Retirer
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Seau physique *</label>
                          <select
                            value={hb.physicalBucketNumber}
                            onChange={e => handleUpdateBucketRow(idx, { physicalBucketNumber: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-xs"
                          >
                            {store.physicalBuckets.map(pb => (
                              <option key={pb.bucketNumber} value={pb.bucketNumber}>
                                {pb.bucketNumber} (tare {pb.tareWeightKg}kg)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Poids brut (kg) *</label>
                          <input
                            type="number"
                            step="0.05"
                            required
                            value={hb.grossWeightKg}
                            onChange={e => handleUpdateBucketRow(idx, { grossWeightKg: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Tare (kg) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={hb.tareWeightKg}
                            onChange={e => handleUpdateBucketRow(idx, { tareWeightKg: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Poids Net calculé</label>
                          <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-emerald-400 font-mono font-bold text-xs">
                            {net} kg net
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Matière pesée *</label>
                          <select
                            value={hb.weighedMaterial}
                            onChange={e => handleUpdateBucketRow(idx, { weighedMaterial: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                          >
                            <option value="gateaux_de_miel">Gâteaux de miel (rayons bruts)</option>
                            <option value="miel_egoutte">Miel égoutté brut</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Destination *</label>
                          <select
                            value={hb.destination}
                            onChange={e => handleUpdateBucketRow(idx, { destination: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                          >
                            <option value="miellerie_centrale">Miellerie Centrale (Lavage & Égouttage)</option>
                            <option value="stockage_tampon">Stockage tampon sécurisé</option>
                            <option value="egouttage_immediat">Égouttage immédiat</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Météo & Notes de récolte</label>
                <input
                  type="text"
                  value={weatherConditions}
                  onChange={e => setWeatherConditions(e.target.value)}
                  placeholder="Ensoleillé, température 32°C..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddHarvestModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition"
                >
                  Valider la récolte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2 : Add Physical Bucket */}
      {showAddBucketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Ajouter un Seau Physique au Parc</h3>
              </div>
              <button onClick={() => setShowAddBucketModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhysicalBucket} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                Numéro gravé unique : <strong className="font-mono text-white">{nextBucketNumber}</strong>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Tare précise à vide (kg) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newBucketTare}
                  onChange={e => setNewBucketTare(e.target.value)}
                  placeholder="1.25"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Matériau de fabrication</label>
                <select
                  value={newBucketMaterial}
                  onChange={e => setNewBucketMaterial(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="plastique_alimentaire_pehd">Plastique PEHD alimentaire haute densité</option>
                  <option value="inox">Inox alimentaire</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Capacité nominale (Litres)</label>
                <input
                  type="number"
                  value={newBucketCapacity}
                  onChange={e => setNewBucketCapacity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBucketModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition"
                >
                  Ajouter au parc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3 : Correct Bucket SubLot with Audit Trail */}
      {correctingSubLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Correction Documentée • Sous-lot {correctingSubLot.subLotNumber}
                </h3>
              </div>
              <button onClick={() => setCorrectingSubLot(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteCorrection} className="space-y-4 text-xs">
              <p className="text-slate-300 text-xs">
                Ruche liée : <strong>{correctingSubLot.hiveNumber}</strong> • Seau : <strong>{correctingSubLot.physicalBucketNumber}</strong>
              </p>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Champ à rectifier *</label>
                <select
                  value={correctionField}
                  onChange={e => {
                    const f = e.target.value as any;
                    setCorrectionField(f);
                    setCorrectionNewValue(String(correctingSubLot[f]));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="grossWeightKg">Poids Brut (actuel: {correctingSubLot.grossWeightKg} kg)</option>
                  <option value="tareWeightKg">Tare du Seau (actuelle: {correctingSubLot.tareWeightKg} kg)</option>
                  <option value="weighedMaterial">Matière pesée (actuelle: {correctingSubLot.weighedMaterial})</option>
                  <option value="observations">Observations</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nouvelle valeur *</label>
                <input
                  type="text"
                  required
                  value={correctionNewValue}
                  onChange={e => setCorrectionNewValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Auteur de la modification *</label>
                <input
                  type="text"
                  required
                  value={correctionAuthor}
                  onChange={e => setCorrectionAuthor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Motif obligatoire de la correction *</label>
                <input
                  type="text"
                  required
                  value={correctionReason}
                  onChange={e => setCorrectionReason(e.target.value)}
                  placeholder="Ex: Rectification de tare après pesée de contrôle miellerie"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-2.5 bg-slate-800 rounded-xl text-[11px] text-slate-400">
                L'ancienne valeur sera enregistrée dans l'historique de traçabilité avec l'auteur, l'horodatage et ce motif.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCorrectingSubLot(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold shadow-md transition"
                >
                  Valider la correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
