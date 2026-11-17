import React, { useState, useMemo } from 'react';
import { BambouMielStore } from '../dataStore';
import { FinishedProduct, SalesOrder, SalesProforma, PosSession, ClientAccountProfile } from '../types';
import InvoicesList from './sales/InvoicesList';
import ProformaManagement from './sales/ProformaManagement';
import CustomerManagement from './sales/CustomerManagement';
import InvoiceDocumentModal from './sales/InvoiceDocumentModal';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Download, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building2, 
  Percent, 
  RotateCcw, 
  Lock, 
  Unlock, 
  DollarSign, 
  User, 
  Clock, 
  Calendar, 
  Receipt, 
  Sparkles, 
  Layers, 
  ArrowLeft,
  X,
  AlertCircle,
  FileText,
  BadgePercent,
  Calculator,
  RefreshCw,
  Users,
  Wallet,
  AlertTriangle
} from 'lucide-react';

interface PosSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onNavigateToFinances?: () => void;
}

interface CartItem {
  product: FinishedProduct;
  quantity: number;
  customPrice?: number;
}

export default function PosSection({ store, onRefresh, onNavigateToFinances }: PosSectionProps) {
  // Main Sub-Tab: POS / Invoices / Proformas / CRM Clients
  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'invoices' | 'proformas' | 'customers'>('pos');

  // Active session
  const activeSession = store.getActivePosSession();

  // Search and category filter (for POS catalog)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'miel' | 'jus' | 'the' | 'hotel' | 'conference' | 'autre'>('all');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('Client Comptoir (Passage)');
  const [newClientName, setNewClientName] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);

  // Discount
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customDiscountAmount, setCustomDiscountAmount] = useState<number>(0);
  const [discountMode, setDiscountMode] = useState<'percent' | 'amount'>('percent');

  // Payment & Credit Mode
  const [salePaymentType, setSalePaymentType] = useState<'cash' | 'credit'>('cash');
  const [paymentMethod, setPaymentMethod] = useState<'especes' | 'momo' | 'carte' | 'virement' | 'cheque' | 'credit'>('especes');
  const [momoProvider, setMomoProvider] = useState<'MTN MoMo' | 'Moov Money' | 'Wave' | 'Celtiis Cash' | 'Autre'>('MTN MoMo');
  const [momoRef, setMomoRef] = useState('');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [creditPaidAmount, setCreditPaidAmount] = useState<string>('0');
  const [creditDueDate, setCreditDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [creditNotes, setCreditNotes] = useState<string>('');

  // Quick Client Creation State (if selling on credit to new client)
  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [quickClientPhone, setQuickClientPhone] = useState('');
  const [quickClientCity, setQuickClientCity] = useState('Cotonou');
  const [quickClientCreditLimit, setQuickClientCreditLimit] = useState('300000');

  // Modals & UI states
  const [completedOrder, setCompletedOrder] = useState<SalesOrder | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionModalMode, setSessionModalMode] = useState<'open' | 'close' | 'history'>('open');
  const [initialCashInput, setInitialCashInput] = useState<string>('50000');
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemVariant, setCustomItemVariant] = useState('Article Libre / Prestation');
  const [customItemPrice, setCustomItemPrice] = useState('1000');
  const [customItemQty, setCustomItemQty] = useState('1');
  const [customItemCategory, setCustomItemCategory] = useState<'autre' | 'miel' | 'jus' | 'the' | 'hotel' | 'conference'>('autre');
  const [saveToCatalog, setSaveToCatalog] = useState(false);

  // Full Document Print Modal (Invoice / Proforma A4)
  const [docModalState, setDocModalState] = useState<{
    isOpen: boolean;
    type: 'invoice' | 'proforma';
    order?: SalesOrder | null;
    proforma?: SalesProforma | null;
  }>({
    isOpen: false,
    type: 'invoice',
    order: null,
    proforma: null
  });

  // Current cashier name
  const currentCashier = localStorage.getItem('yamtaanu_current_user_name') || (activeSession ? activeSession.cashierName : 'Caissier Yamtaanu');

  // Filtered products list for POS
  const filteredProducts = useMemo(() => {
    return store.products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.variant.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) ||
        (p.batchNumber && p.batchNumber.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [store.products, selectedCategory, searchQuery]);

  // Cart financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + ((item.customPrice ?? item.product.price) * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountMode === 'percent') {
      return Math.round((subtotal * discountPercent) / 100);
    }
    return Math.min(subtotal, customDiscountAmount || 0);
  }, [subtotal, discountPercent, customDiscountAmount, discountMode]);

  const totalToPay = Math.max(0, subtotal - discountAmount);

  // Cash change calculations
  const numericAmountReceived = parseFloat(amountReceived) || 0;
  const changeToReturn = Math.max(0, numericAmountReceived - totalToPay);
  const isCashSufficient = salePaymentType === 'credit' || paymentMethod !== 'especes' || numericAmountReceived >= totalToPay;

  // Selected client profile & financial summary
  const selectedClientProfile = useMemo(() => {
    if (!selectedClient || selectedClient === 'Client Comptoir (Passage)') return null;
    return store.clientProfiles.find(cp => cp.clientName.trim().toLowerCase() === selectedClient.trim().toLowerCase()) || null;
  }, [store.clientProfiles, selectedClient]);

  const clientFinancialSummary = useMemo(() => {
    if (!selectedClientProfile) return null;
    return store.getClientFinancialSummary(selectedClientProfile.clientName);
  }, [store, selectedClientProfile]);

  // Counters for tabs badges
  const creditOrdersCount = useMemo(() => {
    return store.orders.filter(o => (o.remainingBalance || 0) > 0 && o.status !== 'retourne').length;
  }, [store.orders]);

  const pendingProformasCount = useMemo(() => {
    return (store.proformas || []).filter(p => p.status !== 'converti_en_facture' && p.status !== 'expire').length;
  }, [store.proformas]);

  const debtorsCount = useMemo(() => {
    return store.clientProfiles.filter(cp => {
      const summary = store.getClientFinancialSummary(cp.clientName);
      return summary.currentDebt > 0;
    }).length;
  }, [store.clientProfiles, store.orders]);

  // Add to cart handler
  const handleAddToCart = (product: FinishedProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    if (cart.length > 0 && window.confirm('Voulez-vous vider le panier en cours ?')) {
      setCart([]);
      setDiscountPercent(0);
      setCustomDiscountAmount(0);
      setAmountReceived('');
      setSalePaymentType('cash');
    }
  };

  // Add custom uncatalogued item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;
    const price = Math.max(0, parseInt(customItemPrice, 10) || 0);
    const qty = Math.max(1, parseInt(customItemQty, 10) || 1);
    const customProd: FinishedProduct = {
      id: `DIVERS-${Date.now().toString().slice(-6)}`,
      name: customItemName.trim(),
      variant: customItemVariant.trim() || 'Article Libre / Prestation',
      price: price,
      stock: 999,
      category: customItemCategory
    };

    if (saveToCatalog) {
      store.addProduct(customProd);
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === customProd.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === customProd.id 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      return [...prev, { product: customProd, quantity: qty }];
    });

    setShowCustomItemModal(false);
    setCustomItemName('');
    setCustomItemPrice('1000');
    setCustomItemQty('1');
    setCustomItemVariant('Article Libre / Prestation');
    setSaveToCatalog(false);
    onRefresh();
  };

  // Cash Register Session Handlers
  const handleOpenSession = (e: React.FormEvent) => {
    e.preventDefault();
    const initCash = Math.max(0, parseFloat(initialCashInput) || 0);
    store.openPosSession(currentCashier, initCash);
    setShowSessionModal(false);
    onRefresh();
  };

  const handleCloseSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    const counted = parseFloat(countedCashInput) || 0;
    store.closePosSession(activeSession.id, counted, closingNotes);
    setShowSessionModal(false);
    setCountedCashInput('');
    setClosingNotes('');
    onRefresh();
  };

  // Handle Quick Create Client
  const handleSaveQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientName.trim()) return;
    const newProfile: ClientAccountProfile = {
      id: `CLI-${Date.now().toString().slice(-4)}`,
      clientName: quickClientName.trim(),
      phone: quickClientPhone.trim(),
      city: quickClientCity.trim() || 'Cotonou',
      creditLimit: parseFloat(quickClientCreditLimit) || 300000,
      paymentTermDays: 15,
      category: 'boutique',
      status: 'actif',
      notes: 'Client créé rapidement depuis la caisse.'
    };
    store.addOrUpdateClientProfile(newProfile);
    setSelectedClient(newProfile.clientName);
    setShowQuickClientModal(false);
    setQuickClientName('');
    setQuickClientPhone('');
    onRefresh();
  };

  // Process POS Checkout (Supports Cash, Mobile Money, and Credit sales!)
  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (salePaymentType === 'credit') {
      if (!selectedClient || selectedClient === 'Client Comptoir (Passage)') {
        alert('Veuillez sélectionner ou créer un client enregistré pour enregistrer une vente à crédit.');
        setShowQuickClientModal(true);
        return;
      }
    } else {
      if (paymentMethod === 'especes' && numericAmountReceived < totalToPay) {
        alert('Montant espèces reçu insuffisant pour régler la totalité.');
        return;
      }
    }

    const items = cart.map(item => ({
      productId: item.product.id,
      variantName: `${item.product.name} (${item.product.variant})`,
      quantity: item.quantity,
      price: item.customPrice ?? item.product.price
    }));

    const client = selectedClient.trim() || 'Client Comptoir (Passage)';
    const isCredit = salePaymentType === 'credit';
    const paidAmt = isCredit ? Math.min(totalToPay, Math.max(0, parseFloat(creditPaidAmount) || 0)) : totalToPay;

    const order = store.recordPosSale({
      clientName: client,
      items,
      totalAmount: totalToPay,
      discountPercent: discountMode === 'percent' ? discountPercent : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      paymentMethod: isCredit ? (paidAmt > 0 ? 'credit' : 'credit') : paymentMethod,
      momoProvider: paymentMethod === 'momo' ? momoProvider : undefined,
      momoRef: paymentMethod === 'momo' ? momoRef : undefined,
      amountReceived: paymentMethod === 'especes' && !isCredit ? numericAmountReceived : paidAmt,
      changeReturned: paymentMethod === 'especes' && !isCredit ? changeToReturn : 0,
      cashierName: currentCashier
    });

    // If it's a credit sale with custom due date or partial amount, update the order specifics
    if (isCredit) {
      store.updateOrder(order.id, {
        isCreditSale: true,
        paidAmount: paidAmt,
        remainingBalance: Math.max(0, totalToPay - paidAmt),
        paymentStatus: paidAmt === 0 ? 'non_paye' : (paidAmt < totalToPay ? 'partiellement_paye' : 'paye'),
        dueDate: creditDueDate,
        notes: creditNotes || 'Vente à crédit accordée'
      });
    }

    setCompletedOrder(store.orders.find(o => o.id === order.id) || order);
    setShowReceiptModal(true);

    // Reset cart & forms
    setCart([]);
    setDiscountPercent(0);
    setCustomDiscountAmount(0);
    setAmountReceived('');
    setCreditPaidAmount('0');
    setCreditNotes('');
    setSalePaymentType('cash');
    setMomoRef('');
    onRefresh();
  };

  // Cash suggestions quick buttons
  const cashSuggestions = [
    totalToPay,
    Math.ceil(totalToPay / 1000) * 1000,
    Math.ceil(totalToPay / 5000) * 5000,
    10000,
    20000,
    50000
  ].filter((v, i, arr) => v >= totalToPay && arr.indexOf(v) === i && v > 0).slice(0, 4);

  // Today's POS Orders
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPosOrders = store.orders.filter(o => o.date === todayStr);

  return (
    <div className="space-y-6">
      {/* TOP UNIFIED SALES MODULE NAVIGATION TABS */}
      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('pos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'pos'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Caisse Tactile POS</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'invoices'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Factures &amp; Ventes</span>
            {creditOrdersCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                activeSubTab === 'invoices' ? 'bg-slate-950 text-rose-400' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {creditOrdersCount} solde(s) dû(s)
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('proformas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'proformas'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Devis &amp; Factures Proforma</span>
            {pendingProformasCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                activeSubTab === 'proformas' ? 'bg-slate-950 text-teal-300' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}>
                {pendingProformasCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('customers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'customers'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestion Clients &amp; Créances (CRM)</span>
            {debtorsCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                activeSubTab === 'customers' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {debtorsCount} débiteurs
              </span>
            )}
          </button>
        </div>

        {/* Global Quick Action & Session Indicator */}
        <div className="flex items-center gap-2 px-2">
          {activeSession ? (
            <button
              onClick={() => { setSessionModalMode('close'); setShowSessionModal(true); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-mono cursor-pointer transition-all shadow-sm"
              title="Cliquer pour voir le résumé ou clôturer la session (Rapport Z)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Caisse: {activeSession.totalRevenue.toLocaleString()} F</span>
              <Lock className="w-3 h-3 text-emerald-400 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => { setSessionModalMode('open'); setShowSessionModal(true); }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Ouvrir Caisse</span>
            </button>
          )}

          {onNavigateToFinances && (
            <button
              onClick={onNavigateToFinances}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Accéder au Journal Comptable SYSCOHADA"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Comptabilité</span>
            </button>
          )}
        </div>
      </div>

      {/* RENDER ACTIVE SUB-TAB */}
      {activeSubTab === 'invoices' && (
        <InvoicesList
          store={store}
          onRefresh={onRefresh}
          onViewInvoice={(ord) => {
            const cp = store.clientProfiles.find(p => p.clientName.trim().toLowerCase() === ord.clientName.trim().toLowerCase());
            setDocModalState({
              isOpen: true,
              type: 'invoice',
              order: ord,
              proforma: null
            });
          }}
        />
      )}

      {activeSubTab === 'proformas' && (
        <ProformaManagement
          store={store}
          onRefresh={onRefresh}
          onViewProforma={(prof) => {
            setDocModalState({
              isOpen: true,
              type: 'proforma',
              order: null,
              proforma: prof
            });
          }}
        />
      )}

      {activeSubTab === 'customers' && (
        <CustomerManagement
          store={store}
          onRefresh={onRefresh}
          onViewInvoice={(ord) => {
            setDocModalState({
              isOpen: true,
              type: 'invoice',
              order: ord,
              proforma: null
            });
          }}
        />
      )}

      {/* POS WORKSPACE VIEW */}
      {activeSubTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN: PRODUCT CATALOG (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
              {/* Search & Custom item bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher produit, pot de miel, jus, thé, lot..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9.5 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowCustomItemModal(true)}
                  className="px-3 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                  title="Ajouter un article hors catalogue ou prestation libre"
                >
                  <Plus className="w-4 h-4" />
                  <span>Article Libre</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: '🌟 Tout afficher' },
                  { id: 'miel', label: '🍯 Miels & Ruche' },
                  { id: 'jus', label: '🍹 Jus & Nectars' },
                  { id: 'the', label: '🌿 Thés & Tisanes' },
                  { id: 'hotel', label: '🏨 Éco-Lodge' },
                  { id: 'conference', label: '🏛️ Conférences' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      selectedCategory === tab.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Touch Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredProducts.map(product => {
                const inCart = cart.find(i => i.product.id === product.id);
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                    className={`bg-slate-900/90 border rounded-2xl p-3.5 shadow-sm transition-all text-left relative flex flex-col justify-between cursor-pointer ${
                      isOutOfStock 
                        ? 'opacity-50 border-slate-800 cursor-not-allowed' 
                        : inCart 
                          ? 'border-amber-500 bg-amber-500/5 hover:border-amber-400' 
                          : 'border-slate-800 hover:border-slate-600 hover:bg-slate-800/40'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md font-mono">
                        {inCart.quantity}
                      </span>
                    )}

                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        {product.category}
                      </span>
                      <h4 className="text-xs font-bold text-white leading-tight mb-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {product.variant}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-black font-mono text-amber-400">
                        {product.price.toLocaleString()} F
                      </span>
                      <span className={`text-[10px] font-mono font-semibold ${
                        product.stock <= 5 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: POS REGISTER & CART (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Panier d'Encaissement</h3>
                  <span className="text-xs font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-full text-amber-400">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Vider
                  </button>
                )}
              </div>

              {/* Client Selector Bar */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Client Facturé :</span>
                  </span>
                  <button
                    onClick={() => setShowQuickClientModal(true)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                  >
                    + Créer Client
                  </button>
                </div>

                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Client Comptoir (Passage)">Client Comptoir (Passage)</option>
                  {store.clientProfiles.map(cp => (
                    <option key={cp.clientName} value={cp.clientName}>
                      {cp.clientName} {cp.companyName ? `(${cp.companyName})` : ''} - {cp.city || 'Bénin'}
                    </option>
                  ))}
                </select>

                {/* Client Credit Warning (if debt > 0) */}
                {clientFinancialSummary && clientFinancialSummary.currentDebt > 0 && (
                  <div className="p-2 bg-rose-950/30 border border-rose-800/40 rounded-lg text-[10.5px] text-rose-300 flex items-center justify-between">
                    <span>⚠️ Solde débiteur actuel :</span>
                    <span className="font-mono font-black">{clientFinancialSummary.currentDebt.toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <span>Panier vide. Cliquez sur un produit à gauche pour l'ajouter.</span>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <strong className="text-white block truncate">{item.product.name}</strong>
                        <span className="text-[10px] text-slate-400">{item.product.variant} • {item.product.price.toLocaleString()} F</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, -1)}
                            className="p-1 hover:bg-slate-700 text-slate-300 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-white text-xs">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, 1)}
                            className="p-1 hover:bg-slate-700 text-slate-300 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="w-16 text-right font-mono font-bold text-amber-400">
                          {((item.customPrice ?? item.product.price) * item.quantity).toLocaleString()} F
                        </span>

                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* SALE MODE TOGGLE: COMPTANT VS CRÉDIT */}
              {cart.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSalePaymentType('cash')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        salePaymentType === 'cash'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-xs'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Au Comptant (Immédiat)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSalePaymentType('credit')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        salePaymentType === 'credit'
                          ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-xs'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>À Crédit (Paiement différé)</span>
                    </button>
                  </div>

                  {/* Discount Controls */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <BadgePercent className="w-3.5 h-3.5 text-amber-400" />
                      <span>Remise :</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[0, 5, 10, 15].map(pct => (
                        <button
                          key={pct}
                          onClick={() => { setDiscountMode('percent'); setDiscountPercent(pct); }}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            discountPercent === pct ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {pct === 0 ? '0%' : `-${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Financial Total Box */}
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Sous-total brut :</span>
                      <span className="font-mono">{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-xs text-amber-400 font-semibold">
                        <span>Remise accordée :</span>
                        <span className="font-mono">- {discountAmount.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
                      <span className="text-xs font-black uppercase text-white">NET TOTAL À FACTURER :</span>
                      <span className="text-xl font-mono font-black text-amber-400">
                        {totalToPay.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>

                  {/* PAYMENT INPUTS ACCORDING TO SALE MODE */}
                  {salePaymentType === 'cash' ? (
                    <div className="space-y-3">
                      {/* Method Selector */}
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'especes', label: '💵 Espèces' },
                          { id: 'momo', label: '📱 MoMo' },
                          { id: 'carte', label: '💳 Carte' },
                          { id: 'virement', label: '🏦 Virement' },
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`py-1.5 rounded-lg text-xs font-semibold border ${
                              paymentMethod === m.id
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      {/* Cash Input */}
                      {paymentMethod === 'especes' && (
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-semibold">Montant perçu :</span>
                            <button
                              onClick={() => setAmountReceived(totalToPay.toString())}
                              className="text-[11px] text-amber-400 underline font-bold"
                            >
                              Montant Exact
                            </button>
                          </div>
                          <input
                            type="number"
                            placeholder="Saisir montant reçu..."
                            value={amountReceived}
                            onChange={e => setAmountReceived(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold text-base focus:outline-hidden"
                          />
                          {numericAmountReceived > 0 && (
                            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                              <span className="text-slate-400">Monnaie à rendre :</span>
                              <span className="font-mono font-black text-amber-400 text-sm">
                                {changeToReturn.toLocaleString()} FCFA
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* MoMo Provider */}
                      {paymentMethod === 'momo' && (
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                          <select
                            value={momoProvider}
                            onChange={e => setMomoProvider(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                          >
                            <option value="MTN MoMo">🟡 MTN Mobile Money</option>
                            <option value="Moov Money">🔵 Moov Money</option>
                            <option value="Wave">🌊 Wave</option>
                            <option value="Celtiis Cash">🟢 Celtiis Cash</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Réf / ID Transaction..."
                            value={momoRef}
                            onChange={e => setMomoRef(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Credit Sale Inputs */
                    <div className="bg-rose-950/20 border border-rose-800/40 p-3 rounded-xl space-y-3 text-xs">
                      <div>
                        <label className="block text-rose-300 font-semibold mb-1">Acompte perçu immédiatement (FCFA)</label>
                        <input
                          type="number"
                          min="0"
                          max={totalToPay}
                          value={creditPaidAmount}
                          onChange={e => setCreditPaidAmount(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-rose-300 font-semibold mb-1">Date d'échéance du crédit</label>
                        <input
                          type="date"
                          value={creditDueDate}
                          onChange={e => setCreditDueDate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-rose-800/40 font-semibold">
                        <span className="text-rose-300">Solde Créance restant :</span>
                        <span className="font-mono font-black text-rose-400 text-sm">
                          {Math.max(0, totalToPay - (parseFloat(creditPaidAmount) || 0)).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Final Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={!isCashSufficient}
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                      isCashSufficient
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider &amp; Facturer ({totalToPay.toLocaleString()} FCFA)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM UNCATALOGUED ITEM (ARTICLE LIBRE) */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-teal-500/40 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" />
                <span>Ajouter un Article Libre / Prestation Ponctuelle</span>
              </h2>
              <button
                onClick={() => setShowCustomItemModal(false)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="p-5 space-y-4 text-xs font-sans">
              <div className="bg-teal-950/30 border border-teal-500/20 p-3 rounded-xl text-teal-300 text-[11px] leading-relaxed">
                Permet d'ajouter un produit ou un service personnalisé (ex: prestation traiteur, pot personnalisé, dégustation, location de salle ou produit hors catalogue) directement dans la commande en cours.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Désignation / Nom de l'article ou prestation *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Coffret Dégustation Spéciale, Prestation Événement..."
                  value={customItemName}
                  onChange={e => setCustomItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-teal-500 font-medium"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Variante / Précision</label>
                  <input
                    type="text"
                    placeholder="Ex: Format personnalisé, 500g vrac..."
                    value={customItemVariant}
                    onChange={e => setCustomItemVariant(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Secteur d'activité</label>
                  <select
                    value={customItemCategory}
                    onChange={e => setCustomItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="autre">📦 Autre / Prestation</option>
                    <option value="miel">🍯 Miel &amp; Ruche</option>
                    <option value="jus">🍹 Jus &amp; Nectars</option>
                    <option value="the">🌿 Thé &amp; Tisanes</option>
                    <option value="hotel">🏨 Éco-Lodge</option>
                    <option value="conference">🏛️ Conférences</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prix Unitaire (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    placeholder="1000"
                    value={customItemPrice}
                    onChange={e => setCustomItemPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantité à ajouter *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={customItemQty}
                    onChange={e => setCustomItemQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Live Subtotal Preview */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Sous-total pour cet article :</span>
                <span className="text-sm font-mono font-black text-teal-400">
                  {((parseInt(customItemPrice, 10) || 0) * (parseInt(customItemQty, 10) || 1)).toLocaleString()} FCFA
                </span>
              </div>

              {/* Option to save permanently to catalog */}
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/60 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={saveToCatalog}
                  onChange={e => setSaveToCatalog(e.target.checked)}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-400 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-300 text-xs">
                  Enregistrer aussi définitivement dans le catalogue des produits finis
                </span>
              </label>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomItemModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter au Panier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POS CASH REGISTER SESSION (OUVERTURE / CLÔTURE / RAPPORT Z) */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="px-5 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>
                  {sessionModalMode === 'open' 
                    ? 'Ouverture de Session de Caisse' 
                    : 'Clôture de Caisse & Rapport Z'}
                </span>
              </h2>
              <button onClick={() => setShowSessionModal(false)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {sessionModalMode === 'open' ? (
              <form onSubmit={handleOpenSession} className="p-5 space-y-4 text-xs font-sans">
                <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl text-amber-300 text-[11px] leading-relaxed">
                  L'ouverture de session initialise le tiroir-caisse avec le fond de roulement en espèces de départ.
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Caissier / Opérateur</label>
                  <input
                    type="text"
                    disabled
                    value={currentCashier}
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fond de Caisse Initial (Espèces en FCFA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={initialCashInput}
                    onChange={e => setInitialCashInput(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-base focus:outline-hidden focus:border-amber-500"
                    autoFocus
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSessionModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Valider l'Ouverture</span>
                  </button>
                </div>
              </form>
            ) : activeSession ? (
              <form onSubmit={handleCloseSession} className="p-5 space-y-4 text-xs font-sans">
                {/* Financial overview of the current session */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Fond de caisse initial :</span>
                    <span className="font-mono font-bold text-slate-200">{activeSession.initialCash.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>+ Ventes en Espèces :</span>
                    <span className="font-mono font-bold">+{activeSession.totalCashSales.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sky-400">
                    <span>+ Ventes Mobile Money :</span>
                    <span className="font-mono">{activeSession.totalMomoSales.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-indigo-400">
                    <span>+ Ventes Carte / Virement :</span>
                    <span className="font-mono">{activeSession.totalCardSales.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>+ Ventes à Crédit :</span>
                    <span className="font-mono">{activeSession.totalCreditSales.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white">
                    <span>Espèces théoriques dans le tiroir :</span>
                    <span className="font-mono text-amber-400">
                      {(activeSession.initialCash + activeSession.totalCashSales).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Montant réel d'espèces compté (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={countedCashInput}
                    onChange={e => setCountedCashInput(e.target.value)}
                    placeholder="Saisir total espèces physique..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold text-base focus:outline-hidden focus:border-amber-500"
                    autoFocus
                  />
                </div>

                {countedCashInput && (
                  <div className="flex justify-between items-center text-xs p-2.5 rounded-xl border bg-slate-950/60 border-slate-800">
                    <span className="text-slate-400">Écart de caisse :</span>
                    {(() => {
                      const diff = (parseFloat(countedCashInput) || 0) - (activeSession.initialCash + activeSession.totalCashSales);
                      if (diff === 0) return <span className="text-emerald-400 font-mono font-bold">Parfait (0 FCFA)</span>;
                      if (diff > 0) return <span className="text-emerald-400 font-mono font-bold">+{diff.toLocaleString()} FCFA (Excédent)</span>;
                      return <span className="text-rose-400 font-mono font-bold">{diff.toLocaleString()} FCFA (Manquant)</span>;
                    })()}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notes / Observations de clôture</label>
                  <textarea
                    rows={2}
                    value={closingNotes}
                    onChange={e => setClosingNotes(e.target.value)}
                    placeholder="Justifications éventuelles d'écart, remarques..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSessionModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Clôturer la Caisse &amp; Rapport Z</span>
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}

      {/* MODAL: QUICK CREATE CLIENT */}
      {showQuickClientModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="px-5 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>Création Rapide de Compte Client CRM</span>
              </h2>
              <button onClick={() => setShowQuickClientModal(false)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickClient} className="p-5 space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom / Enseigne Client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Boutique Divine Cotonou"
                  value={quickClientName}
                  onChange={e => setQuickClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="+229 97 00 00 00"
                    value={quickClientPhone}
                    onChange={e => setQuickClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ville</label>
                  <input
                    type="text"
                    placeholder="Cotonou / Parakou"
                    value={quickClientCity}
                    onChange={e => setQuickClientCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plafond de Crédit Autorisé (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={quickClientCreditLimit}
                  onChange={e => setQuickClientCreditLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickClientModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                >
                  Enregistrer &amp; Sélectionner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETED SALE MODAL (Receipt + Link to A4 Invoice) */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Vente Enregistrée avec Succès !</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">Facture N° {completedOrder.id}</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">Client :</span>
                <strong className="text-white">{completedOrder.clientName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Montant Total :</span>
                <strong className="text-amber-400 font-mono">{completedOrder.totalAmount.toLocaleString()} FCFA</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Règlement :</span>
                <span className="text-slate-200 capitalize">{completedOrder.isCreditSale ? 'Vente à Crédit' : completedOrder.paymentMethod}</span>
              </div>
              {completedOrder.remainingBalance !== undefined && completedOrder.remainingBalance > 0 && (
                <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-slate-800">
                  <span>Solde Restant Dû :</span>
                  <span className="font-mono">{completedOrder.remainingBalance.toLocaleString()} FCFA</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setDocModalState({
                    isOpen: true,
                    type: 'invoice',
                    order: completedOrder,
                    proforma: null
                  });
                }}
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Facture A4 / PDF</span>
              </button>

              <button
                onClick={() => setShowReceiptModal(false)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                + Nouvelle Vente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL INVOICE & PROFORMA A4 MODAL */}
      {docModalState.isOpen && (
        <InvoiceDocumentModal
          type={docModalState.type}
          order={docModalState.order}
          proforma={docModalState.proforma}
          clientProfile={
            docModalState.order 
              ? store.clientProfiles.find(p => p.clientName.trim().toLowerCase() === docModalState.order?.clientName.trim().toLowerCase()) 
              : store.clientProfiles.find(p => p.clientName.trim().toLowerCase() === docModalState.proforma?.clientName.trim().toLowerCase())
          }
          products={store.products}
          onClose={() => setDocModalState({ isOpen: false, type: 'invoice', order: null, proforma: null })}
          onConvertToOrder={(proformaId) => {
            const created = store.convertProformaToOrder(proformaId, { paymentMethod: 'especes', paidAmount: docModalState.proforma?.totalAmount || 0 });
            if (created) {
              setDocModalState({
                isOpen: true,
                type: 'invoice',
                order: created,
                proforma: null
              });
              onRefresh();
            }
          }}
        />
      )}
    </div>
  );
}
