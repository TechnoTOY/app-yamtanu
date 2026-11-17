import React from 'react';
import { FinishedProduct, SalesOrder, SalesProforma, ClientAccountProfile } from '../../types';
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  CreditCard, 
  QrCode,
  ShieldCheck,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';

interface InvoiceDocumentModalProps {
  type: 'invoice' | 'proforma';
  order?: SalesOrder | null;
  proforma?: SalesProforma | null;
  clientProfile?: ClientAccountProfile | null;
  products?: FinishedProduct[];
  onClose: () => void;
  onConvertToOrder?: (proformaId: string) => void;
}

// Convert number to French text approximation for invoices
function numberToFrenchWords(n: number): string {
  if (n === 0) return 'zéro';
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  if (n < 20) return units[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7) return 'soixante-' + (u === 1 ? 'et-onze' : units[10 + u]);
    if (t === 9) return 'quatre-vingt-' + units[10 + u];
    if (u === 0) return t === 8 ? 'quatre-vingts' : tens[t];
    if (u === 1 && t !== 8) return tens[t] + '-et-un';
    return tens[t] + '-' + units[u];
  }
  if (n < 1000) {
    const c = Math.floor(n / 100);
    const rem = n % 100;
    const prefix = c === 1 ? 'cent' : units[c] + ' cents';
    return rem === 0 ? prefix : (c === 1 ? 'cent' : units[c] + ' cent') + ' ' + numberToFrenchWords(rem);
  }
  if (n < 1000000) {
    const m = Math.floor(n / 1000);
    const rem = n % 1000;
    const prefix = m === 1 ? 'mille' : numberToFrenchWords(m) + ' mille';
    return rem === 0 ? prefix : prefix + ' ' + numberToFrenchWords(rem);
  }
  const mil = Math.floor(n / 1000000);
  const rem = n % 1000000;
  const prefix = mil === 1 ? 'un million' : numberToFrenchWords(mil) + ' millions';
  return rem === 0 ? prefix : prefix + ' ' + numberToFrenchWords(rem);
}

