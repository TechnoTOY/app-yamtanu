import React, { useState, useMemo } from 'react';
import { BambouMielStore } from '../dataStore';
import { 
  FinishedProduct, 
  RawMaterialStockItem, 
  StockMovement, 
  ClientReturn 
} from '../types';
import { 
  Package, 
  Boxes, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  RotateCcw, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Tag, 
  MapPin, 
  Truck, 
  FileText, 
  ArrowRightLeft, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  User, 
  RefreshCw, 
  Edit, 
  Trash2, 
  ChevronRight,
  Droplet,
  Coffee,
  Building,
  Briefcase,
  Sliders,
  DollarSign
} from 'lucide-react';

interface StockSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onNavigateToConfig?: (listType: any) => void;
  onNavigateToFinances?: () => void;
}

type StockSubTab = 'overview_alerts' | 'finished_products' | 'raw_materials' | 'movements_log' | 'client_returns' | 'physical_inventory';

export default function StockSection({ store, onRefresh, onNavigateToConfig, onNavigateToFinances }: StockSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<StockSubTab>('overview_alerts');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');

  // Modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddIntrantModal, setShowAddIntrantModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FinishedProduct | null>(null);
  const [editingIntrant, setEditingIntrant] = useState<RawMaterialStockItem | null>(null);

  // Quick Stock Adjust state
  const [adjustTarget, setAdjustTarget] = useState<{
    type: 'produit_fini' | 'intrant';
    id: string;
    name: string;
    currentStock: number;
    unit: string;
    unitCost: number;
    sector: string;
  } | null>(null);
  const [adjustQtyChange, setAdjustQtyChange] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustOperator, setAdjustOperator] = useState<string>('Magasinier / Gestionnaire Stock');

  // Form states: New Product
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general'>('miel');
  const [newProdVariant, setNewProdVariant] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(3500);
  const [newProdCost, setNewProdCost] = useState<number>(2000);
  const [newProdStock, setNewProdStock] = useState<number>(50);
  const [newProdMinAlert, setNewProdMinAlert] = useState<number>(15);
  const [newProdLocation, setNewProdLocation] = useState('Magasin Central');

  // Form states: New Raw Material (Intrant)
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<'matiere_premiere' | 'emballage' | 'consommable' | 'equipement_ruche' | 'fourniture'>('emballage');
  const [newMatSector, setNewMatSector] = useState<'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'general'>('miel');
  const [newMatUnit, setNewMatUnit] = useState('unités');
  const [newMatCurrentStock, setNewMatCurrentStock] = useState<number>(100);
  const [newMatMinAlert, setNewMatMinAlert] = useState<number>(20);
  const [newMatUnitCost, setNewMatUnitCost] = useState<number>(450);
  const [newMatSupplier, setNewMatSupplier] = useState('');
  const [newMatLocation, setNewMatLocation] = useState('Magasin Conditionnement');

  // Form states: New Return (RMA)
  const [returnOrderId, setReturnOrderId] = useState(store.orders[0]?.id || '');
  const [returnClientName, setReturnClientName] = useState(store.orders[0]?.clientName || '');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnReason, setReturnReason] = useState('Casse / avarie lors du transport');
  const [returnProductId, setReturnProductId] = useState(store.products[0]?.id || '');
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnAction, setReturnAction] = useState<'remise_en_stock' | 'rebut_perte'>('remise_en_stock');
  const [returnRefundMethod, setReturnRefundMethod] = useState<'avoir' | 'especes' | 'momo'>('avoir');
  const [returnRefundAmount, setReturnRefundAmount] = useState<number>(6000);
  const [returnHandledBy, setReturnHandledBy] = useState('Service Qualité Yamtaanu');
  const [returnNotes, setReturnNotes] = useState('');

  // Computations
  const sectorColors: Record<string, { bg: string; text: string; border: string; label: string; icon: any }> = {
    miel: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Miel & Apiculture', icon: Droplet },
    jus: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', label: 'Jus & Nectars', icon: Droplet },
    the: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Thés & Infusions', icon: Coffee },
    hotel: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', label: 'Éco-Lodge', icon: Building },
    conference: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'Conférences', icon: Briefcase },
    general: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', label: 'Général', icon: Boxes }
  };

  // Stock Summary & Valuation
  const stockStats = useMemo(() => {
    // Finished products valuation
    let totalFinishedValuation = 0;
    let finishedUnderAlertCount = 0;
    const sectorFinishedValuation: Record<string, number> = { miel: 0, jus: 0, the: 0, hotel: 0, conference: 0, general: 0 };

    store.products.forEach(p => {
      const cost = p.unitCost || (p.price * 0.6);
      const val = p.stock * cost;
      totalFinishedValuation += val;
      const sec = p.category || 'general';
      if (sectorFinishedValuation[sec] !== undefined) {
        sectorFinishedValuation[sec] += val;
      }
      const minAlert = p.minAlertStock ?? 10;
      if (p.stock <= minAlert) {
        finishedUnderAlertCount++;
      }
    });

    // Raw materials valuation
    let totalRawMaterialsValuation = 0;
    let rawUnderAlertCount = 0;
    const sectorRawValuation: Record<string, number> = { miel: 0, jus: 0, the: 0, hotel: 0, conference: 0, general: 0 };

    store.rawMaterials.forEach(m => {
      const val = m.currentStock * m.unitCost;
      totalRawMaterialsValuation += val;
      const sec = m.sector || 'general';
      if (sectorRawValuation[sec] !== undefined) {
        sectorRawValuation[sec] += val;
      }
      if (m.currentStock <= m.minAlertStock) {
        rawUnderAlertCount++;
      }
    });

    // Returns stats
    const totalReturnsCount = store.returns.length;
    const totalRefundsAmount = store.returns.reduce((s, r) => s + (r.refundAmount || 0), 0);

    // Total Stock Movements this month
    const totalMovementsCount = store.stockMovements.length;

    return {
      totalFinishedValuation,
      totalRawMaterialsValuation,
      totalGlobalValuation: totalFinishedValuation + totalRawMaterialsValuation,
      finishedUnderAlertCount,
      rawUnderAlertCount,
      totalAlertsCount: finishedUnderAlertCount + rawUnderAlertCount,
      sectorFinishedValuation,
      sectorRawValuation,
      totalReturnsCount,
      totalRefundsAmount,
      totalMovementsCount
    };
  }, [store.products, store.rawMaterials, store.returns, store.stockMovements]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return store.products.filter(p => {
      const matchSector = sectorFilter === 'all' || p.category === sectorFilter;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.variant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchSearch;
    });
  }, [store.products, sectorFilter, searchQuery]);

  // Filtered Raw Materials
  const filteredRawMaterials = useMemo(() => {
    return store.rawMaterials.filter(m => {
      const matchSector = sectorFilter === 'all' || m.sector === sectorFilter;
      const matchCat = categoryFilter === 'all' || m.category === categoryFilter;
      const matchSearch = !searchQuery || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchCat && matchSearch;
    });
  }, [store.rawMaterials, sectorFilter, categoryFilter, searchQuery]);

  // Filtered Stock Movements
  const filteredMovements = useMemo(() => {
    return store.stockMovements.filter(m => {
      const matchSector = sectorFilter === 'all' || m.sector === sectorFilter;
      const matchType = movementTypeFilter === 'all' || m.movementType === movementTypeFilter;
      const matchSearch = !searchQuery || 
        m.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.referenceDoc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.operator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchType && matchSearch;
    });
  }, [store.stockMovements, sectorFilter, movementTypeFilter, searchQuery]);

  // Items currently under alert threshold
  const criticalAlerts = useMemo(() => {
    const prods = store.products
      .filter(p => p.stock <= (p.minAlertStock ?? 10))
      .map(p => ({
        type: 'produit_fini' as const,
        id: p.id,
        name: p.name,
        variant: p.variant,
        currentStock: p.stock,
        minAlertStock: p.minAlertStock ?? 10,
        sector: p.category,
        unit: 'unités',
        unitCost: p.unitCost || (p.price * 0.6),
        location: p.location || 'Magasin Central'
      }));

    const mats = store.rawMaterials
      .filter(m => m.currentStock <= m.minAlertStock)
      .map(m => ({
        type: 'intrant' as const,
        id: m.id,
        name: m.name,
        variant: m.supplier,
        currentStock: m.currentStock,
        minAlertStock: m.minAlertStock,
        sector: m.sector,
        unit: m.unit,
        unitCost: m.unitCost,
        location: m.location
      }));

    return [...prods, ...mats];
  }, [store.products, store.rawMaterials]);

  // Handlers
  const handleOpenAdjustModal = (item: {
    type: 'produit_fini' | 'intrant';
    id: string;
    name: string;
    currentStock: number;
    unit: string;
    unitCost: number;
    sector: string;
  }) => {
    setAdjustTarget(item);
    setAdjustQtyChange(0);
    setAdjustReason('');
    setShowAdjustStockModal(true);
  };

  const handleExecuteStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget || adjustQtyChange === 0) return;

    store.adjustStock(
      adjustTarget.type,
      adjustTarget.id,
      adjustQtyChange,
      adjustReason || `Mouvement d'ajustement (${adjustQtyChange > 0 ? '+' : ''}${adjustQtyChange} ${adjustTarget.unit})`,
      adjustOperator,
      adjustTarget.unitCost
    );

    setShowAdjustStockModal(false);
    setAdjustTarget(null);
    onRefresh();
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      store.updateProduct(editingProduct.id, {
        name: newProdName,
        category: newProdCategory,
        variant: newProdVariant,
        price: Number(newProdPrice),
        unitCost: Number(newProdCost),
        stock: Number(newProdStock),
        minAlertStock: Number(newProdMinAlert),
        location: newProdLocation
      });
    } else {
      store.addProduct({
        name: newProdName,
        category: newProdCategory,
        variant: newProdVariant,
        price: Number(newProdPrice),
        unitCost: Number(newProdCost),
        stock: Number(newProdStock),
        minAlertStock: Number(newProdMinAlert),
        location: newProdLocation
      });
    }
    setShowAddProductModal(false);
    setEditingProduct(null);
    onRefresh();
  };

  const handleSaveIntrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIntrant) {
      store.updateRawMaterial(editingIntrant.id, {
        name: newMatName,
        category: newMatCategory,
        sector: newMatSector,
        unit: newMatUnit,
        currentStock: Number(newMatCurrentStock),
        minAlertStock: Number(newMatMinAlert),
        unitCost: Number(newMatUnitCost),
        supplier: newMatSupplier,
        location: newMatLocation
      });
    } else {
      store.addRawMaterial({
        name: newMatName,
        category: newMatCategory,
        sector: newMatSector,
        unit: newMatUnit,
        currentStock: Number(newMatCurrentStock),
        minAlertStock: Number(newMatMinAlert),
        unitCost: Number(newMatUnitCost),
        supplier: newMatSupplier,
        location: newMatLocation,
        lastRestockedDate: new Date().toISOString().split('T')[0]
      });
    }
    setShowAddIntrantModal(false);
    setEditingIntrant(null);
    onRefresh();
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = store.products.find(p => p.id === returnProductId);
    const prodName = prod ? `${prod.name} (${prod.variant || ''})` : returnProductId;
    const price = prod ? prod.price : (returnRefundAmount / Math.max(1, returnQuantity));

    store.processClientReturn({
      orderId: returnOrderId,
      clientName: returnClientName,
      date: returnDate,
      reason: returnReason,
      itemsReturned: [
        {
          productId: returnProductId,
          variantName: prodName,
          quantity: Number(returnQuantity),
          unitPrice: price,
          action: returnAction
        }
      ],
      refundAmount: Number(returnRefundAmount),
      refundMethod: returnRefundMethod,
      handledBy: returnHandledBy,
      notes: returnNotes,
      status: 'traite'
    });

    setShowReturnModal(false);
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Boxes className="w-6 h-6 text-amber-700" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestion Intégrée des Stocks & Intrants</h1>
              <p className="text-xs text-gray-500">
                Traçabilité sectorielle, gestion des intrants/matières premières, journal des mouvements et retours clients (SAV / Avoirs).
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setNewProdName('');
              setNewProdCategory('miel');
              setNewProdVariant('');
              setNewProdPrice(3500);
              setNewProdCost(2000);
              setNewProdStock(20);
              setNewProdMinAlert(10);
              setNewProdLocation('Magasin Central Conditionnement');
              setShowAddProductModal(true);
            }}
            className="px-3.5 py-2 bg-brand-green-850 hover:bg-brand-green-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-brand-gold-400" />
            <span>Nouveau Produit Fini</span>
          </button>

          <button
            onClick={() => {
              setEditingIntrant(null);
              setNewMatName('');
              setNewMatCategory('matiere_premiere');
              setNewMatSector('miel');
              setNewMatUnit('unités');
              setNewMatCurrentStock(50);
              setNewMatMinAlert(15);
              setNewMatUnitCost(500);
              setNewMatSupplier('');
              setNewMatLocation('Magasin Intrants');
              setShowAddIntrantModal(true);
            }}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-200" />
            <span>Nouvel Intrant / Matière</span>
          </button>

          <button
            onClick={() => {
              setShowReturnModal(true);
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Enregistrer Retour Client</span>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Valorisation Totale Stock</span>
            <div className="text-lg font-black text-gray-900 font-mono mt-0.5">
              {stockStats.totalGlobalValuation.toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-500">FCFA</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Produits ({stockStats.totalFinishedValuation.toLocaleString('fr-FR')}) + Intrants ({stockStats.totalRawMaterialsValuation.toLocaleString('fr-FR')})
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Produits Finis en Stock</span>
            <div className="text-lg font-black text-gray-900 font-mono mt-0.5">
              {store.products.reduce((s, p) => s + p.stock, 0)} <span className="text-xs font-normal text-gray-500">unités</span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">
              {store.products.length} références actives au catalogue
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Intrants & Emballages</span>
            <div className="text-lg font-black text-gray-900 font-mono mt-0.5">
              {store.rawMaterials.reduce((s, m) => s + m.currentStock, 0)} <span className="text-xs font-normal text-gray-500">articles</span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">
              {store.rawMaterials.length} références d'intrants suivies
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between ${
          stockStats.totalAlertsCount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-gray-150'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Alertes Seuil Réappro</span>
            <div className="text-lg font-black text-rose-700 font-mono mt-0.5">
              {stockStats.totalAlertsCount} <span className="text-xs font-normal text-rose-600">articles critiques</span>
            </div>
            <span className="text-[10px] text-rose-600 font-medium mt-1 block">
              {stockStats.finishedUnderAlertCount} produits &bull; {stockStats.rawUnderAlertCount} intrants
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100 rounded-xl border border-gray-200">
        <button
          onClick={() => setActiveSubTab('overview_alerts')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'overview_alerts' 
              ? 'bg-white text-gray-900 shadow-xs' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Vue Globale & Alertes</span>
          {stockStats.totalAlertsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-mono">
              {stockStats.totalAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('finished_products')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'finished_products' 
              ? 'bg-white text-gray-900 shadow-xs' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-amber-600" />
          <span>Stock Produits Finis ({store.products.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('raw_materials')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'raw_materials' 
              ? 'bg-white text-gray-900 shadow-xs' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 text-teal-600" />
          <span>Stock Intrants & Matières ({store.rawMaterials.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('movements_log')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'movements_log' 
              ? 'bg-white text-gray-900 shadow-xs' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
          <span>Journal des Mouvements ({store.stockMovements.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('client_returns')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'client_returns' 
              ? 'bg-white text-gray-900 shadow-xs' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span>Retours Clients & SAV ({store.returns.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('physical_inventory')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'physical_inventory' 
              ? 'bg-white text-gray-900 shadow-xs' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-purple-600" />
          <span>Fiche Inventaire Physique</span>
        </button>
      </div>

      {/* FILTER CONTROLS BAR (For tabs that filter items) */}
      {(activeSubTab === 'finished_products' || activeSubTab === 'raw_materials' || activeSubTab === 'movements_log') && (
        <div className="bg-white p-3.5 rounded-xl border border-gray-150 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, référence, fournisseur, lot..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sector Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <span className="text-[11px] text-gray-400 font-bold uppercase mr-1">Secteur:</span>
              {[
                { id: 'all', label: 'Tous' },
                { id: 'miel', label: 'Miel' },
                { id: 'jus', label: 'Jus' },
                { id: 'the', label: 'Thés' },
                { id: 'hotel', label: 'Hôtel' },
                { id: 'conference', label: 'Conférence' }
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setSectorFilter(sec.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    sectorFilter === sec.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Filter by Category / Movement Type */}
          {activeSubTab === 'raw_materials' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-bold uppercase">Catégorie:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">Toutes catégories</option>
                <option value="matiere_premiere">Matières premières</option>
                <option value="emballage">Emballages & Pots</option>
                <option value="consommable">Consommables</option>
                <option value="equipement_ruche">Équipements & Ruches</option>
                <option value="fourniture">Fournitures & Supports</option>
              </select>
            </div>
          )}

          {activeSubTab === 'movements_log' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-bold uppercase">Type Mouvement:</span>
              <select
                value={movementTypeFilter}
                onChange={e => setMovementTypeFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="entree_achat">Entrée Achat Fournisseur</option>
                <option value="entree_production">Entrée Production / Récolte</option>
                <option value="entree_retour_client">Entrée Retour Client (SAV)</option>
                <option value="sortie_vente">Sortie Vente Client</option>
                <option value="sortie_consommation">Sortie Consommation Atelier</option>
                <option value="sortie_perte_casse">Sortie Perte / Casse / Rebut</option>
                <option value="ajustement_inventaire">Ajustement d'Inventaire</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. SUB-TAB: VUE GLOBALE & ALERTES                        */}
      {/* ======================================================== */}
      {activeSubTab === 'overview_alerts' && (
        <div className="space-y-6">
          
          {/* CRITICAL ALERTS LIST */}
          <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
            <div className="bg-rose-50/80 px-6 py-4 border-b border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-rose-950">
                  Alertes de Stock & Articles en Rupture Imminente ({criticalAlerts.length})
                </h3>
              </div>
              <span className="text-xs text-rose-700 font-medium">
                Quantité en stock &le; Seuil minimal d'alerte
              </span>
            </div>

            {criticalAlerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">Aucun article sous le seuil d'alerte.</p>
                <p className="text-xs text-gray-400 mt-1">Tous les stocks de produits finis et intrants sont à un niveau satisfaisant.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {criticalAlerts.map(alert => {
                  const secInfo = sectorColors[alert.sector] || sectorColors.general;
                  const SecIcon = secInfo.icon;
                  const isZero = alert.currentStock === 0;

                  return (
                    <div key={`${alert.type}-${alert.id}`} className="p-4 hover:bg-rose-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border ${isZero ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'} shrink-0 mt-0.5`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{alert.name}</span>
                            {alert.variant && <span className="text-xs text-gray-500">({alert.variant})</span>}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${secInfo.bg} ${secInfo.text} ${secInfo.border} flex items-center gap-1`}>
                              <SecIcon className="w-3 h-3" />
                              {secInfo.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                              {alert.type === 'produit_fini' ? 'Produit Fini' : 'Intrant / Matière'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 font-mono">
                            <span>Ref: <strong>{alert.id}</strong></span>
                            <span>Emplacement: <strong>{alert.location}</strong></span>
                            <span>Coût unitaire: <strong>{alert.unitCost.toLocaleString('fr-FR')} FCFA</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Stock Actuel / Seuil</span>
                          <span className={`text-base font-black font-mono ${isZero ? 'text-rose-600' : 'text-amber-600'}`}>
                            {alert.currentStock} <span className="text-xs font-medium text-gray-500">/ min {alert.minAlertStock} {alert.unit}</span>
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenAdjustModal(alert)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Réapprovisionner</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTOR VALUATION BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Products by sector */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                Valorisation des Produits Finis par Secteur
              </h3>

              <div className="space-y-3">
                {Object.entries(stockStats.sectorFinishedValuation).map(([sec, rawVal]) => {
                  const val = Number(rawVal) || 0;
                  const secInfo = sectorColors[sec] || sectorColors.general;
                  const SecIcon = secInfo.icon;
                  const pct = stockStats.totalFinishedValuation > 0 ? (val / stockStats.totalFinishedValuation) * 100 : 0;

                  return (
                    <div key={sec} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <SecIcon className="w-3.5 h-3.5 text-gray-500" />
                          {secInfo.label}
                        </span>
                        <span className="font-mono font-bold text-gray-900">
                          {val.toLocaleString('fr-FR')} FCFA <span className="text-gray-400 font-normal">({pct.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Intrants by sector */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-teal-600" />
                Valorisation des Intrants & Matières Premières par Secteur
              </h3>

              <div className="space-y-3">
                {Object.entries(stockStats.sectorRawValuation).map(([sec, rawVal]) => {
                  const val = Number(rawVal) || 0;
                  const secInfo = sectorColors[sec] || sectorColors.general;
                  const SecIcon = secInfo.icon;
                  const pct = stockStats.totalRawMaterialsValuation > 0 ? (val / stockStats.totalRawMaterialsValuation) * 100 : 0;

                  return (
                    <div key={sec} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <SecIcon className="w-3.5 h-3.5 text-gray-500" />
                          {secInfo.label}
                        </span>
                        <span className="font-mono font-bold text-gray-900">
                          {val.toLocaleString('fr-FR')} FCFA <span className="text-gray-400 font-normal">({pct.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SUB-TAB: STOCK DES PRODUITS FINIS                     */}
      {/* ======================================================== */}
      {activeSubTab === 'finished_products' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Catalogue des Produits Finis ({filteredProducts.length})</h3>
              <p className="text-xs text-gray-500">Miels en pots, jus pasteurisés, thés en étuis, forfaits salles de conférence.</p>
            </div>
            <span className="text-xs text-gray-600 font-mono">
              Valeur totale filtrée: <strong>{filteredProducts.reduce((s, p) => s + (p.stock * (p.unitCost || (p.price * 0.6))), 0).toLocaleString('fr-FR')} FCFA</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/75 text-gray-600 uppercase font-bold text-[10.5px] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Réf / Nom Produit</th>
                  <th className="px-4 py-3">Secteur</th>
                  <th className="px-4 py-3">Variante / Lot</th>
                  <th className="px-4 py-3 text-right">Prix Vente</th>
                  <th className="px-4 py-3 text-right">Coût Revient</th>
                  <th className="px-4 py-3 text-center">Stock Actuel</th>
                  <th className="px-4 py-3 text-right">Valeur Stock</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      Aucun produit trouvé pour les filtres actuels.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const secInfo = sectorColors[p.category] || sectorColors.general;
                    const SecIcon = secInfo.icon;
                    const cost = p.unitCost || (p.price * 0.6);
                    const lineValuation = p.stock * cost;
                    const minAlert = p.minAlertStock ?? 10;
                    const isUnderAlert = p.stock <= minAlert;
                    const isZero = p.stock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{p.name}</div>
                          <span className="font-mono text-[10px] text-gray-400">ID: {p.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${secInfo.bg} ${secInfo.text} ${secInfo.border}`}>
                            <SecIcon className="w-3 h-3" />
                            {secInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{p.variant || 'Standard'}</div>
                          {p.batchNumber && (
                            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Lot: {p.batchNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                          {p.price.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-gray-500">
                          {cost.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-mono text-sm font-black ${
                            isZero ? 'text-rose-600' : isUnderAlert ? 'text-amber-600' : 'text-emerald-700'
                          }`}>
                            {p.stock}
                          </span>
                          <span className="text-[10px] text-gray-400 block">seuil: {minAlert}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                          {lineValuation.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isZero ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Rupture
                            </span>
                          ) : isUnderAlert ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Stock Faible
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAdjustModal({
                                type: 'produit_fini',
                                id: p.id,
                                name: p.name,
                                currentStock: p.stock,
                                unit: 'unités',
                                unitCost: cost,
                                sector: p.category
                              })}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                              title="Ajuster ou réapprovisionner le stock"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setNewProdName(p.name);
                                setNewProdCategory(p.category);
                                setNewProdVariant(p.variant || '');
                                setNewProdPrice(p.price);
                                setNewProdCost(p.unitCost || (p.price * 0.6));
                                setNewProdStock(p.stock);
                                setNewProdMinAlert(p.minAlertStock ?? 10);
                                setNewProdLocation(p.location || 'Magasin Central');
                                setShowAddProductModal(true);
                              }}
                              className="p-1.5 bg-gray-50 hover:bg-gray-150 text-gray-700 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                              title="Modifier la fiche produit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SUB-TAB: STOCK DES INTRANTS & MATIÈRES                */}
      {/* ======================================================== */}
      {activeSubTab === 'raw_materials' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inventaire des Intrants & Matières Premières ({filteredRawMaterials.length})</h3>
              <p className="text-xs text-gray-500">Tiges de bambou, pots verre, bouteilles, capsules, fruits frais, moringa, fournitures.</p>
            </div>
            <span className="text-xs text-gray-600 font-mono">
              Valeur totale filtrée: <strong>{filteredRawMaterials.reduce((s, m) => s + (m.currentStock * m.unitCost), 0).toLocaleString('fr-FR')} FCFA</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/75 text-gray-600 uppercase font-bold text-[10.5px] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Réf / Nom Intrant</th>
                  <th className="px-4 py-3">Secteur</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Fournisseur / Origine</th>
                  <th className="px-4 py-3">Emplacement</th>
                  <th className="px-4 py-3 text-right">Coût Unitaire</th>
                  <th className="px-4 py-3 text-center">Stock Actuel</th>
                  <th className="px-4 py-3 text-right">Valeur Stock</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRawMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-400">
                      Aucun intrant trouvé pour ces critères.
                    </td>
                  </tr>
                ) : (
                  filteredRawMaterials.map(m => {
                    const secInfo = sectorColors[m.sector] || sectorColors.general;
                    const SecIcon = secInfo.icon;
                    const lineVal = m.currentStock * m.unitCost;
                    const isUnderAlert = m.currentStock <= m.minAlertStock;
                    const isZero = m.currentStock === 0;

                    const catLabels: Record<string, string> = {
                      matiere_premiere: 'Matière 1ère',
                      emballage: 'Emballage & Pot',
                      consommable: 'Consommable',
                      equipement_ruche: 'Équipement',
                      fourniture: 'Fourniture'
                    };

                    return (
                      <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{m.name}</div>
                          <span className="font-mono text-[10px] text-gray-400">ID: {m.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${secInfo.bg} ${secInfo.text} ${secInfo.border}`}>
                            <SecIcon className="w-3 h-3" />
                            {secInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                            {catLabels[m.category] || m.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {m.supplier || 'Fournisseur Local Bénin'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-[11px]">
                          {m.location}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                          {m.unitCost.toLocaleString('fr-FR')} FCFA <span className="text-[10px] text-gray-400">/{m.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-mono text-sm font-black ${
                            isZero ? 'text-rose-600' : isUnderAlert ? 'text-amber-600' : 'text-teal-700'
                          }`}>
                            {m.currentStock} {m.unit}
                          </span>
                          <span className="text-[10px] text-gray-400 block">min: {m.minAlertStock}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                          {lineVal.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isZero ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Rupture
                            </span>
                          ) : isUnderAlert ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Alerte Reappro
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAdjustModal({
                                type: 'intrant',
                                id: m.id,
                                name: m.name,
                                currentStock: m.currentStock,
                                unit: m.unit,
                                unitCost: m.unitCost,
                                sector: m.sector
                              })}
                              className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                              title="Ajuster, réapprovisionner ou consommer cet intrant"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingIntrant(m);
                                setNewMatName(m.name);
                                setNewMatCategory(m.category);
                                setNewMatSector(m.sector);
                                setNewMatUnit(m.unit);
                                setNewMatCurrentStock(m.currentStock);
                                setNewMatMinAlert(m.minAlertStock);
                                setNewMatUnitCost(m.unitCost);
                                setNewMatSupplier(m.supplier);
                                setNewMatLocation(m.location);
                                setShowAddIntrantModal(true);
                              }}
                              className="p-1.5 bg-gray-50 hover:bg-gray-150 text-gray-700 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                              title="Modifier la fiche intrant"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SUB-TAB: JOURNAL DES MOUVEMENTS & TRAÇABILITÉ          */}
      {/* ======================================================== */}
      {activeSubTab === 'movements_log' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Journal Audit des Mouvements de Stock ({filteredMovements.length})</h3>
              <p className="text-xs text-gray-500">Historique complet des entrées, sorties ventes, consommations ateliers, pertes et retours.</p>
            </div>
            <span className="text-xs font-mono text-gray-500">
              Traçabilité certifiée ERP Yamtaanu
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/75 text-gray-600 uppercase font-bold text-[10.5px] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Date & Heure</th>
                  <th className="px-4 py-3">Réf Mouvement</th>
                  <th className="px-4 py-3">Type Mouvement</th>
                  <th className="px-4 py-3">Article / Intrant</th>
                  <th className="px-4 py-3">Secteur</th>
                  <th className="px-4 py-3 text-center">Quantité</th>
                  <th className="px-4 py-3">Réf Pièce / Doc</th>
                  <th className="px-4 py-3">Opérateur & Motif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Aucun mouvement correspondant aux filtres.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(mvt => {
                    const secInfo = sectorColors[mvt.sector] || sectorColors.general;
                    const SecIcon = secInfo.icon;
                    const isEntry = mvt.movementType.startsWith('entree_');
                    const isExit = mvt.movementType.startsWith('sortie_');

                    const movementLabels: Record<string, { label: string; bg: string; text: string }> = {
                      entree_achat: { label: 'Entrée Achat', bg: 'bg-emerald-100', text: 'text-emerald-800' },
                      entree_production: { label: 'Entrée Production', bg: 'bg-emerald-100', text: 'text-emerald-800' },
                      entree_retour_client: { label: 'Entrée Retour SAV', bg: 'bg-blue-100', text: 'text-blue-800' },
                      sortie_vente: { label: 'Sortie Vente', bg: 'bg-amber-100', text: 'text-amber-800' },
                      sortie_consommation: { label: 'Sortie Consommation', bg: 'bg-orange-100', text: 'text-orange-800' },
                      sortie_perte_casse: { label: 'Sortie Casse / Rebut', bg: 'bg-rose-100', text: 'text-rose-800' },
                      ajustement_inventaire: { label: 'Ajustement Inventaire', bg: 'bg-purple-100', text: 'text-purple-800' }
                    };

                    const typeMeta = movementLabels[mvt.movementType] || { label: mvt.movementType, bg: 'bg-gray-100', text: 'text-gray-800' };

                    return (
                      <tr key={mvt.id} className="hover:bg-gray-50/80 transition-colors font-sans">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{mvt.date}</div>
                          <span className="text-[10px] text-gray-400 font-mono">{mvt.time}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-gray-800">
                          {mvt.id}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${typeMeta.bg} ${typeMeta.text}`}>
                            {isEntry ? <TrendingUp className="w-3 h-3" /> : isExit ? <TrendingDown className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                            {typeMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{mvt.itemName}</div>
                          <span className="text-[10px] text-gray-400 font-mono">{mvt.itemType === 'produit_fini' ? 'Produit Fini' : 'Intrant'} &bull; {mvt.itemId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${secInfo.bg} ${secInfo.text} ${secInfo.border}`}>
                            <SecIcon className="w-3 h-3" />
                            {secInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-mono text-sm font-black ${isEntry ? 'text-emerald-700' : isExit ? 'text-rose-700' : 'text-purple-700'}`}>
                            {isEntry ? '+' : isExit ? '-' : ''}{mvt.quantity} {mvt.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-700">
                          {mvt.referenceDoc || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="text-[11px] font-semibold text-gray-800">{mvt.operator || 'Opérateur'}</div>
                          <div className="text-[10px] text-gray-500 italic max-w-xs truncate">{mvt.notes || '-'}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SUB-TAB: RETOURS CLIENTS & SAV                        */}
      {/* ======================================================== */}
      {activeSubTab === 'client_returns' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                Gestion Intégrée des Retours Clients & Avoirs (SAV)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Liaison automatique entre les retours physiques (réintégration en stock ou mise au rebut pour casse) et la comptabilité SYSCOHADA (émission d'avoirs, compte 709 RRR & déduction de créance/trésorerie).
              </p>
            </div>

            <button
              onClick={() => setShowReturnModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Retour Client (RMA)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Dossiers de Retours Enregistrés ({store.returns.length})</h4>
              <span className="text-xs text-rose-700 font-mono font-bold">
                Total dédommagements / avoirs émis: {store.returns.reduce((s, r) => s + (r.refundAmount || 0), 0).toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/75 text-gray-600 uppercase font-bold text-[10.5px] border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Réf Retour / RMA</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Commande / Client</th>
                    <th className="px-4 py-3">Articles Retournés</th>
                    <th className="px-4 py-3">Décision Stock</th>
                    <th className="px-4 py-3 text-right">Montant Avoir / Remboursé</th>
                    <th className="px-4 py-3">Mode Dédommagement</th>
                    <th className="px-4 py-3">Statut & Écriture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {store.returns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        Aucun retour client enregistré.
                      </td>
                    </tr>
                  ) : (
                    store.returns.map(ret => {
                      const totalQty = ret.itemsReturned.reduce((s, it) => s + it.quantity, 0);

                      return (
                        <tr key={ret.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-mono font-bold text-rose-700">{ret.id}</div>
                            {ret.creditNoteRef && (
                              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Avoir: {ret.creditNoteRef}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                            {ret.date}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-gray-900">{ret.clientName || 'Client Yamtaanu'}</div>
                            <span className="text-[10.5px] font-mono text-amber-700">Cmd: {ret.orderId}</span>
                            <div className="text-[10.5px] text-gray-500 italic mt-0.5">{ret.reason}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              {ret.itemsReturned.map((it, idx) => (
                                <div key={idx} className="text-gray-800">
                                  <strong className="font-mono">{it.quantity}x</strong> {it.variantName || it.productId}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {ret.itemsReturned[0]?.action === 'rebut_perte' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3" />
                                Rebut / Perte Casse
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Réintégré en Stock
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-rose-700">
                            {ret.refundAmount.toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-gray-100 text-gray-700 uppercase">
                              {ret.refundMethod === 'avoir' ? 'Avoir Facture (SYSCOHADA)' : ret.refundMethod === 'especes' ? 'Espèces Caisse' : 'Mobile Money'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              <ShieldCheck className="w-3 h-3" />
                              Validé & Comptabilisé
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 6. SUB-TAB: FICHE D'INVENTAIRE PHYSIQUE & VALORISATION    */}
      {/* ======================================================== */}
      {activeSubTab === 'physical_inventory' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-150">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-purple-600" />
                Fiche d'Inventaire Physique & Pointage Magasinier
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Document de comptage physique sur le terrain pour rapprochement périodique et valorisation bilancielle.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer Fiche de Comptage A4</span>
            </button>
          </div>

          {/* PRINTABLE INVENTORY SHEET CONTENT */}
          <div className="space-y-6 text-slate-800 font-sans">
            
            {/* Header document */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900">COOPÉRATIVE AGRICOLE BAMBOUMIEL / LES TRIANGLES</span>
                <div className="text-xs text-slate-600">Site de Production & Miellerie : Komiguéa, Parakou, République du Bénin</div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">Date d'inventaire: {new Date().toLocaleDateString('fr-FR')} &bull; Magasinier responsable: _____________________</div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded font-bold border border-amber-300">
                  ÉTAT VALORISÉ DU STOCK
                </span>
                <div className="mt-1.5 font-bold text-gray-900">
                  Total Théorique: {stockStats.totalGlobalValuation.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                Section 1 : Produits Finis Conditionnés
              </h4>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-2 border-b border-slate-200">Réf</th>
                    <th className="p-2 border-b border-slate-200">Désignation</th>
                    <th className="p-2 border-b border-slate-200">Secteur</th>
                    <th className="p-2 border-b border-slate-200 text-right">Coût Unit.</th>
                    <th className="p-2 border-b border-slate-200 text-center">Stock Théorique</th>
                    <th className="p-2 border-b border-slate-200 text-center bg-amber-50">Stock Physique Constaté</th>
                    <th className="p-2 border-b border-slate-200 text-center">Écart (+/-)</th>
                    <th className="p-2 border-b border-slate-200">Observations / Visa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {store.products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-[10.5px]">{p.id}</td>
                      <td className="p-2 font-semibold text-slate-900">{p.name} {p.variant ? `(${p.variant})` : ''}</td>
                      <td className="p-2 uppercase text-[10px] text-slate-600">{p.category}</td>
                      <td className="p-2 text-right font-mono">{(p.unitCost || (p.price * 0.6)).toLocaleString('fr-FR')} F</td>
                      <td className="p-2 text-center font-mono font-bold">{p.stock}</td>
                      <td className="p-2 text-center bg-amber-50/50 border-x border-slate-200 font-mono text-slate-400">
                        [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]
                      </td>
                      <td className="p-2 text-center font-mono text-slate-400">[ &nbsp; &nbsp; ]</td>
                      <td className="p-2 text-slate-400 text-[10.5px]">___________________</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Raw materials Table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-teal-600" />
                Section 2 : Intrants & Matières Premières
              </h4>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-2 border-b border-slate-200">Réf</th>
                    <th className="p-2 border-b border-slate-200">Désignation Intrant</th>
                    <th className="p-2 border-b border-slate-200">Secteur</th>
                    <th className="p-2 border-b border-slate-200">Emplacement</th>
                    <th className="p-2 border-b border-slate-200 text-right">Coût Unit.</th>
                    <th className="p-2 border-b border-slate-200 text-center">Stock Théorique</th>
                    <th className="p-2 border-b border-slate-200 text-center bg-teal-50">Stock Physique Constaté</th>
                    <th className="p-2 border-b border-slate-200 text-center">Écart (+/-)</th>
                    <th className="p-2 border-b border-slate-200">Observations / Visa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {store.rawMaterials.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-[10.5px]">{m.id}</td>
                      <td className="p-2 font-semibold text-slate-900">{m.name}</td>
                      <td className="p-2 uppercase text-[10px] text-slate-600">{m.sector}</td>
                      <td className="p-2 text-slate-600 text-[11px]">{m.location}</td>
                      <td className="p-2 text-right font-mono">{m.unitCost.toLocaleString('fr-FR')} F</td>
                      <td className="p-2 text-center font-mono font-bold">{m.currentStock} {m.unit}</td>
                      <td className="p-2 text-center bg-teal-50/50 border-x border-slate-200 font-mono text-slate-400">
                        [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]
                      </td>
                      <td className="p-2 text-center font-mono text-slate-400">[ &nbsp; &nbsp; ]</td>
                      <td className="p-2 text-slate-400 text-[10.5px]">___________________</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures block */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase block mb-8">Le Magasinier / Gestionnaire de Stock:</span>
                <span className="text-[11px] text-slate-500 font-mono">Date & Signature: _______________________</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center">
                <span className="text-xs font-bold text-slate-800 uppercase block mb-1">La Direction / Visa Officiel:</span>
                <img
                  src="/assets/aistudio/image_8866b669.png"
                  alt="Cachet Officiel Ets Les Triangles Agrobusiness & Signature Le Directeur SARKI Yantannou"
                  className="h-20 w-auto object-contain mix-blend-multiply"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: AJUSTEMENT / MOUVEMENT RAPIDE DE STOCK            */}
      {/* ======================================================== */}
      {showAdjustStockModal && adjustTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <ArrowRightLeft className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Enregistrer un Mouvement de Stock</h3>
                  <span className="text-xs text-gray-500">{adjustTarget.name} ({adjustTarget.id})</span>
                </div>
              </div>
              <button onClick={() => setShowAdjustStockModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteStockAdjust} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 block">Stock actuel théorique</span>
                  <span className="text-base font-bold text-gray-900 font-mono">{adjustTarget.currentStock} {adjustTarget.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 block">Coût unitaire appliqué</span>
                  <span className="text-sm font-bold text-gray-800 font-mono">{adjustTarget.unitCost.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Variation de Stock (Positif = Entrée réappro, Négatif = Sortie consommation / casse):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjustQtyChange}
                    onChange={e => setAdjustQtyChange(Number(e.target.value))}
                    placeholder="Ex: +20 ou -5"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <span className="text-xs font-bold text-gray-600">{adjustTarget.unit}</span>
                </div>
                <div className="mt-1 text-[11px] text-gray-500 font-mono">
                  Nouveau stock après validation : <strong>{Math.max(0, adjustTarget.currentStock + adjustQtyChange)} {adjustTarget.unit}</strong>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Motif / Justification du mouvement :</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="Ex: Réapprovisionnement reçu, consommation atelier jus, casse transport..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Opérateur / Responsable :</label>
                <input
                  type="text"
                  value={adjustOperator}
                  onChange={e => setAdjustOperator(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowAdjustStockModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adjustQtyChange === 0}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  Valider le Mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: AJOUTER / MODIFIER PRODUIT FINI                   */}
      {/* ======================================================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-brand-green-100 text-brand-green-800">
                  <Package className="w-5 h-5 text-brand-green-700" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {editingProduct ? 'Modifier Fiche Produit Fini' : 'Créer un Nouveau Produit Fini'}
                  </h3>
                  <span className="text-xs text-gray-500">Ajout direct au catalogue et au suivi de stock</span>
                </div>
              </div>
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">Nom du Produit :</label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    placeholder="Ex: Miel d'Acacia Sauvage, Nectar de Mangue..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Secteur :</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="miel">Miel & Apiculture</option>
                    <option value="jus">Jus & Nectars</option>
                    <option value="the">Thés & Infusions</option>
                    <option value="hotel">Éco-Lodge</option>
                    <option value="conference">Conférences & Séminaires</option>
                    <option value="general">Général</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Variante / Format :</label>
                  <input
                    type="text"
                    value={newProdVariant}
                    onChange={e => setNewProdVariant(e.target.value)}
                    placeholder="Ex: Pot 500g, Bouteille 1L..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Prix de Vente (FCFA) :</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Coût de Revient (FCFA) :</label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={e => setNewProdCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Stock Initial :</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={e => setNewProdStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Seuil Alerte Reappro :</label>
                  <input
                    type="number"
                    value={newProdMinAlert}
                    onChange={e => setNewProdMinAlert(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">Emplacement de Stockage :</label>
                  <input
                    type="text"
                    value={newProdLocation}
                    onChange={e => setNewProdLocation(e.target.value)}
                    placeholder="Ex: Magasin Central, Chambre Froide..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold shadow-sm"
                >
                  {editingProduct ? 'Mettre à jour' : 'Enregistrer le Produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: AJOUTER / MODIFIER INTRANT                        */}
      {/* ======================================================== */}
      {showAddIntrantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Boxes className="w-5 h-5 text-amber-700" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {editingIntrant ? 'Modifier Fiche Intrant / Matière' : 'Créer un Nouvel Intrant'}
                  </h3>
                  <span className="text-xs text-gray-500">Matière première, emballage, consommable ou fourniture</span>
                </div>
              </div>
              <button onClick={() => setShowAddIntrantModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIntrant} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">Désignation Intrant / Matière :</label>
                  <input
                    type="text"
                    value={newMatName}
                    onChange={e => setNewMatName(e.target.value)}
                    placeholder="Ex: Pots en verre 500g, Ananas frais bio Allada..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Secteur Destinataire :</label>
                  <select
                    value={newMatSector}
                    onChange={e => setNewMatSector(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="miel">Miel & Apiculture</option>
                    <option value="jus">Jus & Nectars</option>
                    <option value="the">Thés & Infusions</option>
                    <option value="hotel">Éco-Lodge</option>
                    <option value="conference">Conférences</option>
                    <option value="general">Général</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Catégorie :</label>
                  <select
                    value={newMatCategory}
                    onChange={e => setNewMatCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="matiere_premiere">Matière première</option>
                    <option value="emballage">Emballage & Conditionnement</option>
                    <option value="consommable">Consommable d'exploitation</option>
                    <option value="equipement_ruche">Équipement apicole / matériel</option>
                    <option value="fourniture">Fourniture de bureau / séminaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Unité de mesure :</label>
                  <input
                    type="text"
                    value={newMatUnit}
                    onChange={e => setNewMatUnit(e.target.value)}
                    placeholder="Ex: pots, kg, tiges, bouteilles, litres..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Coût Unitaire (FCFA) :</label>
                  <input
                    type="number"
                    value={newMatUnitCost}
                    onChange={e => setNewMatUnitCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Stock Initial :</label>
                  <input
                    type="number"
                    value={newMatCurrentStock}
                    onChange={e => setNewMatCurrentStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Seuil Alerte Reappro :</label>
                  <input
                    type="number"
                    value={newMatMinAlert}
                    onChange={e => setNewMatMinAlert(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Fournisseur / Coopérative :</label>
                  <input
                    type="text"
                    value={newMatSupplier}
                    onChange={e => setNewMatSupplier(e.target.value)}
                    placeholder="Ex: Verrerie du Golfe, Ferme Bio Dassa..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Emplacement de Stockage :</label>
                  <input
                    type="text"
                    value={newMatLocation}
                    onChange={e => setNewMatLocation(e.target.value)}
                    placeholder="Ex: Hangar Vannerie, Atelier Jus..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowAddIntrantModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  {editingIntrant ? 'Mettre à jour' : 'Enregistrer l\'Intrant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ENREGISTRER UN RETOUR CLIENT (SAV / AVOIR)        */}
      {/* ======================================================== */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-100 text-rose-800">
                  <RotateCcw className="w-5 h-5 text-rose-700" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Enregistrer un Retour Client (RMA)</h3>
                  <span className="text-xs text-gray-500">Génération automatique d'avoir & ajustement de stock</span>
                </div>
              </div>
              <button onClick={() => setShowReturnModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Commande d'origine :</label>
                  <select
                    value={returnOrderId}
                    onChange={e => {
                      setReturnOrderId(e.target.value);
                      const o = store.orders.find(ord => ord.id === e.target.value);
                      if (o) {
                        setReturnClientName(o.clientName);
                        if (o.items.length > 0) {
                          setReturnProductId(o.items[0].productId);
                          setReturnRefundAmount(o.items[0].price);
                        }
                      }
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  >
                    {store.orders.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.id} - {o.clientName} ({o.totalAmount.toLocaleString('fr-FR')} F)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Nom du Client :</label>
                  <input
                    type="text"
                    value={returnClientName}
                    onChange={e => setReturnClientName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Article retourné :</label>
                  <select
                    value={returnProductId}
                    onChange={e => {
                      setReturnProductId(e.target.value);
                      const prod = store.products.find(p => p.id === e.target.value);
                      if (prod) {
                        setReturnRefundAmount(prod.price * returnQuantity);
                      }
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {store.products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.variant || ''}) - {p.price.toLocaleString('fr-FR')} FCFA
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Quantité retournée :</label>
                  <input
                    type="number"
                    min={1}
                    value={returnQuantity}
                    onChange={e => {
                      const q = Number(e.target.value);
                      setReturnQuantity(q);
                      const prod = store.products.find(p => p.id === returnProductId);
                      if (prod) {
                        setReturnRefundAmount(prod.price * q);
                      }
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">Motif du retour :</label>
                  <select
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="Casse / avarie lors du transport">Casse / avarie lors du transport</option>
                    <option value="Défaut d'étanchéité / pot fêlé">Défaut d'étanchéité / pot fêlé</option>
                    <option value="Erreur sur la référence ou le volume">Erreur sur la référence ou le volume</option>
                    <option value="Cristallisation / aspect non conforme souhaité">Cristallisation / aspect non conforme souhaité</option>
                    <option value="Retard de livraison transporteur">Retard de livraison transporteur</option>
                    <option value="Autre réclamation client">Autre réclamation client</option>
                  </select>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 col-span-2">
                  <label className="block text-amber-950 font-bold mb-1">Décision de traitement du stock :</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="returnAction"
                        checked={returnAction === 'remise_en_stock'}
                        onChange={() => setReturnAction('remise_en_stock')}
                      />
                      <span>Réintégrer l'article en stock (+ {returnQuantity})</span>
                    </label>

                    <label className="flex items-center gap-2 font-semibold text-rose-700 cursor-pointer">
                      <input
                        type="radio"
                        name="returnAction"
                        checked={returnAction === 'rebut_perte'}
                        onChange={() => setReturnAction('rebut_perte')}
                      />
                      <span>Mise au rebut / Perte avarie (Pas de restock)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Montant à rembourser / Avoir (FCFA) :</label>
                  <input
                    type="number"
                    value={returnRefundAmount}
                    onChange={e => setReturnRefundAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-rose-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Mode de Dédommagement :</label>
                  <select
                    value={returnRefundMethod}
                    onChange={e => setReturnRefundMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="avoir">Avoir sur prochaine facture (Compte 4111)</option>
                    <option value="especes">Remboursement Espèces Caisse (Compte 5712)</option>
                    <option value="momo">Remboursement Mobile Money (Compte 5713)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">Notes et observations SAV :</label>
                  <textarea
                    value={returnNotes}
                    onChange={e => setReturnNotes(e.target.value)}
                    rows={2}
                    placeholder="Détails du constat d'avarie, accord commercial..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  La validation créera automatiquement l'écriture comptable d'avoir SYSCOHADA (Compte 709 RRR accordés) et le mouvement de traçabilité associé.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
                >
                  Valider le Retour Client & Émettre l'Avoir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
