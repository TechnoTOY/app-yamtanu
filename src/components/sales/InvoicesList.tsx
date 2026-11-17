import React, { useState, useMemo } from 'react';
import { BambouMielStore } from '../../dataStore';
import { SalesOrder } from '../../types';
import { 
  FileText, 
  Search, 
  Printer, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingBag, 
  RotateCcw, 
  Trash2, 
  User, 
  Wallet, 
  Truck, 
  X,
  CreditCard,
  Building2,
  Phone,
  Filter
} from 'lucide-react';

interface InvoicesListProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onViewInvoice: (order: SalesOrder) => void;
  onOpenReturn?: (order: SalesOrder) => void;
}

export default function InvoicesList({ store, onRefresh, onViewInvoice, onOpenReturn }: InvoicesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'credit_only' | 'paid_only' | 'partial_only'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'effectue' | 'en_attente' | 'retourne'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');

  // Payment Settlement Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPay, setSelectedOrderForPay] = useState<SalesOrder | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<string>('');
  const [payMethodInput, setPayMethodInput] = useState<'especes' | 'momo' | 'virement' | 'cheque' | 'carte'>('especes');
  const [payMomoProvider, setPayMomoProvider] = useState<'MTN MoMo' | 'Moov Money' | 'Wave' | 'Celtiis Cash' | 'Autre'>('MTN MoMo');
  const [payMomoRef, setPayMomoRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Delivery Note Modal
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryOrder, setDeliveryOrder] = useState<SalesOrder | null>(null);

  // Delivery note state
  const [transporterName, setTransporterName] = useState('Transporteur Interne / Bus');
  const [driverContact, setDriverContact] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [packageCount, setPackageCount] = useState('1');

  // KPI Calculations
  const metrics = useMemo(() => {
    let totalSales = 0;
    let totalPaid = 0;
    let totalCreditOutstanding = 0;
    let creditOrderCount = 0;

    store.orders.forEach(o => {
      if (o.status !== 'retourne') {
        totalSales += o.totalAmount;
        const paid = o.paidAmount !== undefined ? o.paidAmount : (o.paymentMethod === 'credit' ? 0 : o.totalAmount);
        totalPaid += paid;
        const remaining = o.remainingBalance !== undefined ? o.remainingBalance : Math.max(0, o.totalAmount - paid);
        totalCreditOutstanding += remaining;
        if (remaining > 0 || o.isCreditSale) {
          creditOrderCount++;
        }
      }
    });

    return {
      totalSales,
      totalPaid,
      totalCreditOutstanding,
      creditOrderCount,
      totalOrders: store.orders.length
    };
  }, [store.orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.slice(0, 7);

    return store.orders.filter(order => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        order.id.toLowerCase().includes(q) ||
        order.clientName.toLowerCase().includes(q) ||
        (order.clientPhone && order.clientPhone.includes(q)) ||
        (order.clientAddress && order.clientAddress.toLowerCase().includes(q)) ||
        order.items.some(it => it.productId.toLowerCase().includes(q) || (it.variantName && it.variantName.toLowerCase().includes(q)));

      // Payment Filter
      const remaining = order.remainingBalance !== undefined ? order.remainingBalance : Math.max(0, order.totalAmount - (order.paidAmount || 0));
      const paid = order.paidAmount || 0;
      let matchPay = true;
      if (paymentFilter === 'credit_only') matchPay = remaining > 0 || order.isCreditSale;
      else if (paymentFilter === 'paid_only') matchPay = remaining === 0;
      else if (paymentFilter === 'partial_only') matchPay = remaining > 0 && paid > 0;

      // Status Filter
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;

      // Date Filter
      let matchDate = true;
      if (dateFilter === 'today') matchDate = order.date === todayStr;
      else if (dateFilter === 'month') matchDate = order.date.startsWith(currentMonthStr);

      return matchSearch && matchPay && matchStatus && matchDate;
    });
  }, [store.orders, searchQuery, paymentFilter, statusFilter, dateFilter]);

  // Open Payment modal
  const handleOpenPay = (order: SalesOrder) => {
    setSelectedOrderForPay(order);
    const balance = order.remainingBalance !== undefined ? order.remainingBalance : Math.max(0, order.totalAmount - (order.paidAmount || 0));
    setPayAmountInput(balance.toString());
    setPayMethodInput('especes');
    setPayMomoProvider('MTN MoMo');
    setPayMomoRef('');
    setPayNotes(`Règlement de la facture ${order.id}`);
    setShowPaymentModal(true);
  };

  // Submit Payment Settlement
  const handleSubmitPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPay) return;

    const amt = parseFloat(payAmountInput);
    if (isNaN(amt) || amt <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }

    const currentCashier = localStorage.getItem('yamtaanu_current_user_name') || 'Caisse Yamtaanu';

    const success = store.recordOrderPayment(selectedOrderForPay.id, {
      amount: amt,
      paymentMethod: payMethodInput,
      momoProvider: payMethodInput === 'momo' ? payMomoProvider : undefined,
      momoRef: payMomoRef,
      receivedBy: currentCashier,
      notes: payNotes,
      date: new Date().toISOString().split('T')[0]
    });

    if (success) {
      setShowPaymentModal(false);
      setSelectedOrderForPay(null);
      onRefresh();
    }
  };

  // Open Delivery Modal
  const handleOpenDelivery = (order: SalesOrder) => {
    setDeliveryOrder(order);
    setTransporterName(order.carrierName || 'Transporteur Partenaire (Bus)');
    setDriverContact(order.carrierContact || '');
    setVehiclePlate(order.carrierTrackingNum || '');
    setPackageCount(order.items.reduce((s, it) => s + it.quantity, 0).toString());
    setShowDeliveryModal(true);
  };

  // Delete Order
  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`Confirmez-vous la suppression de la commande ${orderId} ? Cette opération réajustera l'inventaire.`)) {
      store.deleteOrder(orderId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Chiffre d'Affaires Global</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {metrics.totalSales.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{metrics.totalOrders} factures de vente émises</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Total Encaissé (Comptant + Règl.)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {metrics.totalPaid.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Trésorerie effective en caisse &amp; banques</p>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/40 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">Créances Clients (Ventes à Crédit)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {metrics.totalCreditOutstanding.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">FCFA</span>
          </div>
          <p className="text-[10px] text-rose-400/80 mt-1">{metrics.creditOrderCount} vente(s) avec solde dû</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400">Taux de Recouvrement</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-400 font-mono">
              {metrics.totalSales > 0 ? Math.round((metrics.totalPaid / metrics.totalSales) * 100) : 100} %
            </span>
            <span className="text-xs text-slate-400">encaissé</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher facture, client, produit..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Payment Type Filter */}
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Tous les règlements</option>
            <option value="credit_only">🔴 À Crédit / Solde dû</option>
            <option value="paid_only">🟢 Réglé intégralement</option>
            <option value="partial_only">🪙 Acomptes partiels</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Tous les statuts de vente</option>
            <option value="effectue">Livré / Effectué</option>
            <option value="en_attente">En attente de livraison</option>
            <option value="retourne">Retourné / Avoir</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>

      {/* Orders & Invoices Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-slate-800/80 text-slate-300 text-[10.5px] uppercase font-bold tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client &amp; Contact</th>
                <th className="py-3 px-4">Articles &amp; Qtés</th>
                <th className="py-3 px-4 text-right">Total Facturé</th>
                <th className="py-3 px-4 text-right">Déjà Encaissé</th>
                <th className="py-3 px-4 text-right">Solde Dû (Crédit)</th>
                <th className="py-3 px-4 text-center">Règlement</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredOrders.map(order => {
                const paid = order.paidAmount !== undefined ? order.paidAmount : (order.paymentMethod === 'credit' ? 0 : order.totalAmount);
                const remaining = order.remainingBalance !== undefined ? order.remainingBalance : Math.max(0, order.totalAmount - paid);
                const isPaidInFull = remaining === 0;

                return (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {order.id}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      <div>📅 {order.date}</div>
                      {order.dueDate && !isPaidInFull && (
                        <div className="text-[10px] text-rose-400 font-semibold">
                          Échéance: {order.dueDate}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{order.clientName}</div>
                      {order.clientPhone && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          📞 {order.clientPhone}
                        </div>
                      )}
                      {order.clientAddress && (
                        <div className="text-[10px] text-slate-500">
                          📍 {order.clientAddress}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="space-y-0.5">
                        {order.items.map((it, idx) => {
                          const prod = store.products.find(p => p.id === it.productId);
                          const name = prod ? prod.name : it.productId;
                          return (
                            <div key={idx} className="text-[11px] text-slate-300 truncate">
                              <span className="font-mono font-bold text-amber-400">{it.quantity}x</span> {name}
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-xs">
                      {order.totalAmount.toLocaleString()} FCFA
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400 text-xs">
                      {paid.toLocaleString()} FCFA
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-xs">
                      {remaining > 0 ? (
                        <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {remaining.toLocaleString()} FCFA
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[10px] uppercase font-bold">
                          0 F (Soldé)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isPaidInFull 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : (paid > 0 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')
                      }`}>
                        {isPaidInFull ? '✅ Réglé' : (paid > 0 ? '🪙 Acompte' : '🔴 À Crédit')}
                      </span>
                      <span className="block text-[9.5px] text-slate-400 mt-0.5 capitalize">
                        {order.paymentMethod || 'Espèces'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Print Invoice Button */}
                        <button
                          onClick={() => onViewInvoice(order)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          title="Voir / Imprimer la Facture Officielle A4"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Facture</span>
                        </button>

                        {/* Collect Debt Payment */}
                        {!isPaidInFull && (
                          <button
                            onClick={() => handleOpenPay(order)}
                            className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Encaisser un règlement / acompte sur cette vente à crédit"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Encaisser</span>
                          </button>
                        )}

                        {/* Delivery Slip Button */}
                        <button
                          onClick={() => handleOpenDelivery(order)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400"
                          title="Générer / Imprimer le Bon de Livraison (BL)"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>

                        {/* Return Client Button */}
                        {onOpenReturn && (
                          <button
                            onClick={() => onOpenReturn(order)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400"
                            title="Enregistrer un retour client / avoir"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400"
                          title="Supprimer la commande"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    Aucune facture ou vente trouvée pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COLLECT PAYMENT MODAL */}
      {showPaymentModal && selectedOrderForPay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="px-5 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Encaisser un Règlement sur Facture</span>
              </h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPay} className="p-5 space-y-4 text-xs font-sans">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400">Facture : <strong className="text-amber-400 font-mono">{selectedOrderForPay.id}</strong></p>
                <p className="text-slate-400">Client : <strong className="text-white">{selectedOrderForPay.clientName}</strong></p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-2">
                  <span className="text-rose-400 font-semibold">Solde restant dû :</span>
                  <span className="font-mono font-black text-rose-400 text-sm">
                    {((selectedOrderForPay.remainingBalance !== undefined ? selectedOrderForPay.remainingBalance : selectedOrderForPay.totalAmount - (selectedOrderForPay.paidAmount || 0))).toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Montant perçu (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmountInput}
                  onChange={e => setPayAmountInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 text-lg font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mode de règlement *</label>
                <select
                  value={payMethodInput}
                  onChange={e => setPayMethodInput(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="especes">💵 Espèces (Caisse POS)</option>
                  <option value="momo">📱 Mobile Money (MTN / Moov)</option>
                  <option value="virement">🏦 Virement Bancaire</option>
                  <option value="cheque">📑 Chèque</option>
                  <option value="carte">💳 Carte Bancaire</option>
                </select>
              </div>

              {payMethodInput === 'momo' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Opérateur</label>
                    <select
                      value={payMomoProvider}
                      onChange={e => setPayMomoProvider(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="MTN MoMo">MTN Mobile Money</option>
                      <option value="Moov Money">Moov Money</option>
                      <option value="Wave">Wave</option>
                      <option value="Celtiis Cash">Celtiis Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">ID Transaction / Réf</label>
                    <input
                      type="text"
                      placeholder="Ex: TX-12345"
                      value={payMomoRef}
                      onChange={e => setPayMomoRef(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Note de règlement</label>
                <input
                  type="text"
                  placeholder="Ex: Règlement solde final..."
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Enregistrer l'Encaissement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BON DE LIVRAISON (BL) MODAL */}
      {showDeliveryModal && deliveryOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between no-print">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-400" />
                <span>Bon de Livraison &amp; Expédition (BL-{deliveryOrder.id})</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le BL</span>
                </button>
                <button onClick={() => setShowDeliveryModal(false)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 space-y-4">
                {/* Header BL */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h1 className="text-base font-black uppercase text-slate-900">LES TRIANGLES • YAMTAANU</h1>
                    <p className="text-[10px] text-slate-500">Service Expédition &amp; Logistique • Bénin</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-sky-700 text-white rounded font-bold uppercase text-[10px]">
                      BON DE LIVRAISON
                    </span>
                    <p className="font-mono font-bold text-xs mt-1">BL N° {deliveryOrder.id}</p>
                    <p className="text-[10px] text-slate-500">Date: {deliveryOrder.date}</p>
                  </div>
                </div>

                {/* Client & Transport Info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Destinataire :</span>
                    <strong className="block text-slate-900">{deliveryOrder.clientName}</strong>
                    <p className="text-slate-600 text-[11px]">{deliveryOrder.clientAddress || 'Bénin'}</p>
                    <p className="text-slate-600 text-[11px]">{deliveryOrder.clientPhone}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Transporteur &amp; Colis :</span>
                    <strong className="block text-slate-900">{transporterName}</strong>
                    <p className="text-slate-600 text-[11px]">Nbre Colis : {packageCount} carton(s) / sac(s)</p>
                    <p className="text-slate-600 text-[11px]">Contact : {driverContact || 'N/A'} • {vehiclePlate ? `Plaque : ${vehiclePlate}` : ''}</p>
                  </div>
                </div>

                {/* Table of items */}
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-2 border-b">#</th>
                      <th className="p-2 border-b">Désignation</th>
                      <th className="p-2 border-b text-right">Qté Expédiée</th>
                      <th className="p-2 border-b text-center">Contrôle Réception</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deliveryOrder.items.map((it, idx) => {
                      const prod = store.products.find(p => p.id === it.productId);
                      return (
                        <tr key={idx}>
                          <td className="p-2 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-semibold text-slate-900">{prod ? prod.name : it.productId} ({it.variantName || prod?.variant})</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">{it.quantity}</td>
                          <td className="p-2 text-center text-slate-400">[ &nbsp; ] Conforme</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-600 block mb-1">Visa Expéditeur (Les Triangles) :</span>
                    <div className="min-h-20 border border-dashed border-slate-300 rounded p-1.5 flex flex-col items-center justify-center bg-white">
                      <img
                        src="/assets/aistudio/image_8866b669.png"
                        alt="Cachet Officiel Ets Les Triangles Agrobusiness & Signature Le Directeur SARKI Yantannou"
                        className="h-18 w-auto object-contain mix-blend-multiply"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-600 block mb-1">Visa &amp; Signature Réceptionnaire :</span>
                    <div className="min-h-20 border border-dashed border-slate-300 rounded p-2 text-[8px] text-slate-400 flex items-end justify-end">
                      Nom, Date &amp; Signature
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
