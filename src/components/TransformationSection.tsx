import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { BambouMielStore } from '../dataStore';
import { Harvest, StoredHoneyTank, BottlingBatch } from '../types';
import { 
  Dribbble, 
  Database, 
  Maximize2, 
  Printer, 
  Search, 
  QrCode, 
  Clock, 
  Users, 
  MapPin, 
  Droplet, 
  ArrowRight,
  Sparkles,
  Info,
  ArrowLeft,
  ShieldCheck,
  Heart,
  Download,
  Plus,
  Trash2,
  HelpCircle,
  Check,
  Copy,
  Move,
  Award,
  FileText,
  Calendar,
  ExternalLink,
  Globe,
  Link
} from 'lucide-react';

interface FreeElement {
  id: string;
  x: number; // in mm
  y: number; // in mm
  size: number; // in mm
}

interface TransformationSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
  onBackToDashboard?: () => void;
}

interface QRCanvasProps {
  text: string;
  size: number | string;
  color: string;
  className?: string;
  imageCrispness?: 'smooth' | 'pixelated';
}

function QRCanvas({ text, size, color, className, imageCrispness = 'smooth' }: QRCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const pixelSize = typeof size === 'number' ? size : 150;
      QRCode.toCanvas(
        canvasRef.current,
        text || 'https://yamtaanu.com',
        {
          width: Math.max(128, pixelSize * 3), // Generate at high resolution for printing
          margin: 1,
          errorCorrectionLevel: 'M', // Medium error correction level
          color: {
            dark: color,
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('Error generating QR Code', error);
        }
      );
    }
  }, [text, size, color]);

  const renderingStyle = imageCrispness === 'pixelated' ? 'pixelated' : 'auto';
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: sizeStyle, 
        height: sizeStyle, 
        imageRendering: renderingStyle
      }} 
      className={className || "bg-white"} 
    />
  );
}

// Tailwind static utility mapping helpers for sticker font sizes to bypass runtime dynamic class generation issues
function getSimpleLabelSizeClass(size: number) {
  switch (size) {
    case 6: return 'text-[7.5px]';
    case 7: return 'text-[7.5px]';
    case 8: return 'text-[8.5px]';
    case 9: return 'text-[9.5px]';
    case 10: return 'text-[10.5px]';
    case 11: return 'text-[11.5px]';
    case 12: return 'text-[12.5px]';
    default: return 'text-[8.5px]';
  }
}

function getSimpleLotSizeClass(size: number) {
  switch (size) {
    case 6: return 'text-[6px]';
    case 7: return 'text-[6px]';
    case 8: return 'text-[6.5px]';
    case 9: return 'text-[7.5px]';
    case 10: return 'text-[8.5px]';
    case 11: return 'text-[9.5px]';
    case 12: return 'text-[10.5px]';
    default: return 'text-[6.5px]';
  }
}

function getHeaderTextSize(size: number) {
  switch (size) {
    case 6: return 'text-[6.5px]';
    case 7: return 'text-[6.5px]';
    case 8: return 'text-[6.5px]';
    case 9: return 'text-[7.5px]';
    case 10: return 'text-[8.5px]';
    case 11: return 'text-[9.5px]';
    case 12: return 'text-[10.5px]';
    default: return 'text-[6.5px]';
  }
}

function getLabelTextSize(size: number) {
  switch (size) {
    case 6: return 'text-[8.5px]';
    case 7: return 'text-[8.5px]';
    case 8: return 'text-[9.5px]';
    case 9: return 'text-[10.5px]';
    case 10: return 'text-[11.5px]';
    case 11: return 'text-[12.5px]';
    case 12: return 'text-[13.5px]';
    default: return 'text-[9.5px]';
  }
}

function getMetaTextSize(size: number) {
  switch (size) {
    case 6: return 'text-[6px]';
    case 7: return 'text-[7px]';
    case 8: return 'text-[8px]';
    case 9: return 'text-[9px]';
    case 10: return 'text-[10px]';
    case 11: return 'text-[11px]';
    case 12: return 'text-[12px]';
    default: return 'text-[8px]';
  }
}

function getFooterTextSize(size: number) {
  switch (size) {
    case 6: return 'text-[6px]';
    case 7: return 'text-[6px]';
    case 8: return 'text-[6px]';
    case 9: return 'text-[7px]';
    case 10: return 'text-[8px]';
    case 11: return 'text-[9px]';
    case 12: return 'text-[10px]';
    default: return 'text-[6px]';
  }
}

