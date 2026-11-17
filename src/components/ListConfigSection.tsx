import React, { useState } from 'react';
import { BambouMielStore } from '../dataStore';
import { FinishedProduct } from '../types';
import { 
  Bookmark, 
  MapPin, 
  Users, 
  Coffee, 
  Leaf, 
  ShoppingBag, 
  Truck, 
  Plus, 
  Trash2, 
  Check, 
  HelpCircle,
  ArrowLeft,
  Edit2,
  Euro,
  AlertTriangle,
  Lock,
  ShieldCheck
} from 'lucide-react';

interface ListConfigSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onBackToDashboard?: () => void;
  onNavigate?: (tab: string) => void;
  initialSelectedList?: ChoiceType;
}

export type ChoiceType = 'locations' | 'artisans' | 'juiceFlavors' | 'teaBlends' | 'clients' | 'carriers' | 'products';

export default function ListConfigSection({ store, onRefresh, onBackToDashboard, onNavigate, initialSelectedList }: ListConfigSectionProps) {
  const [selectedList, setSelectedList] = React.useState<ChoiceType>(initialSelectedList || 'locations');
  const [newItem, setNewItem] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Custom password states
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('yamtaanu_erp_password') || 'yamtaanu';
    }
    return 'yamtaanu';
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPwd = newPassword.trim();
    if (!cleanPwd) {
      alert('Veuillez entrer un mot de passe valide.');
      return;
    }
    localStorage.setItem('yamtaanu_erp_password', cleanPwd);
    setCurrentPassword(cleanPwd);
    setNewPassword('');
    setPasswordChangeSuccess(true);
    
    // Clear authentication to force logging in with the new password
    localStorage.removeItem('yamtaanu_erp_authenticated');
    
    alert('Le code d\'accès a été modifié avec succès ! L\'application va maintenant se déconnecter pour vous permettre de vous authentifier avec le nouveau code.');
    window.location.reload();
  };

  const handleResetAllData = () => {
    store.clearAllUserData();
    setShowResetConfirm(false);
    setMessage("Félicitations ! Toutes les données d'exemple ont été supprimées. Le système est maintenant vierge et prêt pour votre entreprise.");
    setTimeout(() => setMessage(null), 5000);
    onRefresh();
  };

  // States for adding finished product
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'autre'>('miel');
  const [prodVariant, setProdVariant] = useState('');
  const [prodPrice, setProdPrice] = useState('3500');
  const [prodStock, setProdStock] = useState('50');

  // States for inline product editing
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // States for inline custom choice option editing
  const [editingChoiceValue, setEditingChoiceValue] = useState<string | null>(null);
  const [editChoiceTempText, setEditChoiceTempText] = useState('');

  // Synchronize state with prop changes
  React.useEffect(() => {
    if (initialSelectedList) {
      setSelectedList(initialSelectedList);
    }
  }, [initialSelectedList]);

  const listMeta = {
    locations: {
      label: 'Emplacements de Ruchers',
      icon: MapPin,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
      description: 'Lieux géographiques où sont installées vos ruches sauvages de bambou.',
      placeholder: 'ex: Rucher Forêt Sacrée, Ouidah Est',
    },
    artisans: {
      label: 'Vanniers & Artisans',
      icon: Users,
      color: 'text-violet-500 bg-violet-50 border-violet-200',
      description: 'Membres de la coopérative locale qui tressent les préformes de ruches en bambou.',
      placeholder: 'ex: Christian Kouton',
    },
    juiceFlavors: {
      label: 'Parfums de Jus',
      icon: Coffee,
      color: 'text-teal-650 bg-teal-50 border-teal-200',
      description: 'Saveurs et recettes de jus de fruits frais élaborées à l\'atelier.',
      placeholder: 'ex: Cocktail Goyave-Passion Bio',
    },
    teaBlends: {
      label: 'Mélanges de Thés & Tisanes',
      icon: Leaf,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Variétés de thés et tisanes bio de la ferme (moringa, citronnelle, etc.).',
      placeholder: 'ex: Tisane Citronnelle-Menthe Sauvage',
    },
    clients: {
      label: 'Clients professionnels',
      icon: ShoppingBag,
      color: 'text-rose-500 bg-rose-50 border-rose-200',
      description: 'Boutiques, éco-lodges et supermarchés qui commandent vos produits en gros.',
      placeholder: 'ex: Supermarché Erevan, Cotonou',
    },
    carriers: {
      label: 'Transporteurs & Logistique',
      icon: Truck,
      color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
      description: 'Sociétés ou chauffeurs assurant le acheminement des commandes de gros.',
      placeholder: 'ex: DHL Bénin S.A.',
    },
    products: {
      label: 'Catalogue Articles de Vente',
      icon: ShoppingBag,
      color: 'text-emerald-700 bg-emerald-50/70 border-emerald-200',
      description: 'Personnalisez le catalogue des articles de vente (miels, jus, thés, lodge...) avec prix (FCFA) et stocks.',
      placeholder: '',
    }
  };

  const getItemsForType = (type: ChoiceType): string[] => {
    switch (type) {
      case 'locations': return store.locations;
      case 'artisans': return store.artisans;
      case 'juiceFlavors': return store.juiceFlavors;
      case 'teaBlends': return store.teaBlends;
      case 'clients': return store.clients;
      case 'carriers': return store.carriers;
      default: return [];
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedList === 'products') {
      if (!prodName.trim() || !prodPrice || !prodStock) return;
      
      store.addProduct({
        name: prodName.trim(),
        category: prodCategory,
        variant: prodVariant.trim() || 'Unit Standard',
        price: Number(prodPrice) || 0,
        stock: Number(prodStock) || 0
      });

      setProdName('');
      setProdVariant('');
      setProdPrice('3500');
      setProdStock('50');
      
      setMessage(`Le produit "${prodName}" a été ajouté.`);
      setErrorMessage(null);
      setTimeout(() => setMessage(null), 3000);
      onRefresh();
      return;
    }

    if (!newItem.trim()) return;

    const added = store.addCustomChoice(selectedList as any, newItem);
    if (added) {
      setNewItem('');
      setMessage(`"${newItem}" a été ajouté avec succès !`);
      setErrorMessage(null);
      setTimeout(() => setMessage(null), 3500);
      onRefresh();
    } else {
      setErrorMessage('Cet élément existe déjà dans la liste.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleRemoveItem = (item: string) => {
    if (selectedList === 'products') return; // handled separately
    const currentList = getItemsForType(selectedList);
    if (currentList.length <= 1) {
      setErrorMessage("La liste doit contenir au moins un élément pour éviter un dysfonctionnement de l'ERP.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    setItemToDelete(item);
  };

  const handleStartEditProduct = (p: FinishedProduct) => {
    setEditingProductId(p.id);
    setEditPrice(String(p.price));
    setEditStock(String(p.stock));
  };

  const handleSaveProductEdit = (id: string) => {
    store.updateProductPriceAndStock(id, Number(editPrice) || 0, Number(editStock) || 0);
    setEditingProductId(null);
    setMessage("Prix et stock de l'article mis à jour !");
    setTimeout(() => setMessage(null), 3000);
    onRefresh();
  };

  const handleStartEditChoice = (val: string) => {
    setEditingChoiceValue(val);
    setEditChoiceTempText(val);
  };

  const handleSaveChoiceEdit = (oldValue: string) => {
    if (!editChoiceTempText.trim()) return;
    const success = store.updateCustomChoice(selectedList as any, oldValue, editChoiceTempText.trim());
    if (success) {
      setEditingChoiceValue(null);
      setMessage(`"${oldValue}" a été modifié en "${editChoiceTempText.trim()}" !`);
      setTimeout(() => setMessage(null), 3000);
      onRefresh();
    } else {
      setErrorMessage("Impossible de modifier cet élément (peut-être existe-t-il déjà dans la liste).");
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  const handleRemoveProduct = (prod: FinishedProduct) => {
    setItemToDelete(`PROD:${prod.id}:${prod.name}`);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.startsWith('PROD:')) {
        const parts = itemToDelete.split(':');
        const prodId = parts[1];
        const prodName = parts[2];
        store.deleteProduct(prodId);
        setMessage(`Le produit "${prodName}" a été supprimé.`);
      } else {
        store.removeCustomChoice(selectedList as any, itemToDelete);
        setMessage(`"${itemToDelete}" a été supprimé.`);
      }
      setErrorMessage(null);
      setItemToDelete(null);
      setTimeout(() => setMessage(null), 3000);
      onRefresh();
    }
  };

  const items = getItemsForType(selectedList);
  const MetaIcon = listMeta[selectedList].icon;

  return (
    <div className="space-y-6">
      {/* Title & Navigation */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-violet-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button 
              onClick={onBackToDashboard}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-700 mr-1"
              title="Retour à l'Espace Général"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <Bookmark className="w-6 h-6 text-violet-600" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold font-display text-gray-900 leading-tight">Configuration des Listes</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md border border-emerald-150 shrink-0 select-none">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Sauvegarde auto active</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">Personnalisez les options déroulantes et le catalogue d'articles de vente de l'ERP</p>
          </div>
        </div>

        {onBackToDashboard && (
          <button 
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à l'accueil
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side: Select List Section */}
        <div className="md:col-span-1 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold block px-2">Listes disponibles</span>
          <div className="bg-white p-2.5 rounded-2xl border border-gray-150 space-y-1">
            {(Object.keys(listMeta) as ChoiceType[]).map(key => {
              const item = listMeta[key];
              const Icon = item.icon;
              const isSelected = selectedList === key;
              return (
                <button
                  key={key}
                  onClick={() => { setSelectedList(key); setNewItem(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-violet-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 bg-violet-50/50 border border-violet-100 rounded-xl text-[11px] text-violet-700 leading-relaxed space-y-1.5">
            <span className="font-bold flex items-center gap-1 text-violet-900"><HelpCircle className="w-3.5 h-3.5 shrink-0 text-violet-600" /> Pas besoin de sauvegarder :</span>
            <p><strong>Toutes vos modifications sont enregistrées en direct !</strong> Dès que vous ajoutez, modifiez ou supprimez un élément, les changements sont immédiatement appliqués dans l'ensemble de l'ERP.</p>
          </div>

          <div className="p-3.5 bg-indigo-50 border border-indigo-150 rounded-xl text-[11px] text-indigo-900 space-y-2">
            <span className="font-bold flex items-center gap-1 text-indigo-950">
              <Lock className="w-3.5 h-3.5 shrink-0 text-indigo-650" /> Sécurité d'accès :
            </span>
            <p className="text-[10px] leading-relaxed text-indigo-750">
              Configurez un mot de passe d'accès personnalisé pour sécuriser la gestion de votre application.
            </p>
            <div className="bg-white border border-indigo-100 p-2 rounded-lg text-[10px] font-mono text-indigo-900">
              Code Actuel : <span className="font-extrabold text-indigo-600">{currentPassword}</span>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-1.5 pt-1">
              <input
                type="text"
                placeholder="Nouveau code..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[10px] bg-white font-medium"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-lg cursor-pointer transition-all text-center text-[10px] shadow-xs"
              >
                Changer le code
              </button>
            </form>
            {passwordChangeSuccess && (
              <p className="text-[10px] text-emerald-700 font-bold animate-pulse">✓ Code mis à jour avec succès !</p>
            )}
            <div className="pt-2.5 border-t border-indigo-200/60 mt-2 space-y-1.5">
              <span className="font-bold flex items-center gap-1 text-indigo-950">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-violet-600" /> Gestion des Employés :
              </span>
              <p className="text-[9.5px] leading-relaxed text-indigo-800">
                L'administrateur autorise et gère les comptes individuels dans l'espace dédié.
              </p>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('admin_users') : undefined}
                className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg cursor-pointer transition-all text-center text-[10px] shadow-xs flex items-center justify-center gap-1"
              >
                <span>👥 Gérer les Autorisations</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50 border border-rose-150 rounded-xl text-[11px] text-rose-800 space-y-2">
            <span className="font-bold flex items-center gap-1 text-rose-750">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" /> Démarrage Réel :
            </span>
            <p className="text-[10px] leading-relaxed text-rose-700">
              Prêt à configurer votre entreprise ? Cliquez ci-dessous pour effacer tous les compteurs, historiques et clients de démonstration.
            </p>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer transition-all text-center text-[10px] shadow-xs"
              type="button"
            >
              Vider les données d'exemple
            </button>
          </div>
        </div>

        {/* Right Side: List Management Interface */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
            {/* List Description Banner */}
            <div className={`p-4 border rounded-xl flex items-start gap-3 ${listMeta[selectedList].color}`}>
              <MetaIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 text-xs block mb-0.5">Base : {listMeta[selectedList].label}</strong>
                <p className="text-[11px] text-gray-600/90 leading-relaxed">{listMeta[selectedList].description}</p>
              </div>
            </div>

            {/* Notification message */}
            {message && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{message}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Custom Product Catalogue manager Interface instead of simple string input */}
            {selectedList === 'products' ? (
              <div className="space-y-6">
                {/* Product Add Form */}
                <form onSubmit={handleAddItem} className="bg-slate-50/60 border border-slate-150 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Ajouter un nouvel article</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-650 mb-1">Nom du produit</label>
                      <input
                        type="text"
                        value={prodName}
                        onChange={e => setProdName(e.target.value)}
                        placeholder="ex: Miel Sauvage Spécial (Pot 500g)"
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-650 mb-1">Catégorie / Secteur</label>
                      <select
                        value={prodCategory}
                        onChange={e => setProdCategory(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg text-gray-800"
                        required
                      >
                        <option value="miel">🍯 Miel sauvage & Dérivés</option>
                        <option value="jus">🍹 Jus de fruits frais & Nectars</option>
                        <option value="the">🌿 Mélanges de Thés & Infusions</option>
                        <option value="hotel">🏨 Immersion Éco-Lodge</option>
                        <option value="conference">🏛️ Salle de Conférence & Événements</option>
                        <option value="autre">📦 Autre / Boutique</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-650 mb-1">Format de présentation</label>
                      <input
                        type="text"
                        value={prodVariant}
                        onChange={e => setProdVariant(e.target.value)}
                        placeholder="ex: Pot de verre 500g, Bouteille 1L, Forfait Journée..."
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-650 mb-1">Prix de vente (FCFA)</label>
                        <input
                          type="number"
                          value={prodPrice}
                          onChange={e => setProdPrice(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 font-mono font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-650 mb-1">Stock initial</label>
                        <input
                          type="number"
                          value={prodStock}
                          onChange={e => setProdStock(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 font-mono font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" /> Créer cet article de vente
                    </button>
                  </div>
                </form>

                {/* Products Grid & Register with inline editing option */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Articles actuels au catalogue ({store.products.length})</span>
                  <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                    {store.products.map(p => {
                      const isEditing = editingProductId === p.id;
                      return (
                        <div 
                          key={p.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-gray-200 rounded-xl hover:border-emerald-200 transition-all gap-3 bg-white"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <span className="text-base shrink-0 mt-0.5">
                              {p.category === 'miel' ? '🍯' : p.category === 'jus' ? '🍹' : p.category === 'the' ? '🌿' : p.category === 'conference' ? '🏛️' : '🏨'}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-950 truncate">{p.name}</h4>
                              <p className="text-[10px] text-gray-400 font-medium">Format: {p.variant} | ID: {p.id}</p>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-150 shrink-0">
                              <div className="max-w-[100px]">
                                <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Prix (FCFA)</label>
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={e => setEditPrice(e.target.value)}
                                  className="w-full text-xs p-1 border border-gray-300 rounded font-mono font-bold bg-white"
                                />
                              </div>
                              <div className="max-w-[70px]">
                                <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Stock</label>
                                <input
                                  type="number"
                                  value={editStock}
                                  onChange={e => setEditStock(e.target.value)}
                                  className="w-full text-xs p-1 border border-gray-300 rounded font-mono font-bold bg-white"
                                />
                              </div>
                              <div className="flex gap-1 self-end">
                                <button
                                  type="button"
                                  onClick={() => handleSaveProductEdit(p.id)}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Sauver
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProductId(null)}
                                  className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-[10px] font-bold cursor-pointer hover:bg-gray-300"
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="font-mono text-xs font-bold text-emerald-800 block">
                                  {p.price.toLocaleString()} FCFA
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono mt-0.5 inline-block ${
                                  p.stock <= 5 ? 'bg-rose-50 text-rose-600' : p.stock <= 15 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  Stock: {p.stock} pces
                                </span>
                              </div>

                              <div className="flex gap-1 border-l border-slate-150 pl-2.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditProduct(p)}
                                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-slate-50 rounded"
                                  title="Éditer le prix et le stock"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(p)}
                                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                  title="Retirer ce produit du catalogue"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Add Item Form  for regular string lists */}
                <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 shrink-0">
                  <div className="sm:col-span-9">
                    <input
                      type="text"
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                      placeholder={listMeta[selectedList].placeholder}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-gray-250 rounded-xl focus:border-violet-600 focus:bg-white focus:outline-hidden font-medium"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full h-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                </form>

                {/* Existing Items Registry for regular string lists */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block px-1">Options actuelles ({items.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                    {items.map((item, idx) => {
                      const isEditing = editingChoiceValue === item;
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 border border-gray-200 hover:border-violet-300 hover:bg-violet-50/10 rounded-xl text-xs font-semibold text-gray-805 transition-all bg-white"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 w-full">
                              <input
                                type="text"
                                value={editChoiceTempText}
                                onChange={e => setEditChoiceTempText(e.target.value)}
                                className="flex-1 text-xs p-1 border border-gray-300 bg-white rounded font-medium text-gray-950 focus:border-violet-500 focus:outline-hidden"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveChoiceEdit(item)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Sauver
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingChoiceValue(null)}
                                className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-[10px] font-bold cursor-pointer hover:bg-gray-300"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="truncate pr-4">{item}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleStartEditChoice(item)}
                                  className="p-1.5 hover:bg-slate-50 text-gray-400 hover:text-emerald-600 rounded-lg cursor-pointer transition-all"
                                  title="Modifier cette option"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(item)}
                                  className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg cursor-pointer transition-all"
                                  title="Supprimer cette option"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal confirmation overlay */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-150 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-display font-bold text-gray-900 text-sm">Confirmer la suppression</h3>
            <p className="text-xs text-gray-550 leading-relaxed">
              Voulez-vous vraiment retirer <strong className="text-gray-900 font-semibold">"{itemToDelete.startsWith('PROD:') ? itemToDelete.split(':')[2] : itemToDelete}"</strong> de la liste ?
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-150 rounded-xl transition-all cursor-pointer text-center"
                type="button"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer text-center"
                type="button"
              >
                Oui, Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Data Confirmation Overlay */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full border border-rose-100 shadow-2xl space-y-5 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-rose-600" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-base">⚠️ Réinitialisation de l'ERP</h3>
            </div>

            <div className="space-y-3.5 text-xs text-gray-650 leading-relaxed">
              <p>
                Vous êtes sur le point de <strong>supprimer définitivement</strong> toutes les données de démonstration du système afin de commencer la saisie réelle des données de votre entreprise.
              </p>
              
              <div className="bg-rose-50/40 border border-rose-100 p-3 rounded-xl space-y-1.5 text-rose-900">
                <span className="font-bold block">Ce qui sera supprimé ou réinitialisé :</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-800">
                  <li>Tous les ruchers d'exemple, les ruches et les inspections</li>
                  <li>Toutes les récoltes de miel et logs d'extractions</li>
                  <li>Toutes les commandes clients, bons de livraison et factures</li>
                  <li>Tous les profils clients et transporteurs d'exemple</li>
                  <li>Toutes les réservations d'écolodge (les chambres seront remises à "disponible")</li>
                  <li>Tous les stocks de produits du catalogue seront ramenés à <strong>0</strong></li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Cette action est irréversible et écrasera votre stockage local actuel.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-750 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer text-center"
                type="button"
              >
                Annuler
              </button>
              <button
                onClick={handleResetAllData}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                type="button"
              >
                Oui, Tout Vider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
