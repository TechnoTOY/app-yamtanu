import React, { useState, useMemo } from 'react';
import { BambouMielStore } from '../../dataStore';
import { SalesProforma, FinishedProduct, OrderItem } from '../../types';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  Clock, 
  X, 
  Sparkles,
  ShoppingBag,
  Send,
  AlertTriangle,
  User,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface ProformaManagementProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onViewProforma: (proforma: SalesProforma) => void;
}

export default function ProformaManagement({ store, onRefresh, onViewProforma }: ProformaManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New / Edit Proforma Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProformaId, setEditingProformaId] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientIfu, setClientIfu] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [paymentTerms, setPaymentTerms] = useState<'comptant' | 'credit_15j' | 'credit_30j' | 'acompte_50' | 'a_reception'>('comptant');
  const [deliveryTerms, setDeliveryTerms] = useState('Livraison sur site client ou enlèvement boutique');
  const [notes, setNotes] = useState('Offre soumise aux conditions générales de vente Les Triangles Yamtaanu.');
  
  // Items Builder
  const [items, setItems] = useState<{ productId: string; variantName: string; quantity: number; price: number; discountPercent: number }[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [addQty, setAddQty] = useState<number>(1);
  const [addPrice, setAddPrice] = useState<number>(0);
  const [addDiscount, setAddDiscount] = useState<number>(0);

  // Global Discount
  const [globalDiscountAmount, setGlobalDiscountAmount] = useState<number>(0);

  // Convert to Order Modal
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [targetProformaToConvert, setTargetProformaToConvert] = useState<SalesProforma | null>(null);
  const [convertPaymentType, setConvertPaymentType] = useState<'paid' | 'credit' | 'partial'>('paid');
  const [convertPaymentMethod, setConvertPaymentMethod] = useState<'especes' | 'momo' | 'virement' | 'cheque'>('especes');
  const [convertPaidAmount, setConvertPaidAmount] = useState<string>('');
  const [convertDueDate, setConvertDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  // Client Selection Helper
  const handleSelectClient = (name: string) => {
    setClientName(name);
    const profile = store.clientProfiles.find(p => p.clientName.trim().toLowerCase() === name.trim().toLowerCase());
    if (profile) {
      setClientPhone(profile.phone || '');
      setClientEmail(profile.email || '');
      setClientAddress(profile.address ? `${profile.city || ''} ${profile.address}`.trim() : (profile.city || ''));
      setClientIfu(profile.ifuNumber || '');
    }
  };

  // Handle Add Item to Proforma
  const handleAddItem = () => {
    if (!selectedProductToAdd) return;
    const prod = store.products.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    const unitP = addPrice > 0 ? addPrice : prod.price;
    setItems(prev => [
      ...prev,
      {
        productId: prod.id,
        variantName: prod.variant || prod.name,
        quantity: Math.max(1, addQty),
        price: unitP,
        discountPercent: addDiscount
      }
    ]);

    // Reset picker
    setSelectedProductToAdd('');
    setAddQty(1);
    setAddPrice(0);
    setAddDiscount(0);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Computed Proforma Total
  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const line = it.price * it.quantity * (1 - (it.discountPercent || 0) / 100);
      return sum + line;
    }, 0);
  }, [items]);

  const totalNet = Math.max(0, Math.round(subtotal - (globalDiscountAmount || 0)));

  // Proforma list
  const proformas = store.proformas || [];

  // Filtered proformas
  const filteredProformas = useMemo(() => {
    return proformas.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        p.id.toLowerCase().includes(q) || 
        p.clientName.toLowerCase().includes(q) ||
        (p.clientPhone && p.clientPhone.includes(q));

      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [proformas, searchQuery, statusFilter]);

  // Proforma metrics
  const proformaMetrics = useMemo(() => {
    const totalCount = proformas.length;
    const totalAmount = proformas.reduce((sum, p) => sum + p.totalAmount, 0);
    const convertedCount = proformas.filter(p => p.status === 'converti_en_facture').length;
    const pendingCount = proformas.filter(p => p.status === 'brouillon' || p.status === 'envoye' || p.status === 'accepte').length;

    return { totalCount, totalAmount, convertedCount, pendingCount };
  }, [proformas]);

  // Open Edit or New Modal
  const handleOpenForm = (existing?: SalesProforma) => {
    if (existing) {
      setEditingProformaId(existing.id);
      setClientName(existing.clientName);
      setClientPhone(existing.clientPhone || '');
      setClientEmail(existing.clientEmail || '');
      setClientAddress(existing.clientAddress || '');
      setClientIfu(existing.clientIfu || '');
      setDate(existing.date);
      setValidUntil(existing.validUntil || '');
      setPaymentTerms(existing.paymentTerms || 'comptant');
      setDeliveryTerms(existing.deliveryTerms || '');
      setNotes(existing.notes || '');
      setGlobalDiscountAmount(existing.discountAmount || 0);
      setItems(existing.items.map(it => ({
        productId: it.productId,
        variantName: it.variantName || '',
        quantity: it.quantity,
        price: it.price,
        discountPercent: it.discountPercent || 0
      })));
    } else {
      setEditingProformaId(null);
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setClientAddress('');
      setClientIfu('');
      setDate(new Date().toISOString().split('T')[0]);
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setValidUntil(d.toISOString().split('T')[0]);
      setPaymentTerms('comptant');
      setDeliveryTerms('Livraison franco de port au point convenu');
      setNotes('Devis proforma valable 30 jours. TVA non applicable selon statut.');
      setGlobalDiscountAmount(0);
      setItems([]);
    }
    setShowFormModal(true);
  };

  // Submit Proforma Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Veuillez renseigner le nom du client.');
      return;
    }
    if (items.length === 0) {
      alert('Veuillez ajouter au moins un article au devis proforma.');
      return;
    }

    const currentCashier = localStorage.getItem('yamtaanu_current_user_name') || 'Responsable Commercial';

    const proformaData: Omit<SalesProforma, 'id'> = {
      date,
      validUntil,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      clientAddress: clientAddress.trim(),
      clientIfu: clientIfu.trim(),
      items: items.map(it => ({
        productId: it.productId,
        variantName: it.variantName,
        quantity: it.quantity,
        price: it.price,
        discountPercent: it.discountPercent
      })),
      totalAmount: totalNet,
      discountAmount: globalDiscountAmount,
      status: 'envoye',
      paymentTerms,
      deliveryTerms,
      notes,
      createdBy: currentCashier,
      createdAt: new Date().toISOString()
    };

    if (editingProformaId) {
      store.updateProforma(editingProformaId, proformaData);
    } else {
      store.addProforma(proformaData);
    }

    setShowFormModal(false);
    onRefresh();
  };

  // Open Convert Modal
  const handleOpenConvert = (proforma: SalesProforma) => {
    setTargetProformaToConvert(proforma);
    setConvertPaymentType('paid');
    setConvertPaymentMethod('especes');
    setConvertPaidAmount(proforma.totalAmount.toString());
    setShowConvertModal(true);
  };

  // Execute Conversion to Order
  const handleExecuteConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProformaToConvert) return;

    let isCredit = false;
    let paid = targetProformaToConvert.totalAmount;

    if (convertPaymentType === 'credit') {
      isCredit = true;
      paid = 0;
    } else if (convertPaymentType === 'partial') {
      isCredit = true;
      paid = Math.min(targetProformaToConvert.totalAmount, Math.max(0, parseFloat(convertPaidAmount) || 0));
    }

    const createdOrder = store.convertProformaToOrder(targetProformaToConvert.id, {
      paymentMethod: convertPaymentMethod,
      paidAmount: paid,
      isCreditSale: isCredit,
      dueDate: isCredit ? convertDueDate : undefined
    });

    if (createdOrder) {
      setShowConvertModal(false);
      setTargetProformaToConvert(null);
      onRefresh();
      alert(`La facture proforma a été convertie avec succès en Facture de Vente définitive N° ${createdOrder.id} ! Les stocks et écritures comptables ont été mis à jour.`);
    }
  };

  // Delete Proforma
  const handleDelete = (id: string) => {
    if (confirm(`Confirmez-vous la suppression de la facture proforma ${id} ?`)) {
      store.deleteProforma(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Devis &amp; Proformas</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{proformaMetrics.totalCount}</span>
            <span className="text-xs text-slate-400">émis</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Volume Devisé Total</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {proformaMetrics.totalAmount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">FCFA</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400">Proformas en Négociation</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-400 font-mono">{proformaMetrics.pendingCount}</span>
            <span className="text-xs text-slate-400">en attente de validation</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Devis Convertis en Ventes</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{proformaMetrics.convertedCount}</span>
            <span className="text-xs text-emerald-400 font-bold">
              ({proformaMetrics.totalCount > 0 ? Math.round((proformaMetrics.convertedCount / proformaMetrics.totalCount) * 100) : 0} % succès)
            </span>
          </div>
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
              placeholder="Rechercher proforma, client..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="envoye">📤 Envoyé / En attente</option>
            <option value="accepte">✅ Devis Accepté</option>
            <option value="converti_en_facture">🏆 Converti en Vente</option>
            <option value="brouillon">📝 Brouillon</option>
            <option value="expire">⏳ Expiré</option>
          </select>
        </div>

        {/* Create Proforma Button */}
        <button
          onClick={() => handleOpenForm()}
          className="w-full md:w-auto px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Établir une Facture Proforma</span>
        </button>
      </div>

      {/* Proforma Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-slate-800/80 text-slate-300 text-[10.5px] uppercase font-bold tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Réf. Proforma</th>
                <th className="py-3 px-4">Date &amp; Validité</th>
                <th className="py-3 px-4">Client &amp; Contact</th>
                <th className="py-3 px-4 text-center">Articles</th>
                <th className="py-3 px-4 text-right">Montant Total</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredProformas.map(p => {
                const isConverted = p.status === 'converti_en_facture';

                return (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {p.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="block text-slate-300">📅 {p.date}</span>
                        {p.validUntil && (
                          <span className="text-[10px] text-slate-500 block">
                            Validité : {p.validUntil}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{p.clientName}</div>
                      {p.clientPhone && (
                        <span className="text-[11px] text-slate-400 font-mono block">
                          📞 {p.clientPhone}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 bg-slate-800 rounded-full font-mono text-[11px] text-slate-300">
                        {p.items.length} réf.
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400 text-sm">
                      {p.totalAmount.toLocaleString()} FCFA
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'converti_en_facture' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        p.status === 'accepte' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                        p.status === 'envoye' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {p.status === 'converti_en_facture' ? '🏆 Vente Validée' :
                         p.status === 'accepte' ? '✅ Accepté' :
                         p.status === 'envoye' ? '📤 Envoyé' :
                         p.status === 'brouillon' ? '📝 Brouillon' : '⏳ Expiré'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Print / Download Button */}
                        <button
                          onClick={() => onViewProforma(p)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          title="Voir / Imprimer le devis Proforma A4"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>PDF / A4</span>
                        </button>

                        {/* Convert to Sale Button */}
                        {!isConverted && (
                          <button
                            onClick={() => handleOpenConvert(p)}
                            className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Convertir ce devis en commande de vente définitive"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Convertir</span>
                          </button>
                        )}

                        {/* Edit Button */}
                        {!isConverted && (
                          <button
                            onClick={() => handleOpenForm(p)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                            title="Modifier le devis"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400"
                          title="Supprimer le devis"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProformas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Aucune facture proforma trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PROFORMA MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>{editingProformaId ? `Modifier Facture Proforma ${editingProformaId}` : 'Établir une Nouvelle Facture Proforma (Devis)'}</span>
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-sans">
              {/* Client & Metadata Grid */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nom du Client / Établissement *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Supermarché Erevan, Hôtel Paradiso..."
                      value={clientName}
                      onChange={e => handleSelectClient(e.target.value)}
                      list="existing-clients-datalist"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                    />
                    <datalist id="existing-clients-datalist">
                      {store.clientProfiles.map(cp => (
                        <option key={cp.clientName} value={cp.clientName} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Téléphone / Contact</label>
                    <input
                      type="text"
                      placeholder="+229 97 00 00 00"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">N° IFU Bénin (Client)</label>
                    <input
                      type="text"
                      placeholder="Ex: 3201800998811"
                      value={clientIfu}
                      onChange={e => setClientIfu(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date d'Émission</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Offre Valable Jusqu'au</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Modalités de Paiement</label>
                    <select
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="comptant">Paiement Comptant</option>
                      <option value="credit_15j">Crédit à 15 jours</option>
                      <option value="credit_30j">Crédit à 30 jours</option>
                      <option value="acompte_50">Acompte 50% à la commande</option>
                      <option value="a_reception">Paiement à réception</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email / Adresse</label>
                    <input
                      type="text"
                      placeholder="Cotonou, Bénin..."
                      value={clientAddress}
                      onChange={e => setClientAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Items Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Lignes de Produits &amp; Prestations ({items.length})</span>
                  </h3>
                </div>

                {/* Add Item Bar */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sélectionner un Produit</label>
                    <select
                      value={selectedProductToAdd}
                      onChange={e => {
                        const pId = e.target.value;
                        setSelectedProductToAdd(pId);
                        const p = store.products.find(prod => prod.id === pId);
                        if (p) {
                          setAddPrice(p.price);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="">-- Choisir un produit du catalogue --</option>
                      {store.products.map(prod => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} ({prod.variant}) - {prod.price.toLocaleString()} FCFA
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      value={addQty}
                      onChange={e => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Prix Unitaire (F)</label>
                    <input
                      type="number"
                      min="0"
                      value={addPrice}
                      onChange={e => setAddPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Remise %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={addDiscount}
                      onChange={e => setAddDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedProductToAdd}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>

                {/* Items Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="py-2 px-3">Article</th>
                        <th className="py-2 px-3 text-right">Quantité</th>
                        <th className="py-2 px-3 text-right">P.U. (FCFA)</th>
                        <th className="py-2 px-3 text-right">Remise</th>
                        <th className="py-2 px-3 text-right">Total Net (FCFA)</th>
                        <th className="py-2 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {items.map((it, idx) => {
                        const prod = store.products.find(p => p.id === it.productId);
                        const lineTotal = it.price * it.quantity * (1 - (it.discountPercent || 0) / 100);

                        return (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="py-2.5 px-3">
                              <strong className="text-white block">{prod ? prod.name : it.productId}</strong>
                              <span className="text-[10px] text-slate-400">{it.variantName}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-300">{it.price.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-amber-400">{it.discountPercent > 0 ? `${it.discountPercent}%` : '-'}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">{Math.round(lineTotal).toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {items.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                            Aucun article ajouté. Utilisez le sélecteur ci-dessus.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terms & Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Conditions de Livraison</label>
                    <input
                      type="text"
                      value={deliveryTerms}
                      onChange={e => setDeliveryTerms(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Notes &amp; Mentions Légales</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Sous-total articles :</span>
                    <span className="font-mono font-semibold text-white">{Math.round(subtotal).toLocaleString()} FCFA</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>Remise Globale (FCFA) :</span>
                    <input
                      type="number"
                      min="0"
                      value={globalDiscountAmount}
                      onChange={e => setGlobalDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-right font-mono text-amber-400"
                    />
                  </div>

                  <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white uppercase">NET TOTAL DEVISÉ :</span>
                    <span className="text-xl font-black font-mono text-amber-400">
                      {totalNet.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Enregistrer la Facture Proforma</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT PROFORMA TO ORDER MODAL */}
      {showConvertModal && targetProformaToConvert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="px-5 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Valider la Vente &amp; Facture Définitive</span>
              </h2>
              <button onClick={() => setShowConvertModal(false)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteConvert} className="p-5 space-y-4 text-xs font-sans">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400">Devis Réf : <strong className="text-teal-400 font-mono">{targetProformaToConvert.id}</strong></p>
                <p className="text-slate-400">Client : <strong className="text-white">{targetProformaToConvert.clientName}</strong></p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-2">
                  <span className="text-white font-bold">Montant Facture Définitive :</span>
                  <span className="font-mono font-black text-amber-400 text-base">
                    {targetProformaToConvert.totalAmount.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-2">Modalité de la vente *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConvertPaymentType('paid');
                      setConvertPaidAmount(targetProformaToConvert.totalAmount.toString());
                    }}
                    className={`py-2 px-1 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                      convertPaymentType === 'paid' 
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-xs' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    💵 Au Comptant
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConvertPaymentType('partial');
                      setConvertPaidAmount((targetProformaToConvert.totalAmount * 0.5).toString());
                    }}
                    className={`py-2 px-1 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                      convertPaymentType === 'partial' 
                        ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-xs' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    🪙 Avec Acompte
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConvertPaymentType('credit');
                      setConvertPaidAmount('0');
                    }}
                    className={`py-2 px-1 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                      convertPaymentType === 'credit' 
                        ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-xs' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    📑 100% À Crédit
                  </button>
                </div>
              </div>

              {convertPaymentType !== 'credit' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Montant perçu immédiatement (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    max={targetProformaToConvert.totalAmount}
                    value={convertPaidAmount}
                    onChange={e => setConvertPaidAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mode de règlement (immédiat ou principal)</label>
                <select
                  value={convertPaymentMethod}
                  onChange={e => setConvertPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="especes">💵 Espèces</option>
                  <option value="momo">📱 Mobile Money (MTN / Moov)</option>
                  <option value="virement">🏦 Virement Bancaire</option>
                  <option value="cheque">📑 Chèque</option>
                </select>
              </div>

              {convertPaymentType !== 'paid' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date d'échéance du solde crédit</label>
                  <input
                    type="date"
                    value={convertDueDate}
                    onChange={e => setConvertDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              )}

              <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-xl text-[11px] text-teal-300 space-y-1">
                <p>⚡ <strong>Impacts automatiques :</strong></p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  <li>Sortie de stock des {targetProformaToConvert.items.length} références.</li>
                  <li>Génération de la facture officielle SYSCOHADA.</li>
                  <li>Inscription au compte client CRM.</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer la Facture</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
