import React, { useState } from 'react';
import { BambouMielStore } from '../dataStore';
import { JuiceBatch, TeaBatch } from '../types';
import { 
  Coffee, 
  Leaf, 
  Milestone, 
  Flame, 
  Warehouse, 
  Boxes, 
  PlusCircle, 
  Compass,
  ArrowRight,
  TrendingUp,
  Settings
} from 'lucide-react';

interface BeveragesSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onNavigateToConfig?: (listType: 'locations' | 'artisans' | 'juiceFlavors' | 'teaBlends' | 'clients' | 'carriers' | 'products') => void;
}

export default function BeveragesSection({ store, onRefresh, onNavigateToConfig }: BeveragesSectionProps) {
  const [beverageTab, setBeverageTab] = useState<'jus' | 'the' | 'stocks'>('jus');

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

  // Form states: Juice
  const [juiceFlavor, setJuiceFlavor] = useState(store.juiceFlavors[0] || 'Gingembre-Ananas Bio');
  const [juiceVolume, setJuiceVolume] = useState('50');
  const [juiceSourcing, setJuiceSourcing] = useState('Ananas doux d\'Allada & gingembre frais béninois');
  const [qty250ml, setQty250ml] = useState('120');
  const [qty1L, setQty1L] = useState('10');

  // Form states: Tea
  const [teaBlend, setTeaBlend] = useState(store.teaBlends[0] || 'Thé Vert Moringa');
  const [teaQtyKg, setTeaQtyKg] = useState('5');
  const [teaSourcing, setTeaSourcing] = useState('Feuilles de moringa de notre ferme à Ouidah & thé vert bio');
  const [qty50g, setQty50g] = useState('90');

  // Custom manual typing states (User request)
  const [customJuiceFlavor, setCustomJuiceFlavor] = useState('');
  const [customTeaBlend, setCustomTeaBlend] = useState('');

  // Actions
  const handleCreateJuiceBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const finalFlavor = juiceFlavor === 'Autre' ? customJuiceFlavor : juiceFlavor;
    if (!finalFlavor) return alert('Veuillez spécifier la saveur.');

    store.addJuiceBatch({
      date: new Date().toISOString().split('T')[0],
      flavor: finalFlavor,
      volumeLiters: parseFloat(juiceVolume) || 20.0,
      ingredientsSourced: juiceSourcing,
      bottledQty250ml: parseInt(qty250ml) || 0,
      bottledQty1L: parseInt(qty1L) || 0
    });

    if (juiceFlavor === 'Autre') {
      store.addCustomChoice('juiceFlavors', customJuiceFlavor);
    }

    setJuiceFlavor(store.juiceFlavors[0] || 'Gingembre-Ananas Bio');
    setCustomJuiceFlavor('');
    setJuiceVolume('50');
    alert(`Lot de jus fraîchement pressé "${finalFlavor}" enregistré au stock d'inventaire.`);
    onRefresh();
  };

  const handleCreateTeaBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBlend = teaBlend === 'Autre' ? customTeaBlend : teaBlend;
    if (!finalBlend) return alert('Veuillez spécifier le mélange d\'herboristerie.');

    store.addTeaBatch({
      date: new Date().toISOString().split('T')[0],
      blendName: finalBlend,
      quantityKg: parseFloat(teaQtyKg) || 1.0,
      ingredientsSourced: teaSourcing,
      packagedQty50g: parseInt(qty50g) || 0
    });

    if (teaBlend === 'Autre') {
      store.addCustomChoice('teaBlends', customTeaBlend);
    }

    setTeaBlend(store.teaBlends[0] || 'Thé Vert Moringa');
    setCustomTeaBlend('');
    setTeaQtyKg('5');
    alert(`Mélange d'herboristerie "${finalBlend}" pesé, ensaché et enregistré.`);
    onRefresh();
  };

  // Juices/Teas products from store
  const drinkProducts = store.products.filter(p => p.category === 'jus' || p.category === 'the');

  return (
    <div className="space-y-6">
      {/* Beverages tab header */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-brand-green-100/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Leaf className="w-6 h-6 text-emerald-600 animate-pulse" />
          <div>
            <h2 className="text-xl font-semibold font-display text-gray-900 leading-tight">Boissonnerie & Herboristerie</h2>
            <p className="text-xs text-gray-500">Supervision des ateliers Jus de Fruits Tropicaux et Sachets Infusion Thé</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setBeverageTab('jus'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              beverageTab === 'jus' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Pressoir & Atelier Jus
            </div>
          </button>

          <button
            onClick={() => { setBeverageTab('the'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              beverageTab === 'the' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5" /> Séchage & Mélange Thé
            </div>
          </button>

          <button
            onClick={() => { setBeverageTab('stocks'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              beverageTab === 'stocks' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5" /> Stocks Boissons
            </div>
          </button>
        </div>
      </div>

      {beverageTab === 'jus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Squeezing batch creator */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-955 text-sm mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
              <PlusCircle className="w-4.5 h-4.5 text-brand-green-650" /> Saisir un Brassage de Jus
            </h3>

            <form onSubmit={handleCreateJuiceBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Recette / Saveur</label>
                <div className="flex gap-1.5 mt-1">
                  <select
                    value={juiceFlavor}
                    onChange={e => setJuiceFlavor(e.target.value)}
                    className="flex-1 text-xs p-2.5 border border-gray-200 bg-white rounded-lg focus:outline-hidden"
                  >
                    {store.juiceFlavors.map(flavor => (
                      <option key={flavor} value={flavor}>{flavor}</option>
                    ))}
                    <option value="Autre">Nouvelle saveur (Saisir...)</option>
                  </select>
                  {onNavigateToConfig && (
                    <button
                      type="button"
                      onClick={() => onNavigateToConfig('juiceFlavors')}
                      className="p-2.5 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-650 cursor-pointer transition-all shrink-0"
                      title="Gérer la liste des saveurs"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {juiceFlavor === 'Autre' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Entrer Nom Nouvelle Saveur</label>
                  <input
                    type="text"
                    value={customJuiceFlavor}
                    onChange={e => setCustomJuiceFlavor(e.target.value)}
                    placeholder="ex: Jus de Mangue Passion"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden font-medium"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Volume Pressé (L)</label>
                  <input
                    type="number"
                    value={juiceVolume}
                    onChange={e => setJuiceVolume(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden"
                    required
                  />
                </div>
                <div className="flex items-end text-[10px] text-gray-400 pb-1">
                  <span>Centrifugeuse de brousse à froid</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sourcing & Origine des fruits</label>
                <textarea
                  value={juiceSourcing}
                  onChange={e => setJuiceSourcing(e.target.value)}
                  rows={2}
                  placeholder="ex: Vergers coopératifs d'Obala..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden"
                  required
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 space-y-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Quantité d'embouteillage</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">Bouteilles 250ml</label>
                    <input
                      type="number"
                      value={qty250ml}
                      onChange={e => setQty250ml(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-gray-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">Bouteilles 1 Litre</label>
                    <input
                      type="number"
                      value={qty1L}
                      onChange={e => setQty1L(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-gray-200 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Inscrire & Conditionner
              </button>
            </form>
          </div>

          {/* Juice Batch History */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-900 text-base mb-4">Événements de Pressage et Décantation</h3>
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {store.juiceBatches.map(batch => (
                <div key={batch.id} className="p-4 border border-gray-150 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                    <div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md font-mono">
                        {batch.id}
                      </span>
                      <strong className="text-sm text-gray-900 ml-2.5">{batch.flavor}</strong>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{formatDateToFR(batch.date)}</span>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                    🍉 <strong>Sourcing :</strong> {batch.ingredientsSourced}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold mt-3 pt-2 text-gray-600">
                    <div>Volume: <strong className="text-gray-900 font-mono">{batch.volumeLiters} Litres</strong></div>
                    <div>Pots 250ml: <strong className="text-gray-900 font-mono">{batch.bottledQty250ml} u</strong></div>
                    <div>Bout. 1L: <strong className="text-gray-900 font-mono">{batch.bottledQty1L} u</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {beverageTab === 'the' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sourcing blended teas */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-900 text-sm mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
              <PlusCircle className="w-4.5 h-4.5 text-emerald-650" /> Créer un Lot d'Herboristerie
            </h3>

            <form onSubmit={handleCreateTeaBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mélange / Variété</label>
                <div className="flex gap-1.5 mt-1">
                  <select
                    value={teaBlend}
                    onChange={e => setTeaBlend(e.target.value)}
                    className="flex-1 text-xs p-2.5 border border-gray-200 bg-white rounded-lg focus:outline-hidden"
                  >
                    {store.teaBlends.map(blend => (
                      <option key={blend} value={blend}>{blend}</option>
                    ))}
                    <option value="Autre">Nouveau mélange (Saisir...)</option>
                  </select>
                  {onNavigateToConfig && (
                    <button
                      type="button"
                      onClick={() => onNavigateToConfig('teaBlends')}
                      className="p-2.5 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-650 cursor-pointer transition-all shrink-0"
                      title="Gérer la liste des mélanges de thé/tisanes"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {teaBlend === 'Autre' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Entrer Nom Nouveau Mélange / Tisane</label>
                  <input
                    type="text"
                    value={customTeaBlend}
                    onChange={e => setCustomTeaBlend(e.target.value)}
                    placeholder="ex: Infusion Menthe Hibiscus"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden font-medium"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Poids préparé (Kg)</label>
                  <input
                    type="number"
                    value={teaQtyKg}
                    onChange={e => setTeaQtyKg(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden"
                    required
                  />
                </div>
                <div className="flex items-end text-[10px] text-gray-400 pb-1">
                  <span>Séchage solaire passif sous cloche</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sourcing des herbes & aromates</label>
                <textarea
                  value={teaSourcing}
                  onChange={e => setTeaSourcing(e.target.value)}
                  rows={2}
                  placeholder="ex: cueillette éco-lodge sauvage..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden"
                  required
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-gray-150">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ensachage Étuis Carton 50g (unités)</label>
                <input
                  type="number"
                  value={qty50g}
                  onChange={e => setQty50g(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-md"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Inscrire & Mettre en sachet
              </button>
            </form>
          </div>

          {/* Tea Blend History */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-900 text-base mb-4">Lots de séchage et mélanges herbes</h3>
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {store.teaBatches.map(tBatch => (
                <div key={tBatch.id} className="p-4 border border-gray-150 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                    <div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md font-mono">
                        {tBatch.id}
                      </span>
                      <strong className="text-sm text-gray-900 ml-2.5">{tBatch.blendName}</strong>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{formatDateToFR(tBatch.date)}</span>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                    🌱 <strong>Herboristerie :</strong> {tBatch.ingredientsSourced}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold mt-3 pt-2 text-gray-600">
                    <div>Matière Sèche: <strong className="text-gray-900 font-mono">{tBatch.quantityKg} Kg</strong></div>
                    <div>Étuis 50g scellés: <strong className="text-gray-900 font-mono">{tBatch.packagedQty50g} boîtes</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {beverageTab === 'stocks' && (
        <div className="bg-white p-6 rounded-2xl border border-brand-green-100/30">
          <h3 className="font-display font-semibold text-gray-900 text-base mb-4">Stock en réserve - Boissonnerie & Boutique</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {drinkProducts.map(prod => (
              <div key={prod.id} className="bg-slate-50/50 p-4 rounded-xl border border-gray-150 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      prod.category === 'jus' ? 'bg-orange-100 text-orange-850' : 'bg-emerald-100 text-emerald-850'
                    }`}>
                      {prod.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-900">{prod.price.toLocaleString()} FCFA / unit</span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 mt-3">{prod.name}</h4>
                  <p className="text-[11px] text-gray-450 mt-1">{prod.variant}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-150 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase">Unités disponibles</span>
                  <span className={`font-mono font-bold text-sm ${prod.stock < 50 ? 'text-rose-600 animate-pulse' : 'text-emerald-700'}`}>
                    {prod.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
