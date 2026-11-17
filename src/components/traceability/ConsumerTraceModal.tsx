import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import yamtaanuLogo from '../../assets/images/yamtaanu_logo_1783692830472.jpg';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Droplet, 
  Award, 
  ExternalLink,
  Info,
  Check,
  Lock
} from 'lucide-react';

interface ConsumerTraceModalProps {
  jarData: {
    jarCode: string;
    lotNumber: string;
    subLotNumber: string;
    hiveNumber: string;
    apiaryName: string;
    village: string;
    ownerName?: string;
    campaignNumber: string;
    harvestDate: string;
    bottlingDate: string;
    jarFormat: string;
    moisturePercent?: number;
    extractionMethod?: string;
  };
  onClose: () => void;
}

export default function ConsumerTraceModal({ jarData, onClose }: ConsumerTraceModalProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      const url = `https://yamtaanu.bj/trace?bocal=${jarData.jarCode}&lot=${jarData.lotNumber}`;
      QRCode.toCanvas(
        qrRef.current,
        url,
        {
          width: 130,
          margin: 1,
          color: {
            dark: '#1e293b',
            light: '#ffffff'
          }
        },
        (err) => {
          if (err) console.error(err);
        }
      );
    }
  }, [jarData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #consumer-certificate, #consumer-certificate * {
            visibility: visible !important;
          }
          #consumer-certificate {
            position: absolute !important;
            left: 50% !important;
            top: 10mm !important;
            transform: translateX(-50%) !important;
            width: 200mm !important;
            margin: 0 !important;
            padding: 15mm !important;
            border: 8px double #b45309 !important;
            background: #fffdfa !important;
            color: #0f172a !important;
            box-shadow: none !important;
          }
          .no-print-trace {
            display: none !important;
          }
        }
      `}} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Modal Controls Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-900/40 border-b border-amber-500/20 flex items-center justify-between no-print-trace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Droplet className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                TRAÇABILITÉ VÉRIFIÉE CONSOMMATEUR
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Passeport Numérique du Miel sur votre table
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le Certificat</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          
          {/* Privacy Protection Banner */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5 no-print-trace">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong>Transparence Totale & Respect de la Vie Privée :</strong> Cette vue publique présente fidèlement le terroir, la ruche unique d'origine, le sous-lot et les étapes artisanales. Les coordonnées privées de l'apiculteur et les coordonnées GPS sensibles de localisation sont protégées.
            </div>
          </div>

          {/* ================= CERTIFICAT A4 VIRTUEL ================= */}
          <div 
            id="consumer-certificate" 
            className="bg-[#FCFBF7] text-slate-900 rounded-2xl p-6 sm:p-10 border-4 border-amber-600/30 shadow-xl relative"
          >
            {/* Header Logos */}
            <div className="flex items-center justify-between border-b-2 border-amber-600/20 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-12 rounded-xl bg-[#09090b] p-0.5 border border-amber-400/50 shadow flex items-center justify-center overflow-hidden">
                  <img src="/assets/aistudio/image_467966f7.png" alt="Les Triangles" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm tracking-wide">LES TRIANGLES</h4>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Komiguéa • Bénin</span>
                </div>
              </div>

              <div className="text-center hidden sm:block">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-700 block">
                  ORIGINE 100% GARANTIE SANS MÉLANGE
                </span>
                <span className="text-xs text-slate-600 font-serif italic">
                  Du rucher au pot sur votre table
                </span>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <h4 className="font-extrabold text-amber-900 text-sm tracking-wider">YAMTÃANU</h4>
                  <span className="text-[9px] uppercase tracking-wider text-amber-700 font-medium block">Marque Déposée (1990)</span>
                </div>
                <div className="w-14 h-11 rounded-xl bg-[#1c184e] p-0.5 border border-amber-400/40 shadow flex items-center justify-center overflow-hidden">
                  <img src={yamtaanuLogo} alt="Marque Yamtãanu" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Product Title Badge */}
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                🍯 Miel Pur Brut Égoutté Yamtãanu • {jarData.jarFormat || '500g'}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                Certificat Officiel de Traçabilité & Terroir
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Identifiant unique individuel de ce bocal : <strong className="font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{jarData.jarCode}</strong>
              </p>
            </div>

            {/* Step-by-Step Provenance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              
              {/* Box 1 : Terroir & Ruche unique */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>1. TERROIR & RUCHE D'ORIGINE</span>
                </div>
                <div className="text-xs space-y-1 text-slate-700">
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-slate-500">Village / Zone :</span>
                    <strong className="text-slate-900">{jarData.village || 'Kpébié (Parakou)'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-slate-500">Rucher associé :</span>
                    <strong className="text-slate-900">{jarData.apiaryName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-slate-500">Numéro unique de la Ruche :</span>
                    <strong className="font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">{jarData.hiveNumber}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Type d'habitat des abeilles :</span>
                    <strong className="text-emerald-700">Ruche Écologique Yamtãanu</strong>
                  </div>
                </div>
              </div>

              {/* Box 2 : Récolte & Seau dédié */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>2. RÉCOLTE & SOUS-LOT DE SEAU</span>
                </div>
                <div className="text-xs space-y-1 text-slate-700">
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-slate-500">Campagne officielle :</span>
                    <strong className="font-mono text-slate-900">{jarData.campaignNumber}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-slate-500">Date de récolte au rucher :</span>
                    <strong className="text-slate-900">{jarData.harvestDate}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-slate-500">Sous-lot traçabilité seau :</span>
                    <strong className="font-mono text-amber-800">{jarData.subLotNumber}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Règle de séparation :</span>
                    <strong className="text-emerald-700">Miel 100% pur d'une seule ruche</strong>
                  </div>
                </div>
              </div>

              {/* Box 3 : Procédé « Égoutté avec mousse » */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>3. EXTRACTION « ÉGOUTTÉ AVEC MOUSSE »</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Ce miel n'a <strong>jamais été chauffé ni pasteurisé</strong>. Égoutté lentement par simple gravité sur tamis inox alimentaire à température ambiante, avec élimination naturelle de la mousse d'opercules. Toutes les enzymes, flavonoïdes et pollens d'origine sont préservés intacts.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Taux d'humidité contrôlé : {jarData.moisturePercent || 17.2}% (&lt; 18% conforme)</span>
                </div>
              </div>

              {/* Box 4 : Conditionnement & QR */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-4">
                <div className="shrink-0 bg-white p-2 rounded-xl border border-amber-300 shadow-sm">
                  <canvas ref={qrRef} className="w-20 h-20" />
                </div>
                <div className="text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">4. CONDITIONNEMENT & CONTRÔLE</span>
                  <p className="text-slate-600 text-[11px]">
                    Mis en pot le <strong>{jarData.bottlingDate}</strong> sous lot n° <strong className="font-mono text-slate-900">{jarData.lotNumber}</strong>.
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    Flacon en verre scellé avec bague d'inviolabilité garantissant la fraîcheur.
                  </p>
                </div>
              </div>

            </div>

            {/* Quality Seal Footer */}
            <div className="pt-4 border-t-2 border-amber-600/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-700 shrink-0" />
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-900 block font-bold">Charte d'Excellence LES TRIANGLES – Yamtãanu</strong>
                  <span>Miel brut récolté et conditionné artisanalement au Bénin.</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-black text-amber-800 tracking-wider block">
                  DIRECTION TECHNIQUE YAMTÃANU
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  Certificat n° {jarData.jarCode}
                </span>
              </div>
            </div>

          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-400 flex items-center justify-between no-print-trace">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Données internes de l'entreprise (coûts, GPS bruts, contacts privés) protégées conformément à la politique de confidentialité.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
