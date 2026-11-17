import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { BeekeeperOwner } from '../../types';
import yamtaanuLogo from '../../assets/images/yamtaanu_logo_1783692830472.jpg';
import {
  X,
  Printer,
  Award,
  Sparkles,
  User,
  Camera,
  ShieldCheck,
  Download,
  FileDown,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { readFileAsDataURL, compressImage } from '../../utils/imageUtils';
import {
  downloadMemberCardPng,
  downloadMemberCardPdf
} from '../../utils/memberCardExporter';

interface MemberCardModalProps {
  beekeeper: BeekeeperOwner;
  onClose: () => void;
  onUpdatePhoto?: (newPhotoUrl: string) => void;
  onUpdateRole?: (newRoleTitle: string) => void;
}

const PRESET_MEMBER_ROLES = [
  'Apiculteur',
  'Apicultrice',
  'Technicien',
  'Producteur',
  'Responsable de Rucher',
  'Technicien Miellerie',
  'Tresseur de Ruches',
  'Chef d\'Atelier Jus & Thés',
  'Coopérateur',
  'Responsable Qualité',
  'Agent Commercial',
  'Partenaire',
  'Membre Honoraire',
  'Direction Générale'
];

function formatDateFr(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString('fr-FR');
  const clean = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-');
    return `${d}/${m}/${y}`;
  }
  return clean;
}