export default function InvoiceDocumentModal({
  type,
  order,
  proforma,
  clientProfile,
  products = [],
  onClose,
  onConvertToOrder
}: InvoiceDocumentModalProps) {
  const isInvoice = type === 'invoice' && order;
  const isProforma = type === 'proforma' && proforma;

  if (!isInvoice && !isProforma) return null;

  const docNumber = isInvoice ? order.id : proforma.id;
  const docDate = isInvoice ? order.date : proforma.date;
  const clientName = isInvoice ? order.clientName : proforma.clientName;
  const clientPhone = isInvoice ? (order.clientPhone || clientProfile?.phone || '') : (proforma.clientPhone || clientProfile?.phone || '');
  const clientEmail = isInvoice ? (clientProfile?.email || '') : (proforma.clientEmail || clientProfile?.email || '');
  const clientAddress = isInvoice ? (order.clientAddress || clientProfile?.address || clientProfile?.city || 'Bénin') : (proforma.clientAddress || clientProfile?.address || 'Bénin');
  const clientIfu = isInvoice ? (order.clientIfu || clientProfile?.ifuNumber || '') : (proforma.clientIfu || clientProfile?.ifuNumber || '');
  const clientCompany = clientProfile?.companyName || '';

  const rawItems = isInvoice ? order.items : proforma.items;
  const items = rawItems.map(it => {
    const matchedProd = products.find(p => p.id === it.productId);
    const name = matchedProd ? matchedProd.name : it.productId;
    const variant = it.variantName || matchedProd?.variant || '';
    const unitPrice = it.price;
    const qty = it.quantity;
    const discount = it.discountPercent || 0;
    const lineTotal = unitPrice * qty * (1 - discount / 100);
    return {
      ...it,
      displayName: name + (variant ? ` - ${variant}` : ''),
      unitPrice,
      qty,
      discount,
      lineTotal
    };
  });

  const totalAmount = isInvoice ? order.totalAmount : proforma.totalAmount;
  const paidAmount = isInvoice ? (order.paidAmount || 0) : 0;
  const remainingBalance = isInvoice ? (order.remainingBalance !== undefined ? order.remainingBalance : Math.max(0, totalAmount - paidAmount)) : totalAmount;
  const isCreditSale = isInvoice ? (order.isCreditSale || remainingBalance > 0) : false;
  const dueDate = isInvoice ? (order.dueDate || order.date) : (proforma.validUntil || '');

  const paymentTermsLabel = isInvoice 
    ? (isCreditSale ? `À Crédit - Échéance au ${dueDate}` : `Règlement au comptant (${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'ESPÈCES'})`)
    : (proforma.paymentTerms === 'comptant' ? 'Paiement comptant à la commande' :
       proforma.paymentTerms === 'credit_15j' ? 'Paiement à crédit à 15 jours' :
       proforma.paymentTerms === 'credit_30j' ? 'Paiement à crédit à 30 jours' :
       proforma.paymentTerms === 'acompte_50' ? 'Acompte 50% à la commande, solde à la livraison' :
       proforma.paymentTerms === 'a_reception' ? 'Paiement à réception des marchandises' : 'Selon accord commercial');

  const subtotalBeforeDiscount = items.reduce((sum, it) => sum + (it.unitPrice * it.qty), 0);
  const totalItemDiscounts = subtotalBeforeDiscount - items.reduce((sum, it) => sum + it.lineTotal, 0);
  const globalDiscountAmount = (isInvoice ? order.discountAmount : proforma.discountAmount) || 0;
  const totalDiscount = totalItemDiscounts + globalDiscountAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice-paper, #printable-invoice-paper * {
            visibility: visible;
          }
          #printable-invoice-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20mm 15mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh]">
        {/* Top Floating Control Bar */}
        <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-inner ${isInvoice ? 'bg-amber-600' : 'bg-teal-600'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isInvoice ? 'Facture Commerciale Définitive' : 'Facture Proforma / Devis'}
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isInvoice 
                    ? (remainingBalance === 0 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30')
                    : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                }`}>
                  {isInvoice ? (remainingBalance === 0 ? 'PAYÉE INTÉGRALEMENT' : `À CRÉDIT (SOLDE DÛ : ${remainingBalance.toLocaleString()} F)`) : `VALIDITÉ : ${proforma.validUntil || '30 Jours'}`}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Réf: {docNumber} • Date: {docDate} • Client: {clientName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isProforma && proforma.status !== 'converti_en_facture' && onConvertToOrder && (
              <button
                onClick={() => onConvertToOrder(proforma.id)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                title="Convertir ce devis en commande / facture de vente"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Convertir en Facture</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              title="Télécharger sous format PDF ou imprimer directement sur imprimante"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>Imprimer / Télécharger en PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/60 flex justify-center">
          {/* A4 PAPER DESIGN */}
          <div 
            id="printable-invoice-paper"
            className="w-full max-w-[210mm] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-xl relative border border-slate-200 flex flex-col justify-between"
            style={{ minHeight: '270mm' }}
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-9xl font-black text-slate-950 uppercase tracking-widest rotate-[-30deg]">
                {isInvoice ? (remainingBalance === 0 ? 'PAYÉ' : 'À CRÉDIT') : 'PROFORMA'}
              </span>
            </div>

            {/* HEADER SECTION */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-900/15 pb-6">
                {/* Company details */}
                <div className="flex items-start gap-4">
                  <div className="w-18 h-14 rounded-xl border border-amber-400/50 p-1 shadow-xs bg-[#09090b] shrink-0 overflow-hidden flex items-center justify-center">
                    <img 
                      src="/assets/aistudio/image_467966f7.png" 
                      alt="Les Triangles Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight font-serif uppercase">
                      LES TRIANGLES
                    </h1>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest leading-none mb-1.5">
                      Complexe Agro-Écologique &amp; Yamtaanu
                    </p>
                    <div className="text-[10px] text-slate-600 space-y-0.5 font-sans leading-tight">
                      <p>📍 Komiguéa, Parakou / Allada • République du Bénin</p>
                      <p>📞 (+229) 97 00 00 00 / 95 00 00 00 • ✉️ contact@lestriangles.bj</p>
                      <p className="font-mono text-[9.5px] font-semibold text-slate-800">
                        IFU : <span className="text-slate-950 font-bold">3201800998811</span> • RCCM : RB/PKO/2026-B-1142
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Type & Reference Box */}
                <div className="text-right sm:self-stretch flex flex-col justify-between w-full sm:w-auto">
                  <div>
                    <div className={`inline-block px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest text-white shadow-xs ${
                      isInvoice ? (isCreditSale ? 'bg-rose-700' : 'bg-slate-900') : 'bg-teal-700'
                    }`}>
                      {isInvoice ? 'FACTURE DE VENTE' : 'FACTURE PROFORMA'}
                    </div>
                    <h2 className="text-lg font-mono font-black text-slate-900 mt-1">
                      N° {docNumber}
                    </h2>
                  </div>

                  <div className="text-[10.5px] text-slate-600 font-sans mt-2 space-y-0.5">
                    <p><span className="font-semibold text-slate-800">Date d'émission :</span> {docDate}</p>
                    {isInvoice && order.dueDate && (
                      <p className="text-rose-700 font-bold">
                        <span>Date d'échéance :</span> {order.dueDate}
                      </p>
                    )}
                    {isProforma && proforma.validUntil && (
                      <p className="text-teal-700 font-bold">
                        <span>Offre valable jusqu'au :</span> {proforma.validUntil}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CLIENT BILLING BOX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left font-sans">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                    ÉMIS PAR :
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block">Les Triangles - Ferme Yamtaanu</strong>
                  <p className="text-[11px] text-slate-600">Service Commercial &amp; Facturation</p>
                  <p className="text-[11px] text-slate-600">Régime Fiscal : Réel Normal (Bénin)</p>
                </div>

                <div className="bg-amber-50/50 border border-amber-900/20 rounded-xl p-4 text-left font-sans">
                  <span className="text-[9px] uppercase font-black text-amber-800 tracking-wider block mb-1">
                    FACTURÉ À / CLIENT :
                  </span>
                  <strong className="text-sm font-black text-slate-950 block">
                    {clientName}
                  </strong>
                  {clientCompany && clientCompany !== clientName && (
                    <p className="text-[11px] font-semibold text-slate-800">{clientCompany}</p>
                  )}
                  {clientAddress && (
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>{clientAddress}</span>
                    </p>
                  )}
                  {clientPhone && (
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>{clientPhone}</span>
                    </p>
                  )}
                  {clientIfu && (
                    <p className="text-[10px] font-mono font-bold text-slate-900 mt-1 bg-white inline-block px-1.5 py-0.5 rounded border border-amber-200">
                      IFU Client : {clientIfu}
                    </p>
                  )}
                </div>
              </div>

              {/* TABLE OF ITEMS */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-slate-100 text-slate-800 text-[10px] uppercase font-black tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Désignation des Articles &amp; Prestations</th>
                      <th className="py-2.5 px-3 text-right">Qté</th>
                      <th className="py-2.5 px-3 text-right">P.U. (FCFA)</th>
                      <th className="py-2.5 px-3 text-right">Remise</th>
                      <th className="py-2.5 px-3 text-right">Total Net (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <strong className="text-slate-900 block font-semibold">{it.displayName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">Réf: {it.productId}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                          {it.qty}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {it.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {it.discount > 0 ? `${it.discount}%` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                          {Math.round(it.lineTotal).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TOTALS & FINANCIAL SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mb-6">
                {/* Words amount & terms */}
                <div className="space-y-3 font-sans text-left">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                      MONTANT TOTAL EN TOUTES LETTRES :
                    </span>
                    <p className="text-xs font-serif italic text-slate-800 font-bold capitalize">
                      "{numberToFrenchWords(totalAmount)} Francs CFA"
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 bg-amber-50/30 p-3 rounded-xl border border-amber-900/10">
                    <p>
                      <strong className="text-slate-900 font-semibold">Conditions de règlement :</strong>{' '}
                      {paymentTermsLabel}
                    </p>
                    {isProforma && proforma.deliveryTerms && (
                      <p>
                        <strong className="text-slate-900 font-semibold">Livraison :</strong> {proforma.deliveryTerms}
                      </p>
                    )}
                    {((isInvoice && order.notes) || (isProforma && proforma.notes)) && (
                      <p className="italic text-slate-500 text-[10px]">
                        Note : {isInvoice ? order.notes : proforma.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Calculation block */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 font-sans text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Sous-total Brut :</span>
                    <span className="font-mono font-semibold">{subtotalBeforeDiscount.toLocaleString()} FCFA</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Remise commerciale accordée :</span>
                      <span className="font-mono">- {Math.round(totalDiscount).toLocaleString()} FCFA</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-black text-slate-950 uppercase">TOTAL NET À PAYER :</span>
                    <span className="text-lg font-mono font-black text-slate-950">
                      {totalAmount.toLocaleString()} FCFA
                    </span>
                  </div>

                  {isInvoice && (
                    <>
                      <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between text-emerald-700 font-bold">
                        <span>Montant Déjà Encaissé :</span>
                        <span className="font-mono">{paidAmount.toLocaleString()} FCFA</span>
                      </div>

                      <div className={`p-2.5 rounded-lg border flex justify-between items-center ${
                        remainingBalance > 0 
                          ? 'bg-rose-50 border-rose-200 text-rose-900 font-black' 
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-black'
                      }`}>
                        <span className="text-xs uppercase tracking-wide">
                          {remainingBalance > 0 ? 'SOLDE RESTANT DÛ (CRÉANCE) :' : 'STATUT DU RÈGLEMENT :'}
                        </span>
                        <span className="text-sm font-mono">
                          {remainingBalance > 0 ? `${remainingBalance.toLocaleString()} FCFA` : 'SOLDE INTÉGRALEMENT RÉGLÉ'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* PAYMENTS HISTORY (IF INVOICE HAS PAYMENTS) */}
              {isInvoice && order.payments && order.payments.length > 0 && (
                <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3 text-left font-sans text-xs">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">
                    Historique des Encaissements &amp; Règlements perçus :
                  </span>
                  <div className="space-y-1.5">
                    {order.payments.map((p, idx) => (
                      <div key={p.id || idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-[11px]">
                        <span className="text-slate-700 font-medium">
                          📅 {p.date} • {p.paymentMethod ? p.paymentMethod.toUpperCase() : 'ESPÈCES'} {p.momoProvider ? `(${p.momoProvider})` : ''} - Reçu par : {p.receivedBy}
                        </span>
                        <span className="font-mono font-bold text-emerald-700">
                          + {p.amount.toLocaleString()} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BANKING DETAILS FOR PAYMENT */}
              <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-slate-700 font-sans grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
                <div>
                  <strong className="text-slate-900 block font-bold mb-1">🏦 Coordonnées Bancaires pour Virement :</strong>
                  <p>Banque : <span className="font-bold">Bank Of Africa (BOA Bénin)</span></p>
                  <p className="font-mono">IBAN/RIB : BJ061 01001 00123456789 45</p>
                  <p>Titulaire : Complexe Les Triangles</p>
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold mb-1">📱 Règlements par Mobile Money :</strong>
                  <p>MTN MoMo Marchand : <span className="font-mono font-bold text-amber-800">*880*41*97000000#</span></p>
                  <p>Moov Money Marchand : <span className="font-mono font-bold text-blue-800">*155*4*1*95000000#</span></p>
                  <p className="text-[9px] text-slate-500">Mentionner le N° {docNumber} en référence.</p>
                </div>
              </div>
            </div>

            {/* FOOTER & SIGNATURES */}
            <div className="border-t-2 border-slate-900/15 pt-6 text-left font-sans">
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">
                    Bon pour accord &amp; Réception Client :
                  </span>
                  <div className="h-16 border border-dashed border-slate-300 rounded-lg p-2 text-[9px] text-slate-400 flex items-end">
                    Date &amp; Signature / Cachet
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">
                    Pour Les Triangles - La Direction :
                  </span>
                  <div className="min-h-24 border border-dashed border-slate-300 rounded-lg px-3 py-1.5 flex flex-col justify-between items-center bg-white">
                    <img
                      src="/assets/aistudio/image_8866b669.png"
                      alt="Cachet Officiel Ets Les Triangles Agrobusiness & Signature Le Directeur SARKI Yantannou"
                      className="h-20 w-auto object-contain mix-blend-multiply"
                    />
                    <span className="text-[8.5px] text-slate-500 font-mono mt-0.5">
                      Cachet officiel &amp; signature • Parakou
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-400 font-sans border-t border-slate-100 pt-3">
                <p>Les Triangles Yamtaanu • Entreprise enregistrée au Bénin • Merci pour votre confiance et votre fidélité !</p>
                <p className="font-mono text-[8px] text-slate-400 mt-0.5">Facturation Conforme SYSCOHADA &amp; Direction Générale des Impôts (DGI Bénin)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