export default function TransformationSection({ store, onRefresh, onBackToDashboard }: TransformationSectionProps) {
  // Navigation tabs for this section
  const [activeTab, setActiveTab] = useState<'extraction' | 'cuves' | 'conditionnement' | 'scan' | 'qr_manuel'>('cuves');

  // Selected Lot for Traceability Lookup
  const [searchedLot, setSearchedLot] = useState<string>(store.bottlings[0]?.batchNumber || '');
  const [traceHistory, setTraceHistory] = useState<any>(
    store.bottlings[0] ? store.getTraceabilityHistory(store.bottlings[0].batchNumber) : null
  );

  // Form states: Extraction
  const [selectedHarvestIds, setSelectedHarvestIds] = useState<string[]>([]);
  const [extractedQty, setExtractedQty] = useState('22.8');
  const [wasteQty, setWasteQty] = useState('1.5');
  const [extractionMethod, setExtractionMethod] = useState<'pressurage' | 'centrifugation' | 'degouttage'>('degouttage');
  const [extractionTankId, setExtractionTankId] = useState(store.tanks[0]?.id || '');

  // Form states: Bottling
  const [bottlingTankId, setBottlingTankId] = useState(store.tanks[0]?.id || '');
  const [jarSize, setJarSize] = useState<'250' | '500' | '1000'>('500');
  const [bottledQty, setBottledQty] = useState('30');
  const [lblTemplate, setLblTemplate] = useState("Miel sauvage de Forêt de Bambou - Brut Égoutté de Brousse");

  // Logic Handlers
  const handleLogLevelExtraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHarvestIds.length === 0) return alert('Sélectionnez au moins une récolte de brousse à traiter.');
    if (!extractionTankId) return alert('Sélectionnez une cuve d\'égouttage de destination.');

    const log = store.addExtraction({
      harvestIds: selectedHarvestIds,
      extractionDate: new Date().toISOString().split('T')[0],
      extractedWeightKg: parseFloat(extractedQty) || 15.0,
      wasteWeightKg: parseFloat(wasteQty) || 1.0,
      tankId: extractionTankId,
      method: extractionMethod
    });

    alert(`Extraction #${log.id} enregistrée. ${log.extractedWeightKg} kg de miel pur ont été transférés dans la cuve.`);
    setSelectedHarvestIds([]);
    onRefresh();
  };

  const handleCreateBottling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bottlingTankId) return;
    const targetTank = store.tanks.find(t => t.id === bottlingTankId);
    if (!targetTank) return;

    const honeyNeeded = (Number(jarSize) * Number(bottledQty)) / 1000;
    if (targetTank.currentWeightKg < honeyNeeded) {
      if (!confirm(`⚠️ Attention : La cuve ne contient que ${targetTank.currentWeightKg} kg de miel sauvage, mais ce conditionnement nécessite ${honeyNeeded} kg. Voulez-vous forcer l'opération et ramener le niveau de la cuve à zéro ?`)) {
        return;
      }
    }

    // Assign dynamic batch lot number
    const customLot = `LOT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${jarSize}G-${String(store.bottlings.length + 1).padStart(2, '0')}`;
    
    store.addBottling({
      tankId: bottlingTankId,
      bottlingDate: new Date().toISOString().split('T')[0],
      jarSizeG: Number(jarSize) as any,
      quantity: Number(bottledQty),
      batchNumber: customLot,
      expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
      labelTemplate: lblTemplate
    });

    alert(`Conditionnement réussi ! ${bottledQty} pots étiquetés sous le numéro de Lot de traçabilité : ${customLot}`);
    // Auto-update traceability scan target
    setSearchedLot(customLot);
    setTraceHistory(store.getTraceabilityHistory(customLot));
    setActiveTab('scan');
    onRefresh();
  };

  const handleTraceLookup = (lot: string) => {
    setSearchedLot(lot);
    const hist = store.getTraceabilityHistory(lot);
    setTraceHistory(hist);
  };

  const rawHarvestsAvailable = store.harvests.filter(h => h.status === 'brut');

  // Manual QR Code states - Structured fields requested by user
  const [qrPays, setQrPays] = useState('Bénin');
  const [qrDepartementCommune, setQrDepartementCommune] = useState('Atlantique, Allada');
  const [qrVillage, setQrVillage] = useState('Attogon');
  const [qrApiculteur, setQrApiculteur] = useState('Kofi Mensah');
  const [qrTypeRuche, setQrTypeRuche] = useState('Kényane Traditionnelle');
  const [qrVegetations, setQrVegetations] = useState('Acacia, Baobab, fleurs sauvages');
  const [qrDateRecolte, setQrDateRecolte] = useState('2026-05-12');
  const [qrDateConditionnement, setQrDateConditionnement] = useState('2026-06-20');

  const formatDateToFR = (dateStr: string) => {
    if (!dateStr) return '';
    const cleanStr = dateStr.trim();

    // 1. Slash-separated formats (e.g. 12/05/2026, 12/5/26, 2/5/2026)
    // In French/European context, slash-separated dates are always DD/MM/YYYY.
    if (cleanStr.includes('/')) {
      const parts = cleanStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) {
          year = `20${year}`;
        }
        return `${day}/${month}/${year}`;
      }
    }

    // 2. Dash-separated formats (e.g. 2026-05-12, 12-05-2026)
    if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD -> DD/MM/YYYY
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          const day = parts[2].padStart(2, '0');
          return `${day}/${month}/${year}`;
        } else {
          // Assume DD-MM-YYYY -> DD/MM/YYYY
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          let year = parts[2];
          if (year.length === 2) {
            year = `20${year}`;
          }
          return `${day}/${month}/${year}`;
        }
      }
    }

    // Fallback try-catch using native Date with strict check
    try {
      const d = new Date(cleanStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {}

    return dateStr;
  };

  const formatDateToISO = (dateStr: string) => {
    if (!dateStr) return '';
    const cleanStr = dateStr.trim();

    // If already in yyyy-mm-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      return cleanStr;
    }
    // If in dd/mm/yyyy format (or d/m/yy, etc.)
    if (cleanStr.includes('/')) {
      const parts = cleanStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) {
          year = `20${year}`;
        }
        return `${year}-${month}-${day}`;
      }
    }
    // If in dd-mm-yyyy format
    if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          let year = parts[2];
          if (year.length === 2) {
            year = `20${year}`;
          }
          return `${year}-${month}-${day}`;
        }
      }
    }
    return dateStr;
  };

  const [qrEncodingType, setQrEncodingType] = useState<'full' | 'compact' | 'url'>('url');
  const [showPublicDomainGuide, setShowPublicDomainGuide] = useState<boolean>(true);
  const [customQrDomain, setCustomQrDomain] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('yamtaanu_qr_custom_domain') || '';
    }
    return '';
  });

  const handleCustomDomainChange = (val: string) => {
    setCustomQrDomain(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yamtaanu_qr_custom_domain', val);
    }
  };

  const getAutoBaseUrl = () => {
    if (customQrDomain && customQrDomain.trim() !== '') {
      let domain = customQrDomain.trim();
      if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = 'https://' + domain;
      }
      return domain.replace(/\/$/, '');
    }
    if (typeof window === 'undefined') return 'https://yamtaanu.com';
    const origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  };

  const getOfflineCertificateQrText = () => {
    if (!traceHistory) return '';
    const b = traceHistory.bottling;
    const h = traceHistory.harvests?.[0];
    const hive = traceHistory.hives?.[0];
    const p = traceHistory.preforms?.[0];
    const insp = traceHistory.inspections?.[0];

    const baseUrl = getAutoBaseUrl();
    const params: Record<string, string> = {
      t: '1',
      l: b.batchNumber || 'LOT-20260622-01',
      prod: `Miel Sauvage Brut - ${b.jarSizeG}g`,
      format: `${b.jarSizeG}g`,
      qte: `${b.quantity} pots scellés`,
      p: hive?.country || 'Bénin',
      v: hive?.locationName || 'Attogon',
      dc: hive?.department || 'Atlantique, Allada',
      a: 'Kofi Mensah (Apiculteur Référencé)',
      r: `${hive?.code || 'HIVE-01'} (${hive?.type || 'Kényane'})`,
      g: hive?.vegetationType || 'Acacia, Baobab & Savane',
      rc: formatDateToFR(h?.harvestDate || h?.date || b.bottlingDate || ''),
      cd: formatDateToFR(b.bottlingDate || ''),
      exp: formatDateToFR(b.expirationDate || ''),
      artisan: p?.artisanName || 'Kofi Mensah',
      gps: hive?.gpsCoordinates || "10°15'N 1°22'E",
      sante: insp?.populationHealth || 'Excellente (10/10)',
    };

    const searchParams = new URLSearchParams(params);
    return `${baseUrl}?${searchParams.toString()}`;
  };
  const [qrMinimizeFields, setQrMinimizeFields] = useState<boolean>(false);
  const [isPrintingPlanche, setIsPrintingPlanche] = useState(false);
  const [isPrintingCertificate, setIsPrintingCertificate] = useState(false);
  const [plancheCount, setPlancheCount] = useState<number>(12);
  const [plancheCols, setPlancheCols] = useState<number>(3);
  const [plancheStyle, setPlancheStyle] = useState<'qr_pure_2cm' | 'qr_pure_1cm' | 'qr_pure_05cm' | 'qr_only' | 'detailed'>('detailed');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [plancheUniqueCode, setPlancheUniqueCode] = useState<boolean>(true);
  const [plancheSingleLotNum, setPlancheSingleLotNum] = useState<string>('1');
  const [plancheGridGap, setPlancheGridGap] = useState<number>(1); // Default to 1mm (compact, avoids wasting paper)
  const [plancheDetailedTwoQrs, setPlancheDetailedTwoQrs] = useState<boolean>(true); // Support 2 QR codes per detailed label by default as requested

  // Interactive free placement states
  const [plancheLayoutMode, setPlancheLayoutMode] = useState<'grid' | 'free'>('grid');
  const [freeElements, setFreeElements] = useState<FreeElement[]>([
    { id: '1', x: 20, y: 20, size: 40 }
  ]);
  const [selectedFreeElementId, setSelectedFreeElementId] = useState<string | null>('1');
  const activeDragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startElemX: number;
    startElemY: number;
    containerWidth: number;
  } | null>(null);

  const handleElementStartDrag = (e: React.MouseEvent | React.TouchEvent, id: string, currentX: number, currentY: number) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Find the container element to get its width
    const container = document.getElementById('free-placement-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    activeDragRef.current = {
      id,
      startX: clientX,
      startY: clientY,
      startElemX: currentX,
      startElemY: currentY,
      containerWidth: rect.width
    };

    const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!activeDragRef.current) return;
      const currentDrag = activeDragRef.current;
      
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const dx = moveX - currentDrag.startX;
      const dy = moveY - currentDrag.startY;
      
      const mmPerPixel = 210 / currentDrag.containerWidth;
      
      let nextX = currentDrag.startElemX + dx * mmPerPixel;
      let nextY = currentDrag.startElemY + dy * mmPerPixel;
      
      // Find current element to check boundary limits
      const elem = freeElements.find(el => el.id === currentDrag.id);
      const size = elem ? elem.size : 40;
      
      // Keep within the printable bounds of A4
      nextX = Math.max(0, Math.min(210 - size, nextX));
      nextY = Math.max(0, Math.min(297 - size, nextY));

      setFreeElements(prev => prev.map(el => {
        if (el.id === currentDrag.id) {
          return { ...el, x: nextX, y: nextY };
        }
        return el;
      }));
    };

    const handleDragEnd = () => {
      activeDragRef.current = null;
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  };

  const handleAddFreeElement = () => {
    const newId = Date.now().toString();
    // Position it slightly offset to prevent perfect stacking
    const offset = (freeElements.length * 8) % 80;
    setFreeElements(prev => [
      ...prev,
      { id: newId, x: 20 + offset, y: 20 + offset, size: 40 }
    ]);
    setSelectedFreeElementId(newId);
  };

  const handleDuplicateFreeElement = (elem: FreeElement) => {
    const newId = Date.now().toString();
    setFreeElements(prev => [
      ...prev,
      { id: newId, x: Math.min(170, elem.x + 10), y: Math.min(250, elem.y + 10), size: elem.size }
    ]);
    setSelectedFreeElementId(newId);
  };

  const handleDeleteFreeElement = (id: string) => {
    if (freeElements.length <= 1) return; // Keep at least one element
    setFreeElements(prev => prev.filter(el => el.id !== id));
    if (selectedFreeElementId === id) {
      // Select another remaining element
      const remaining = freeElements.filter(el => el.id !== id);
      setSelectedFreeElementId(remaining[0].id);
    }
  };

  const [manualQrLabel, setManualQrLabel] = useState('Miel Sauvage d\'Allada');
  const [manualQrSize, setManualQrSize] = useState<100 | 140 | 180>(100);
  const [manualQrColor, setManualQrColor] = useState('#144d2d');
  const [stickerFontSize, setStickerFontSize] = useState<number>(8); // Defaults to 8 as requested
  const [stickerFontFamily, setStickerFontFamily] = useState<'font-sans' | 'font-display' | 'font-mono' | 'font-serif'>('font-serif'); // Defaults to 'font-serif' (Playfair Display) for "un caractère qui vend" (high-end elegant feel)
  const [imageCrispness, setImageCrispness] = useState<'smooth' | 'pixelated'>('smooth');

  // Compute the combined text representation for the QR code dynamically
  const getManualQrText = (
    type: 'full' | 'compact' | 'url',
    p: string, dc: string, v: string, api: string, r: string, veg: string, rec: string, cond: string,
    lotIndex?: number
  ) => {
    const recFR = formatDateToFR(rec);
    const condFR = formatDateToFR(cond);
    const lotStr = lotIndex !== undefined ? `LOT: #${lotIndex}` : '';

    if (type === 'compact') {
      // Shorten date from dd/mm/yyyy to dd/mm/yy for ultra-compact text
      const shortDate = (dStr: string) => {
        if (!dStr) return '';
        const fr = formatDateToFR(dStr);
        return fr.replace(/\/\d{2}(\d{2})$/, '/$1'); // e.g. 12/05/2026 -> 12/05/26
      };

      const parts = [
        `YAM`, // Super short brand identifier
        `P:${p.substring(0, 3).toUpperCase()}`, // BJ / BEN etc
        `V:${v.substring(0, 10).toUpperCase()}`, // VILLAGE
        `A:${api.substring(0, 10).toUpperCase()}`, // API
        `R:${r.substring(0, 8).toUpperCase()}`, // RUCHE
        `V:${veg.substring(0, 8).toUpperCase()}`, // VEGETATION
        `R:${shortDate(rec)}`, // RECOLTE
        `C:${formatDateToFR(cond)}` // CONDITIONNEMENT
      ];
      if (lotIndex !== undefined) {
        parts.push(`L:${lotIndex}`);
      }
      return parts.join('|');
    }

    if (type === 'full') {
      const lines = [
        `🍯 YAMTAANU - TRACABILITÉ MIEL`,
        `🌍 Pays: ${p}`,
        `📍 Dép/Commune: ${dc}`,
        `🏡 Village: ${v}`,
        `🐝 Apiculteur: ${api}`,
        `🛖 Ruche: ${r}`,
        `🌱 Végétation: ${veg}`,
        `📅 Récolte: ${recFR}`,
        `🏺 Conditionnement: ${condFR}`
      ];
      if (lotIndex !== undefined) {
        lines.push(`📦 Lot: #${lotIndex}`);
      }
      return lines.join('\n');
    }

    const baseUrl = getAutoBaseUrl();
    const params: Record<string, string> = {
      t: '1',
    };

    if (lotIndex !== undefined) {
      params.l = `LOT-20260622-0${lotIndex}`;
    } else {
      params.l = 'LOT-20260622-01';
    }

    if (qrMinimizeFields) {
      // Shortened URL for low-density micro stickers (1x1 cm)
      params.p = p.substring(0, 15);
      params.v = v.substring(0, 15);
      params.a = api.substring(0, 15);
    } else {
      // Complete URL with all rich product information
      params.prod = "Miel Sauvage Brut Certifié Pur";
      params.format = "500g";
      params.qte = "120 pots scellés";
      params.p = p;
      params.v = v;
      params.dc = dc;
      params.a = api;
      params.r = r;
      params.g = veg;
      params.rc = rec ? formatDateToFR(rec) : '';
      params.cd = cond ? formatDateToFR(cond) : '';
      params.exp = "20/06/2028";
      params.artisan = "Kofi Mensah";
      params.gps = "10°15'N 1°22'E";
      params.sante = "Excellente (10/10)";
    }

    const searchParams = new URLSearchParams(params);
    return `${baseUrl}?${searchParams.toString()}`;
  };

  const manualQrText = getManualQrText(
    qrEncodingType, qrPays, qrDepartementCommune, qrVillage, qrApiculteur, qrTypeRuche, qrVegetations, qrDateRecolte, qrDateConditionnement
  );

  const getTestQrText = () => {
    if (typeof window === 'undefined') return manualQrText;
    const currentOrigin = window.location.origin;
    if (manualQrText.startsWith('http')) {
      try {
        const urlObj = new URL(manualQrText);
        return `${currentOrigin}${urlObj.search}`;
      } catch (e) {
        return manualQrText;
      }
    }
    return `${currentOrigin}?t=1`;
  };
  
  const [manualHistory, setManualHistory] = useState<{
    id: string, text: string, label: string, size: number, color: string, date: string,
    pays: string, depComm: string, village: string, apiculteur: string, ruche: string, veg: string, recolte: string, cond: string
  }[]>(() => {
    try {
      const saved = localStorage.getItem('yamtaanu_manual_qrs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'm-1',
        text: "🍯 YAMTAANU - TRACABILITÉ MIEL\n🌍 Pays: Bénin\n📍 Dép/Commune: Atlantique, Allada\n🏡 Village: Attogon\n🐝 Apiculteur: Kofi Mensah\n🛖 Ruche: Kényane Traditionnelle\n🌱 Végétation: Acacia, Baobab, fleurs sauvages\n📅 Récolte: 2026-05-12\n🏺 Conditionnement: 2026-06-20",
        label: "Miel Sauvage d'Allada",
        size: 100,
        color: '#144d2d',
        date: '2026-06-24',
        pays: 'Bénin',
        depComm: 'Atlantique, Allada',
        village: 'Attogon',
        apiculteur: 'Kofi Mensah',
        ruche: 'Kényane Traditionnelle',
        veg: 'Acacia, Baobab, fleurs sauvages',
        recolte: '2026-05-12',
        cond: '2026-06-20'
      },
      {
        id: 'm-2',
        text: "🍯 YAMTAANU - TRACABILITÉ MIEL\n🌍 Pays: Bénin\n📍 Dép/Commune: Borgou, Parakou\n🏡 Village: Kpassa\n🐝 Apiculteur: Amadou Diallo\n🛖 Ruche: Langstroth Moderne\n🌱 Végétation: Fleurs de karité et néré\n📅 Récolte: 2026-04-18\n🏺 Conditionnement: 2026-05-30",
        label: "Miel Doré de Savane",
        size: 140,
        color: '#d97706',
        date: '2026-06-20',
        pays: 'Bénin',
        depComm: 'Borgou, Parakou',
        village: 'Kpassa',
        apiculteur: 'Amadou Diallo',
        ruche: 'Langstroth Moderne',
        veg: 'Fleurs de karité et néré',
        recolte: '2026-04-18',
        cond: '2026-05-30'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('yamtaanu_manual_qrs', JSON.stringify(manualHistory));
    } catch (e) {
      console.error(e);
    }
  }, [manualHistory]);

  const handleSaveManualQR = () => {
    if (!manualQrLabel.trim()) return alert('Veuillez renseigner le libellé de l\'étiquette.');
    if (!qrPays.trim()) return alert('Veuillez renseigner le pays.');
    if (!qrDepartementCommune.trim()) return alert('Veuillez renseigner le département et la commune.');
    if (!qrVillage.trim()) return alert('Veuillez renseigner le village.');
    if (!qrApiculteur.trim()) return alert('Veuillez renseigner l\'apiculteur.');
    if (!qrTypeRuche.trim()) return alert('Veuillez renseigner le type de ruche.');
    if (!qrVegetations.trim()) return alert('Veuillez renseigner la végétation.');
    
    const computedText = getManualQrText(
      qrEncodingType, qrPays, qrDepartementCommune, qrVillage, qrApiculteur, qrTypeRuche, qrVegetations, qrDateRecolte, qrDateConditionnement
    );

    const newQR = {
      id: `m-${Date.now()}`,
      text: computedText,
      label: manualQrLabel.trim(),
      size: manualQrSize,
      color: manualQrColor,
      date: new Date().toISOString().split('T')[0],
      pays: qrPays.trim(),
      depComm: qrDepartementCommune.trim(),
      village: qrVillage.trim(),
      apiculteur: qrApiculteur.trim(),
      ruche: qrTypeRuche.trim(),
      veg: qrVegetations.trim(),
      recolte: qrDateRecolte,
      cond: qrDateConditionnement
    };
    
    setManualHistory([newQR, ...manualHistory]);
    alert('QR Code créé manuellement et enregistré avec succès !');
  };

  const handleDeleteManualQR = (id: string) => {
    setManualHistory(manualHistory.filter(q => q.id !== id));
  };

  const handleDownloadCompositePNG = (
    text: string, 
    label: string, 
    size: number, 
    color: string,
    pays: string,
    village: string,
    depComm: string,
    apiculteur: string,
    ruche: string,
    veg: string,
    recolte: string,
    cond: string
  ) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; // 2x high resolution
    canvas.height = 1120; // 2x high resolution
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(2, 2); // Map logical 400x560 coordinates to physical 800x1120 resolution

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 400, 560);

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 380, 540);
    
    // Dotted inner line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(18, 18, 364, 524);
    ctx.setLineDash([]);

    // Header Title
    ctx.fillStyle = '#144d2d';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('YAMTAANU BÉNIN', 200, 45);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('• CARTE D\'IDENTITÉ DU MIEL •', 200, 65);

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 80);
    ctx.lineTo(370, 80);
    ctx.stroke();

    // Temp canvas for QR Code (High-res source)
    const qrCanvas = document.createElement('canvas');
    QRCode.toCanvas(qrCanvas, text, {
      width: 512, // High resolution (512px) instead of 200px
      margin: 1,
      errorCorrectionLevel: 'M', // Medium density is much more robust for scanner focus
      color: {
        dark: color,
        light: '#FFFFFF'
      }
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      // Draw onto target canvas scaled beautifully to 200x200
      ctx.drawImage(qrCanvas, 100, 95, 200, 200);

      // Footer Divider
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(40, 315);
      ctx.lineTo(360, 315);
      ctx.stroke();

      // Label under QR
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(label.toUpperCase(), 200, 338);

      // Draw structured fields beautifully on the canvas in two columns
      ctx.fillStyle = '#334155';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';

      // Column 1 starts X: 45
      // Column 2 starts X: 215
      
      // Row 1
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText('🌍 PAYS:', 45, 370);
      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      ctx.fillText(pays || 'Bénin', 95, 370);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText('🏡 VILLAGE:', 215, 370);
      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      ctx.fillText(village || 'Attogon', 275, 370);

      // Row 2
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText('📍 RÉGION:', 45, 394);
      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      ctx.fillText(depComm || 'Atlantique, Allada', 105, 394);

      // Row 3
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText('🐝 APICULTEUR:', 45, 418);
      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      ctx.fillText(apiculteur || 'Kofi Mensah', 135, 418);

      // Row 4
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText('🛖 RUCHE:', 45, 442);
      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      ctx.fillText(ruche || 'Kényane', 100, 442);

      // Row 5
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText('🌱 VÉGÉTATION:', 45, 466);
      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      let vegStr = veg || 'Fleurs sauvages';
      if (vegStr.length > 38) vegStr = vegStr.substring(0, 35) + '...';
      ctx.fillText(vegStr, 135, 466);

      // Row 6
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText('📅 RÉCOLTE:', 45, 490);
      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      ctx.fillText(formatDateToFR(recolte || '2026-05-12'), 115, 490);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText('🏺 COND:', 215, 490);
      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      ctx.fillText(formatDateToFR(cond || '2026-06-20'), 260, 490);

      // Mini brand footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRODUIT SAUVAGE 100% PUR', 200, 522);

      // Trigger download
      const link = document.createElement('a');
      link.download = `yamtaanu-etiquette-${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const handleDownloadPlanchePNG = async () => {
    const canvas = document.createElement('canvas');
    const logicalWidth = 1240;
    const logicalHeight = 1754; // A4 Ratio
    
    // Set physical resolution to 2x (2480x3508 pixels) for crisp 300 DPI print quality
    canvas.width = logicalWidth * 2;
    canvas.height = logicalHeight * 2;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable premium smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Scale drawings so existing coordinates map perfectly onto the 2x canvas
    ctx.scale(2, 2);

    // Background A4 page
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    if (plancheLayoutMode === 'free') {
      const mmToPx = logicalWidth / 210; // 1240 / 210 ≈ 5.9 px/mm
      
      for (const el of freeElements) {
        const x = el.x * mmToPx;
        const y = el.y * mmToPx;
        const size = el.size * mmToPx;

        // Sticker card background
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#94a3b8'; // Grey border for clean cutting guide
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, size, size, 2);
        } else {
          ctx.rect(x, y, size, size);
        }
        ctx.fill();
        
        // Draw cut lines using dashed strokes for easy cutting
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();

        const qrTextForCell = getManualQrText(
          qrEncodingType, qrPays, qrDepartementCommune, qrVillage, qrApiculteur, qrTypeRuche, qrVegetations, qrDateRecolte, qrDateConditionnement, 
          plancheUniqueCode ? (parseInt(plancheSingleLotNum) || undefined) : undefined
        );

        const tempCanvas = document.createElement('canvas');
        await new Promise<void>((resolve) => {
          QRCode.toCanvas(tempCanvas, qrTextForCell, {
            width: size * 2,
            margin: 0,
            errorCorrectionLevel: 'L',
            color: {
              dark: manualQrColor,
              light: '#FFFFFF'
            }
          }, () => resolve());
        });

        // Beautiful centered QR inside the card (leaving small outer white margin)
        const innerMargin = size * 0.08;
        const innerSize = size - 2 * innerMargin;
        ctx.drawImage(tempCanvas, x + innerMargin, y + innerMargin, innerSize, innerSize);
      }
    } else {
      // Grid layout variables depending on style
      let cols = plancheCols;
      let gap = Math.round(plancheGridGap * 5.9);
      let marginX = cols >= 7 ? 40 : 50;
      let marginTop = 90;
      let cellWidth = 0;
      let cellHeight = 0;

      if (plancheStyle === 'qr_pure_2cm') {
        cols = 8;
        cellWidth = 118; // exactly 2.0 cm (118 pixels on 1240x1754 canvas)
        cellHeight = 118;
        gap = Math.round(plancheGridGap * 5.9);
        const totalGridWidth = cols * cellWidth + (cols - 1) * gap;
        marginX = Math.max(20, Math.floor((logicalWidth - totalGridWidth) / 2));
        marginTop = 120;
      } else if (plancheStyle === 'qr_pure_1cm') {
        cols = 16;
        cellWidth = 59; // exactly 1.0 cm (59 pixels on 1240x1754 canvas)
        cellHeight = 59;
        gap = Math.round(plancheGridGap * 5.9);
        const totalGridWidth = cols * cellWidth + (cols - 1) * gap;
        marginX = Math.max(20, Math.floor((logicalWidth - totalGridWidth) / 2));
        marginTop = 120;
      } else if (plancheStyle === 'qr_pure_05cm') {
        cols = 28;
        cellWidth = 30; // approx 0.5 cm (30 pixels on 1240x1754 canvas)
        cellHeight = 30;
        gap = Math.round(plancheGridGap * 5.9);
        const totalGridWidth = cols * cellWidth + (cols - 1) * gap;
        marginX = Math.max(20, Math.floor((logicalWidth - totalGridWidth) / 2));
        marginTop = 120;
      } else {
        const rows = Math.ceil(plancheCount / cols);
        const marginBottom = 45;
        gap = Math.round(plancheGridGap * 5.9);
        const gapY = gap;
        const availableWidth = logicalWidth - 2 * marginX - (cols - 1) * gap;
        cellWidth = availableWidth / cols;
        const maxCellHeight = (logicalHeight - marginTop - marginBottom - (rows - 1) * gapY) / rows;
        const desiredHeight = plancheStyle === 'qr_only' ? cellWidth : cellWidth * 1.35;
        cellHeight = Math.min(desiredHeight, maxCellHeight);
      }

      const count = plancheCount;

      // Draw header
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`PLANCHE DE STICKERS YAMTAANU - ${manualQrLabel.toUpperCase()}`, logicalWidth / 2, 40);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#64748b';
      let formatDesc = 'Codes QR Purs (2x2 cm)';
      if (plancheStyle === 'qr_only') formatDesc = 'Stickers Simples (avec libellé)';
      if (plancheStyle === 'detailed') formatDesc = 'Étiquettes Détaillées';
      ctx.fillText(`Généré le ${new Date().toLocaleDateString('fr-FR')} | Format: ${formatDesc} | ${count} stickers`, logicalWidth / 2, 58);

      // Render cells
      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const gapY = gap;
        const x = marginX + col * (cellWidth + gap);
        const y = marginTop + row * (cellHeight + gapY);

        // Stop if drawing goes past A4 height
        if (y + cellHeight > logicalHeight - 40) {
          break;
        }

        // Sticker card background
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#94a3b8'; // Grey border for clean cutting guide
        ctx.lineWidth = 1;
        
        // Draw rounded rectangle
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(
            x, y, cellWidth, cellHeight, 
            plancheStyle === 'qr_pure_2cm' ? 4 : 
            plancheStyle === 'qr_pure_1cm' ? 2 : 
            plancheStyle === 'qr_pure_05cm' ? 1 : 
            10
          );
        } else {
          ctx.rect(x, y, cellWidth, cellHeight);
        }
        ctx.fill();
        
        // Draw cut lines using dashed strokes for easy cutting
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();

        const limitText = (str: string, maxLen: number) => {
          if (!str) return '';
          return str.length > maxLen ? str.substring(0, maxLen - 2) + '..' : str;
        };

        // Determine the lot index/number to encode in this cell
        const currentLotIndex = plancheUniqueCode ? (parseInt(plancheSingleLotNum) || undefined) : (i + 1);

        if (plancheStyle === 'qr_pure_2cm' || plancheStyle === 'qr_pure_1cm' || plancheStyle === 'qr_pure_05cm') {
          // QR Code ONLY: No text inside or around. Maximize readability
          let qrSize = cellWidth - 4; // Maximize QR code size (e.g. 114px instead of 82px for 2x2cm, leaving only a tiny 2px border)
          if (plancheStyle === 'qr_pure_1cm') qrSize = cellWidth - 2; // e.g. 57px instead of 42px for 1x1cm, leaving only 1px border
          if (plancheStyle === 'qr_pure_05cm') qrSize = cellWidth; // e.g. 30px instead of 20px, filling the micro cell completely
          
          const qrX = x + (cellWidth - qrSize) / 2;
          const qrY = y + (cellHeight - qrSize) / 2;

          const qrTextForCell = getManualQrText(
            qrEncodingType, qrPays, qrDepartementCommune, qrVillage, qrApiculteur, qrTypeRuche, qrVegetations, qrDateRecolte, qrDateConditionnement, currentLotIndex
          );

          const tempCanvas = document.createElement('canvas');
          await new Promise<void>((resolve) => {
            QRCode.toCanvas(tempCanvas, qrTextForCell, {
              width: qrSize * 2, // Perfect pixel alignment on 2x scaled canvas (maps 1:1)
              margin: 0, // 0 margin to maximize barcode squares inside the small space
              errorCorrectionLevel: 'L', // Low density error correction level (maximum block size for small prints)
              color: {
                dark: manualQrColor,
                light: '#FFFFFF'
              }
            }, () => resolve());
          });

          ctx.drawImage(tempCanvas, qrX, qrY, qrSize, qrSize);

        } else if (plancheStyle === 'qr_only') {
          // QR Code with labels
          const qrSize = Math.floor(Math.min(cellWidth * 0.72, cellHeight * 0.65));
          const qrX = x + (cellWidth - qrSize) / 2;
          const qrY = y + (cellHeight - qrSize) / 2 - (cellHeight > 130 ? 10 : 5);

          // Render QR Code onto temporary canvas
          const tempCanvas = document.createElement('canvas');
          
          const qrTextForCell = getManualQrText(
            qrEncodingType, qrPays, qrDepartementCommune, qrVillage, qrApiculteur, qrTypeRuche, qrVegetations, qrDateRecolte, qrDateConditionnement, currentLotIndex
          );

          await new Promise<void>((resolve) => {
            QRCode.toCanvas(tempCanvas, qrTextForCell, {
              width: qrSize * 2, // Perfect physical pixel alignment (maps 1:1)
              margin: 1,
              errorCorrectionLevel: 'L', // Low density error correction
              color: {
                dark: manualQrColor,
                light: '#FFFFFF'
              }
            }, () => resolve());
          });

          ctx.drawImage(tempCanvas, qrX, qrY, qrSize, qrSize);

          // Optional tiny batch label underneath to avoid confusion
          const isCompact = cellHeight < 140;
          ctx.fillStyle = '#334155';
          ctx.font = `bold ${isCompact ? 8 : 9.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(limitText(manualQrLabel, isCompact ? 16 : 24).toUpperCase(), x + cellWidth / 2, y + cellHeight - (isCompact ? 12 : 18));
          ctx.font = `${isCompact ? 6.5 : 8}px monospace`;
          ctx.fillStyle = '#94a3b8';
          const displayLotText = plancheUniqueCode ? `LOT #${plancheSingleLotNum}` : `LOT #${i + 1}`;
          ctx.fillText(`${displayLotText} • YAMTAANU`, x + cellWidth / 2, y + cellHeight - (isCompact ? 4 : 6));

        } else {
          // Detailed style - Vertical stacked layout with centered, much larger QR code
          
          // Define scaling factors based on cell height
          const isCompact = cellHeight < 160;
          const headerSize = isCompact ? 7.5 : 9;
          const labelSize = isCompact ? 8 : 9.5;
          const metaSize = isCompact ? 6.5 : 8;
          const footerSize = isCompact ? 6 : 7;
          
          // 1. Header of sticker
          ctx.fillStyle = '#1e293b';
          ctx.font = `bold ${headerSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('YAMTAANU • TRACABILITÉ', x + cellWidth / 2, y + (isCompact ? 11 : 16));

          // 2. Center-aligned QR Code(s)
          const qrTextForCell = getManualQrText(
            qrEncodingType, qrPays, qrDepartementCommune, qrVillage, qrApiculteur, qrTypeRuche, qrVegetations, qrDateRecolte, qrDateConditionnement, currentLotIndex
          );

          let qrY = y + (isCompact ? 16 : 25);
          let finalQrSize = 0;

          if (plancheDetailedTwoQrs) {
            // Two QR codes side-by-side as requested
            finalQrSize = Math.floor(Math.min(cellWidth * 0.40, cellHeight * 0.40));
            const gap = 8; // spacing gap
            const totalWidth = finalQrSize * 2 + gap;
            const qrX1 = x + (cellWidth - totalWidth) / 2;
            const qrX2 = qrX1 + finalQrSize + gap;

            const tempCanvas = document.createElement('canvas');
            await new Promise<void>((resolve) => {
              QRCode.toCanvas(tempCanvas, qrTextForCell, {
                width: finalQrSize * 2,
                margin: 1,
                errorCorrectionLevel: 'L',
                color: {
                  dark: manualQrColor,
                  light: '#FFFFFF'
                }
              }, () => resolve());
            });

            ctx.drawImage(tempCanvas, qrX1, qrY, finalQrSize, finalQrSize);
            ctx.drawImage(tempCanvas, qrX2, qrY, finalQrSize, finalQrSize);
          } else {
            // Original single centered QR code
            finalQrSize = Math.floor(Math.min(cellWidth * 0.55, cellHeight * 0.44));
            const qrX = x + (cellWidth - finalQrSize) / 2;

            const tempCanvas = document.createElement('canvas');
            await new Promise<void>((resolve) => {
              QRCode.toCanvas(tempCanvas, qrTextForCell, {
                width: finalQrSize * 2,
                margin: 1,
                errorCorrectionLevel: 'L',
                color: {
                  dark: manualQrColor,
                  light: '#FFFFFF'
                }
              }, () => resolve());
            });

            ctx.drawImage(tempCanvas, qrX, qrY, finalQrSize, finalQrSize);
          }

          // 3. Product Label (Below QR Code)
          const labelY = qrY + finalQrSize + (isCompact ? 10 : 14);
          ctx.fillStyle = '#0f172a';
          ctx.font = `bold ${labelSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(limitText(manualQrLabel, isCompact ? 22 : 28).toUpperCase(), x + cellWidth / 2, labelY);

          // 4. Compact metadata (3 centered lines below label)
          ctx.font = `${metaSize}px sans-serif`;
          ctx.fillStyle = '#475569';
          
          const line1Y = labelY + (isCompact ? 9 : 13);
          const line2Y = line1Y + (isCompact ? 8 : 11);
          const line3Y = line2Y + (isCompact ? 8 : 11);

          ctx.fillText(`🌍 ${limitText(qrPays, isCompact ? 8 : 11)} (${limitText(qrVillage, isCompact ? 8 : 11)}) • 📍 ${limitText(qrDepartementCommune, isCompact ? 8 : 12)}`, x + cellWidth / 2, line1Y);
          ctx.fillText(`🐝 Api: ${limitText(qrApiculteur, isCompact ? 9 : 13)} • 🛖 ${limitText(qrTypeRuche, isCompact ? 8 : 12)}`, x + cellWidth / 2, line2Y);
          ctx.fillText(`📅 Réc: ${formatDateToFR(qrDateRecolte)} • 🏺 Cond: ${formatDateToFR(qrDateConditionnement)}`, x + cellWidth / 2, line3Y);

          // Divider
          ctx.strokeStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.moveTo(x + 10, y + cellHeight - (isCompact ? 14 : 20));
          ctx.lineTo(x + cellWidth - 10, y + cellHeight - (isCompact ? 14 : 20));
          ctx.stroke();

          // Footer
          ctx.fillStyle = '#94a3b8';
          ctx.font = `bold ${footerSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('🐝 CERTIFIÉ PUR & NATUREL 🐝', x + cellWidth / 2, y + cellHeight - (isCompact ? 5 : 8));
        }
      }
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = `yamtaanu-planche-a4-${manualQrLabel.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Transformation Sub Tabs Header */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-brand-green-100/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button 
              onClick={onBackToDashboard}
              className="p-1.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-gray-500 mr-1"
              title="Retour à l'Espace Général"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Dribbble className="w-6 h-6 text-brand-gold-500 animate-spin" style={{ animationDuration: '6s' }} />
          <div>
            <h2 className="text-xl font-semibold font-display text-gray-900 leading-tight">Miellerie & Traçabilité</h2>
            <p className="text-xs text-gray-500">De l'égouttage à froid jusqu'à la labellisation des lots de pots</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('cuves'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'cuves' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Stockage Egoutté
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('extraction'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'extraction' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5" /> Extraction & Décantage
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('conditionnement'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'conditionnement' 
                ? 'bg-brand-green-700 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Conditionnement & Étiquettes
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('scan'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'scan' 
                ? 'bg-brand-gold-500 text-brand-green-900' 
                : 'bg-amber-100/60 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" /> Simulateur Traçabilité Lot
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('qr_manuel'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'qr_manuel' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" /> Générateur QR Manuel
            </div>
          </button>
        </div>
      </div>

      {/* 1. STOCKAGE / TANKS TAB */}
      {activeTab === 'cuves' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {store.tanks.map(tank => {
              const occupancyPct = Math.min(100, (tank.currentWeightKg / tank.capacityKg) * 100);
              return (
                <div key={tank.id} className="bg-white p-5 rounded-2xl border border-brand-green-100/30 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-green-600 uppercase font-mono px-2 py-0.5 bg-brand-green-50 rounded-md">
                        {tank.id}
                      </span>
                      <h3 className="font-display font-semibold text-gray-900 mt-2 text-sm">{tank.name}</h3>
                    </div>
                  </div>

                  {/* Physical gauge representation */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="text-gray-400">Contenu :</span>
                        <strong className="text-base font-mono text-gray-900 block mt-0.5">{tank.currentWeightKg.toFixed(1)} kg</strong>
                      </div>
                      <span className="font-mono text-gray-500 font-semibold">{occupancyPct.toFixed(0)}%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden border border-slate-200 relative flex items-center justify-center">
                      <div 
                        className="bg-amber-400 h-full rounded-r-xs transition-all duration-700 absolute left-0" 
                        style={{ width: `${occupancyPct}%` }}
                      ></div>
                      {/* Grid markers */}
                      <span className="relative text-[9px] font-bold text-amber-900 z-10 uppercase tracking-widest drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                        {tank.capacityKg} kg max
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-150 flex justify-between text-[11px] text-gray-400">
                    <span>Matière : Inox alimentaire micro-poli</span>
                    <span>Décanté à froid</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conditioned jars list summary */}
          <div className="bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-900 text-base mb-4">Derniers Lots Conditionnés</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {store.bottlings.map(bt => {
                const tank = store.tanks.find(t => t.id === bt.tankId);
                return (
                  <div 
                    key={bt.id} 
                    className="p-4 rounded-xl border border-gray-150 bg-slate-50/50 flex flex-col justify-between hover:border-brand-gold-500 cursor-pointer transition-all"
                    onClick={() => {
                      handleTraceLookup(bt.batchNumber);
                      setActiveTab('scan');
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2.5">
                        <strong className="text-xs font-mono font-bold text-gray-900">{bt.batchNumber}</strong>
                        <span className="text-[9px] bg-amber-50 text-brand-gold-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                          FORMAT {bt.jarSizeG}G
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 italic">"{bt.labelTemplate}"</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-150 flex justify-between text-[11px] text-gray-400 font-mono">
                      <span>Conditionnement: {formatDateToFR(bt.bottlingDate)}</span>
                      <span className="text-brand-green-800 font-bold">{bt.quantity} pots</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. EXTRACTION FORM TAB */}
      {activeTab === 'extraction' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-905 text-sm mb-4 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-brand-green-600" /> Saisir une Extraction
            </h3>

            {rawHarvestsAvailable.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl p-3 leading-relaxed">
                ⚠️ Aucune récolte brute n'est en attente de traitement en miellerie. Allez dans l'onglet "Apiculture" pour enregistrer de nouvelles récoltes brutes de brousse.
              </p>
            ) : (
              <form onSubmit={handleLogLevelExtraction} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Cochez les hausses récoltées à extraire</label>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto border border-gray-150 p-2 rounded-lg bg-slate-50/50">
                    {rawHarvestsAvailable.map(harvest => {
                      const hive = store.hives.find(h => h.id === harvest.hiveId);
                      return (
                        <label key={harvest.id} className="flex items-center gap-2 text-xs text-gray-700 hover:bg-white p-1 rounded-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedHarvestIds.includes(harvest.id)}
                            onChange={e => {
                              if (e.target.checked) setSelectedHarvestIds([...selectedHarvestIds, harvest.id]);
                              else setSelectedHarvestIds(selectedHarvestIds.filter(id => id !== harvest.id));
                            }}
                            className="rounded text-brand-green-600"
                          />
                          <span className="font-semibold block truncate">
                            {harvest.id} / Ruche {hive?.code} ({harvest.quantityKg} kg) - {formatDateToFR(harvest.date)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-750 mb-1">Miel pur extrait (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={extractedQty}
                      onChange={e => setExtractedQty(e.target.value)}
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-750 mb-1">Cire / Déchets (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wasteQty}
                      onChange={e => setWasteQty(e.target.value)}
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Technique d'élaboration</label>
                  <select
                    value={extractionMethod}
                    onChange={e => setExtractionMethod(e.target.value as any)}
                    className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg focus:outline-hidden"
                  >
                    <option value="degouttage">Égouttage de brousse à froid (Gravité)</option>
                    <option value="pressurage">Pressurage doux traditionnel</option>
                    <option value="centrifugation">Centrifugation mécanique (Inox)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Cuve de destination</label>
                  <select
                    value={extractionTankId}
                    onChange={e => setExtractionTankId(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg focus:outline-hidden"
                  >
                    {store.tanks.map(tank => (
                      <option key={tank.id} value={tank.id}>
                        {tank.name} (Dispo actuel: {tank.currentWeightKg} kg)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Filtrer & Verser en Cuve
                </button>
              </form>
            )}
          </div>

          {/* Historical extraction logs */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-901 text-base mb-4">Registre de Transformation Miellerie</h3>
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {store.extractions.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-10">Aucun log d'extraction dans l'historique.</p>
              ) : (
                store.extractions.map(ex => {
                  const targetTank = store.tanks.find(t => t.id === ex.tankId);
                  return (
                    <div key={ex.id} className="p-4 border border-gray-150 bg-slate-50/50 rounded-xl space-y-2/5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 bg-brand-green-100/40 text-brand-green-800 rounded-md">
                          EXTRACTION #{ex.id}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{formatDateToFR(ex.extractionDate)}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                        <div className="bg-white p-2 border border-gray-100 rounded-md">
                          <span className="text-[10px] text-gray-400 uppercase block">Rendement Pur</span>
                          <strong className="text-gray-900 font-mono text-sm">{ex.extractedWeightKg} kg</strong>
                        </div>
                        <div className="bg-white p-2 border border-gray-100 rounded-md">
                          <span className="text-[10px] text-gray-400 uppercase block font-mono">Pertes / Cire</span>
                          <strong className="text-gray-900 font-mono text-sm">{ex.wasteWeightKg} kg</strong>
                        </div>
                        <div className="bg-white p-2 border border-gray-100 rounded-md">
                          <span className="text-[10px] text-gray-400 uppercase block">Méthode</span>
                          <strong className="text-gray-900 capitalize text-xs">{ex.method}</strong>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between items-center text-[11px] text-gray-500">
                        <span>Reçu dans : <strong>{targetTank?.name}</strong></span>
                        <span>Contient {ex.harvestIds.length} cueillettes brutes</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. PACKAGING FORM TAB */}
      {activeTab === 'conditionnement' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-900 text-sm mb-4 border-b border-gray-100 pb-2">
              Lancer un conditionnement
            </h3>

            <form onSubmit={handleCreateBottling} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-750 mb-1">Sélectionner la cuve de miel</label>
                <select
                  value={bottlingTankId}
                  onChange={e => setBottlingTankId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-lg focus:outline-hidden"
                >
                  {store.tanks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.currentWeightKg.toFixed(1)} kg dispos)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Format Pots verre</label>
                  <select
                    value={jarSize}
                    onChange={e => setJarSize(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-gray-200 bg-white rounded-lg focus:outline-hidden"
                  >
                    <option value="250">250 grammes</option>
                    <option value="500">500 grammes</option>
                    <option value="1000">1 Kilogramme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-750 mb-1">Nombre d'unités</label>
                  <input
                    type="number"
                    value={bottledQty}
                    onChange={e => setBottledQty(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-750 mb-1">Libellé commercial étiquette</label>
                <input
                  type="text"
                  value={lblTemplate}
                  onChange={e => setLblTemplate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-hidden font-medium"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5 text-[11px] text-gray-500">
                <p className="flex justify-between">
                  <span>Miel brut à soustraire:</span>
                  <strong className="text-gray-800 font-mono">{((Number(jarSize) * Number(bottledQty)) / 1000).toFixed(1)} Kg</strong>
                </p>
                <p className="flex justify-between">
                  <span>Code Lot auto-généré:</span>
                  <strong className="text-amber-750 font-mono">LOT-{new Date().toISOString().split('T')[0].replace(/-/g, '')}-{jarSize}G-XX</strong>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Embouteiller & Étiqueter
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-brand-green-100/30">
            <h3 className="font-display font-semibold text-gray-900 text-base mb-4">Générateur d'Étiquette Traçabilité</h3>
            <p className="text-xs text-gray-500 mb-4">
              L'étiquette de traçabilité est collée sous chaque pot de verre. Elle comporte le logo <strong>Yamtaanu</strong>, les avertissements habituels ainsi que le QR Code liant le numéro de Lot au parcours du producteur.
            </p>

            <div className="border border-dashed border-amber-300 bg-brand-gold-100/30 rounded-2xl p-6 relative max-w-md mx-auto space-y-4">
              <div className="absolute top-2 right-2 flex items-center justify-center p-2 bg-white rounded-xs border border-gray-100 shadow-sm text-gray-700">
                <QrCode className="w-14 h-14" />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gold-600 block">Ligne Premium Traditionnelle</span>
                <h4 className="text-lg font-bold font-display text-brand-green-800">MIEL DE FORÊT DE BAMBOU</h4>
                <p className="text-[10px] text-gray-500 italic">"Récolte forestière à caractère sauvage"</p>
              </div>

              <div className="pt-2 pb-2 border-y border-brand-gold-500/20 text-xs text-gray-700 space-y-1">
                <p><strong>N° de Lot :</strong> <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-150">LOT-20260622-{jarSize}G-01</span></p>
                <p><strong>DLUO :</strong> <span className="font-mono">22/06/2028</span></p>
                <p><strong>Contenance :</strong> {jarSize} grammes brut égoutté</p>
              </div>

              <div className="text-[8px] text-gray-400 space-y-1 leading-relaxed">
                <p>Produit et étiqueté par Yamtaanu, Cameroun. Miel brut tressé, récolté manuellement, filtré à température ambiante pour conserver les arômes de pollen naturel.</p>
                <p className="font-bold">⚠️ Ne convient pas aux nourrissons de moins de 12 mois.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SCANNER / TRACEABILITY SEARCH ENGINE */}
      {activeTab === 'scan' && (
        <div className="bg-white p-6 rounded-2xl border border-brand-green-100/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
            <div>
              <h3 className="font-display font-semibold text-gray-900 text-lg">Moteur de Traçabilité & Transparence</h3>
              <p className="text-xs text-gray-500">Reconstruisez l'histoire complète d'un pot de miel de sa fabrication en brousse</p>
            </div>

            {/* Lot Selector */}
            <div className="w-full md:w-80 flex gap-2">
              <select
                value={searchedLot}
                onChange={e => handleTraceLookup(e.target.value)}
                className="flex-1 text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:border-brand-green-600"
              >
                <option value="">-- Choisir un Lot à scanner --</option>
                {store.bottlings.map(bt => (
                  <option key={bt.batchNumber} value={bt.batchNumber}>
                    {bt.batchNumber} (Format: {bt.jarSizeG}g)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {traceHistory ? (
            <div className="space-y-6">
              {/* Premium Print Actions Header bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF9F6] border-2 border-brand-gold-500/30 p-4.5 rounded-2xl shadow-xs font-sans">
                <div className="text-left space-y-1">
                  <span className="text-[10px] uppercase font-bold text-brand-gold-600 bg-brand-gold-100 px-2 py-0.5 rounded-md tracking-wider border border-brand-gold-200">
                    Origine Traçable Validée
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">Dossier de Lot : {traceHistory.bottling.batchNumber}</h4>
                  <p className="text-[11px] text-slate-500">Vous pouvez exporter ces informations complètes en format de certificat officiel pour impression ou enregistrement PDF.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrintingCertificate(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-brand-green-800 hover:bg-brand-green-900 text-brand-gold-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-green-900/10 border border-brand-gold-500/20"
                >
                  <FileText className="w-4 h-4 text-brand-gold-400" />
                  Générer Certificat A4 (PDF / Print)
                </button>
              </div>

              {/* Timeline layout showing sequence */}
              <div className="relative pl-6 md:pl-0 md:grid md:grid-cols-6 gap-4 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-1 before:bg-brand-gold-500 md:before:hidden">
                
                {/* Step 1: Bamboo Preform */}
                <div className="relative md:text-center pb-6 md:pb-0 space-y-2">
                  <div className="absolute right-full mr-3.5 md:relative md:mx-auto w-6.5 h-6.5 rounded-full bg-brand-green-700 text-white text-[11px] font-bold flex items-center justify-center mb-1 border-2 border-white shadow-xs">
                    1
                  </div>
                  <div className="flex flex-col items-start md:items-center">
                    <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-display">Tressage Bambou</h4>
                    <span className="text-[9px] bg-brand-green-105 text-brand-green-800 font-bold px-1.5 py-0.5 rounded-md mt-0.5">🟢 CERTIFIÉ</span>
                  </div>
                  {traceHistory.preforms[0] ? (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 inline-block text-left w-full text-xs space-y-1">
                      <p className="font-mono font-bold text-brand-green-800 text-[10px]">{traceHistory.preforms[0].id}</p>
                      <p className="text-gray-650 text-[10.5px]">Artisan: <strong className="text-gray-901">{traceHistory.preforms[0].artisanName}</strong></p>
                      <p className="text-[9.5px] text-gray-400">Le {traceHistory.preforms[0].createdAt}</p>
                    </div>
                  ) : <span className="text-xs text-gray-405 italic">Aucun raccord</span>}
                </div>

                {/* Step 2: Installed Hive / Location */}
                <div className="relative md:text-center pb-6 md:pb-0 space-y-2">
                  <div className="absolute right-full mr-3.5 md:relative md:mx-auto w-6.5 h-6.5 rounded-full bg-brand-green-700 text-white text-[11px] font-bold flex items-center justify-center mb-1 border-2 border-white shadow-xs">
                    2
                  </div>
                  <div className="flex flex-col items-start md:items-center">
                    <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-display">Rucher & GPS</h4>
                    <span className="text-[9px] bg-brand-green-105 text-brand-green-800 font-bold px-1.5 py-0.5 rounded-md mt-0.5">🟢 CARTOGRAPHIÉ</span>
                  </div>
                  {traceHistory.hives[0] ? (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 inline-block text-left w-full text-xs space-y-1">
                      <p className="font-mono font-bold text-brand-green-800 text-[10px]">{traceHistory.hives[0].code}</p>
                      <p className="text-gray-900 truncate font-semibold text-[10.5px]">{traceHistory.hives[0].locationName}</p>
                      <p className="text-[9.5px] text-gray-400 font-mono">GPS: {traceHistory.hives[0].gpsCoordinates}</p>
                    </div>
                  ) : <span className="text-xs text-gray-405 italic">Aucun raccord</span>}
                </div>

                {/* Step 3: Inspections & Ecology Audits */}
                <div className="relative md:text-center pb-6 md:pb-0 space-y-2">
                  <div className="absolute right-full mr-3.5 md:relative md:mx-auto w-6.5 h-6.5 rounded-full bg-brand-green-700 text-white text-[11px] font-bold flex items-center justify-center mb-1 border-2 border-white shadow-xs">
                    3
                  </div>
                  <div className="flex flex-col items-start md:items-center">
                    <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-display">Suivi Sanitaire</h4>
                    <span className="text-[9px] bg-brand-green-105 text-brand-green-800 font-bold px-1.5 py-0.5 rounded-md mt-0.5">🟢 AUDITÉ OK</span>
                  </div>
                  {traceHistory.inspections.length > 0 ? (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 inline-block text-left w-full text-xs space-y-1">
                      <p className="text-gray-900 font-bold text-[10.5px]">Santé: {traceHistory.inspections[0].populationHealth === 'excellent' ? 'Excellente (10/10)' : 'Normale'}</p>
                      <p className="text-gray-650 text-[10.5px]">Humidité: <span className="font-mono">{traceHistory.inspections[0].humidityLevelPercent}%</span></p>
                      <p className="text-[9.5px] text-gray-400">Reine présente: {traceHistory.inspections[0].queenPresent ? 'Oui' : 'Non'}</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 inline-block text-left w-full text-xs space-y-1">
                      <p className="text-amber-700 italic text-[10.5px]">Aucune anomalie</p>
                      <p className="text-[9.5px] text-gray-400">Contrôle écologique OK</p>
                    </div>
                  )}
                </div>

                {/* Step 4: Harvest details */}
                <div className="relative md:text-center pb-6 md:pb-0 space-y-2">
                  <div className="absolute right-full mr-3.5 md:relative md:mx-auto w-6.5 h-6.5 rounded-full bg-brand-green-700 text-white text-[11px] font-bold flex items-center justify-center mb-1 border-2 border-white shadow-xs">
                    4
                  </div>
                  <div className="flex flex-col items-start md:items-center">
                    <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-display">Récolte Royale</h4>
                    <span className="text-[9px] bg-brand-green-105 text-brand-green-800 font-bold px-1.5 py-0.5 rounded-md mt-0.5">🟢 CONTRÔLÉ</span>
                  </div>
                  {traceHistory.harvests[0] ? (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 inline-block text-left w-full text-xs space-y-1">
                      <p className="font-mono font-bold text-brand-gold-600 text-[10px]">{traceHistory.harvests[0].id}</p>
                      <p className="text-gray-900 font-bold text-[10.5px]">{traceHistory.harvests[0].quantityKg} Kg bruts</p>
                      <p className="text-[9.5px] text-gray-450 leading-tight">Eau: {traceHistory.harvests[0].moisturePercent}% | Grade {traceHistory.harvests[0].qualityGrade}</p>
                    </div>
                  ) : <span className="text-xs text-gray-405 italic">Aucun raccord</span>}
                </div>

                {/* Step 5: Extraction & Tank */}
                <div className="relative md:text-center pb-6 md:pb-0 space-y-2">
                  <div className="absolute right-full mr-3.5 md:relative md:mx-auto w-6.5 h-6.5 rounded-full bg-brand-green-700 text-white text-[11px] font-bold flex items-center justify-center mb-1 border-2 border-white shadow-xs">
                    5
                  </div>
                  <div className="flex flex-col items-start md:items-center">
                    <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-display">Miellerie Décantage</h4>
                    <span className="text-[9px] bg-brand-green-105 text-brand-green-800 font-bold px-1.5 py-0.5 rounded-md mt-0.5">🟢 PUR & FILTRÉ</span>
                  </div>
                  {traceHistory.extraction ? (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 inline-block text-left w-full text-xs space-y-1">
                      <p className="font-mono font-bold text-brand-green-800 text-[10px]">{traceHistory.extraction.id}</p>
                      <p className="text-gray-750 font-medium text-[10.5px]">Décantage à froid</p>
                      <p className="text-[9.5px] text-gray-400 font-mono">Cuve: {traceHistory.bottling.tankId}</p>
                    </div>
                  ) : <span className="text-xs text-gray-405 italic">Aucun raccord</span>}
                </div>

                {/* Step 6: Bottling */}
                <div className="relative md:text-center space-y-2">
                  <div className="absolute right-full mr-3.5 md:relative md:mx-auto w-6.5 h-6.5 rounded-full bg-brand-gold-500 text-brand-green-900 text-[11px] font-bold flex items-center justify-center mb-1 border-2 border-white shadow-xs">
                    6
                  </div>
                  <div className="flex flex-col items-start md:items-center">
                    <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider font-display">Pots Fini (Lot)</h4>
                    <span className="text-[9px] bg-brand-gold-100 text-brand-gold-800 border border-brand-gold-300 font-bold px-1.5 py-0.5 rounded-md mt-0.5">🟢 PRÊT COMMERCE</span>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 inline-block text-left w-full text-xs space-y-1">
                    <p className="font-mono font-bold text-brand-gold-600 text-[10px]">{traceHistory.bottling.batchNumber}</p>
                    <p className="text-gray-700 text-[10.5px]">Format: <strong>{traceHistory.bottling.jarSizeG}g</strong></p>
                    <p className="text-[9.5px] text-gray-400 font-mono">Lot de: {traceHistory.bottling.quantity} pots</p>
                  </div>
                </div>

              </div>

              {/* Map/Details block card */}
              <div className="bg-radial from-brand-green-850 to-brand-green-900 text-white p-6 rounded-2xl relative overflow-hidden mt-6 shadow-md shadow-emerald-900/10">
                <div className="absolute right-4 bottom-4 text-emerald-850/60 font-serif text-[120px] font-bold select-none pointer-events-none">
                  OR
                </div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-500">Certificat de cueillette sauvage</span>
                    <h4 className="text-xl font-bold font-display uppercase">Dossier de traçabilité certifié</h4>
                    <p className="text-xs text-brand-green-50 leading-relaxed">
                      Ce pot de <strong className="text-brand-gold-500">{traceHistory.bottling.jarSizeG}g</strong> étiqueté sous le lot <strong className="text-brand-gold-500">{traceHistory.bottling.batchNumber}</strong> a été produit et certifié avec succès.
                    </p>
                    <div className="space-y-2 text-xs">
                      <p className="flex justify-between border-b border-white/10 pb-1.5"><span className="text-brand-green-150">Vannier du bambou:</span> <span>{traceHistory.preforms[0]?.artisanName}</span></p>
                      <p className="flex justify-between border-b border-white/10 pb-1.5"><span className="text-brand-green-150">Date d'installation:</span> <span>{formatDateToFR(traceHistory.hives[0]?.installedAt)}</span></p>
                      <p className="flex justify-between border-b border-white/10 pb-1.5"><span className="text-brand-green-150">Coordonnées carto GPS:</span> <span className="font-mono">{traceHistory.hives[0]?.gpsCoordinates}</span></p>
                      <p className="flex justify-between border-b border-white/10 pb-1.5"><span className="text-brand-green-150">Taux d'humidité brute:</span> <span className="font-mono">{traceHistory.harvests[0]?.moisturePercent}%</span></p>
                      <p className="flex justify-between"><span className="text-brand-green-150">Date d'embouteillage:</span> <span>{formatDateToFR(traceHistory.bottling.bottlingDate)}</span></p>
                    </div>
                  </div>

                  {/* Aesthetic visual block mapping */}
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-gold-500 tracking-widest block mb-2">Visites de suivi associées</span>
                      {traceHistory.inspections.length === 0 ? (
                        <p className="text-xs italic text-brand-green-100">Aucun historique d'inpections trouvé.</p>
                      ) : (
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {traceHistory.inspections.map((insp: any) => (
                            <div key={insp.id} className="text-xs bg-black/10 p-2.5 rounded-lg">
                              <div className="flex justify-between items-center text-[10px] text-brand-gold-500 font-bold mb-1">
                                <span>{insp.date}</span>
                                <span>Colonnie: {insp.populationHealth}</span>
                              </div>
                              <p className="text-[11px] text-brand-green-50">"{insp.notes}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="inline-flex items-center gap-1.5 p-2 bg-brand-gold-600/10 rounded-lg text-brand-gold-500 text-xs border border-brand-gold-500/20">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>Conforme aux normes de certification forestière et apicole Durable.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 italic bg-gray-50 rounded-2xl border border-gray-150">
              Veuillez sélectionner un numéro de lot ci-dessus pour simuler le scan du QR Code de traçabilité d'un pot.
            </div>
          )}
        </div>
      )}

      {activeTab === 'qr_manuel' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-brand-green-100/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6 font-sans">
              <div>
                <h3 className="font-display font-semibold text-gray-900 text-lg">Générateur Manuel de Codes QR & Étiquettes</h3>
                <p className="text-xs text-gray-500">Générez à la demande des codes QR de petite taille pour l'étiquetage manuel de vos pots de miel sauvages, infusions ou boissons artisanales.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-150 shrink-0">
                Mode Hors-ligne (Offline)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
              {/* Left Column: Form Controls (Colspan 6) */}
              <div className="lg:col-span-6 space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-150/70">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block font-sans">Configuration</span>
                  <h4 className="text-sm font-bold text-gray-900 font-sans">Fiche de Traçabilité du Produit</h4>
                  <p className="text-[11px] text-gray-500">Renseignez ces informations réelles pour les encoder directement dans le code QR à destination de vos clients (sans besoin de numéro de lot).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Label Input */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-700 flex items-center justify-between font-sans">
                      <span>Libellé principal de l'étiquette :</span>
                      <span className="text-[10px] text-gray-400 font-mono">Requis</span>
                    </label>
                    <input
                      type="text"
                      value={manualQrLabel}
                      onChange={(e) => setManualQrLabel(e.target.value)}
                      placeholder="Ex: Miel Sauvage d'Allada"
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Pays Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block font-sans">Pays :</label>
                    <input
                      type="text"
                      value={qrPays}
                      onChange={(e) => setQrPays(e.target.value)}
                      placeholder="Ex: Bénin"
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Village Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block font-sans">Village :</label>
                    <input
                      type="text"
                      value={qrVillage}
                      onChange={(e) => setQrVillage(e.target.value)}
                      placeholder="Ex: Attogon"
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Département & Commune Input */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-700 block font-sans">Département & Commune :</label>
                    <input
                      type="text"
                      value={qrDepartementCommune}
                      onChange={(e) => setQrDepartementCommune(e.target.value)}
                      placeholder="Ex: Atlantique, Allada"
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Apiculteur Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block font-sans">Apiculteur :</label>
                    <input
                      type="text"
                      value={qrApiculteur}
                      onChange={(e) => setQrApiculteur(e.target.value)}
                      placeholder="Ex: Kofi Mensah"
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Type de ruche Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block font-sans">Type de ruche :</label>
                    <input
                      type="text"
                      value={qrTypeRuche}
                      onChange={(e) => setQrTypeRuche(e.target.value)}
                      placeholder="Ex: Kényane Traditionnelle"
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Végétations Input */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-700 block font-sans">Végétations environnantes :</label>
                    <input
                      type="text"
                      value={qrVegetations}
                      onChange={(e) => setQrVegetations(e.target.value)}
                      placeholder="Ex: Acacia, Baobab, fleurs sauvages"
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Date récolte Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block font-sans">
                      Date de récolte :
                    </label>
                    <input
                      type="date"
                      value={qrDateRecolte}
                      onChange={(e) => setQrDateRecolte(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  {/* Date conditionnement Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block font-sans">
                      Date de conditionnement :
                    </label>
                    <input
                      type="date"
                      value={qrDateConditionnement}
                      onChange={(e) => setQrDateConditionnement(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>
                </div>

                {/* Format Selection for Scanner Readability */}
                <div className="space-y-1.5 pt-2 border-t border-slate-150">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 block font-sans">
                    <span>Format d'encodage du QR Code :</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setQrEncodingType('compact')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-sans ${
                        qrEncodingType === 'compact'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                      }`}
                      title="Format texte abrégé ultra-léger. Ne nécessite aucun lien web ni connexion internet pour être lu."
                    >
                      ⭐ Compact
                      <span className="text-[9px] block text-gray-400 font-normal font-sans">Texte simple (Hors ligne)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrEncodingType('full')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-sans ${
                        qrEncodingType === 'full'
                          ? 'bg-slate-50 text-slate-700 border-slate-300'
                          : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                      }`}
                      title="Format texte complet avec toutes les phrases détaillées. Ne nécessite aucune connexion internet."
                    >
                      📜 Détaillé
                      <span className="text-[9px] block text-gray-400 font-normal font-sans">Texte complet (Hors ligne)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrEncodingType('url')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-sans ${
                        qrEncodingType === 'url'
                          ? 'bg-slate-50 text-slate-700 border-slate-300'
                          : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                      }`}
                      title="Encode un lien URL interactif pour ouvrir la fiche de traçabilité en ligne."
                    >
                      🔗 Lien Web
                      <span className="text-[9px] block text-gray-400 font-normal font-sans">Fiche en ligne (URL)</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-450 leading-tight">
                    {qrEncodingType === 'compact' && "💡 Recommandé pour l'impression en série et les micro-stickers (1x1 cm). Encode un texte brut simple (ex: YAM|P:BEN|V:ALLADA...) directement lisible hors ligne !"}
                    {qrEncodingType === 'full' && "📜 Mode texte détaillé : encode l'intégralité des phrases de traçabilité dans le QR code. Fonctionne à 100% sans internet !"}
                    {qrEncodingType === 'url' && "🔗 Mode web interactif : redirige vers la fiche de traçabilité en ligne sur le téléphone du client."}
                  </p>

                  {qrEncodingType !== 'url' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-[10px] text-emerald-950 leading-normal flex items-start gap-2 font-sans shadow-2xs mt-2">
                      <span className="text-base leading-none mt-0.5 shrink-0">✅</span>
                      <div className="space-y-1">
                        <strong className="block font-bold text-emerald-900 text-[11px]">
                          Mode 100% Hors Ligne Actif (Aucune erreur 403 possible !)
                        </strong>
                        <p className="text-emerald-800">
                          En mode <strong>{qrEncodingType === 'compact' ? 'Compact (Texte simple)' : 'Détaillé (Texte complet)'}</strong>, les informations de votre lot sont encodées directement dans le dessin du QR code.
                        </p>
                        <p className="text-emerald-900 font-medium pt-1 border-t border-emerald-200/80">
                          👉 Quand un client ou un contrôleur scanne ce code avec son smartphone, <strong>le texte s'affiche instantanément sur son écran sans qu'il ait besoin de connexion Internet ni d'ouvrir un lien web</strong>. Il n'y a donc <strong>jamais d'erreur 403</strong> !
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3 mt-2 text-left">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-150 rounded-lg text-[10px] text-indigo-800 leading-normal space-y-2">
                      {qrEncodingType !== 'url' && (
                        <div className="p-2 bg-indigo-100/90 text-indigo-950 rounded-lg font-normal text-[9.5px] mb-1.5 border border-indigo-200">
                          💡 <strong>Remarque :</strong> Vous avez sélectionné le mode <em>{qrEncodingType === 'compact' ? '⭐ Compact' : '📜 Détaillé'}</em> ci-dessus (qui fonctionne sans Internet). Votre URL ci-dessous reste configurable et prête dès que vous basculez sur <strong>🔗 Lien Web</strong> !
                        </div>
                      )}
                      <div>
                        <span className="font-bold flex items-center gap-1 text-indigo-950">
                          <Globe className="w-3.5 h-3.5 text-indigo-600" /> Domaine Public / URL de Traçabilité :
                        </span>
                          <p className="text-[9.5px] text-indigo-700 mt-0.5">
                            Pour que le QR Code soit <strong>fonctionnel sur le téléphone de vos clients</strong> sans erreur 403, indiquez ici l'URL de votre site web public (ex: <code>https://yamtaanu.com</code> ou votre hébergement Vercel/Firebase/GitHub).
                          </p>
                        </div>

                        {getAutoBaseUrl().includes('.run.app') && !customQrDomain && (
                          <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-[10px] text-amber-950 leading-normal space-y-2 font-sans shadow-2xs">
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                                <span className="text-base leading-none">⚠️</span> Pourquoi le scan indique une erreur 403 sur téléphone ?
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowPublicDomainGuide(!showPublicDomainGuide)}
                                className="px-2 py-0.5 bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold rounded text-[9.5px] shrink-0 cursor-pointer transition-all"
                              >
                                {showPublicDomainGuide ? 'Masquer le guide' : '🚀 Comment avoir un domaine ?'}
                              </button>
                            </div>

                            <p className="text-[9.5px] text-amber-900">
                              L'adresse actuelle (<code>.run.app</code>) est un serveur de développement privé Google Cloud. Un smartphone client non connecté à votre compte Google recevra une <strong>erreur 403 (Accès refusé)</strong>.
                            </p>

                            {showPublicDomainGuide && (
                              <div className="bg-white/95 p-3 rounded-lg border border-amber-200 space-y-2.5 text-[9.5px] text-slate-700 shadow-inner">
                                <h5 className="font-bold text-[10.5px] text-indigo-950 flex items-center gap-1 border-b pb-1 border-slate-100">
                                  ✨ 3 solutions rapides pour obtenir votre lien public (100% accessible par vos clients) :
                                </h5>

                                <div className="space-y-2">
                                  <div className="p-2 bg-indigo-50/70 rounded border border-indigo-150">
                                    <strong className="text-indigo-900 block font-bold text-[10px]">
                                      1. Solution Instantanée : Le bouton "Partager / Déployer" Google AI Studio (0€ - 30 sec)
                                    </strong>
                                    <p className="mt-0.5 text-indigo-800">
                                      En haut à droite de votre écran Google AI Studio, cliquez sur le bouton <strong>"Share" (Partager)</strong> ou le menu <strong>"Deploy"</strong>. AI Studio va publier votre application et vous donner un lien public officiel. Copiez ce lien et collez-le dans la case ci-dessous !
                                    </p>
                                  </div>

                                  <div className="p-2 bg-emerald-50/70 rounded border border-emerald-150">
                                    <strong className="text-emerald-900 block font-bold text-[10px]">
                                      2. Nom de domaine gratuit à vie : Vercel ou Netlify (0€ - 2 min)
                                    </strong>
                                    <ul className="mt-0.5 text-emerald-800 list-decimal list-inside space-y-0.5">
                                      <li>Dans AI Studio, cliquez sur les paramètres ⚙️ (ou menu) et choisissez <strong>"Export to GitHub"</strong> ou <strong>"Download ZIP"</strong>.</li>
                                      <li>Inscrivez-vous gratuitement sur <a href="https://vercel.com" target="_blank" rel="noreferrer" className="underline font-bold">vercel.com</a> ou <a href="https://netlify.com" target="_blank" rel="noreferrer" className="underline font-bold">netlify.com</a>.</li>
                                      <li>Importez votre projet : vous obtiendrez immédiatement une adresse publique permanente comme <code>https://miellerie-yamtaanu.vercel.app</code>. Collez-la ici !</li>
                                    </ul>
                                  </div>

                                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                    <strong className="text-slate-800 block font-bold text-[10px]">
                                      3. Votre nom de domaine officiel (.com, .bj, .fr - ~5€ à 10€/an)
                                    </strong>
                                    <p className="mt-0.5 text-slate-600">
                                      Pour avoir une adresse prestigieuse à votre marque (ex: <code>https://yamtaanu.com</code> ou <code>https://miel-yamtaanu.bj</code>), achetez votre nom sur un registraire (OVH, Namecheap, LWS, Hostinger) et connectez-le à votre hébergement gratuit Vercel/Netlify.
                                    </p>
                                  </div>
                                </div>

                                <p className="text-[9px] text-gray-500 italic pt-1 border-t border-slate-100">
                                  💡 Astuce : En attendant, vous pouvez aussi basculer ci-dessus sur le mode <strong>"📜 Détaillé"</strong> ou <strong>"⭐ Compact"</strong> pour tester le scan sans dépendre du serveur de développement.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Ex: https://votre-projet.vercel.app (Collez votre vraie URL Vercel ici !)"
                            value={customQrDomain}
                            onChange={(e) => handleCustomDomainChange(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border border-indigo-200 rounded-lg text-[10px] font-mono bg-white text-indigo-950 focus:ring-1 focus:ring-indigo-500 font-bold placeholder:font-normal placeholder:text-gray-400"
                          />
                          {typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') && !customQrDomain && (
                            <button
                              type="button"
                              onClick={() => handleCustomDomainChange(window.location.origin.replace('ais-dev-', 'ais-pre-'))}
                              className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9.5px] font-bold cursor-pointer shrink-0 shadow-xs"
                              title="Coller l'URL publique partagée"
                            >
                              ⚡ Mettre l'URL Publique
                            </button>
                          )}
                          {typeof window !== 'undefined' && !window.location.origin.includes('ais-dev-') && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1') && !customQrDomain && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[9px] font-bold shrink-0">
                              ✅ URL Hébergée Active
                            </span>
                          )}
                          {customQrDomain && (
                            <button
                              type="button"
                              onClick={() => handleCustomDomainChange('')}
                              className="px-2 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-[9.5px] font-bold cursor-pointer"
                              title="Réinitialiser l'URL par défaut"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <div className="text-[9.5px] bg-white/80 p-1.5 rounded border border-indigo-100 font-mono text-indigo-900 break-all space-y-1">
                          <div>
                            <span className="text-gray-500 font-sans">Lien racine utilisé dans ce QR Code : </span>
                            <strong>{getAutoBaseUrl()}</strong>
                          </div>
                          {(getAutoBaseUrl().includes('yamtaanu') || (!getAutoBaseUrl().includes('.vercel.app') && !getAutoBaseUrl().includes('.netlify.app') && !getAutoBaseUrl().includes('.run.app') && !getAutoBaseUrl().includes('localhost') && !getAutoBaseUrl().includes('127.0.0.1'))) && (
                            <div className="p-2.5 bg-red-50 border border-red-300 rounded-lg text-red-900 font-sans text-[10px] leading-normal shadow-xs space-y-1.5">
                              <div className="font-bold flex items-center gap-1 text-[11px] text-red-950">
                                <span>🚨</span> Pourquoi le téléphone indique "Ce site est inaccessible" ?
                              </div>
                              <p className="text-red-900">
                                L'adresse <code>{getAutoBaseUrl()}</code> est une adresse personnalisée (.com, .bj, etc.). Si vous l'avez simplement inventée ou tapée dans cette case sans avoir acheté ce nom de domaine chez un hébergeur (comme OVH, Namecheap ou LWS), <strong>ce site n'existe pas sur Internet !</strong> Le téléphone ne peut donc pas s'y connecter.
                              </p>
                              <div className="p-2 bg-white/90 rounded border border-red-200 text-slate-800 space-y-1">
                                <strong className="text-emerald-800 block font-bold text-[10px]">
                                  ✅ LA SOLUTION GRATUITE ET IMMÉDIATE (avec Vercel) :
                                </strong>
                                <p className="text-[9.5px]">
                                  1. Allez sur votre tableau de bord <a href="https://vercel.com" target="_blank" rel="noreferrer" className="underline font-bold text-indigo-700">vercel.com</a>.<br />
                                  2. Regardez sous le nom de votre projet : Vercel vous a attribué un vrai domaine gratuit qui se termine obligatoirement par <strong><code>.vercel.app</code></strong> (par exemple <code>https://miellerie-yamtaanu.vercel.app</code>).<br />
                                  3. <strong>Copiez ce lien <code>.vercel.app</code> exact et collez-le dans la case ci-dessus !</strong><br />
                                  4. <strong>Téléchargez ou imprimez le nouveau QR code généré.</strong> (Les anciens autocollants gardent l'ancienne fausse adresse en mémoire !).
                                </p>
                              </div>
                            </div>
                          )}
                          {getAutoBaseUrl().includes('ais-pre-') && (
                            <span className="block text-[9.5px] text-emerald-700 font-sans font-bold mt-0.5">
                              ✨ URL publique AI Studio active ! (Cliquez sur le bouton "Share / Partager" en haut à droite dans AI Studio pour que vos clients puissent l'ouvrir sans erreur 403)
                            </span>
                          )}
                          {typeof window !== 'undefined' && (getAutoBaseUrl().includes('.vercel.app') || getAutoBaseUrl().includes('.netlify.app') || getAutoBaseUrl().includes('.github.io')) && (
                            <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-sans text-[10px] space-y-1 shadow-2xs">
                              <strong className="block font-bold text-emerald-950">
                                🎉 Parfait ! Votre adresse officielle hébergée ({getAutoBaseUrl()}) est connectée !
                              </strong>
                              <p className="text-[9.5px]">
                                Ce QR code pointera directement vers votre vrai site en ligne sur les smartphones de vos clients sans aucune erreur ! <strong>Attention : pensez à télécharger et imprimer ce NOUVEAU QR code pour remplacer vos anciens tests !</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 pt-2 border-t border-slate-150">
                        <input
                          type="checkbox"
                          id="qrMinimizeFields"
                          checked={qrMinimizeFields}
                          onChange={(e) => setQrMinimizeFields(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <label htmlFor="qrMinimizeFields" className="text-[11px] font-bold text-slate-800 cursor-pointer flex items-center gap-1">
                            🚀 Optimiser en mode ultra-court (Pour Micro-Stickers 1x1 cm)
                          </label>
                          <p className="text-[9.5px] text-slate-600 leading-normal">
                            {!qrMinimizeFields ? (
                              <span className="text-emerald-700 font-semibold block mt-0.5">
                                ✓ Mode 100% complet actif : Toutes les informations du lot (Apiculteur, Village, Type de ruche, Fleurs, Dates de récolte/conditionnement) sont intégralement conservées dans l'URL !
                              </span>
                            ) : (
                              <span className="text-amber-700 block mt-0.5">
                                ⚡ Mode abrégé : Ne conserve dans l'URL que le Pays, le Village et l'Apiculteur pour réduire la densité des pixels au minimum pour un scan à 1 cm.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Print Diagnostic & Help */}
                      <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-2.5 space-y-1.5">
                        <h4 className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Guide d'impression & Scan 1x1 cm
                        </h4>
                        <ul className="text-[9.5px] text-slate-600 list-disc list-inside space-y-1 leading-normal">
                          <li><strong>Complexité de grille :</strong> L'optimisation ci-dessus réduit le QR à une grille très simple (25x25). C'est indispensable pour du 1x1 cm !</li>
                          <li><strong>Qualité d'impression :</strong> Les imprimantes jet d'encre standard font baver l'encre sur papier ordinaire, fusionnant les micro-carrés. Utilisez de préférence une <strong>imprimante laser (600/1200 DPI)</strong> ou une <strong>imprimante thermique directe haute définition</strong>.</li>
                          <li><strong>Type de support :</strong> Utilisez du papier autocollant brillant ou synthétique pour assurer un tracé parfait des bords.</li>
                          <li><strong>Contraste de couleur :</strong> Conservez une couleur sombre (ex: noir, vert foncé) sur fond blanc uni.</li>
                        </ul>
                      </div>
                    </div>
                </div>

                {/* Sizes Radio */}
                <div className="space-y-1.5 pt-2 border-t border-slate-150">
                  <label className="text-xs font-semibold text-gray-700 block font-sans">Taille d'impression du QR Code :</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setManualQrSize(100)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-sans ${
                        manualQrSize === 100
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Très Petite
                      <span className="text-[9px] block text-gray-400 font-normal font-sans">100x100 px</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualQrSize(140)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-sans ${
                        manualQrSize === 140
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Petite (Std)
                      <span className="text-[9px] block text-gray-400 font-normal font-sans">140x140 px</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualQrSize(180)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-sans ${
                        manualQrSize === 180
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Moyenne
                      <span className="text-[9px] block text-gray-400 font-normal font-sans">180x180 px</span>
                    </button>
                  </div>
                </div>

                {/* Color Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 block font-sans">Couleur du Code QR :</label>
                  <div className="flex gap-2">
                    {[
                      { hex: '#144d2d', label: 'Vert Forêt' },
                      { hex: '#d97706', label: 'Or Ambré' },
                      { hex: '#000000', label: 'Noir Classique' },
                      { hex: '#1e1b4b', label: 'Bleu Nuit' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setManualQrColor(col.hex)}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                          manualQrColor === col.hex ? 'border-indigo-500 scale-110 shadow-xs' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      >
                        {manualQrColor === col.hex && <Check className="w-4 h-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveManualQR}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Enregistrer dans l'historique
                  </button>
                </div>
              </div>

              {/* Middle Column: Polaroid Sticker Preview (Colspan 6) */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-100/50 p-6 rounded-2xl border border-dashed border-gray-300">
                <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block mb-4 font-sans">Aperçu Réel de l'Étiquette</span>
                
                {/* Visual Label Sticker Container */}
                <div className="bg-white p-5 rounded-2xl shadow-lg border-2 border-gray-200 max-w-sm w-full text-center space-y-4 font-sans">
                  
                  {/* Mini canvas and renderer hook */}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-brand-gold-650 block font-sans">Yamtaanu Bénin</span>
                    <h4 className="text-xs font-bold font-display text-brand-green-800 uppercase tracking-wider">CARTE D'IDENTITÉ DU MIEL</h4>
                  </div>

                  <div className="flex justify-center items-center py-3 bg-slate-50 rounded-xl border border-slate-100 relative">
                    <div className="absolute top-1.5 right-2 text-[8px] text-slate-400 font-mono">
                      {manualQrSize}x{manualQrSize}px
                    </div>
                    {/* Live Canvas element using helper hook */}
                    <QRCanvas text={manualQrText} size={manualQrSize} color={manualQrColor} className="rounded bg-white border border-slate-100 shadow-2xs" />
                  </div>

                  <div className="border-t border-slate-150 pt-3 text-xs text-slate-800 text-left space-y-1 font-sans">
                    <p className="font-bold text-xs uppercase text-gray-900 tracking-wide text-center mb-2">{manualQrLabel || 'SANS TITRE'}</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-600 text-[10.5px]">
                      <div><span className="font-bold text-gray-800">🌍 Pays:</span> {qrPays}</div>
                      <div><span className="font-bold text-gray-800">🏡 Village:</span> {qrVillage}</div>
                      <div className="col-span-2"><span className="font-bold text-gray-800">📍 Région:</span> {qrDepartementCommune}</div>
                      <div className="col-span-2"><span className="font-bold text-gray-800">🐝 Apiculteur:</span> {qrApiculteur}</div>
                      <div className="col-span-2"><span className="font-bold text-gray-800">🛖 Ruche:</span> {qrTypeRuche}</div>
                      <div className="col-span-2"><span className="font-bold text-gray-800">🌱 Veg:</span> {qrVegetations}</div>
                      <div><span className="font-bold text-gray-800">📅 Récolte:</span> {formatDateToFR(qrDateRecolte)}</div>
                      <div><span className="font-bold text-gray-800">🏺 Cond:</span> {formatDateToFR(qrDateConditionnement)}</div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-dashed border-slate-200 flex flex-col gap-2">
                    <a
                      href={getTestQrText()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center"
                      title="Ouvrir la fiche de traçabilité dans un nouvel onglet pour vérifier son fonctionnement"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" /> Tester le lien en direct (Fiche Client)
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDownloadCompositePNG(manualQrText, manualQrLabel, manualQrSize, manualQrColor, qrPays, qrVillage, qrDepartementCommune, qrApiculteur, qrTypeRuche, qrVegetations, qrDateRecolte, qrDateConditionnement)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                      title="Télécharger l'étiquette au format PNG pour l'imprimer sur autocollant"
                    >
                      <Download className="w-3.5 h-3.5" /> Télécharger l'Étiquette PNG
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPrintingPlanche(true)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      title="Générer une planche de stickers prête à imprimer sur feuille A4 ou A2"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimer une Planche (A4 / A2)
                    </button>
                  </div>
                </div>

                <div className="mt-5 text-center text-gray-400 text-[11px] max-w-sm font-sans">
                  💡 <strong>Astuce d'impression :</strong> Utilisez le bouton vert <strong>Planche</strong> pour imprimer 12, 24 ou 40 étiquettes identiques sur une seule feuille de papier ! Le format <strong>Compact</strong> optimise la lisibilité du QR code.
                </div>
              </div>
            </div>

            {/* Manual QR Catalogue List (Persisted) */}
            <div className="mt-8 pt-6 border-t border-gray-150 space-y-4 font-sans">
              <div className="flex justify-between items-center font-sans">
                <div>
                  <h4 className="font-display font-semibold text-gray-900 text-sm">Registre des QR Codes créés manuellement ({manualHistory.length})</h4>
                  <p className="text-xs text-gray-500">Historique local de vos étiquettes à la demande (conservé dans votre navigateur)</p>
                </div>
              </div>

              {manualHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic text-xs bg-slate-50 rounded-xl border border-slate-150 font-sans">
                  Aucun QR Code créé manuellement pour le moment. Remplissez le formulaire ci-dessus pour enregistrer votre premier code.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
                  {manualHistory.map((item) => (
                    <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-all">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className="shrink-0 p-1 bg-slate-50 rounded-lg border border-slate-150 mt-1">
                          {/* Mini QR preview */}
                          <QRCanvas text={item.text} size={50} color={item.color} className="rounded bg-white border border-slate-100 shadow-2xs" />
                        </div>
                        <div className="overflow-hidden min-w-0 text-left text-xs">
                          <strong className="text-xs font-bold text-indigo-950 block truncate">{item.label}</strong>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5"><span className="font-semibold">Apiculteur:</span> {item.apiculteur || 'Inconnu'}</p>
                          <p className="text-[10px] text-gray-500 truncate"><span className="font-semibold">Village:</span> {item.village || 'Inconnu'} ({item.pays || 'Bénin'})</p>
                          <span className="text-[9px] text-gray-400 block mt-1">Créé le : {item.date}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setQrPays(item.pays || 'Bénin');
                            setQrDepartementCommune(item.depComm || '');
                            setQrVillage(item.village || '');
                            setQrApiculteur(item.apiculteur || '');
                            setQrTypeRuche(item.ruche || '');
                            setQrVegetations(item.veg || '');
                            setQrDateRecolte(formatDateToISO(item.recolte || '2026-05-12'));
                            setQrDateConditionnement(formatDateToISO(item.cond || '2026-06-20'));

                            setManualQrLabel(item.label);
                            setManualQrSize(item.size as any || 100);
                            setManualQrColor(item.color || '#144d2d');
                          }}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 border border-slate-200 text-[10px] font-bold text-center cursor-pointer transition-all"
                          title="Charger dans l'éditeur"
                        >
                          Éditer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadCompositePNG(item.text, item.label, item.size || 100, item.color, item.pays || '', item.village || '', item.depComm || '', item.apiculteur || '', item.ruche || '', item.veg || '', item.recolte || '', item.cond || '')}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded text-indigo-700 border border-indigo-150 text-[10px] font-bold text-center cursor-pointer transition-all"
                          title="Télécharger"
                        >
                          PNG
                        </button>
                        {deleteConfirmId === item.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              handleDeleteManualQR(item.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold text-center cursor-pointer transition-all animate-pulse"
                            title="Confirmer la suppression"
                          >
                            Sûr ?
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-all cursor-pointer text-center"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Print Layout Sheet Overlay */}
      {isPrintingPlanche && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 overflow-y-auto p-4 md:p-10 font-sans print:p-0 print:bg-white print:absolute print:inset-0">
          {/* Controls bar: hidden when printing */}
          <div className="max-w-5xl mx-auto bg-white p-5 rounded-2xl shadow-xl border border-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden no-print">
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600 animate-pulse" />
                Générateur de Planche d'Impression Multi-Stickers (A4 / A2)
              </h3>
              <p className="text-[11px] text-slate-500">
                Générez instantanément une grille d'autocollants réguliers et prêts à être collés sur vos pots.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Disposition Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPlancheLayoutMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    plancheLayoutMode === 'grid' 
                      ? 'bg-white text-indigo-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📊 Grille Automatique
                </button>
                <button
                  type="button"
                  onClick={() => setPlancheLayoutMode('free')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    plancheLayoutMode === 'free' 
                      ? 'bg-white text-indigo-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎯 Placement Libre (Interactif)
                </button>
              </div>

              {plancheLayoutMode === 'grid' ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Style :</span>
                    <select 
                      value={plancheStyle} 
                      onChange={(e) => {
                        const nextStyle = e.target.value as any;
                        setPlancheStyle(nextStyle);
                        if (nextStyle === 'qr_pure_2cm') {
                          setPlancheCount(96);
                          setQrEncodingType('url');
                          setQrMinimizeFields(true);
                          setPlancheGridGap(1); // Default to ultra-compact 1mm for pure QR to save paper
                        } else if (nextStyle === 'qr_pure_1cm') {
                          setPlancheCount(320);
                          setQrEncodingType('url');
                          setQrMinimizeFields(true);
                          setPlancheGridGap(0.5); // Default to ultra-compact 0.5mm
                        } else if (nextStyle === 'qr_pure_05cm') {
                          setPlancheCount(616);
                          setQrEncodingType('url');
                          setQrMinimizeFields(true);
                          setPlancheGridGap(0); // Default to 0mm (perfectly touching) for micro to maximize paper saving
                        } else {
                          setPlancheGridGap(2); // Compact 2mm default for other styles
                        }
                      }}
                      className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold"
                    >
                      <option value="qr_pure_2cm">🎯 QR Code Pur (2x2 cm)</option>
                      <option value="qr_pure_1cm">🎯 QR Code Micro (1x1 cm)</option>
                      <option value="qr_pure_05cm">🎯 QR Code Ultra-Micro (0.5x0.5 cm)</option>
                      <option value="qr_only">🏷️ Simple (QR + Libellé)</option>
                      <option value="detailed">📝 Étiquettes Détaillées</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Quantité :</span>
                    <select 
                      value={plancheCount} 
                      onChange={(e) => setPlancheCount(Number(e.target.value))}
                      className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold"
                    >
                      <option value={10}>10 autocollants (Grille 2x5 - Super Lisible)</option>
                      <option value={12}>12 autocollants (Grille 3x4 - Recommandé)</option>
                      <option value={15}>15 autocollants (Grille 3x5)</option>
                      <option value={18}>18 autocollants (Grille 3x6)</option>
                      <option value={20}>20 autocollants (Grille 4x5)</option>
                      <option value={24}>24 autocollants (Grille 4x6)</option>
                      <option value={30}>30 autocollants (Grille 5x6)</option>
                      <option value={40}>40 autocollants</option>
                      <option value={48}>48 autocollants</option>
                      <option value={70}>70 autocollants</option>
                      <option value={80}>80 autocollants (Grille 8x10)</option>
                      <option value={96}>96 autocollants (Grille A4 dense 2cm)</option>
                      <option value={112}>112 autocollants</option>
                      <option value={160}>160 autocollants</option>
                      <option value={320}>320 autocollants (Grille A4 micro 1cm)</option>
                      <option value={616}>616 autocollants (Grille A4 ultra-micro 0.5cm)</option>
                      <option value={1232}>1232 autocollants (Feuille ultra dense)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Espacement (Gap) :</span>
                    <select 
                      value={plancheGridGap} 
                      onChange={(e) => setPlancheGridGap(Number(e.target.value))}
                      className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold text-indigo-700"
                      title="Espace entre les autocollants pour économiser le papier et faciliter la découpe"
                    >
                      <option value={0}>🚫 0 mm (Collés - Économie de papier Max)</option>
                      <option value={0.5}>⚡ 0.5 mm (Ultra serré)</option>
                      <option value={1}>✨ 1 mm (Très compact)</option>
                      <option value={2}>📏 2 mm (Compact)</option>
                      <option value={3}>📐 3 mm (Moyen)</option>
                      <option value={4}>🎨 4 mm (Standard)</option>
                      <option value={6}>🍃 6 mm (Espacé)</option>
                    </select>
                  </div>

                  {!(plancheStyle === 'qr_pure_2cm' || plancheStyle === 'qr_pure_1cm' || plancheStyle === 'qr_pure_05cm') && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">Colonnes :</span>
                        <select 
                          value={plancheCols} 
                          onChange={(e) => setPlancheCols(Number(e.target.value) as any)}
                          className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold"
                        >
                          <option value={2}>2 col (Grand QR)</option>
                          <option value={3}>3 col (Recommandé)</option>
                          <option value={4}>4 col (Standard)</option>
                          <option value={5}>5 col (Compact)</option>
                          <option value={6}>6 col</option>
                          <option value={7}>7 col</option>
                          <option value={8}>8 col (Dense)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">Taille :</span>
                        <select 
                          value={stickerFontSize} 
                          onChange={(e) => setStickerFontSize(Number(e.target.value))}
                          className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold text-brand-green-800"
                          title="Taille de la police des métadonnées (police 8 recommandée)"
                        >
                          <option value={6}>6 px</option>
                          <option value={7}>7 px</option>
                          <option value={8}>8 px (Recommandé)</option>
                          <option value={9}>9 px</option>
                          <option value={10}>10 px</option>
                          <option value={11}>11 px</option>
                          <option value={12}>12 px</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">Police :</span>
                        <select 
                          value={stickerFontFamily} 
                          onChange={(e) => setStickerFontFamily(e.target.value as any)}
                          className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold text-brand-gold-600"
                          title="Caractère de police (qui vend)"
                        >
                          <option value="font-serif">👑 Playfair (Sert à Vendre)</option>
                          <option value="font-sans">✨ Jakarta (Épuré)</option>
                          <option value="font-display">📐 Grotesk (Moderne)</option>
                          <option value="font-mono">💻 JetBrains (Précis)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">Rendu QR :</span>
                        <select 
                          value={imageCrispness} 
                          onChange={(e) => setImageCrispness(e.target.value as any)}
                          className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold"
                          title="Lissage HD ou Pixels bruts"
                        >
                          <option value="smooth">✨ Lissage HD (Anti-flou)</option>
                          <option value="pixelated">🔳 Pixels Nets (Brut)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {plancheStyle === 'detailed' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Codes QR :</span>
                      <select 
                        value={plancheDetailedTwoQrs ? '2' : '1'} 
                        onChange={(e) => setPlancheDetailedTwoQrs(e.target.value === '2')}
                        className="p-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg focus:ring-1 focus:ring-amber-500 font-bold"
                        title="Nombre de codes QR par étiquette détaillée"
                      >
                        <option value="1">1 QR (Centré)</option>
                        <option value="2">⚡ 2 QR (Côte à côte)</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-2.5 py-1.5 rounded-lg">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plancheUniqueCode}
                        onChange={(e) => setPlancheUniqueCode(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-slate-800 font-medium">Code unique</span>
                    </label>
                    {plancheUniqueCode && (
                      <input
                        type="text"
                        value={plancheSingleLotNum}
                        onChange={(e) => setPlancheSingleLotNum(e.target.value)}
                        placeholder="N°"
                        className="w-14 p-1 text-xs text-center bg-white border border-slate-200 rounded-md focus:outline-hidden font-mono font-bold text-brand-green-800"
                        title="Numéro de lot unique pour toute la planche"
                      />
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Free Mode Specific Controls */}
                  <button
                    type="button"
                    onClick={handleAddFreeElement}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Multiplier le QR
                  </button>

                  {/* Selected Element settings */}
                  {(() => {
                    const selectedElem = freeElements.find(el => el.id === selectedFreeElementId) || freeElements[0];
                    if (!selectedElem) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 border border-slate-200 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-700">Taille ({selectedElem.size}mm) :</span>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          value={selectedElem.size}
                          onChange={(e) => {
                            const newSize = Number(e.target.value);
                            setFreeElements(prev => prev.map(el => {
                              if (el.id === selectedElem.id) {
                                return {
                                  ...el,
                                  size: newSize,
                                  x: Math.min(210 - newSize, el.x),
                                  y: Math.min(297 - newSize, el.y)
                                };
                              }
                              return el;
                            }));
                          }}
                          className="w-20 accent-indigo-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setFreeElements(prev => prev.map(el => {
                              if (el.id === selectedElem.id) {
                                return { ...el, x: (210 - el.size) / 2, y: (297 - el.size) / 2 };
                              }
                              return el;
                            }));
                          }}
                          className="px-2 py-1 hover:bg-white border border-transparent hover:border-slate-250 text-slate-700 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                          title="Centrer le code QR sur la page A4"
                        >
                          Centrer
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateFreeElement(selectedElem)}
                          className="px-2 py-1 hover:bg-white border border-transparent hover:border-slate-250 text-emerald-700 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-0.5"
                        >
                          <Copy className="w-3 h-3" /> Dupliquer
                        </button>

                        {freeElements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFreeElement(selectedElem.id)}
                            className="px-2 py-1 hover:bg-rose-50 border border-transparent hover:border-rose-250 text-rose-600 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Supprimer
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}

              <button
                type="button"
                onClick={handleDownloadPlanchePNG}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Télécharger toute la planche d'impression au format image PNG"
              >
                <Download className="w-4 h-4" /> Télécharger (PNG)
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimer (Ctrl + P)
              </button>

              <button
                type="button"
                onClick={() => setIsPrintingPlanche(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
              >
                Fermer
              </button>
            </div>
          </div>

          {/* Guidelines info: hidden when printing */}
          <div className="max-w-5xl mx-auto mb-6 bg-amber-50 p-4.5 rounded-xl border border-amber-250 text-xs text-amber-955 space-y-2 print:hidden no-print">
            <p className="font-bold text-sm flex items-center gap-1.5 text-amber-900">
              💡 Conseils importants pour l'impression de vos stickers :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-amber-900 leading-relaxed">
              <li>📄 <strong>COMMENT CRÉER LE FICHIER PDF :</strong> Cliquez sur le bouton bleu <strong>"Imprimer (Ctrl + P)"</strong> ci-dessus. Dans la fenêtre d'impression qui s'ouvre, à la ligne <strong>Destination</strong>, sélectionnez <strong>"Enregistrer au format PDF"</strong> (ou "Sauvegarder en PDF"). C'est le format idéal pour sauvegarder, partager et imprimer vos stickers !</li>
              <li>✂️ <strong>SÉPARATION ET DÉCOUPE DES STICKERS :</strong> Des lignes en pointillés gris fins de découpe ont été ajoutées automatiquement entre chaque étiquette pour vous permettre de découper proprement aux ciseaux ou au massicot sans déborder sur les codes QR.</li>
              <li>⚡ <strong>CONSEIL SCANNABILITÉ :</strong> Pour les petites tailles (1 cm ou 0.5 cm), sélectionnez impérativement le type d'encodage <strong>"Lien Web"</strong>. Cela génère des codes QR simplifiés à gros pixels, extrêmement faciles à scanner par n'importe quel smartphone, même imprimés en taille microscopique.</li>
              <li>📏 Réglez les marges de votre navigateur sur <strong>"Aucune"</strong> lors de la sauvegarde PDF ou de l'impression physique pour exploiter tout le papier A4.</li>
              <li>🖼️ Activez l'option <strong>"Graphiques d'arrière-plan"</strong> (ou "Imprimer les images de fond") dans les paramètres d'impression de votre navigateur pour afficher correctement les couleurs et décors des stickers.</li>
            </ul>
          </div>

          {/* Printable Page Wrapper */}
          <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-2xl border border-slate-300 min-h-[29.7cm] print:p-0 print:shadow-none print:border-none">
            {/* Inject direct print overrides in a style tag */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden;
                }
                .no-print, .no-print * {
                  display: none !important;
                }
                #printable-grid-container, #printable-grid-container * {
                  visibility: visible;
                }
                #printable-grid-container {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  margin: 0;
                  padding: 0;
                  background: white;
                }
              }
            `}} />

            <div id="printable-grid-container">
              <div className="text-center pb-4 mb-6 border-b border-gray-200 print:hidden">
                <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-650">Yamtaanu Bénin</span>
                <h2 className="text-lg font-bold text-gray-900 font-display">Aperçu de votre Planche de Stickers</h2>
                <p className="text-[11px] text-gray-400">Le cadre ci-dessous simule votre feuille d'impression.</p>
              </div>

              {/* Layout Container */}
              {plancheLayoutMode === 'free' ? (
                <div className="w-full overflow-x-auto py-4 flex justify-center bg-slate-50/20 rounded-2xl border border-slate-100/50 print:overflow-visible print:p-0 print:border-none print:bg-transparent">
                  {/* Free Layout Canvas Sheet */}
                  <div
                    onClick={() => setSelectedFreeElementId(null)}
                    className="relative bg-white border border-slate-300 shadow-md print:border-none print:shadow-none"
                    style={{
                      width: '210mm',
                      height: '297mm',
                      minWidth: '210mm',
                      minHeight: '297mm',
                      position: 'relative'
                    }}
                  >
                    {/* Visual guide header - hidden when printing */}
                    <div className="absolute inset-x-0 top-2 text-center text-[10px] text-slate-400 font-medium select-none pointer-events-none print:hidden">
                      📐 Feuille A4 (210 x 297 mm) • Glissez-déposez pour déplacer vos codes QR
                    </div>

                    {freeElements.map((el) => {
                      const isSelected = selectedFreeElementId === el.id;
                      const qrTextForCell = getManualQrText(
                        qrEncodingType, qrPays, qrDepartementCommune, qrVillage, qrApiculteur, qrTypeRuche, qrVegetations, qrDateRecolte, qrDateConditionnement, 
                        plancheUniqueCode ? (parseInt(plancheSingleLotNum) || undefined) : undefined
                      );
                      
                      const canvasPxSize = Math.floor(el.size * 3.5);

                      return (
                        <div
                          key={el.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFreeElementId(el.id);
                          }}
                          className={`absolute bg-white border border-dashed rounded flex flex-col items-center justify-center cursor-move select-none print:shadow-none print:border-dashed print:border-slate-400 group ${
                            isSelected 
                              ? 'border-indigo-600 ring-2 ring-indigo-500/50 shadow-md z-20' 
                              : 'border-slate-300 hover:border-indigo-400 shadow-xs z-10'
                          }`}
                          style={{
                            left: `${el.x}mm`,
                            top: `${el.y}mm`,
                            width: `${el.size}mm`,
                            height: `${el.size}mm`,
                            touchAction: 'none'
                          }}
                          onMouseDown={(e) => handleElementStartDrag(e, el.id, el.x, el.y)}
                          onTouchStart={(e) => handleElementStartDrag(e, el.id, el.x, el.y)}
                        >
                          {/* Centered QR Canvas */}
                          <div className="w-[85%] h-[85%] flex items-center justify-center p-0.5 pointer-events-none">
                            <QRCanvas text={qrTextForCell} size={canvasPxSize} color={manualQrColor} />
                          </div>

                          {/* Float badge size */}
                          <div className="absolute bottom-0.5 right-1 bg-slate-800/80 text-white text-[8px] font-mono px-1 rounded pointer-events-none print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                            {el.size}mm
                          </div>

                          {/* Quick duplicate & delete buttons on hover */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateFreeElement(el);
                            }}
                            className="absolute -top-3.5 -left-1.5 p-1 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all cursor-pointer shadow-xs pointer-events-auto print:hidden opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                            title="Dupliquer"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>

                          {freeElements.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFreeElement(el.id);
                              }}
                              className="absolute -top-3.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-all cursor-pointer shadow-xs pointer-events-auto print:hidden opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                              title="Supprimer"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="w-full overflow-x-auto py-2 flex justify-center bg-slate-50/20 rounded-2xl border border-slate-100/50 print:overflow-visible print:p-0 print:border-none print:bg-transparent">
                  {/* Grid Layout */}
                  <div 
                    className="grid p-1 bg-white justify-center" 
                    style={{ 
                      gridTemplateColumns: 
                        plancheStyle === 'qr_pure_2cm' ? 'repeat(8, 20mm)' : 
                        plancheStyle === 'qr_pure_1cm' ? 'repeat(16, 10mm)' : 
                        plancheStyle === 'qr_pure_05cm' ? 'repeat(28, 5mm)' : 
                        `repeat(${plancheCols}, minmax(0, 1fr))`,
                      gap: `${plancheGridGap}mm`,
                      // Enforce physical minimum width to keep identical size representation on screen and prevent overlap
                      minWidth: 
                        plancheStyle === 'qr_pure_2cm' ? `${160 + 7 * plancheGridGap}mm` : 
                        plancheStyle === 'qr_pure_1cm' ? `${160 + 15 * plancheGridGap}mm` : 
                        plancheStyle === 'qr_pure_05cm' ? `${140 + 27 * plancheGridGap}mm` : 
                        '190mm',
                      width: 
                        plancheStyle === 'qr_pure_2cm' ? `${160 + 7 * plancheGridGap}mm` : 
                        plancheStyle === 'qr_pure_1cm' ? `${160 + 15 * plancheGridGap}mm` : 
                        plancheStyle === 'qr_pure_05cm' ? `${140 + 27 * plancheGridGap}mm` : 
                        '190mm'
                    }}
                  >
                  {Array.from({ length: plancheCount }).map((_, index) => {
                    const currentLotIndex = plancheUniqueCode ? (parseInt(plancheSingleLotNum) || undefined) : (index + 1);
                    const qrTextForCell = getManualQrText(
                      qrEncodingType, qrPays, qrDepartementCommune, qrVillage, qrApiculteur, qrTypeRuche, qrVegetations, qrDateRecolte, qrDateConditionnement, currentLotIndex
                    );
 
                    if (plancheStyle === 'qr_pure_2cm') {
                      return (
                        <div 
                          key={index} 
                          className="bg-white border border-dashed border-slate-300 rounded flex flex-col items-center justify-center p-[0.5mm] shadow-xs print:shadow-none print:border-dashed print:border-slate-400 relative break-inside-avoid"
                          style={{ width: '20mm', height: '20mm', minWidth: '20mm', minHeight: '20mm' }}
                        >
                          <QRCanvas text={qrTextForCell} size="100%" color={manualQrColor} />
                        </div>
                      );
                    }
 
                    if (plancheStyle === 'qr_pure_1cm') {
                      return (
                        <div 
                          key={index} 
                          className="bg-white border border-dashed border-slate-300 rounded-[2px] flex flex-col items-center justify-center p-0 shadow-xs print:shadow-none print:border-dashed print:border-slate-400 relative break-inside-avoid"
                          style={{ width: '10mm', height: '10mm', minWidth: '10mm', minHeight: '10mm' }}
                        >
                          <QRCanvas text={qrTextForCell} size="100%" color={manualQrColor} />
                        </div>
                      );
                    }
 
                    if (plancheStyle === 'qr_pure_05cm') {
                      return (
                        <div 
                          key={index} 
                          className="bg-white border border-dashed border-slate-200 rounded-[1px] flex flex-col items-center justify-center p-0 shadow-none print:shadow-none print:border-dashed print:border-slate-350 relative break-inside-avoid"
                          style={{ width: '5mm', height: '5mm', minWidth: '5mm', minHeight: '5mm' }}
                        >
                          <QRCanvas text={qrTextForCell} size="100%" color={manualQrColor} />
                        </div>
                      );
                    }

                  if (plancheStyle === 'qr_only') {
                    const simpleHeightClass = 
                      plancheCols >= 8 ? "h-[2.4cm] p-1 space-y-0.5" :
                      plancheCols === 7 ? "h-[2.6cm] p-1.5 space-y-1" :
                      plancheCols === 6 ? "h-[2.8cm] p-2 space-y-1" :
                      plancheCols === 5 ? "h-[3.0cm] p-2 space-y-1.5" :
                      "h-[3.4cm] p-3 space-y-1.5";
                    
                    const simpleQrSize = 
                      plancheCols >= 8 ? 54 :
                      plancheCols === 7 ? 62 :
                      plancheCols === 6 ? 72 :
                      plancheCols === 5 ? 85 :
                      92;

                    const simpleLabelSizeClass = `${getSimpleLabelSizeClass(stickerFontSize)} ${stickerFontFamily}`;
                    const simpleLotSizeClass = getSimpleLotSizeClass(stickerFontSize);

                    return (
                      <div 
                        key={index} 
                        className={`bg-white border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center shadow-xs print:shadow-none print:border-dashed print:border-slate-400 relative break-inside-avoid ${simpleHeightClass} ${stickerFontFamily}`}
                      >
                        <div className="p-0.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-center shrink-0">
                          <QRCanvas text={qrTextForCell} size={simpleQrSize} color={manualQrColor} imageCrispness={imageCrispness} />
                        </div>
                        <div className={`font-bold text-slate-800 uppercase tracking-wide truncate max-w-full px-1 leading-none ${simpleLabelSizeClass}`}>
                          {manualQrLabel}
                        </div>
                        <div className={`font-mono text-slate-400 uppercase tracking-widest leading-none ${simpleLotSizeClass}`}>
                          {plancheUniqueCode ? `LOT #${plancheSingleLotNum}` : `LOT #${index + 1}`} • YAMTAANU
                        </div>
                      </div>
                    );
                  }

                  // Detailed style - Vertical stacked layout with centered, much larger QR code
                  const detailedHeightClass = 
                    plancheCols >= 8 ? "h-[2.6cm] p-1 space-y-0.5" :
                    plancheCols === 7 ? "h-[2.9cm] p-1.5 space-y-1" :
                    plancheCols === 6 ? "h-[3.3cm] p-2 space-y-1" :
                    plancheCols === 5 ? "h-[3.8cm] p-2.5 space-y-1" :
                    plancheCols === 4 ? "h-[4.4cm] p-3 space-y-1.5" :
                    "h-[4.8cm] p-3 space-y-1.5";

                  const qrSize = 
                    plancheCols >= 8 ? 54 : 
                    plancheCols === 7 ? 62 : 
                    plancheCols === 6 ? 72 : 
                    plancheCols === 5 ? 85 : 
                    plancheCols === 4 ? 100 : 
                    plancheCols === 3 ? 120 : 
                    145;

                  const headerTextSize = getHeaderTextSize(stickerFontSize);
                  const labelTextSize = `${getLabelTextSize(stickerFontSize)} ${stickerFontFamily}`;
                  const metaTextSize = `${getMetaTextSize(stickerFontSize)} ${stickerFontFamily}`;
                  const footerTextSize = getFooterTextSize(stickerFontSize);

                  return (
                    <div 
                      key={index} 
                      className={`bg-white border border-dashed border-slate-300 rounded-xl flex flex-col justify-between text-center shadow-xs print:shadow-none print:border-dashed print:border-slate-400 relative break-inside-avoid ${detailedHeightClass} ${stickerFontFamily}`}
                    >
                      {/* Sticker Header */}
                      <div className={`uppercase tracking-wider font-extrabold text-brand-gold-650 flex items-center justify-between border-b border-slate-100 pb-0.5 ${headerTextSize}`}>
                        <span>Yamtaanu • Traçabilité</span>
                        <span className="text-slate-400 font-mono">#{plancheUniqueCode ? plancheSingleLotNum : index + 1}</span>
                      </div>

                      {/* Centered QR Code(s) */}
                      <div className="flex flex-row items-center justify-center gap-2 py-0.5 px-1">
                        <div className="p-0.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-center shadow-2xs">
                          <QRCanvas text={qrTextForCell} size={plancheDetailedTwoQrs ? Math.max(28, Math.floor(qrSize * 0.75)) : qrSize} color={manualQrColor} imageCrispness={imageCrispness} />
                        </div>
                        {plancheDetailedTwoQrs && (
                          <div className="p-0.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-center shadow-2xs">
                            <QRCanvas text={qrTextForCell} size={Math.max(28, Math.floor(qrSize * 0.75))} color={manualQrColor} imageCrispness={imageCrispness} />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Name (Centered) */}
                      <div className={`font-extrabold text-slate-950 uppercase truncate max-w-full leading-none ${labelTextSize}`} title={manualQrLabel}>
                        {manualQrLabel}
                      </div>

                      {/* Compact aligned metadata */}
                      <div className={`text-center text-gray-500 space-y-0.5 leading-tight ${metaTextSize}`}>
                        <div className="truncate"><span className="font-bold text-gray-700">🌍 {qrPays} ({qrVillage})</span></div>
                        <div className="truncate"><span className="font-bold text-slate-700">Api:</span> {qrApiculteur} | 🛖 {qrTypeRuche}</div>
                        <div className="font-semibold text-slate-400">
                          📅 Réc: {formatDateToFR(qrDateRecolte)} • 🏺 Cond: {formatDateToFR(qrDateConditionnement)}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className={`uppercase tracking-widest text-slate-400 border-t border-dashed border-slate-150 pt-0.5 leading-none ${footerTextSize}`}>
                        🐝 CERTIFIÉ PUR & NATUREL 🐝
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )}

  {/* Fullscreen Print Layout Certificate Overlay */}
  {isPrintingCertificate && traceHistory && (
    <div className="fixed inset-0 bg-slate-950/95 z-50 overflow-y-auto p-4 md:p-10 font-sans print:p-0 print:bg-white print:absolute print:inset-0">
      {/* Controls bar: hidden when printing */}
      <div className="max-w-4xl mx-auto bg-white p-5 rounded-2xl shadow-xl border border-slate-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden no-print">
        <div className="text-left">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Générateur de Certificat de Traçabilité Officiel (A4)
          </h3>
          <p className="text-[11px] text-slate-500">
            Imprimez ou enregistrez au format PDF une fiche de conformité complète pour le lot <strong className="text-indigo-700">#{traceHistory.bottling.batchNumber}</strong>.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-green-800 hover:bg-brand-green-900 text-brand-gold-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-green-950/10 border border-brand-gold-500/20"
          >
            <Printer className="w-4 h-4 text-brand-gold-400" /> Imprimer / PDF (A4)
          </button>
          <button
            type="button"
            onClick={() => setIsPrintingCertificate(false)}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Printable Page Wrapper */}
      <div className="max-w-4xl mx-auto print:mx-0 print:max-w-full flex items-center justify-center p-2 print:p-0">
        <div className="w-[210mm] min-h-[297mm] bg-[#FCFBF7] text-slate-900 p-10 sm:p-14 relative border-[12px] border-double border-brand-gold-650/40 shadow-2xl print:shadow-none print:border-brand-gold-650/60 print:p-8 flex flex-col justify-between" id="printable-certificate-page">
          
          {/* Corner Ornaments */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-brand-gold-650/50 pointer-events-none" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-brand-gold-650/50 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-brand-gold-650/50 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-brand-gold-650/50 pointer-events-none" />

          {/* Watermark Logo */}
          <div className="absolute inset-0 opacity-[0.015] flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-[120mm] h-[120mm]" fill="currentColor">
              <circle cx="50" cy="50" r="40" />
            </svg>
          </div>

          {/* Top Certificate Header */}
          <div className="text-center space-y-3 relative z-10">
            <div className="flex justify-center items-center gap-1 text-brand-gold-650 text-xs font-extrabold tracking-[0.25em] uppercase mb-1">
              <span>🐝 MIELLERIE COMMUNITAIRE YAMTAANU 🐝</span>
            </div>
            
            <h1 className="text-3xl font-display font-black tracking-tight text-[#141852] uppercase">
              Certificat d'Origine &amp; Traçabilité
            </h1>
            
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-brand-gold-600 to-transparent mx-auto my-2" />
            
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Ce document atteste de la pureté absolue de notre miel sauvage de forêt et certifie la traçabilité intégrale, du tressage de la ruche en bambou sauvage jusqu'au scellage du pot fini.
            </p>
          </div>

          {/* Central Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 relative z-10 text-xs">
            
            {/* Left Side: Product, Batch & Logistics */}
            <div className="space-y-4">
              <div className="bg-white p-4.5 rounded-xl border border-brand-gold-500/20 shadow-xs">
                <h3 className="font-display font-bold text-brand-green-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-gold-550" />
                  Spécifications du Miel &amp; Conditionnement
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Nom commercial :</span> <strong className="text-slate-800">YAMTAANU Miel Sauvage Brut</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Format du Pot :</span> <strong className="text-slate-800">{traceHistory.bottling.jarSizeG} grammes</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Volume de Production :</span> <strong className="text-slate-800">{traceHistory.bottling.quantity} pots scellés</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Date d'embouteillage :</span> <strong className="text-slate-800">{formatDateToFR(traceHistory.bottling.bottlingDate)}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Expiration conseillée :</span> <strong className="text-slate-800">{formatDateToFR(traceHistory.bottling.expirationDate)}</strong></div>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-xl border border-brand-gold-500/20 shadow-xs">
                <h3 className="font-display font-bold text-brand-green-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-gold-550" />
                  Origine Apicole &amp; Géographique
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Pays d'Origine :</span> <strong className="text-slate-800">{traceHistory.hives?.[0]?.country || 'Bénin'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Localité / Village :</span> <strong className="text-slate-800">{traceHistory.hives?.[0]?.locationName || 'N/A'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Coordonnées GPS :</span> <strong className="text-slate-800 font-mono">{traceHistory.hives?.[0]?.gpsCoordinates || 'N/A'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Type de Flore :</span> <strong className="text-slate-800 italic">{traceHistory.hives?.[0]?.vegetationType || 'Forêt sauvage & Savane'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Type de Ruche :</span> <strong className="text-slate-800">{traceHistory.hives?.[0]?.type || 'Kényane Traditionnelle'}</strong></div>
                </div>
              </div>
            </div>

            {/* Right Side: Step-by-Step Chain & Quality Indices */}
            <div className="space-y-4">
              <div className="bg-white p-4.5 rounded-xl border border-brand-gold-500/20 shadow-xs">
                <h3 className="font-display font-bold text-brand-green-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-gold-550" />
                  Historique de la Chaîne d'Origine
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-brand-green-100 text-brand-green-800 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-slate-800 block">Tressage Artisan : {traceHistory.preforms?.[0]?.artisanName || 'Kofi Mensah'}</strong>
                      <span className="text-[10px] text-slate-500">Matière première locale (bambou sauvage).</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-brand-green-100 text-brand-green-800 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-slate-800 block">Installation Ruche : {traceHistory.hives?.[0]?.code || 'HIVE-001'}</strong>
                      <span className="text-[10px] text-slate-500">Mise en place le {formatDateToFR(traceHistory.hives?.[0]?.installedAt || '')}.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-brand-green-100 text-brand-green-800 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-slate-800 block">Récolte Brut : {traceHistory.harvests?.[0]?.quantityKg || '24'} Kg récoltés</strong>
                      <span className="text-[10px] text-slate-500">Le {formatDateToFR(traceHistory.harvests?.[0]?.harvestDate || '')} par l'apiculteur référencé.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-brand-green-100 text-brand-green-800 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">4</span>
                    <div>
                      <strong className="text-slate-800 block">Miellerie &amp; Décantation : Cuve {traceHistory.bottling.tankId || 'CUVE-01'}</strong>
                      <span className="text-[10px] text-slate-500">Décantation naturelle à froid, filtrage mécanique doux.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Integrated Offline QR Code Presentation */}
          <div className="border-t-2 border-dashed border-brand-gold-500/35 pt-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
            <div className="md:col-span-2 text-left space-y-1.5">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1">
                <QrCode className="w-4 h-4 text-brand-gold-550" />
                Encodage Intégral Autonome (Sans Connexion Internet)
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Le code QR ci-contre intègre l'ensemble des données de traçabilité de manière brute et lisible par n'importe quel scanner mobile. <strong>Aucun lien internet requis, aucune erreur 403 possible.</strong> Vos clients peuvent vérifier l'origine et l'authenticité du lot même dans les zones reculées, hors réseau.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-white p-2.5 rounded-xl border border-brand-gold-500/20 shadow-xs max-w-[130px] mx-auto">
              <QRCanvas text={getOfflineCertificateQrText()} size={110} color="#141852" />
              <span className="text-[8.5px] text-slate-400 font-mono font-bold mt-1 uppercase">Scan Hors-Ligne</span>
            </div>
          </div>

          {/* Stamp and Signatures Section */}
          <div className="border-t-2 border-brand-gold-500/20 pt-5 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10 mt-auto">
            <div className="text-left text-[9.5px] text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-700">ETS LES TRIANGLES AGROBUSINESS • MIELLERIE YAMTAANU</p>
              <p>BP 662 Parakou • Tél : 96 28 54 20 • République du Bénin</p>
              <p>Coopérative de protection de la biodiversité &amp; Récolte Forestière Durable</p>
            </div>

            {/* Official Stamp & Signature */}
            <div className="shrink-0 flex flex-col items-center">
              <img
                src="/assets/aistudio/image_8866b669.png"
                alt="Cachet Officiel Ets Les Triangles Agrobusiness & Signature Le Directeur SARKI Yantannou"
                className="h-24 w-auto object-contain mix-blend-multiply"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )}
</div>
);
}