export default function MemberCardModal({
  beekeeper,
  onClose,
  onUpdatePhoto,
  onUpdateRole
}: MemberCardModalProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardPrintRef = useRef<HTMLDivElement>(null);
  const [currentPhoto, setCurrentPhoto] = React.useState<string>(beekeeper.photoUrl || '');
  const [currentRole, setCurrentRole] = React.useState<string>(beekeeper.roleTitle || 'Apiculteur');
  const [currentCountry, setCurrentCountry] = React.useState<string>('Bénin');
  const [exportingType, setExportingType] = React.useState<'png' | 'pdf' | null>(null);
  const [downloadedType, setDownloadedType] = React.useState<'png' | 'pdf' | null>(null);
  const [exportError, setExportError] = React.useState<string | null>(null);

  const handleRoleChange = (value: string) => {
    setCurrentRole(value);
    if (onUpdateRole) {
      onUpdateRole(value);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const rawData = await readFileAsDataURL(file);
        const compressed = await compressImage(rawData, 500, 500, 0.85);
        setCurrentPhoto(compressed);
        if (onUpdatePhoto) {
          onUpdatePhoto(compressed);
        }
      } catch (err) {
        console.error('Erreur chargement photo', err);
      }
    }
  };

  useEffect(() => {
    if (qrCanvasRef.current) {
      const verificationUrl = `https://yamtaanu.bj/membre?id=${beekeeper.memberNumber}`;
      QRCode.toCanvas(
        qrCanvasRef.current,
        verificationUrl,
        {
          width: 120,
          margin: 1,
          color: {
            dark: '#171956',
            light: '#ffffff'
          }
        },
        (err) => {
          if (err) console.error('Erreur génération QR membre', err);
        }
      );
    }
  }, [beekeeper.memberNumber]);

  const handlePrint = () => {
    window.print();
  };

  const formattedAddress = [beekeeper.commune, beekeeper.village].filter(Boolean).join(', ');
  const validationDateLabel = formatDateFr(beekeeper.validationDate || beekeeper.joinDate);

  const buildExportPayload = () => ({
    fullName: beekeeper.fullName,
    roleTitle: (currentRole || 'Apiculteur').trim(),
    memberNumber: beekeeper.memberNumber,
    phone: beekeeper.phone || 'Non renseigné',
    address: formattedAddress || 'Komiguéa, Parakou',
    country: (currentCountry || 'Bénin').trim(),
    validationDateLabel,
    photoUrl: currentPhoto || undefined
  });

  const handleDownloadPng = async () => {
    if (exportingType) return;
    setExportError(null);
    setExportingType('png');
    try {
      await downloadMemberCardPng(buildExportPayload());
      setDownloadedType('png');
      setTimeout(() => setDownloadedType((prev) => (prev === 'png' ? null : prev)), 3000);
    } catch (err) {
      console.error('Erreur export PNG carte de membre:', err);
      setExportError('Impossible de télécharger l’image PNG. Réessayez.');
    } finally {
      setExportingType(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (exportingType) return;
    setExportError(null);
    setExportingType('pdf');
    try {
      await downloadMemberCardPdf(buildExportPayload());
      setDownloadedType('pdf');
      setTimeout(() => setDownloadedType((prev) => (prev === 'pdf' ? null : prev)), 3000);
    } catch (err) {
      console.error('Erreur export PDF carte de membre:', err);
      setExportError('Impossible de télécharger le fichier PDF. Réessayez.');
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-member-card-wrapper, #printable-member-card-wrapper * {
            visibility: visible !important;
          }
          #printable-member-card-wrapper {
            position: absolute !important;
            left: 50% !important;
            top: 25mm !important;
            transform: translateX(-50%) !important;
            width: 145mm !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print-card {
            display: none !important;
          }
        }
      `}} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#171956] via-slate-900 to-amber-950/60 border-b border-amber-500/20 flex items-center justify-between no-print-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-400/30">
                  CARTE OFFICIELLE • UNE FACE
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">
                  {beekeeper.memberNumber}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {beekeeper.fullName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handleDownloadPng}
              disabled={exportingType !== null}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              title="Télécharger directement l'image haute définition (PNG)"
            >
              {exportingType === 'png' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : downloadedType === 'png' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>PNG</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={exportingType !== null}
              className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-60 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              title="Télécharger directement le fichier PDF prêt à imprimer"
            >
              {exportingType === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : downloadedType === 'pdf' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              title="Ouvrir la boîte d'impression"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-7 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Controls bar (hidden on print) */}
          <div className="space-y-3 no-print-card">
            <div className="text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Carte permanente (sans date d&apos;expiration) • Modèle officiel alvéolé Yamtãanu.</span>
              </p>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs cursor-pointer transition w-fit">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>📷 Importer photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            {/* Personnalisation de la fonction et du pays */}
            <div className="bg-slate-950/75 border border-slate-800 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-8 flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="font-bold text-amber-300 text-[11px] shrink-0">
                  Fonction du bénéficiaire :
                </label>
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <select
                    value={PRESET_MEMBER_ROLES.includes(currentRole) ? currentRole : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') {
                        handleRoleChange(e.target.value);
                      }
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {PRESET_MEMBER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                    {!PRESET_MEMBER_ROLES.includes(currentRole) && (
                      <option value="__custom__">Personnalisée</option>
                    )}
                  </select>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    placeholder="Fonction personnalisée..."
                    maxLength={32}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="md:col-span-4 flex items-center gap-2">
                <label className="font-bold text-slate-300 text-[11px] shrink-0">Pays :</label>
                <input
                  type="text"
                  value={currentCountry}
                  onChange={(e) => setCurrentCountry(e.target.value)}
                  placeholder="Bénin"
                  maxLength={24}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* ================= CARTE UNIQUE RECTO (UNE FACE) ================= */}
          <div id="printable-member-card-wrapper" ref={cardPrintRef}>
            <div className="relative w-full max-w-[600px] mx-auto aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#171956] flex flex-col justify-between select-none bg-[#fbbf24]">
              
              {/* TOP NAVY HEADER BAR */}
              <div className="bg-[#171956] px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 relative z-10">
                {/* Left Logo: Les Triangles */}
                <div className="h-8 sm:h-10 w-14 sm:w-18 bg-[#09090b] border border-amber-400/50 rounded-md p-0.5 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                  <img
                    src="/assets/aistudio/image_467966f7.png"
                    alt="Les Triangles"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Center Official Title */}
                <h2 className="text-[11px] sm:text-[15px] font-extrabold text-white tracking-wide text-center leading-tight">
                  Carte de membre de la marque Yamtãanu
                </h2>

                {/* Right Logo: Yamtãanu */}
                <div className="h-8 sm:h-10 w-14 sm:w-18 bg-[#171956] rounded-md overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={yamtaanuLogo}
                    alt="Marque Yamtãanu"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* MAIN GOLDEN HONEYCOMB BODY */}
              <div
                className="relative flex-1 px-3 sm:px-5 py-2.5 sm:py-3.5 flex items-center gap-3 sm:gap-5 overflow-hidden"
                style={{
                  background: 'linear-gradient(125deg, #ffe066 0%, #fbbf24 55%, #f59e0b 100%)'
                }}
              >
                {/* Crisp Inline Honeycomb SVG Pattern Overlay */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="yamtaanu-honeycomb"
                      width="36"
                      height="31.176"
                      patternUnits="userSpaceOnUse"
                    >
                      <polygon
                        points="18,1 35,8.794 35,22.382 18,30.176 1,22.382 1,8.794"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.15"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#yamtaanu-honeycomb)" />
                </svg>

                {/* LEFT COLUMN: Hexagonal Photo Frame + Compact Verification QR */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-2 shrink-0">
                  {/* Flat-top Hexagon Outer Navy Border */}
                  <div
                    className="relative w-22 h-20 sm:w-28 sm:h-25 bg-[#171956] flex items-center justify-center shadow-lg group"
                    style={{
                      clipPath: 'polygon(25% 2%, 75% 2%, 98% 50%, 75% 98%, 25% 98%, 2% 50%)'
                    }}
                  >
                    {/* Inner White Hexagon holding Photo */}
                    <div
                      className="w-[calc(100%-6px)] h-[calc(100%-6px)] bg-white flex items-center justify-center overflow-hidden relative"
                      style={{
                        clipPath: 'polygon(25% 2%, 75% 2%, 98% 50%, 75% 98%, 25% 98%, 2% 50%)'
                      }}
                    >
                      {currentPhoto ? (
                        <img
                          src={currentPhoto}
                          alt={beekeeper.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-[#171956]/60">
                          <User className="w-7 h-7 sm:w-9 sm:h-9" />
                          <span className="text-[7px] font-bold uppercase tracking-wider mt-0.5">
                            Photo
                          </span>
                        </div>
                      )}

                      {/* Upload hover overlay (hidden when printing) */}
                      <label className="no-print-card absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300 cursor-pointer text-center p-1">
                        <Camera className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                        <span className="text-[7px] font-bold leading-tight">Changer</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Mini Verification QR Box */}
                  <div className="bg-white/95 rounded-lg p-1 border border-[#171956]/30 shadow-xs flex flex-col items-center">
                    <canvas ref={qrCanvasRef} className="w-10 h-10 sm:w-12 sm:h-12" />
                    <span className="text-[5.5px] sm:text-[6px] font-black uppercase tracking-wider text-[#171956] leading-none mt-0.5">
                      VÉRIF. MEMBRE
                    </span>
                  </div>
                </div>

                {/* RIGHT COLUMN: Translucent Member Details Card */}
                <div className="relative z-10 flex-1 min-w-0 h-full bg-white/25 border border-white/60 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col justify-between shadow-inner">
                  {/* Top Row: Member Name & Customizable Role Badge */}
                  <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-[#171956]/15">
                    <h4 className="text-sm sm:text-lg font-black text-[#171956] uppercase tracking-tight leading-tight truncate">
                      {beekeeper.fullName}
                    </h4>
                    <span className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-md bg-[#171956] text-white text-[9px] sm:text-[11px] font-bold tracking-wide shrink-0 shadow-xs">
                      {(currentRole || 'Apiculteur').trim()}
                    </span>
                  </div>

                  {/* Key-Value Details Grid (NO expiration date) */}
                  <div className="space-y-1 sm:space-y-1.5 my-auto py-1 text-[10px] sm:text-[12px] pr-22 sm:pr-28">
                    <div className="grid grid-cols-12 items-baseline gap-1">
                      <span className="col-span-4 font-bold text-[#171956]">Matricule</span>
                      <span className="col-span-8 font-mono font-extrabold text-slate-900 truncate">
                        {beekeeper.memberNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 items-baseline gap-1">
                      <span className="col-span-4 font-bold text-[#171956]">Téléphone</span>
                      <span className="col-span-8 font-semibold text-slate-900 truncate">
                        {beekeeper.phone || 'Non renseigné'}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 items-baseline gap-1">
                      <span className="col-span-4 font-bold text-[#171956]">Adresse</span>
                      <span className="col-span-8 font-semibold text-slate-900 truncate">
                        {formattedAddress || 'Komiguéa, Parakou'}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 items-baseline gap-1">
                      <span className="col-span-4 font-bold text-[#171956]">Pays</span>
                      <span className="col-span-8 font-semibold text-slate-900 truncate">
                        {(currentCountry || 'Bénin').trim()}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 items-baseline gap-1 pt-0.5">
                      <span className="col-span-4 font-bold text-[#171956]">Validée le</span>
                      <span className="col-span-8 font-semibold text-slate-900">
                        {formatDateFr(beekeeper.validationDate || beekeeper.joinDate)}
                        <span className="ml-1.5 text-[8.5px] sm:text-[9.5px] font-bold text-[#171956]/80">
                          • Carte Permanente
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Official Director Stamp & Signature (blended directly on honeycomb panel) */}
                  <div className="absolute bottom-1.5 right-2 sm:bottom-2 sm:right-3 pointer-events-none">
                    <img
                      src="/assets/aistudio/image_8866b669.png"
                      alt="Cachet Officiel Ets Les Triangles Agrobusiness & Signature Le Directeur SARKI Yantannou"
                      className="h-14 sm:h-18 w-auto object-contain mix-blend-multiply"
                    />
                  </div>
                </div>
              </div>

              {/* BOTTOM NAVY LEGAL FOOTER BAND */}
              <div className="bg-[#171956] px-3 py-1.5 sm:py-2 text-center relative z-10">
                <p className="text-[8px] sm:text-[10.5px] font-bold text-white tracking-wide leading-none truncate">
                  N°RCCM RB/PKO/16 A 2662 &bull; IFU 32008004912 &bull; Tél : +229 01 65613939 / 01 96285520
                </p>
              </div>
            </div>
          </div>

          {/* Direct Download Action Bar */}
          <div className="no-print-card space-y-3">
            {exportError && (
              <div className="p-2.5 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-300">
                {exportError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={handleDownloadPng}
                disabled={exportingType !== null}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {exportingType === 'png' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : downloadedType === 'png' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloadedType === 'png' ? 'Image PNG téléchargée !' : 'Télécharger Image (PNG)'}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={exportingType !== null}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-60 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {exportingType === 'pdf' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : downloadedType === 'pdf' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span>{downloadedType === 'pdf' ? 'PDF téléchargé !' : 'Télécharger Carte (PDF)'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimer sur papier</span>
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Téléchargement direct en 1 clic :</strong> Utilisez <strong>« Télécharger Image (PNG) »</strong> ou <strong>« Télécharger Carte (PDF) »</strong> pour enregistrer immédiatement la carte sur votre ordinateur ou téléphone avec les alvéoles dorées, la photo hexagonale, le QR code, la fonction personnalisée et le cachet officiel.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
