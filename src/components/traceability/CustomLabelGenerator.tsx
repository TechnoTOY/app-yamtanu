import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { BambouMielStore } from '../../dataStore';
import { BottledJar, BucketSubLot } from '../../types';
import { readFileAsDataURL } from '../../utils/imageUtils';
import yamtaanuLogo from '../../assets/images/yamtaanu_logo_1783692830472.jpg';
import { 
  Upload, 
  Printer, 
  Download, 
  QrCode, 
  Move, 
  Maximize2, 
  Layers, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Sliders, 
  Eye, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

interface CustomLabelGeneratorProps {
  store: BambouMielStore;
  onRefresh: () => void;
  selectedJar?: BottledJar | null;
  onClose?: () => void;
}

export default function CustomLabelGenerator({ store, onRefresh, selectedJar, onClose }: CustomLabelGeneratorProps) {
  // Label image state (custom uploaded or default template)
  const [uploadedLabelImage, setUploadedLabelImage] = useState<string | null>(() => {
    return localStorage.getItem('yamtaanu_custom_label_bg') || null;
  });

  // Selected target Jar or Lot
  const [selectedJarCode, setSelectedJarCode] = useState<string>(
    selectedJar?.jarCode || store.bottledJars[0]?.jarCode || 'YAM-BOC-2026-00001'
  );

  const currentJar = store.bottledJars.find(j => j.jarCode === selectedJarCode) || {
    jarCode: selectedJarCode,
    lotNumber: 'LOT-20260618-500G-01',
    subLotNumber: 'YAM-SLOT-000001',
    hiveNumber: 'YAM/26/001',
    apiaryName: 'Rucher Pilote de Kpébié',
    village: 'Kpébié (Parakou)',
    ownerName: 'Salamatou Gnon',
    campaignNumber: 'YAM-CAM-2026-01',
    harvestDate: '2026-06-12',
    bottlingDate: '2026-06-15',
    jarFormat: '500g',
    netWeightG: 500,
    moisturePercent: 17.2,
    qrUrl: '',
    status: 'en_stock'
  };

  // QR Overlay placement & styling parameters
  const [qrPosX, setQrPosX] = useState<number>(82); // in percentage (0 to 100)
  const [qrPosY, setQrPosY] = useState<number>(55); // in percentage (0 to 100)
  const [qrSizePercent, setQrSizePercent] = useState<number>(26); // in percentage of label width (10% to 50%)
  const [qrBackground, setQrBackground] = useState<'white' | 'transparent'>('white');
  const [showTextUnderQr, setShowTextUnderQr] = useState<boolean>(true);
  const [customTextUnderQr, setCustomTextUnderQr] = useState<string>('Scannez pour traçabilité');
  const [showJarCodeBadge, setShowJarCodeBadge] = useState<boolean>(true);

  // Label physical dimensions
  const [labelWidthMm, setLabelWidthMm] = useState<number>(100);
  const [labelHeightMm, setLabelHeightMm] = useState<number>(60);
  const [sheetLayout, setSheetLayout] = useState<'single' | 'grid_a4_8' | 'grid_a4_12'>('single');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // References
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate QR Code on invisible canvas whenever jar changes
  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://yamtaanu.bj';
    const qrParams = new URLSearchParams({
      t: '1',
      jar: currentJar.jarCode,
      lot: currentJar.lotNumber,
      slot: currentJar.subLotNumber,
      ruche: currentJar.hiveNumber,
      village: currentJar.village,
      recolte: currentJar.harvestDate,
      cond: currentJar.bottlingDate,
      format: currentJar.jarFormat
    });
    const url = `${baseUrl}?${qrParams.toString()}`;

    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        url,
        {
          width: 256,
          margin: qrBackground === 'white' ? 1 : 0,
          color: {
            dark: '#0f172a',
            light: qrBackground === 'white' ? '#ffffff' : '#00000000'
          }
        },
        (err) => {
          if (err) console.error('Erreur QR Code canvas', err);
        }
      );
    }

    QRCode.toDataURL(
      url,
      {
        width: 512,
        margin: qrBackground === 'white' ? 1 : 0,
        color: {
          dark: '#0f172a',
          light: qrBackground === 'white' ? '#ffffff' : '#00000000'
        }
      },
      (err, data) => {
        if (!err && data) {
          setQrDataUrl(data);
        }
      }
    );
  }, [currentJar, qrBackground]);

  // Handle image upload from computer or phone
  const handleLabelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        setUploadedLabelImage(dataUrl);
        localStorage.setItem('yamtaanu_custom_label_bg', dataUrl);
      } catch (err) {
        console.error('Erreur importation image étiquette', err);
      }
    }
  };

  const handleResetToDefaultTemplate = () => {
    setUploadedLabelImage(null);
    localStorage.removeItem('yamtaanu_custom_label_bg');
  };

  // Quick preset positioning
  const handleApplyPreset = (preset: 'bottom_right' | 'bottom_left' | 'top_right' | 'center') => {
    switch (preset) {
      case 'bottom_right':
        setQrPosX(82);
        setQrPosY(55);
        break;
      case 'bottom_left':
        setQrPosX(15);
        setQrPosY(55);
        break;
      case 'top_right':
        setQrPosX(82);
        setQrPosY(18);
        break;
      case 'center':
        setQrPosX(50);
        setQrPosY(50);
        break;
    }
  };

  // Export high-resolution combined image
  const handleDownloadHighResImage = () => {
    const canvas = document.createElement('canvas');
    const widthPx = Math.round(labelWidthMm * 11.81); // ~300 DPI
    const heightPx = Math.round(labelHeightMm * 11.81);
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // 1. Draw Background
      if (uploadedLabelImage) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, widthPx, heightPx);
          drawOverlay();
        };
        bgImg.src = uploadedLabelImage;
      } else {
        // Default golden template background
        const grad = ctx.createLinearGradient(0, 0, widthPx, heightPx);
        grad.addColorStop(0, '#fef3c7');
        grad.addColorStop(1, '#fde68a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, widthPx, heightPx);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, widthPx - 20, heightPx - 20);

        // Header text
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('LES TRIANGLES • YAMTÃANU', 40, 70);

        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 44px serif';
        ctx.fillText(`Miel Pur Brut Égoutté • ${currentJar.jarFormat}`, 40, 130);

        ctx.fillStyle = '#475569';
        ctx.font = '24px sans-serif';
        ctx.fillText(`Terroir : ${currentJar.village} • Ruche : ${currentJar.hiveNumber}`, 40, 180);
        ctx.fillText(`Lot : ${currentJar.lotNumber} • Récolte : ${currentJar.harvestDate}`, 40, 220);

        drawOverlay();
      }
    };

    const drawOverlay = () => {
      if (qrCanvasRef.current) {
        const qrSize = Math.round((widthPx * qrSizePercent) / 100);
        const qrLeft = Math.round((widthPx * qrPosX) / 100 - qrSize / 2);
        const qrTop = Math.round((heightPx * qrPosY) / 100 - qrSize / 2);

        // Draw white backing if selected
        if (qrBackground === 'white') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(qrLeft - 8, qrTop - 8, qrSize + 16, qrSize + (showTextUnderQr ? 40 : 16));
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.strokeRect(qrLeft - 8, qrTop - 8, qrSize + 16, qrSize + (showTextUnderQr ? 40 : 16));
        }

        ctx.drawImage(qrCanvasRef.current, qrLeft, qrTop, qrSize, qrSize);

        if (showTextUnderQr) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(customTextUnderQr, qrLeft + qrSize / 2, qrTop + qrSize + 18);
          ctx.fillText(currentJar.jarCode, qrLeft + qrSize / 2, qrTop + qrSize + 34);
        }

        // Trigger Download
        const link = document.createElement('a');
        link.download = `Etiquette_${currentJar.jarCode}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };

    render();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Hidden high-res QR canvas source */}
      <canvas ref={qrCanvasRef} className="hidden" />

      {/* Dynamic print styles for A4 sheet printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-label-sheet, #printable-label-sheet * {
            visibility: visible !important;
          }
          #printable-label-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            box-shadow: none !important;
          }
          .no-print-label {
            display: none !important;
          }
        }
      `}} />

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              GÉNÉRATEUR D'ÉTIQUETTES PERSONNALISÉES
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Incrustation QR Traçabilité
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Importation de vos Étiquettes Existantes & Application du Code QR
          </h2>
          <p className="text-xs text-slate-400">
            Importez l'image de votre maquette d'étiquette existante, positionnez précisément le code QR et imprimez sur planche A4 ou étiquette individuelle.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print-label">
          <button
            onClick={handleDownloadHighResImage}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Télécharger l'image de l'étiquette en haute définition pour votre imprimeur"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Télécharger Image HD</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Planche</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace : Controls (Left 5 cols) & Live Preview (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= CONTROLS COLUMN (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          
          {/* Card 1 : Import Custom Label Graphic */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>1. Votre Image d'Étiquette</span>
              </span>
              {uploadedLabelImage && (
                <button
                  onClick={handleResetToDefaultTemplate}
                  className="text-red-400 hover:text-red-300 text-[10px] font-bold"
                >
                  Effacer
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition text-center group">
                <ImageIcon className="w-8 h-8 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-200">
                  {uploadedLabelImage ? 'Changer l\'image d\'étiquette' : 'Importer mon étiquette existante'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Depuis ordinateur ou téléphone (PNG, JPG, WEBP)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLabelUpload}
                />
              </label>

              <p className="text-[11px] text-slate-400">
                {uploadedLabelImage ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Étiquette personnalisée chargée avec succès !
                  </span>
                ) : (
                  <span>Modèle standard Yamtãanu actif. Importez votre propre graphisme pour superposer le QR.</span>
                )}
              </p>
            </div>
          </div>

          {/* Card 2 : Target Jar / Batch Selection */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>2. Bocal ou Lot Cible</span>
            </span>

            <div className="space-y-2">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Sélectionner le Bocal / Sous-lot *</label>
                <select
                  value={selectedJarCode}
                  onChange={e => setSelectedJarCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                >
                  {store.bottledJars.map(j => (
                    <option key={j.jarCode} value={j.jarCode}>
                      {j.jarCode} • Ruche {j.hiveNumber} ({j.jarFormat} - {j.village})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-xl space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ruche source :</span>
                  <strong className="text-white font-mono">{currentJar.hiveNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Terroir d'origine :</span>
                  <strong className="text-amber-300">{currentJar.village}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lot de conditionnement :</span>
                  <strong className="text-slate-200 font-mono">{currentJar.lotNumber}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 : QR Code Placement Controls */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>3. Ajustement & Position du QR</span>
            </span>

            {/* Quick Position Presets */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Positionnements rapides :</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('bottom_right')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10.5px] font-medium transition cursor-pointer"
                >
                  Bas-Droit
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('bottom_left')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10.5px] font-medium transition cursor-pointer"
                >
                  Bas-Gauche
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('top_right')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10.5px] font-medium transition cursor-pointer"
                >
                  Haut-Droit
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('center')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10.5px] font-medium transition cursor-pointer"
                >
                  Centre
                </button>
              </div>
            </div>

            {/* Fine Position Sliders */}
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Position Horizontale (X) :</span>
                  <span className="font-mono text-white">{qrPosX}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={qrPosX}
                  onChange={e => setQrPosX(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Position Verticale (Y) :</span>
                  <span className="font-mono text-white">{qrPosY}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={qrPosY}
                  onChange={e => setQrPosY(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Taille du QR Code :</span>
                  <span className="font-mono text-white">{qrSizePercent}%</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="45"
                  value={qrSizePercent}
                  onChange={e => setQrSizePercent(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Appearance toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Fond blanc de protection :</span>
                <button
                  type="button"
                  onClick={() => setQrBackground(qrBackground === 'white' ? 'transparent' : 'white')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    qrBackground === 'white' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {qrBackground === 'white' ? 'Opaque (Recommandé)' : 'Transparent'}
                </button>
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={showTextUnderQr}
                  onChange={e => setShowTextUnderQr(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>Ajouter texte d'instruction sous le QR</span>
              </label>

              {showTextUnderQr && (
                <input
                  type="text"
                  value={customTextUnderQr}
                  onChange={e => setCustomTextUnderQr(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-[11px]"
                />
              )}
            </div>

          </div>

          {/* Card 4 : Dimensions & Sheet layout */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>4. Format d'Impression</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Largeur (mm)</label>
                <input
                  type="number"
                  value={labelWidthMm}
                  onChange={e => setLabelWidthMm(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Hauteur (mm)</label>
                <input
                  type="number"
                  value={labelHeightMm}
                  onChange={e => setLabelHeightMm(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Mise en page d'impression :</label>
              <select
                value={sheetLayout}
                onChange={e => setSheetLayout(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="single">Étiquette unique (imprimante d'étiquettes / unitaire)</option>
                <option value="grid_a4_8">Planche A4 (8 étiquettes • 2 colonnes × 4 lignes)</option>
                <option value="grid_a4_12">Planche A4 (12 étiquettes • 3 colonnes × 4 lignes)</option>
              </select>
            </div>
          </div>

        </div>

        {/* ================= PREVIEW COLUMN (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Aperçu Interactif en Temps Réel</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {labelWidthMm} mm × {labelHeightMm} mm
              </span>
            </div>

            {/* Visual Label Canvas Container */}
            <div className="p-4 sm:p-6 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-center overflow-hidden min-h-[340px]">
              
              <div 
                className="relative bg-white shadow-2xl rounded-xl overflow-hidden select-none transition-all border border-slate-300"
                style={{
                  width: `${Math.min(500, labelWidthMm * 4.5)}px`,
                  aspectRatio: `${labelWidthMm} / ${labelHeightMm}`
                }}
              >
                {/* Background Layer: Uploaded image OR Yamtaanu template */}
                {uploadedLabelImage ? (
                  <img 
                    src={uploadedLabelImage} 
                    alt="Étiquette importée" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-4 border-amber-600/40 flex flex-col justify-between text-slate-900">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-7 rounded bg-[#09090b] border border-amber-400/50 p-0.5 shadow flex items-center justify-center overflow-hidden">
                          <img src="/assets/aistudio/image_467966f7.png" alt="Logo Les Triangles" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <span className="font-black text-amber-900 text-[10px] block leading-none">LES TRIANGLES</span>
                          <span className="text-[7px] text-slate-600 uppercase font-semibold">Komiguéa • Bénin</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <span className="font-black text-amber-950 text-[10px] block leading-none">YAMTÃANU</span>
                          <span className="text-[7px] text-amber-700 uppercase font-bold">Marque Officielle</span>
                        </div>
                        <div className="w-10 h-7 rounded-md bg-[#1c184e] p-0.5 border border-amber-400/40 shadow overflow-hidden flex items-center justify-center">
                          <img src={yamtaanuLogo} alt="Marque Yamtãanu" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded inline-block">
                        🍯 100% PUR NATUREL
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 font-serif leading-tight">
                        Miel Brut Égoutté • {currentJar.jarFormat}
                      </h3>
                      <p className="text-[9.5px] text-slate-700">
                        Terroir : <strong>{currentJar.village}</strong> • Ruche : <strong className="font-mono text-amber-900">{currentJar.hiveNumber}</strong>
                      </p>
                      <p className="text-[8.5px] text-slate-600 font-mono">
                        Lot : {currentJar.lotNumber} • Récolte : {currentJar.harvestDate}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-amber-500/20 text-[7.5px] text-slate-600 font-serif italic">
                      Égoutté à froid sans chauffage industriel • Écumage naturel de mousse
                    </div>
                  </div>
                )}

                {/* Overlaid QR Code Layer */}
                <div 
                  className="absolute pointer-events-none flex flex-col items-center justify-center transition-all duration-75 shadow-md"
                  style={{
                    left: `${qrPosX}%`,
                    top: `${qrPosY}%`,
                    width: `${qrSizePercent}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: qrBackground === 'white' ? '#ffffff' : 'transparent',
                    padding: qrBackground === 'white' ? '4px' : '0px',
                    borderRadius: '8px'
                  }}
                >
                  {/* Generated QR Canvas Clone */}
                  <img
                    src={qrDataUrl || (qrCanvasRef.current ? qrCanvasRef.current.toDataURL() : '')}
                    alt="QR Traçabilité"
                    className="w-full aspect-square object-contain"
                  />

                  {showTextUnderQr && (
                    <div className="text-center mt-0.5 leading-tight px-0.5 select-none">
                      <span className="text-[6.5px] sm:text-[7.5px] font-black text-slate-900 uppercase block tracking-tighter">
                        {customTextUnderQr}
                      </span>
                      {showJarCodeBadge && (
                        <span className="text-[6px] sm:text-[6.5px] font-mono font-bold text-amber-800 block">
                          {currentJar.jarCode}
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Helper tips */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Conseil d'impression :</strong> Utilisez le curseur <strong>Position (X / Y)</strong> pour placer le QR code exactement sur l'espace réservé ou libre de votre étiquette existante. Le code QR pointe vers le passeport numérique officiel de ce bocal.
              </div>
            </div>

          </div>

          {/* ================= PRINTABLE SHEET PREVIEW (FOR @media print) ================= */}
          <div id="printable-label-sheet" className="hidden print:block">
            {sheetLayout === 'single' ? (
              <div 
                className="relative bg-white border border-slate-300 overflow-hidden mx-auto"
                style={{
                  width: `${labelWidthMm}mm`,
                  height: `${labelHeightMm}mm`
                }}
              >
                {uploadedLabelImage ? (
                  <img src={uploadedLabelImage} alt="Label" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full p-4 bg-amber-50 border-2 border-amber-600 text-slate-900 flex flex-col justify-between">
                    <span className="font-bold text-xs">Miel Brut Yamtãanu • {currentJar.jarFormat}</span>
                    <span className="text-[10px] font-mono">Ruche : {currentJar.hiveNumber}</span>
                  </div>
                )}

                <div 
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    left: `${qrPosX}%`,
                    top: `${qrPosY}%`,
                    width: `${qrSizePercent}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: qrBackground === 'white' ? '#ffffff' : 'transparent',
                    padding: qrBackground === 'white' ? '2mm' : '0mm'
                  }}
                >
                  <img
                    src={qrDataUrl || (qrCanvasRef.current ? qrCanvasRef.current.toDataURL() : '')}
                    alt="QR"
                    className="w-full aspect-square object-contain"
                  />
                  {showTextUnderQr && (
                    <span className="text-[7px] font-bold text-center block leading-none mt-0.5">
                      {customTextUnderQr}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: sheetLayout === 'grid_a4_8' ? 8 : 12 }).map((_, i) => (
                  <div 
                    key={i}
                    className="relative bg-white border border-slate-300 overflow-hidden"
                    style={{
                      width: `${labelWidthMm}mm`,
                      height: `${labelHeightMm}mm`
                    }}
                  >
                    {uploadedLabelImage ? (
                      <img src={uploadedLabelImage} alt="Label" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full p-3 bg-amber-50 border border-amber-600 text-slate-900 flex flex-col justify-between text-xs">
                        <span className="font-bold">Miel Brut Yamtãanu</span>
                        <span className="text-[9px] font-mono">Bocal {currentJar.jarCode}</span>
                      </div>
                    )}

                    <div 
                      className="absolute flex flex-col items-center justify-center"
                      style={{
                        left: `${qrPosX}%`,
                        top: `${qrPosY}%`,
                        width: `${qrSizePercent}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: qrBackground === 'white' ? '#ffffff' : 'transparent',
                        padding: qrBackground === 'white' ? '2mm' : '0mm'
                      }}
                    >
                      <img
                        src={qrDataUrl || (qrCanvasRef.current ? qrCanvasRef.current.toDataURL() : '')}
                        alt="QR"
                        className="w-full aspect-square object-contain"
                      />
                      {showTextUnderQr && (
                        <span className="text-[6.5px] font-bold text-center block leading-none mt-0.5">
                          {currentJar.jarCode}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
