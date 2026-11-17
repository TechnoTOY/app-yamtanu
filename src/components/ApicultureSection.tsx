import React, { useState } from 'react';
import { BambouMielStore } from '../dataStore';
import { InstalledHive, BambooHivePreform, HiveInspection, Harvest, HarvestCampaign } from '../types';
import { 
  Hammer, 
  MapPin, 
  Eye, 
  Compass, 
  ClipboardCheck, 
  FilePlus, 
  Coins, 
  Calendar,
  Layers,
  Activity,
  Droplets,
  CalendarDays,
  UserCheck,
  Settings
} from 'lucide-react';

interface ApicultureSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onNavigateToConfig?: (listType: 'locations' | 'artisans' | 'juiceFlavors' | 'teaBlends' | 'clients' | 'carriers' | 'products') => void;
}

export default function ApicultureSection({ store, onRefresh, onNavigateToConfig }: ApicultureSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'bambou' | 'ruches' | 'inspections' | 'recoltes'>('ruches');
  
  const formatDateToFR = (dateStr: string) => {
    if (!dateStr) return '';
    const cleanStr = dateStr.trim();

    // 1. Slash-separated formats (e.g. 12/05/2026, 12/5/26, 2/5/2026)
    if (cleanStr.includes('/')) {
      const parts = cleanStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) {
          year = `20${year}`;
        }
        return `${day}/${month}/${year}`;
      }
    }

    // 2. Dash-separated formats (e.g. 2026-05-12, 12-05-2026)
    if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD -> DD/MM/YYYY
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          const day = parts[2].padStart(2, '0');
          return `${day}/${month}/${year}`;
        } else {
          // Assume DD-MM-YYYY -> DD/MM/YYYY
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          let year = parts[2];
          if (year.length === 2) {
            year = `20${year}`;
          }
          return `${day}/${month}/${year}`;
        }
      }
    }

    // Fallback try-catch using native Date with strict check
    try {
      const d = new Date(cleanStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {}

    return dateStr;
  };
  
  // States for selected hive details
  const [selectedHiveId, setSelectedHiveId] = useState<string | null>(store.hives[0]?.id || null);

  // Form states: Bamboo preform
  const [bambooQty, setBambooQty] = useState('12');
  const [artisan, setArtisan] = useState('');
  const [customArtisan, setCustomArtisan] = useState('');
  const [bambooStatus, setBambooStatus] = useState<'complete' | 'en_cours'>('complete');
  const [bambooCenter, setBambooCenter] = useState('Atelier Central de Ouidah');

  // Form states: Hive install
  const [selectedPreformId, setSelectedPreformId] = useState('');
  const [locationName, setLocationName] = useState(store.locations[0] || '');
  const [customLocation, setCustomLocation] = useState('');
  const [gps, setGps] = useState('4.3225, 11.5140');
  const [hiveBeekeeper, setHiveBeekeeper] = useState('Salamatou Gnon');
  const [hiveCount, setHiveCount] = useState('1');
  const [hiveNumbers, setHiveNumbers] = useState('BAM-OU-05');
  const [hiveCommune, setHiveCommune] = useState('Ouidah');
  const [hiveVillage, setHiveVillage] = useState('Pahou');

  // Form states: Inspection
  const [inspHiveId, setInspHiveId] = useState(store.hives[0]?.id || '');
  const [health, setHealth] = useState<'excellent' | 'normal' | 'faible'>('excellent');
  const [queen, setQueen] = useState(true);
  const [parasites, setParasites] = useState(false);
  const [humidity, setHumidity] = useState('18.0');
  const [honeyEst, setHoneyEst] = useState('8');
  const [inspNotes, setInspNotes] = useState('');
  const [inspectedBy, setInspectedBy] = useState('');
  const [broodPresence, setBroodPresence] = useState<'oui' | 'non'>('oui');
  const [queenCells, setQueenCells] = useState(false);
  const [activityLevel, setActivityLevel] = useState<'tres_actif' | 'moyen' | 'faible'>('moyen');

  // Form states: Harvest
  const [harvHiveId, setHarvHiveId] = useState(store.hives[0]?.id || '');
  const [harvQty, setHarvQty] = useState('12.5');
  const [harvMoisture, setHarvMoisture] = useState('17.8');
  const [harvColor, setHarvColor] = useState<'extra_blanc' | 'blanc' | 'ambre_clair' | 'ambre' | 'sombre'>('ambre_clair');
  const [harvGrade, setHarvGrade] = useState<'AA' | 'A' | 'B'>('AA');
  const [harvestedBy, setHarvestedBy] = useState('');
  const [weatherConditions, setWeatherConditions] = useState('Ensoleillé');
  const [batchReference, setBatchReference] = useState('LOT-HARV-BAM-03');

  // New Harvest Campaign states
  const [recolteSubView, setRecolteSubView] = useState<'liste' | 'campagnes'>('liste');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(store.campaigns[0]?.id || '');
  const [campName, setCampName] = useState('');
  const [campStartDate, setCampStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [campEndDate, setCampEndDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [campStatus, setCampStatus] = useState<'active' | 'terminee'>('active');
  const [campDescription, setCampDescription] = useState('');

  // Logic handlers
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) return alert('Veuillez saisir le nom de la campagne de récolte.');
    const newCamp = store.addCampaign({
      name: campName.trim(),
      startDate: campStartDate,
      endDate: campEndDate,
      status: campStatus,
      description: campDescription.trim() || undefined
    });
    setCampName('');
    setCampDescription('');
    setSelectedCampaignId(newCamp.id);
    onRefresh();
  };
  const handleCreatePreform = (e: React.FormEvent) => {
    e.preventDefault();
    const finalArtisan = artisan === 'Autre' ? customArtisan : artisan;
    if (!finalArtisan) return alert('Saisissez le nom de l\'artisan vanneuse/vannier.');
    store.addPreform({
      createdAt: new Date().toISOString().split('T')[0],
      bambooQtyUsed: parseInt(bambooQty) || 12,
      status: bambooStatus,
      artisanName: finalArtisan,
      centerName: bambooCenter
    });
    // Dynamically save new artisan to choices
    if (artisan === 'Autre') {
      store.addCustomChoice('artisans', customArtisan);
    }
    setArtisan('');
    setCustomArtisan('');
    onRefresh();
  };

  const handleInstallHive = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLocation = locationName === 'Autre' ? customLocation : locationName;
    if (!finalLocation) return alert('Veuillez spécifier un emplacement pour le rucher.');

    store.addHive({
      preformId: selectedPreformId || 'STANDARD',
      locationName: finalLocation,
      gpsCoordinates: gps || '0.0000, 0.0000',
      installedAt: new Date().toISOString().split('T')[0],
      status: 'actif',
      beekeeperName: hiveBeekeeper,
      hiveCount: parseInt(hiveCount) || 1,
      hiveNumbers: hiveNumbers,
      commune: hiveCommune,
      village: hiveVillage
    });

    // Update the installed preform status to complete if it was not standard
    if (selectedPreformId && selectedPreformId !== 'STANDARD') {
      const targetPref = store.preforms.find(p => p.id === selectedPreformId);
      if (targetPref) targetPref.status = 'complete';
    }

    // Dynamically save new location of Hive to choices
    if (locationName === 'Autre') {
      store.addCustomChoice('locations', customLocation);
    }

    setSelectedPreformId('');
    setLocationName(store.locations[0] || '');
    setCustomLocation('');
    onRefresh();
  };

  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspHiveId) return;
    store.addInspection({
      hiveId: inspHiveId,
      date: new Date().toISOString().split('T')[0],
      populationHealth: health,
      queenPresent: queen,
      parasitesDetected: parasites,
      humidityLevelPercent: parseFloat(humidity) || 18.0,
      honeyEstimateKg: parseFloat(honeyEst) || 5.0,
      notes: inspNotes,
      inspectedBy: inspectedBy || undefined,
      broodPresence: broodPresence,
      queenCells: queenCells,
      activityLevel: activityLevel
    });

    setInspNotes('');
    setInspectedBy('');
    onRefresh();
  };

  const handleAddHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvHiveId) return;
    if (!selectedCampaignId) return alert('Veuillez d\'abord sélectionner ou créer une campagne de récolte.');
    store.addHarvest({
      hiveId: harvHiveId,
      campaignId: selectedCampaignId,
      date: new Date().toISOString().split('T')[0],
      quantityKg: parseFloat(harvQty) || 10.0,
      moisturePercent: parseFloat(harvMoisture) || 18.0,
      honeyColor: harvColor,
      qualityGrade: harvGrade,
      status: 'brut',
      harvestedBy: harvestedBy || undefined,
      weatherConditions: weatherConditions,
      batchReference: batchReference || undefined
    });

    setHarvestedBy('');
    setBatchReference('');
    onRefresh();
  };

  const selectedHive = store.hives.find(h => h.id === selectedHiveId);
  const selectedHivePreform = selectedHive ? store.preforms.find(p => p.id === selectedHive.preformId) : null;
  const selectedHiveInspections = selectedHive ? store.inspections.filter(i => i.hiveId === selectedHive.id).sort((a,b) => b.date.localeCompare(a.date)) : [];
  const selectedHiveHarvests = selectedHive ? store.harvests.filter(h => h.hiveId === selectedHive.id).sort((a,b) => b.date.localeCompare(a.date)) : [];

  // Available preforms for deployment
  const availablePreforms = store.preforms.filter(
    p => p.status === 'complete' && !store.hives.some(h => h.preformId === p.id)
  );

  return (
    <div className="space-y-6">
      {/* Header section with tab buttons */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-brand-green-100/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-brand-green-600" />
          <div>
            <h2 className="text-xl font-semibold font-display text-gray-900 leading-tight">Gestion Apicole Forestière</h2>
            <p className="text-xs text-gray-500">De la tresserie en brousse jusqu'à la récolte des hausses de bambou</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setActiveSubTab('ruches'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeSubTab === 'ruches' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Ruches & Ruchers
            </div>
          </button>

          <button
            onClick={() => { setActiveSubTab('bambou'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeSubTab === 'bambou' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5" /> Atelier Bambou
            </div>
          </button>

          <button
            onClick={() => { setActiveSubTab('inspections'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeSubTab === 'inspections' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" /> Visites de Suivi
            </div>
          </button>

          <button
            onClick={() => { setActiveSubTab('recoltes'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeSubTab === 'recoltes' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Récoltes de Brousse
            </div>
          </button>
        </div>
      </div>

      {activeSubTab === 'ruches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-brand-green-100/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-gray-900 text-sm">Registre des Ruches</h3>
                <span className="text-[10px] bg-brand-green-50 text-brand-green-700 font-bold px-2 py-0.5 rounded-full font-mono">
                  {store.hives.length} installées
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {store.hives.map(hive => {
                  const pre = store.preforms.find(p => p.id === hive.preformId);
                  const isSelected = selectedHiveId === hive.id;
                  const lastInsp = store.inspections.filter(i => i.hiveId === hive.id).sort((a,b) => b.date.localeCompare(a.date))[0];

                  return (
                    <div
                      key={hive.id}
                      onClick={() => setSelectedHiveId(hive.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-brand-green-50/75 border-brand-green-500 shadow-xs' 
                          : 'bg-slate-50/50 hover:bg-slate-50 border-gray-150'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold font-mono text-gray-900">{hive.code}</span>
                          <span className="text-[10px] font-medium text-gray-400 ml-2">({pre?.artisanName})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          hive.status === 'actif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {hive.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-2">
                        <MapPin className="w-3 h-3 text-brand-green-600" />
                        <span>{hive.locationName}</span>
                      </div>

                      {lastInsp && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-[10px] text-gray-400">
                          <span>Dernier suivi: {formatDateToFR(lastInsp.date)}</span>
                          <span className={`font-semibold ${
                            lastInsp.populationHealth === 'excellent' ? 'text-emerald-600' : lastInsp.populationHealth === 'normal' ? 'text-blue-500' : 'text-amber-600'
                          }`}>
                            Santé: {lastInsp.populationHealth}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick deployment form */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-brand-green-100/30">
              <div className="flex items-center gap-2 mb-3.5 border-b border-gray-100 pb-2">
                <Compass className="w-4.5 h-4.5 text-brand-gold-500" />
                <h3 className="font-display font-semibold text-gray-900 text-sm">Distribuer & Installer</h3>
              </div>

              <form onSubmit={handleInstallHive} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase">Sélectionner la préforme (Optionnel)</label>
                  <select
                    value={selectedPreformId}
                    onChange={e => setSelectedPreformId(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg mt-1 focus:border-brand-green-600 focus:outline-hidden bg-white text-gray-800 font-medium"
                  >
                    <option value="STANDARD">-- Ruche Standard / Traditionnelle (Sans préforme) --</option>
                    {availablePreforms.map(pref => (
                      <option key={pref.id} value={pref.id}>
                        {pref.id} tressée par {pref.artisanName} (Bambous: {pref.bambooQtyUsed})
                      </option>
                    ))}
                  </select>
                  {availablePreforms.length === 0 && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 p-1.5 rounded mt-1.5 block">
                      💡 Aucune préforme en bambou disponible. Enregistrement direct en ruche traditionnelle actif.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase">Nom du Rucher / Emplacement *</label>
                  <div className="flex gap-1.5 mt-1">
                    <select
                      value={locationName}
                      onChange={e => setLocationName(e.target.value)}
                      className="flex-1 text-xs p-2 border border-gray-200 bg-white rounded-lg focus:border-brand-green-600 focus:outline-hidden"
                      required
                    >
                      <option value="">-- Choisir un rucher --</option>
                      {store.locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                      <option value="Autre">Autre Rucher (Spécifier...)</option>
                    </select>
                    {onNavigateToConfig && (
                      <button
                        type="button"
                        onClick={() => onNavigateToConfig('locations')}
                        className="p-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer transition-all shrink-0"
                        title="Gérer les emplacements de ruchers"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {locationName === 'Autre' && (
                  <div>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={e => setCustomLocation(e.target.value)}
                      placeholder="ex: Rucher des Collines d'Ouidah"
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:border-brand-green-600 focus:outline-hidden"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase">Apiculteur responsable / propriétaire *</label>
                  <input
                    type="text"
                    value={hiveBeekeeper}
                    onChange={e => setHiveBeekeeper(e.target.value)}
                    placeholder="ex: Salamatou Gnon"
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg mt-1 focus:border-brand-green-600 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase">Commune *</label>
                    <input
                      type="text"
                      value={hiveCommune}
                      onChange={e => setHiveCommune(e.target.value)}
                      placeholder="ex: Parakou"
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg mt-1 focus:border-brand-green-600 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase">Village *</label>
                    <input
                      type="text"
                      value={hiveVillage}
                      onChange={e => setHiveVillage(e.target.value)}
                      placeholder="ex: Kpébié"
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg mt-1 focus:border-brand-green-600 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase">Nombre de ruches *</label>
                    <input
                      type="number"
                      value={hiveCount}
                      onChange={e => setHiveCount(e.target.value)}
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg mt-1 focus:border-brand-green-600 focus:outline-hidden font-semibold"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase">Numéros de série / Ruches *</label>
                    <input
                      type="text"
                      value={hiveNumbers}
                      onChange={e => setHiveNumbers(e.target.value)}
                      placeholder="ex: BAM-PK-01, BAM-PK-02..."
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg mt-1 focus:border-brand-green-600 focus:outline-hidden font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase">Coordonnées GPS</label>
                  <input
                    type="text"
                    value={gps}
                    onChange={e => setGps(e.target.value)}
                    placeholder="ex: 4.3122, 11.5015"
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg mt-1 focus:border-brand-green-600 focus:outline-hidden font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-lg text-xs font-semibold transition-colors mt-2 cursor-pointer"
                >
                  Valider et Poser le Rucher
                </button>
              </form>
            </div>
            </div>
          

          {/* Detailed timeline history for selected hive */}
          <div className="lg:col-span-2 space-y-6">
            {selectedHive ? (
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-brand-green-100/30">
                {/* Hive header card */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-wrap text-brand-gold-600 rounded-xl font-medium">
                      <Layers className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-bold font-mono text-gray-900">{selectedHive.code}</h4>
                        <span className="text-xs bg-brand-green-50 text-brand-green-700 px-2 py-0.5 rounded-full font-semibold">
                          ID: {selectedHive.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {selectedHive.locationName} | GPS: <span className="font-mono">{selectedHive.gpsCoordinates}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Structure Bambou</p>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5">
                      Préforme {selectedHivePreform?.id} par {selectedHivePreform?.artisanName}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Posée le {selectedHive.installedAt}</p>
                  </div>
                </div>

                {/* Identity information of the selected Apiary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 mt-4 bg-amber-50/40 rounded-xl border border-amber-100/60 text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold">Apiculteur responsable</span>
                    <strong className="text-gray-800 text-xs">{selectedHive.beekeeperName || 'Salamatou Gnon'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold">Commune & Village</span>
                    <span className="text-gray-950 font-semibold truncate block">
                      📍 {selectedHive.commune || 'Enregistré'} - {selectedHive.village || 'Enregistré'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold">Ruches tressées</span>
                    <strong className="text-gray-800">{selectedHive.hiveCount || 1} ruche(s)</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold">Numéros de ruche</span>
                    <span className="font-mono text-[10px] text-brand-green-800 font-semibold truncate block" title={selectedHive.hiveNumbers || selectedHive.code}>
                      {selectedHive.hiveNumbers || selectedHive.code}
                    </span>
                  </div>
                </div>

                {/* Sub-tabs for the selected hive details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Left sub-column: Inspections Log of selected hive + Form */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/30">
                      <span className="text-xs font-bold text-brand-green-900 flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4 text-brand-green-600" /> Historique de Suivi
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full text-brand-green-700 border border-brand-green-100">
                        {selectedHiveInspections.length} visites
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {selectedHiveInspections.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center italic">Aucune visite d'inspection enregistrée pour le moment.</p>
                      ) : (
                        selectedHiveInspections.map(insp => (
                          <div key={insp.id} className="p-3 bg-gray-50/75 border border-gray-100 rounded-xl text-xs space-y-1.5">
                            <div className="flex justify-between font-semibold">
                              <span className="text-gray-800 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-brand-green-600" /> {formatDateToFR(insp.date)}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                                insp.populationHealth === 'excellent' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {insp.populationHealth}
                              </span>
                            </div>
                            {insp.inspectedBy && (
                              <p className="text-[10px] text-amber-800/90 font-semibold">🔍 Inspecté par: {insp.inspectedBy}</p>
                            )}
                            <p className="text-gray-600 leading-relaxed italic">"{insp.notes}"</p>
                            
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-gray-500 pt-1.5 border-t border-gray-150">
                              <span>Humidité: <strong className="text-gray-700">{insp.humidityLevelPercent}%</strong></span>
                              <span>Est. miel: <strong className="text-gray-700">{insp.honeyEstimateKg} kg</strong></span>
                              <span>Couvain: <strong className="text-gray-700">{insp.broodPresence === 'non' ? '🚨 Absent' : '✅ Présent'}</strong></span>
                              <span>Planche d'envol: <strong className="text-gray-700">{insp.activityLevel === 'tres_actif' ? 'Très actif' : insp.activityLevel === 'moyen' ? 'Moyen' : 'Faible'}</strong></span>
                              <span>Varroa/Parasites: <strong className={insp.parasitesDetected ? "text-red-650" : "text-emerald-650"}>{insp.parasitesDetected ? "Oui" : "Non"}</strong></span>
                              <span>Cellules royales: <strong className="text-gray-700">{insp.queenCells ? "Oui (Avis)" : "Non"}</strong></span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Quick Visit Form */}
                    <form onSubmit={handleAddInspection} className="bg-slate-50/50 p-4 rounded-xl border border-gray-150 space-y-3">
                      <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                        <FilePlus className="w-3.5 h-3.5 text-brand-green-600" /> Saisir un Rapport de Visite
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold block">Apiculteur Inspecteur</label>
                          <input
                            type="text"
                            value={inspectedBy}
                            onChange={e => setInspectedBy(e.target.value)}
                            placeholder="nom de l'apiculteur"
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold block">Couvain observé ?</label>
                          <select
                            value={broodPresence}
                            onChange={e => setBroodPresence(e.target.value as any)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 font-medium text-gray-800"
                          >
                            <option value="oui">Oui (Présence active)</option>
                            <option value="non">Non (Alerte orpheline)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold block font-sans">Activité Envol</label>
                          <select
                            value={activityLevel}
                            onChange={e => setActivityLevel(e.target.value as any)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 font-medium text-gray-800"
                          >
                            <option value="tres_actif">Très Actif (Excellent)</option>
                            <option value="moyen">Moyen (Normal)</option>
                            <option value="faible">Faible (Inactif)</option>
                          </select>
                        </div>
                        <div className="flex items-end pb-0.5">
                          <label className="flex items-center gap-1.5 py-1.5 bg-white px-2 rounded-md border border-gray-200 cursor-pointer w-full justify-center select-none">
                            <input
                              type="checkbox"
                              checked={queenCells}
                              onChange={e => setQueenCells(e.target.checked)}
                              className="rounded text-brand-green-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-[10px] text-gray-700 font-medium">Cellules Royales</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Dyn. Colonie</label>
                          <select
                            value={health}
                            onChange={e => setHealth(e.target.value as any)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 text-gray-800"
                          >
                            <option value="excellent">Excellent</option>
                            <option value="normal">Normal</option>
                            <option value="faible">Faible</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Humidité %</label>
                          <input
                            type="number"
                            step="0.1"
                            value={humidity}
                            onChange={e => setHumidity(e.target.value)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 font-medium"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Est. Miel (kg)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={honeyEst}
                            onChange={e => setHoneyEst(e.target.value)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 font-medium"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-1.5 py-1 bg-white px-2 rounded-md border border-gray-150 cursor-pointer justify-center select-none">
                          <input
                            type="checkbox"
                            checked={queen}
                            onChange={e => setQueen(e.target.checked)}
                            className="rounded text-brand-green-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[10px] text-gray-700 font-medium">Reine observée</span>
                        </label>

                        <label className="flex items-center gap-1.5 py-1 bg-white px-2 rounded-md border border-gray-150 cursor-pointer justify-center select-none">
                          <input
                            type="checkbox"
                            checked={parasites}
                            onChange={e => setParasites(e.target.checked)}
                            className="rounded text-brand-green-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[10px] text-gray-700 font-medium">Alerte parasites</span>
                        </label>
                      </div>

                      <input
                        type="text"
                        value={inspNotes}
                        onChange={e => setInspNotes(e.target.value)}
                        placeholder="Notes d'observation (ex: pontes vigoureuse...)"
                        className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg focus:outline-hidden focus:border-brand-green-600"
                        required
                      />

                      <button
                        type="submit"
                        disabled={!selectedHive}
                        className="w-full py-1.5 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-md text-[11px] font-semibold transition-transform cursor-pointer"
                      >
                        Enregistrer l'inspection
                      </button>
                    </form>
                  </div>

                  {/* Right sub-column: Harvests history of selected hive + Form */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-amber-50/50 p-3 rounded-xl border border-amber-100/30">
                      <span className="text-xs font-bold text-brand-green-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-brand-gold-600" /> Récoltes de la ruche
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full text-brand-gold-600 border border-amber-100">
                        {selectedHiveHarvests.reduce((sum, h) => sum + h.quantityKg, 0).toFixed(1)} kg récolté
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {selectedHiveHarvests.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center italic">Aucune récolte enregistrée pour cette ruche.</p>
                      ) : (
                        selectedHiveHarvests.map(harv => (
                          <div key={harv.id} className="p-3 bg-gray-50/75 border border-gray-100 rounded-xl text-xs space-y-1.5">
                            <div className="flex justify-between font-semibold">
                              <span className="text-gray-800 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-brand-gold-500" /> {formatDateToFR(harv.date)}</span>
                              <span className="text-brand-green-800 font-bold">{harv.quantityKg} kg</span>
                            </div>
                            {harv.harvestedBy && (
                              <p className="text-[10px] text-brand-green-700 font-semibold">🧑‍🌾 Opérateur: {harv.harvestedBy}</p>
                            )}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-gray-500 mt-1">
                              <span>Météo: <strong className="text-gray-700">{harv.weatherConditions || 'Clément'}</strong></span>
                              <span>Numéro Lot: <strong className="text-gray-700 font-mono text-[9px]">{harv.batchReference || 'N/A'}</strong></span>
                              <span>Humidité miel: <strong className="text-gray-700">{harv.moisturePercent}%</strong></span>
                              <span>Robe: <strong className="text-gray-700 capitalize">{harv.honeyColor.replace('_', ' ')}</strong></span>
                            </div>
                            <div className="flex justify-between items-center pt-1.5 mt-1 border-t border-gray-150">
                              <span className="text-[9px] bg-brand-gold-100 text-brand-gold-600 px-1.5 py-0.5 rounded-full font-bold">Grade {harv.qualityGrade}</span>
                              <span className={`text-[9px] font-semibold ${
                                harv.status === 'extrait' ? 'text-emerald-600' : 'text-amber-600 font-bold'
                              }`}>
                                {harv.status === 'extrait' ? 'Miel extrait' : 'Disponible en miellerie'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Quick Harvest logger */}
                    <form onSubmit={handleAddHarvest} className="bg-slate-50/50 p-4 rounded-xl border border-gray-150 space-y-3">
                      <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                        <FilePlus className="w-3.5 h-3.5 text-brand-gold-600" /> Déclarer une Récolte brute
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Récolté Par / Opérateur</label>
                          <input
                            type="text"
                            value={harvestedBy}
                            onChange={e => setHarvestedBy(e.target.value)}
                            placeholder="nom du récoltant"
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Conditions Météo</label>
                          <select
                            value={weatherConditions}
                            onChange={e => setWeatherConditions(e.target.value)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 font-medium text-gray-800"
                          >
                            <option value="Ensoleillé">Ensoleillé & Sec</option>
                            <option value="Couvert">Couvert / Nuageux</option>
                            <option value="Humide">Humide / Brumeux</option>
                            <option value="Pluvieux">Pluvieux</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-semibold">Référence de lot (Traçabilité)</label>
                        <input
                          type="text"
                          value={batchReference}
                          onChange={e => setBatchReference(e.target.value)}
                          placeholder="ex: LOT-OUIDAH-BAM-03"
                          className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 font-mono font-semibold text-brand-green-800"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Poids Brut (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={harvQty}
                            onChange={e => setHarvQty(e.target.value)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 font-medium"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Taux d'Eau %</label>
                          <input
                            type="number"
                            step="0.1"
                            value={harvMoisture}
                            onChange={e => setHarvMoisture(e.target.value)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 font-medium"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Robe du Miel</label>
                          <select
                            value={harvColor}
                            onChange={e => setHarvColor(e.target.value as any)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 text-gray-800"
                          >
                            <option value="ambre_clair">Ambre Clair</option>
                            <option value="ambre">Ambre Sombre</option>
                            <option value="sombre">Brun / Forêt</option>
                            <option value="blanc">Blanc Sauvage</option>
                            <option value="extra_blanc">Extra Blanc</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Label Grade</label>
                          <select
                            value={harvGrade}
                            onChange={e => setHarvGrade(e.target.value as any)}
                            className="w-full text-xs p-1.5 border border-gray-200 bg-white rounded-md mt-1 text-gray-800"
                          >
                            <option value="AA">Grade AA (Optimum)</option>
                            <option value="A">Grade A (Excellent)</option>
                            <option value="B">Grade B (Standard)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!selectedHive}
                        className="w-full py-1.5 bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-green-900 rounded-md text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Enregistrer la pesée brute
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-xs border border-brand-green-100/30 text-gray-400 italic">
                Sélectionnez une ruche dans la liste de gauche pour voir ses données logistiques.
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'bambou' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Bamboo Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-brand-green-100/30 space-y-4 h-fit">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
              <Hammer className="w-5 h-5 text-brand-green-600" />
              <h3 className="font-display font-semibold text-gray-900 text-sm">Tressage de Préformes</h3>
            </div>

            <form onSubmit={handleCreatePreform} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom du Vannier / Artisan</label>
                <div className="flex gap-1.5 mt-1">
                  <select
                    value={artisan}
                    onChange={e => setArtisan(e.target.value)}
                    className="flex-1 text-xs p-2.5 border border-gray-200 bg-white rounded-lg focus:outline-hidden focus:border-brand-green-600"
                    required
                  >
                    <option value="">-- Sélectionner l'Artisan --</option>
                    {store.artisans.map(art => (
                      <option key={art} value={art}>{art}</option>
                    ))}
                    <option value="Autre">Nouvel artisan (Spécifier...)</option>
                  </select>
                  {onNavigateToConfig && (
                    <button
                      type="button"
                      onClick={() => onNavigateToConfig('artisans')}
                      className="p-2.5 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer transition-all shrink-0 font-medium"
                      title="Gérer la liste des artisans"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {artisan === 'Autre' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Entrer Nom du nouvel artisan</label>
                  <input
                    type="text"
                    value={customArtisan}
                    onChange={e => setCustomArtisan(e.target.value)}
                    placeholder="ex: Jean Koundé, Mamadou Diallo"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:border-brand-green-600 font-medium"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Centre de fabrication de la ruche</label>
                <input
                  type="text"
                  value={bambooCenter}
                  onChange={e => setBambooCenter(e.target.value)}
                  placeholder="ex: Atelier Central de Ouidah..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:border-brand-green-600 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tiges utilisées</label>
                  <input
                    type="number"
                    value={bambooQty}
                    onChange={e => setBambooQty(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:border-brand-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Statut initial</label>
                  <select
                    value={bambooStatus}
                    onChange={e => setBambooStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-lg focus:outline-hidden"
                  >
                    <option value="complete">Terminé (Prêt)</option>
                    <option value="en_cours">En cours de tressage</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold transition-transform"
              >
                Inscrire au registre d'atelier
              </button>
            </form>
          </div>

          {/* Bamboo List */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-900 text-base mb-4">Préformes de Ruches en Bambou</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {store.preforms.map(pref => {
                const isInstalled = store.hives.some(h => h.preformId === pref.id);
                const linkedHive = store.hives.find(h => h.preformId === pref.id);

                return (
                  <div key={pref.id} className="p-4 border border-gray-150 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 bg-brand-green-100/40 text-brand-green-800 rounded-md">
                          {pref.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pref.status === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pref.status === 'complete' ? 'Tressage Fini' : 'Tressage en Cours'}
                        </span>
                      </div>

                      <div className="mt-3.5 text-xs text-gray-700 space-y-1">
                        <p className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                          Artisan: <strong className="text-gray-900">{pref.artisanName}</strong>
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-gray-600">
                          <Compass className="w-3.5 h-3.5 text-gray-400" />
                          Centre: <strong className="text-gray-800">{pref.centerName || 'Coopérative locale'}</strong>
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-gray-600">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          Conçu le: {pref.createdAt}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-gray-600">
                          <Droplets className="w-3.5 h-3.5 text-gray-400" />
                          Bambou vert consommé: {pref.bambooQtyUsed} piquets
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-150 flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 uppercase">État logistique</span>
                      {isInstalled ? (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                          Déployé ({linkedHive?.code})
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-bold">
                          En stock / Non distribué
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INSPECTIONS GLOBAL TABLE TAB */}
      {activeSubTab === 'inspections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-brand-green-100/30 space-y-4 h-fit">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
              <ClipboardCheck className="w-5 h-5 text-brand-green-600" />
              <h3 className="font-display font-semibold text-gray-900 text-sm">Saisir un Rapport de Visite</h3>
            </div>

            <form onSubmit={handleAddInspection} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Sélectionner la Ruche inspectée</label>
                <select
                  value={inspHiveId}
                  onChange={e => setInspHiveId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-lg mt-1 font-semibold text-brand-green-800 focus:outline-hidden"
                  required
                >
                  <option value="">-- Choisir la Ruche --</option>
                  {store.hives.map(h => (
                    <option key={h.id} value={h.id}>{h.code} ({h.locationName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-semibold block">Apiculteur Inspecteur</label>
                  <input
                    type="text"
                    value={inspectedBy}
                    onChange={e => setInspectedBy(e.target.value)}
                    placeholder="nom de l'apiculteur"
                    className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-semibold block">Couvain observé ?</label>
                  <select
                    value={broodPresence}
                    onChange={e => setBroodPresence(e.target.value as any)}
                    className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-medium text-gray-800"
                  >
                    <option value="oui">Oui (Présence active)</option>
                    <option value="non">Non (Alerte orpheline)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-semibold block">Activité Envol</label>
                  <select
                    value={activityLevel}
                    onChange={e => setActivityLevel(e.target.value as any)}
                    className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-medium text-gray-800 animate-none"
                  >
                    <option value="tres_actif">Très Actif (Excellent)</option>
                    <option value="moyen">Moyen (Normal)</option>
                    <option value="faible">Faible (Inactif)</option>
                  </select>
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-1.5 py-2 bg-white px-2 rounded-md border border-gray-200 cursor-pointer w-full justify-center select-none">
                    <input
                      type="checkbox"
                      checked={queenCells}
                      onChange={e => setQueenCells(e.target.checked)}
                      className="rounded text-brand-green-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-gray-700 font-medium">Cellules Royales</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-semibold block">Dyn. Colonie</label>
                  <select
                    value={health}
                    onChange={e => setHealth(e.target.value as any)}
                    className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 text-gray-800"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="normal">Normal</option>
                    <option value="faible">Faible</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-semibold block">Humidité %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={humidity}
                    onChange={e => setHumidity(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-semibold block">Est. Miel (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={honeyEst}
                    onChange={e => setHoneyEst(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-1.5 py-1.5 bg-white px-2 rounded-md border border-gray-155 cursor-pointer justify-center select-none">
                  <input
                    type="checkbox"
                    checked={queen}
                    onChange={e => setQueen(e.target.checked)}
                    className="rounded text-brand-green-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-700 font-medium">Reine observée</span>
                </label>

                <label className="flex items-center gap-1.5 py-1.5 bg-white px-2 rounded-md border border-gray-155 cursor-pointer justify-center select-none">
                  <input
                    type="checkbox"
                    checked={parasites}
                    onChange={e => setParasites(e.target.checked)}
                    className="rounded text-brand-green-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-700 font-medium">Varroa / parasites</span>
                </label>
              </div>

              <div>
                <label className="block text-[9px] text-gray-500 uppercase font-semibold mb-1">Notes d'observation terrain</label>
                <input
                  type="text"
                  value={inspNotes}
                  onChange={e => setInspNotes(e.target.value)}
                  placeholder="Notes d'observation (ex: couvain operculé régulier...)"
                  className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-lg focus:outline-hidden focus:border-brand-green-600 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Valider et Inscrire au Carnet de Suivi
              </button>
            </form>
          </div>

          {/* Right Column: General list */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-brand-green-100/30 overflow-hidden h-fit">
            <h3 className="font-display font-semibold text-gray-900 text-base mb-4">Chronologie Générale des Inspections</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Ref Visite</th>
                    <th className="p-3">Ruche</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Santé Générale</th>
                    <th className="p-3 text-center">Reine présente</th>
                    <th className="p-3 text-center">Alerte Varroa</th>
                    <th className="p-3">Humidité</th>
                    <th className="p-3">Est. cadres hausses</th>
                    <th className="p-3 max-w-[150px]">Notes terrain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {store.inspections.sort((a,b) => b.date.localeCompare(a.date)).map(insp => {
                    const hive = store.hives.find(h => h.id === insp.hiveId);
                    return (
                      <tr key={insp.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-gray-900">{insp.id}</td>
                        <td className="p-3 font-mono font-bold text-brand-green-700">{hive?.code || 'N/A'}</td>
                        <td className="p-3 whitespace-nowrap">{formatDateToFR(insp.date)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            insp.populationHealth === 'excellent' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {insp.populationHealth}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold">{insp.queenPresent ? '✅ Oui' : '❌ Non'}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            insp.parasitesDetected ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-750'
                          }`}>
                            {insp.parasitesDetected ? 'Critique' : 'Aucun'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-semibold">{insp.humidityLevelPercent}%</td>
                        <td className="p-3 font-mono">{insp.honeyEstimateKg} kg</td>
                        <td className="p-3 max-w-[150px] truncate text-gray-500" title={insp.notes}>{insp.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RECOLTES GLOBAL TAB */}
      {activeSubTab === 'recoltes' && (
        <div className="space-y-6">
          {/* Sub Navigation Bar for Harvests & Campaigns */}
          <div className="flex gap-2 border-b border-gray-150 pb-3">
            <button
              onClick={() => setRecolteSubView('liste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                recolteSubView === 'liste'
                  ? 'bg-brand-gold-500 text-brand-green-950 shadow-xs'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              📊 Saisie & Historique des Récoltes
            </button>
            <button
              onClick={() => setRecolteSubView('campagnes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                recolteSubView === 'campagnes'
                  ? 'bg-brand-gold-500 text-brand-green-950 shadow-xs'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              📅 Campagnes de Récolte ({store.campaigns.length})
            </button>
          </div>

          {recolteSubView === 'liste' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form */}
              <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-brand-green-100/30 space-y-4 h-fit">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
                  <Activity className="w-5 h-5 text-brand-gold-600" />
                  <h3 className="font-display font-semibold text-gray-900 text-sm">Déclarer une Récolte brute</h3>
                </div>

                {store.campaigns.length === 0 ? (
                  <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-xs space-y-2">
                    <p className="font-bold">⚠️ Aucune campagne de récolte active</p>
                    <p className="leading-relaxed">Vous devez d'abord créer une campagne de récolte dans l'onglet <strong>"Campagnes de Récolte"</strong> ci-dessus pour pouvoir enregistrer des pesées de miel.</p>
                    <button
                      onClick={() => setRecolteSubView('campagnes')}
                      className="w-full mt-2 py-1.5 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                      Créer une Campagne
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddHarvest} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Campagne de Récolte liée *</label>
                      <select
                        value={selectedCampaignId}
                        onChange={e => setSelectedCampaignId(e.target.value)}
                        className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-lg mt-1 font-semibold text-brand-green-800 focus:outline-hidden"
                        required
                      >
                        <option value="">-- Choisir la Campagne --</option>
                        {store.campaigns.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.status === 'active' ? '(🟢 Active)' : '(⚪ Terminée)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Provenance : Ruches & Rucher *</label>
                      <select
                        value={harvHiveId}
                        onChange={e => setHarvHiveId(e.target.value)}
                        className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-lg mt-1 font-semibold text-brand-green-800 focus:outline-hidden"
                        required
                      >
                        <option value="">-- Choisir le Rucher d'Origine --</option>
                        {store.hives.map(h => (
                          <option key={h.id} value={h.id}>
                            📍 {h.locationName} ({h.hiveCount || 1} ruches) - Prop: {h.beekeeperName} ({h.village || 'N/A'}, {h.commune || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-semibold">Récolté Par / Opérateur</label>
                        <input
                          type="text"
                          value={harvestedBy}
                          onChange={e => setHarvestedBy(e.target.value)}
                          placeholder="Nom de l'apiculteur"
                          className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-medium text-gray-850"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-semibold font-sans">Conditions Météo</label>
                        <select
                          value={weatherConditions}
                          onChange={e => setWeatherConditions(e.target.value)}
                          className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-medium text-gray-800 focus:outline-hidden"
                        >
                          <option value="Ensoleillé">Ensoleillé & Sec</option>
                          <option value="Couvert">Couvert / Nuageux</option>
                          <option value="Humide">Humide / Brumeux</option>
                          <option value="Pluvieux">Pluvieux</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-gray-500 uppercase font-semibold">Référence de lot (Traçabilité)</label>
                      <input
                        type="text"
                        value={batchReference}
                        onChange={e => setBatchReference(e.target.value)}
                        placeholder="ex: LOT-OUIDAH-BAM-03"
                        className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg mt-1 font-mono font-bold text-brand-green-800 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-semibold block">Poids Brut (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={harvQty}
                          onChange={e => setHarvQty(e.target.value)}
                          className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-semibold block">Taux d'Eau %</label>
                        <input
                          type="number"
                          step="0.1"
                          value={harvMoisture}
                          onChange={e => setHarvMoisture(e.target.value)}
                          className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-semibold block">Robe du Miel</label>
                        <select
                          value={harvColor}
                          onChange={e => setHarvColor(e.target.value as any)}
                          className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 text-gray-800 focus:outline-hidden"
                        >
                          <option value="ambre_clair">Ambre Clair</option>
                          <option value="ambre">Ambre Sombre</option>
                          <option value="sombre">Brun / Forêt</option>
                          <option value="blanc">Blanc Sauvage</option>
                          <option value="extra_blanc">Extra Blanc</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-semibold block">Label Grade</label>
                        <select
                          value={harvGrade}
                          onChange={e => setHarvGrade(e.target.value as any)}
                          className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 text-gray-800 focus:outline-hidden"
                        >
                          <option value="AA">Grade AA (Optimum)</option>
                          <option value="A">Grade A (Excellent)</option>
                          <option value="B">Grade B (Standard)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-green-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Valider et Enregistrer la Pesée brute
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Historical List */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-brand-green-100/30">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-display font-semibold text-gray-900 text-base">Historique des Pesées de Récoltes</h3>
                    <p className="text-xs text-gray-500">Miel forestier brut stocké en miellerie avant filtration active</p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-150 px-4 py-2 rounded-xl text-right shrink-0 animate-pulse-slow">
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">Total Brut Récolté</span>
                    <strong className="text-xl font-bold font-mono text-brand-green-900">
                      {store.harvests.reduce((sum, h) => sum + h.quantityKg, 0).toFixed(1)} kg
                    </strong>
                  </div>
                </div>

                {store.harvests.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-12">Aucune récolte enregistrée pour le moment.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
                    {store.harvests.sort((a,b) => b.date.localeCompare(a.date)).map(harv => {
                      const hive = store.hives.find(h => h.id === harv.hiveId);
                      const campaign = store.campaigns.find(c => c.id === harv.campaignId);
                      return (
                        <div key={harv.id} className="p-4 rounded-xl border border-gray-150 bg-slate-50/50 space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-semibold text-gray-400 block">Référence Récolte</span>
                              <strong className="text-xs font-mono font-bold text-gray-900">{harv.id}</strong>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              harv.status === 'extrait' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {harv.status === 'extrait' ? 'Extrait / Décanté' : 'Brut en Attente'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 bg-white p-2.5 rounded-lg border border-gray-100 text-xs">
                            <div>
                              <span className="text-gray-400 text-[9px] block uppercase">Poids Récolté</span>
                              <strong className="text-sm font-mono text-gray-900">{harv.quantityKg} kg</strong>
                            </div>
                            <div>
                              <span className="text-gray-400 text-[9px] block uppercase">Provenance Ruche</span>
                              <strong className="text-sm font-mono text-brand-green-800" title={`Rucher : ${hive?.locationName || 'N/A'}`}>
                                {hive?.code || 'N/A'}
                              </strong>
                            </div>
                          </div>

                          <div className="text-[11px] text-gray-600 space-y-1">
                            <p className="flex justify-between">
                              <span>Campagne liée :</span>
                              <span className="font-semibold text-brand-green-900 truncate max-w-[150px]" title={campaign?.name}>
                                {campaign?.name || 'Non liée'}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span>Date récolte:</span>
                              <span className="font-semibold">{formatDateToFR(harv.date)}</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Robe / Couleur:</span>
                              <span className="font-semibold capitalize text-brand-gold-600">{harv.honeyColor.replace('_', ' ')}</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Humidité / Teneur en eau:</span>
                              <span className="font-mono font-semibold">{harv.moisturePercent}%</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-150 flex justify-between items-center">
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                              Grade Qualité {harv.qualityGrade}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              Par : {harv.harvestedBy || 'N/A'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {recolteSubView === 'campagnes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form to create a campaign */}
              <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-brand-green-100/30 space-y-4 h-fit">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
                  <CalendarDays className="w-5 h-5 text-brand-gold-600" />
                  <h3 className="font-display font-semibold text-gray-900 text-sm">Créer une Campagne de Récolte</h3>
                </div>

                <form onSubmit={handleCreateCampaign} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Nom de la Campagne *</label>
                    <input
                      type="text"
                      value={campName}
                      onChange={e => setCampName(e.target.value)}
                      placeholder="ex: Campagne Miel d'Anacarde 2026"
                      className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-lg mt-1 font-semibold text-gray-800 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-500 uppercase font-semibold">Date de début *</label>
                      <input
                        type="date"
                        value={campStartDate}
                        onChange={e => setCampStartDate(e.target.value)}
                        className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-semibold text-gray-800 focus:outline-hidden"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 uppercase font-semibold">Date de fin *</label>
                      <input
                        type="date"
                        value={campEndDate}
                        onChange={e => setCampEndDate(e.target.value)}
                        className="w-full text-xs p-2 border border-gray-200 bg-white rounded-md mt-1 font-semibold text-gray-800 focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase font-semibold">Statut initial</label>
                    <select
                      value={campStatus}
                      onChange={e => setCampStatus(e.target.value as 'active' | 'terminee')}
                      className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg mt-1 font-semibold text-gray-800 focus:outline-hidden"
                    >
                      <option value="active">🔴 Active (En cours)</option>
                      <option value="terminee">⚪ Terminée (Archive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase font-semibold">Description / Objectifs</label>
                    <textarea
                      value={campDescription}
                      onChange={e => setCampDescription(e.target.value)}
                      placeholder="Objectif de tonnage, zones géographiques visées..."
                      rows={3}
                      className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg mt-1 text-gray-800 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-green-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Lancer la Campagne de Récolte
                  </button>
                </form>
              </div>

              {/* Right Column: List of campaigns */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-brand-green-100/30">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-display font-semibold text-gray-900 text-base">Liste des Campagnes</h3>
                    <p className="text-xs text-gray-500">Planification et suivi global des saisons de collecte de miel</p>
                  </div>
                </div>

                {store.campaigns.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-12">Aucune campagne de récolte n'est encore définie.</p>
                ) : (
                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                    {store.campaigns.map(camp => {
                      const linkedHarvests = store.harvests.filter(h => h.campaignId === camp.id);
                      const totalKg = linkedHarvests.reduce((sum, h) => sum + h.quantityKg, 0);
                      const activeHivesList = Array.from(new Set(linkedHarvests.map(h => h.hiveId)));
                      
                      return (
                        <div key={camp.id} className="p-4 rounded-xl border border-gray-150 bg-slate-50/50 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                                  {camp.id}
                                </span>
                                <strong className="text-sm text-gray-900 font-display font-bold">{camp.name}</strong>
                              </div>
                              <span className="text-[11px] text-gray-500 block mt-0.5">
                                Du {formatDateToFR(camp.startDate)} au {formatDateToFR(camp.endDate)}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              camp.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {camp.status === 'active' ? '🟢 En cours' : 'Terminée'}
                            </span>
                          </div>

                          {camp.description && (
                            <p className="text-xs text-gray-600 leading-relaxed italic bg-white p-2.5 rounded-lg border border-gray-100">
                              "{camp.description}"
                            </p>
                          )}

                          <div className="grid grid-cols-3 gap-3 text-xs bg-white p-3 rounded-xl border border-gray-150">
                            <div className="text-center border-r border-gray-100">
                              <span className="text-gray-400 text-[9px] block uppercase font-semibold">Total Brut Récolté</span>
                              <strong className="text-sm font-mono text-brand-green-900">{totalKg.toFixed(1)} kg</strong>
                            </div>
                            <div className="text-center border-r border-gray-100">
                              <span className="text-gray-400 text-[9px] block uppercase font-semibold">Récoltes (Pesées)</span>
                              <strong className="text-sm font-mono text-gray-900">{linkedHarvests.length}</strong>
                            </div>
                            <div className="text-center">
                              <span className="text-gray-400 text-[9px] block uppercase font-semibold">Ruchers Actifs</span>
                              <strong className="text-sm font-mono text-brand-green-800">{activeHivesList.length}</strong>
                            </div>
                          </div>

                          {linkedHarvests.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[9px] text-gray-400 uppercase font-semibold font-mono block mb-1">Détail des apports rattachés</span>
                              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                                {linkedHarvests.map(h => {
                                  const hiveObj = store.hives.find(hv => hv.id === h.hiveId);
                                  return (
                                    <span key={h.id} className="text-[10px] bg-amber-50 text-amber-900 border border-amber-100 px-2 py-0.5 rounded-md font-mono" title={`Opérateur: ${h.harvestedBy || 'Inconnu'}`}>
                                      {h.id}: <strong>{h.quantityKg} kg</strong> ({hiveObj?.code || 'N/A'})
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
