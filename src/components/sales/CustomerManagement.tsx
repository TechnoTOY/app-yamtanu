import React, { useState, useMemo } from 'react';
import { BambouMielStore } from '../../dataStore';
import { ClientAccountProfile, SalesOrder } from '../../types';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  MessageSquare, 
  FileText, 
  ExternalLink,
  ChevronRight,
  X,
  Sparkles,
  Wallet,
  Receipt,
  UserCheck
} from 'lucide-react';

interface CustomerManagementProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onViewInvoice: (order: SalesOrder) => void;
}

export default function CustomerManagement({ store, onRefresh, onViewInvoice }: CustomerManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [debtFilter, setDebtFilter] = useState<'all' | 'debt_only' | 'no_debt' | 'over_limit'>('all');

  // Selected client for detailed drawer/view
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<ClientAccountProfile> | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetOrderForPayment, setTargetOrderForPayment] = useState<SalesOrder | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [paymentMethodInput, setPaymentMethodInput] = useState<'especes' | 'momo' | 'carte' | 'virement' | 'cheque'>('especes');
  const [paymentMomoProvider, setPaymentMomoProvider] = useState<'MTN MoMo' | 'Moov Money' | 'Wave' | 'Celtiis Cash' | 'Autre'>('MTN MoMo');
  const [paymentMomoRef, setPaymentMomoRef] = useState('');
  const [paymentNotesInput, setPaymentNotesInput] = useState('');

  // All clients with computed financial metrics
  const clientsData = useMemo(() => {
    return store.clientProfiles.map(profile => {
      const summary = store.getClientFinancialSummary(profile.clientName);
      return {
        ...profile,
        summary
      };
    });
  }, [store, store.clientProfiles, store.orders]);

  // Overall Global KPI Metrics
  const globalMetrics = useMemo(() => {
    let totalPurchases = 0;
    let totalDebt = 0;
    let totalOverdue = 0;
    let debtorCount = 0;

    clientsData.forEach(c => {
      totalPurchases += c.summary.totalPurchased;
      totalDebt += c.summary.currentDebt;
      totalOverdue += c.summary.overdueDebt;
      if (c.summary.currentDebt > 0) {
        debtorCount++;
      }
    });

    return {
      totalClients: clientsData.length,
      totalPurchases,
      totalDebt,
      totalOverdue,
      debtorCount
    };
  }, [clientsData]);

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clientsData.filter(client => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        client.clientName.toLowerCase().includes(q) ||
        (client.companyName && client.companyName.toLowerCase().includes(q)) ||
        (client.phone && client.phone.toLowerCase().includes(q)) ||
        (client.city && client.city.toLowerCase().includes(q)) ||
        (client.ifuNumber && client.ifuNumber.toLowerCase().includes(q));

      const matchCat = categoryFilter === 'all' || client.category === categoryFilter;

      let matchDebt = true;
      if (debtFilter === 'debt_only') matchDebt = client.summary.currentDebt > 0;
      else if (debtFilter === 'no_debt') matchDebt = client.summary.currentDebt === 0;
      else if (debtFilter === 'over_limit') matchDebt = client.summary.currentDebt > (client.creditLimit || 300000);

      return matchSearch && matchCat && matchDebt;
    });
  }, [clientsData, searchQuery, categoryFilter, debtFilter]);

  // Selected client detailed object
  const activeClientDetail = useMemo(() => {
    if (!selectedClientName) return null;
    return clientsData.find(c => c.clientName.trim().toLowerCase() === selectedClientName.trim().toLowerCase()) || null;
  }, [clientsData, selectedClientName]);

  // Handle Save or Create Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editingProfile.clientName || !editingProfile.clientName.trim()) {
      alert('Veuillez renseigner le nom du client.');
      return;
    }

    const trimmedName = editingProfile.clientName.trim();
    const finalProfile: ClientAccountProfile = {
      id: editingProfile.id || `CLI-${Date.now().toString().slice(-4)}`,
      clientName: trimmedName,
      companyName: editingProfile.companyName?.trim() || '',
      ifuNumber: editingProfile.ifuNumber?.trim() || '',
      phone: editingProfile.phone?.trim() || '',
      whatsapp: editingProfile.whatsapp?.trim() || editingProfile.phone?.trim() || '',
      email: editingProfile.email?.trim() || '',
      address: editingProfile.address?.trim() || '',
      city: editingProfile.city?.trim() || 'Bénin',
      creditLimit: Number(editingProfile.creditLimit) || 300000,
      paymentTermDays: Number(editingProfile.paymentTermDays) || 15,
      category: editingProfile.category || 'autre',
      status: editingProfile.status || 'actif',
      notes: editingProfile.notes || '',
      lastContactDate: editingProfile.lastContactDate || new Date().toISOString().split('T')[0]
    };

    store.addOrUpdateClientProfile(finalProfile);
    setShowEditModal(false);
    setEditingProfile(null);
    onRefresh();
  };

  // Handle Delete Client Profile
  const handleDeleteClient = (clientName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le profil client "${clientName}" ? Les ventes associées resteront enregistrées.`)) {
      store.deleteClientProfile(clientName);
      if (selectedClientName === clientName) {
        setSelectedClientName(null);
      }
      onRefresh();
    }
  };

  // Open Payment Modal for an Order
  const handleOpenPayment = (order: SalesOrder) => {
    setTargetOrderForPayment(order);
    const balance = order.remainingBalance !== undefined ? order.remainingBalance : Math.max(0, order.totalAmount - (order.paidAmount || 0));
    setPaymentAmountInput(balance.toString());
    setPaymentMethodInput('especes');
    setPaymentMomoProvider('MTN MoMo');
    setPaymentMomoRef('');
    setPaymentNotesInput(`Règlement créance facture ${order.id}`);
    setShowPaymentModal(true);
  };

  // Submit Payment Settlement
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOrderForPayment) return;

    const amt = parseFloat(paymentAmountInput);
    if (isNaN(amt) || amt <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }

    const currentCashier = localStorage.getItem('yamtaanu_current_user_name') || 'Caisse Yamtaanu';

    const success = store.recordOrderPayment(targetOrderForPayment.id, {
      amount: amt,
      paymentMethod: paymentMethodInput,
      momoProvider: paymentMethodInput === 'momo' ? paymentMomoProvider : undefined,
      momoRef: paymentMomoRef,
      receivedBy: currentCashier,
      notes: paymentNotesInput,
      date: new Date().toISOString().split('T')[0]
    });

    if (success) {
      setShowPaymentModal(false);
      setTargetOrderForPayment(null);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Portefeuille Clients</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{globalMetrics.totalClients}</span>
            <span className="text-xs text-slate-400">comptes enregistrés</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Chiffre d'Affaires Clients (B2B)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {globalMetrics.totalPurchases.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">FCFA</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/40 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">Encours Total Créances (Dettes)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {globalMetrics.totalDebt.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">FCFA</span>
          </div>
          <p className="text-[10px] text-rose-400/80 mt-1">
            {globalMetrics.debtorCount} client(s) ont des créances en cours
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Créances Échues en Retard</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {globalMetrics.totalOverdue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Date d'échéance dépassée</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher nom, IFU, ville, tél..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Debt Filter */}
          <select
            value={debtFilter}
            onChange={e => setDebtFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Tous les états de solde</option>
            <option value="debt_only">🔴 Débiteurs (Créances à recouvrer)</option>
            <option value="no_debt">🟢 Soldes à jour (0 Dette)</option>
            <option value="over_limit">⚠️ Plafond de crédit dépassé</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Toutes les catégories</option>
            <option value="supermarche">Supermarchés &amp; Grandes Surfaces</option>
            <option value="hotel">Hôtels &amp; Restaurants</option>
            <option value="boutique">Boutiques &amp; Épiceries Fines</option>
            <option value="distributeur">Distributeurs Grossistes</option>
            <option value="particulier">Clients Particuliers</option>
            <option value="autre">Autres</option>
          </select>
        </div>

        {/* Add New Client Button */}
        <button
          onClick={() => {
            setEditingProfile({
              clientName: '',
              companyName: '',
              ifuNumber: '',
              phone: '',
              whatsapp: '',
              email: '',
              address: '',
              city: 'Cotonou',
              creditLimit: 500000,
              paymentTermDays: 15,
              category: 'boutique',
              status: 'actif',
              notes: ''
            });
            setShowEditModal(true);
          }}
          className="w-full md:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client CRM</span>
        </button>
      </div>

      {/* Main Customers Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => {
          const debt = client.summary.currentDebt;
          const limit = client.creditLimit || 300000;
          const usagePct = limit > 0 ? Math.min(100, Math.round((debt / limit) * 100)) : 0;
          const isOverLimit = debt > limit;
          const isWarning = usagePct >= 70 && !isOverLimit;

          return (
            <div 
              key={client.clientName}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-sm transition-all hover:border-slate-600 flex flex-col justify-between ${
                isOverLimit ? 'border-rose-600/60 bg-rose-950/10' : 
                (debt > 0 ? 'border-amber-600/40' : 'border-slate-800')
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {client.clientName}
                      </h3>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        client.category === 'supermarche' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        client.category === 'hotel' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        client.category === 'boutique' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {client.category || 'Client'}
                      </span>
                    </div>

                    {client.companyName && client.companyName !== client.clientName && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{client.companyName}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProfile(client);
                        setShowEditModal(true);
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                      title="Modifier les coordonnées & plafond"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.clientName)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      title="Supprimer ce client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  {client.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-amber-500" />
                        <span>Tél :</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <a href={`tel:${client.phone}`} className="font-mono text-amber-400 hover:underline">
                          {client.phone}
                        </a>
                        {client.whatsapp && (
                          <a 
                            href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-emerald-600/20 text-emerald-400 px-1.5 py-0.5 rounded hover:bg-emerald-600/30"
                            title="Contacter sur WhatsApp"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {client.city && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>Ville / Adresse :</span>
                      </span>
                      <span className="truncate max-w-[160px]">{client.city} {client.address ? `• ${client.address}` : ''}</span>
                    </div>
                  )}

                  {client.ifuNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">N° IFU :</span>
                      <span className="font-mono font-semibold text-slate-200">{client.ifuNumber}</span>
                    </div>
                  )}
                </div>

                {/* Credit Limit & Debt Gauge */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Encours Dettes / Plafond :</span>
                    <span className={`font-mono ${debt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {debt.toLocaleString()} / {limit.toLocaleString()} F
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverLimit ? 'bg-rose-500' : (isWarning ? 'bg-amber-500' : 'bg-emerald-500')
                      }`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Délai accordé : {client.paymentTermDays || 15} jours</span>
                    <span>Dispo : {Math.max(0, limit - debt).toLocaleString()} F</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => setSelectedClientName(client.clientName)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Historique &amp; Commandes</span>
                  <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                    {client.summary.orderCount}
                  </span>
                </button>

                {debt > 0 && (
                  <button
                    onClick={() => {
                      const firstUnpaid = client.summary.clientOrders.find(o => (o.remainingBalance || 0) > 0);
                      if (firstUnpaid) {
                        handleOpenPayment(firstUnpaid);
                      }
                    }}
                    className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Encaisser un paiement sur les dettes de ce client"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Encaisser</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Aucun client correspondant aux critères de recherche.</p>
          <p className="text-xs text-slate-500 mt-1">Modifiez vos filtres ou ajoutez un nouveau profil client.</p>
        </div>
      )}

      {/* CLIENT DETAILED DRAWER / MODAL */}
      {activeClientDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold border border-amber-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{activeClientDetail.clientName}</span>
                    <span className="text-xs font-normal text-slate-400">({activeClientDetail.category || 'Client'})</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    IFU : {activeClientDetail.ifuNumber || 'Non renseigné'} • Ville : {activeClientDetail.city || 'Bénin'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClientName(null)}
                className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Chiffre d'Affaires</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {activeClientDetail.summary.totalPurchased.toLocaleString()} F
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Réglé</span>
                  <span className="text-base font-black text-blue-400 font-mono">
                    {activeClientDetail.summary.totalPaid.toLocaleString()} F
                  </span>
                </div>
                <div className={`p-3.5 rounded-xl border text-center ${
                  activeClientDetail.summary.currentDebt > 0 ? 'bg-rose-950/30 border-rose-700/50' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-rose-300 block mb-1">Créance / Solde Dû</span>
                  <span className="text-base font-black text-rose-400 font-mono">
                    {activeClientDetail.summary.currentDebt.toLocaleString()} F
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span>Factures &amp; Commandes du Client ({activeClientDetail.summary.clientOrders.length})</span>
                  </h3>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 bg-slate-950/40">
                  {activeClientDetail.summary.clientOrders.map(order => {
                    const remaining = order.remainingBalance !== undefined ? order.remainingBalance : Math.max(0, order.totalAmount - (order.paidAmount || 0));
                    const isPaid = remaining === 0;

                    return (
                      <div key={order.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-xs">{order.id}</span>
                            <span className="text-[11px] text-slate-400">📅 {order.date}</span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isPaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {isPaid ? 'Payé Intégralement' : `À Crédit (Reste: ${remaining.toLocaleString()} F)`}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 mt-1">
                            {order.items.length} article(s) • Total: <strong className="text-white font-mono">{order.totalAmount.toLocaleString()} FCFA</strong>
                            {order.dueDate && !isPaid && (
                              <span className="ml-2 text-amber-400 text-[11px]">Échéance : {order.dueDate}</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isPaid && (
                            <button
                              onClick={() => handleOpenPayment(order)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Encaisser Acompte</span>
                            </button>
                          )}

                          <button
                            onClick={() => onViewInvoice(order)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                            title="Voir et imprimer la facture"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            <span>Facture A4</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {activeClientDetail.summary.clientOrders.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Aucune commande enregistrée pour le moment pour ce client.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedClientName(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      {showEditModal && editingProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="px-5 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{editingProfile.id ? 'Modifier la Fiche Client' : 'Créer un Nouveau Client CRM'}</span>
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nom du Client / Responsable *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Boutique Cotonou Premium"
                    value={editingProfile.clientName || ''}
                    onChange={e => setEditingProfile({ ...editingProfile, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Raison Sociale / Entreprise</label>
                  <input
                    type="text"
                    placeholder="Ex: SARL Cotonou Premium"
                    value={editingProfile.companyName || ''}
                    onChange={e => setEditingProfile({ ...editingProfile, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Téléphone Principal</label>
                  <input
                    type="tel"
                    placeholder="+229 97 00 00 00"
                    value={editingProfile.phone || ''}
                    onChange={e => setEditingProfile({ ...editingProfile, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+229 97 00 00 00"
                    value={editingProfile.whatsapp || ''}
                    onChange={e => setEditingProfile({ ...editingProfile, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">N° IFU Bénin</label>
                  <input
                    type="text"
                    placeholder="Ex: 3201800998811"
                    value={editingProfile.ifuNumber || ''}
                    onChange={e => setEditingProfile({ ...editingProfile, ifuNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ville</label>
                  <input
                    type="text"
                    placeholder="Cotonou, Parakou, Calavi..."
                    value={editingProfile.city || ''}
                    onChange={e => setEditingProfile({ ...editingProfile, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Adresse Complète</label>
                  <input
                    type="text"
                    placeholder="Bvd St Michel, Haie Vive..."
                    value={editingProfile.address || ''}
                    onChange={e => setEditingProfile({ ...editingProfile, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Catégorie d'Activité</label>
                  <select
                    value={editingProfile.category || 'boutique'}
                    onChange={e => setEditingProfile({ ...editingProfile, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="supermarche">Supermarché / Grande Surface</option>
                    <option value="hotel">Hôtel / Restauration</option>
                    <option value="boutique">Boutique / Épicerie Fine</option>
                    <option value="distributeur">Grossiste / Distributeur</option>
                    <option value="particulier">Particulier</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plafond Crédit (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={editingProfile.creditLimit || 300000}
                    onChange={e => setEditingProfile({ ...editingProfile, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Délai Paiement (Jours)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={editingProfile.paymentTermDays || 15}
                    onChange={e => setEditingProfile({ ...editingProfile, paymentTermDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes &amp; Modalités Spécifiques</label>
                <textarea
                  rows={2}
                  placeholder="Informations sur la solvabilité, conditions de livraison particulières..."
                  value={editingProfile.notes || ''}
                  onChange={e => setEditingProfile({ ...editingProfile, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                >
                  Enregistrer le Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENCAISSER RÈGLEMENT MODAL */}
      {showPaymentModal && targetOrderForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="px-5 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Encaisser un Règlement de Créance</span>
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-5 space-y-4 text-xs font-sans">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400">Facture N° : <strong className="text-white font-mono">{targetOrderForPayment.id}</strong></p>
                <p className="text-slate-400">Client : <strong className="text-white">{targetOrderForPayment.clientName}</strong></p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-2">
                  <span className="text-rose-400 font-semibold">Solde restant dû :</span>
                  <span className="font-mono font-black text-rose-400 text-sm">
                    {((targetOrderForPayment.remainingBalance !== undefined ? targetOrderForPayment.remainingBalance : targetOrderForPayment.totalAmount - (targetOrderForPayment.paidAmount || 0))).toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Montant perçu (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmountInput}
                  onChange={e => setPaymentAmountInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 text-lg font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mode d'encaissement *</label>
                <select
                  value={paymentMethodInput}
                  onChange={e => setPaymentMethodInput(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                >
                  <option value="especes">💵 Espèces (Caisse POS)</option>
                  <option value="momo">📱 Mobile Money (MTN / Moov)</option>
                  <option value="virement">🏦 Virement Bancaire (BOA / Ecobank)</option>
                  <option value="cheque">📑 Chèque Bancaire</option>
                  <option value="carte">💳 Carte Bancaire</option>
                </select>
              </div>

              {paymentMethodInput === 'momo' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Opérateur MoMo</label>
                    <select
                      value={paymentMomoProvider}
                      onChange={e => setPaymentMomoProvider(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="MTN MoMo">MTN Mobile Money</option>
                      <option value="Moov Money">Moov Money</option>
                      <option value="Wave">Wave Bénin</option>
                      <option value="Celtiis Cash">Celtiis Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">ID Transaction / Réf</label>
                    <input
                      type="text"
                      placeholder="Ex: TX-98210"
                      value={paymentMomoRef}
                      onChange={e => setPaymentMomoRef(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observation / Note de règlement</label>
                <input
                  type="text"
                  placeholder="Ex: Acompte 50%, solde par chèque..."
                  value={paymentNotesInput}
                  onChange={e => setPaymentNotesInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ce règlement mettra à jour automatiquement le journal de caisse SYSCOHADA (Compte 571 / 4111).</span>
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
                  <span>Valider l'Encaissement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
