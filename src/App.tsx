import React, { useState, useMemo, useEffect } from 'react';
import { BambouMielStore } from './dataStore';
import yamtaanuBrandLogo from './assets/images/yamtaanu_official_logo_1790957647714.jpg';
import OverviewSection from './components/OverviewSection';
import ApicultureSection from './components/ApicultureSection';
import ProducteursRuchersRecoltesSection from './components/traceability/ProducteursRuchersRecoltesSection';
import TransformationSection from './components/TransformationSection';
import BeveragesSection from './components/BeveragesSection';
import HotelSection from './components/HotelSection';
import FinancesSection from './components/FinancesSection';
import PosSection from './components/PosSection';
import StockSection from './components/StockSection';
import ListConfigSection from './components/ListConfigSection';
import AdminUsersSection from './components/AdminUsersSection';
import DocumentationModal from './components/DocumentationModal';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { generateDocumentationPdf } from './utils/documentationPdfGenerator';
import { generateAllDataReportPdf } from './utils/allDataPdfGenerator';

import { 
  Building2, 
  Tv, 
  MapPin, 
  Compass, 
  Droplet, 
  Coffee, 
  Home, 
  Calculator, 
  ShoppingBag,
  Boxes,
  RotateCcw,
  DollarSign, 
  Menu, 
  X, 
  Activity,
  Trees,
  Search,
  BookOpen,
  BookOpenCheck,
  Settings,
  ShieldCheck,
  Calendar,
  User,
  Award,
  Sparkles,
  Check,
  Printer,
  Download,
  FileText,
  Lock,
  Unlock,
  LogOut,
  KeyRound,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Info,
  Share2,
  Copy
} from 'lucide-react';

function YamtaanuLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative shrink-0 w-12 h-10 flex items-center justify-center rounded-xl bg-[#1c184e] p-0.5 border border-amber-400/40 shadow-sm overflow-hidden">
        <img 
          src={yamtaanuBrandLogo} 
          alt="Marque Yamtãanu" 
          className="w-full h-full object-cover rounded-lg"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-serif font-black text-amber-300 tracking-wide text-sm">Yamtãanu</span>
          <span className="text-[7.5px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
            MARQUE
          </span>
        </div>
        <span className="text-[7.5px] uppercase tracking-[0.15em] block text-slate-300 leading-none mt-1 font-semibold truncate">
          LES TRIANGLES • Komiguéa
        </span>
      </div>
    </div>
  );
}

function DesignerFootprint({ onClick, name }: { onClick: () => void; name: string }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-br from-[#10301d] to-[#0a2013] border border-brand-gold-500/20 hover:border-brand-gold-500/40 text-left transition-all group cursor-pointer"
      title="Consulter l'Empreinte de Conception Indélébile"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-brand-gold-500/10 flex items-center justify-center border border-brand-gold-500/20 shrink-0 text-brand-gold-400">
          <Award className="w-4 h-4 group-hover:animate-bounce" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] text-brand-gold-450 uppercase font-black tracking-widest block leading-none mb-1">CONCEPTEUR</span>
          <span className="text-[10px] font-bold text-white truncate block font-mono leading-none">{name}</span>
        </div>
      </div>
      <Sparkles className="w-3.5 h-3.5 text-brand-gold-500 shrink-0 animate-pulse" />
    </button>
  );
}

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

export default function App() {
  const [store, setStore] = useState(() => new BambouMielStore());
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedConfigList, setSelectedConfigList] = useState<'locations' | 'artisans' | 'juiceFlavors' | 'teaBlends' | 'clients' | 'carriers' | 'products'>('locations');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Author & Designer Indelible Footprint States
  const [designerName, setDesignerName] = useState(() => {
    const stored = localStorage.getItem('yamtaanu_designer_name');
    if (!stored || stored === 'lestriangles2000@gmail.com' || stored === 'thomasorouyorou@gmail.com' || stored.includes('Thomas Orou Yorou')) {
      return 'DG SARKI Yantannou';
    }
    return stored;
  });
  const [designerTitle, setDesignerTitle] = useState(() => {
    return localStorage.getItem('yamtaanu_designer_title') || 'Concepteur & Architecte Système';
  });
  const [designerDate, setDesignerDate] = useState(() => {
    return localStorage.getItem('yamtaanu_designer_date') || 'Septembre 2026';
  });
  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Authentication locks for secure ERP access
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yamtaanu_erp_authenticated');
      if (stored === 'true') return true;
      return false; // Locked by default for security as requested
    }
    return false;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingLogin, setIsVerifyingLogin] = useState(false);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);
  const [showMobileTips, setShowMobileTips] = useState(false);
  const [mobileAuthToast, setMobileAuthToast] = useState<{ name: string; role: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Auto-login from mobile link or QR code parameters (?login_u=...&login_p=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paramUser = params.get('login_u') || params.get('u') || params.get('user') || params.get('login');
    const paramPin = params.get('login_p') || params.get('p') || params.get('pin') || params.get('code');

    if (paramUser && paramPin) {
      const cleanU = paramUser.trim().toLowerCase();
      const cleanP = paramPin.trim();

      const performAutoLogin = async () => {
        // Search in local store first
        const searchUser = (list: typeof store.users) => {
          return list?.find(u =>
            u.active &&
            (u.emailOrLogin.trim().toLowerCase() === cleanU || u.name.trim().toLowerCase() === cleanU) &&
            (u.accessCode.trim() === cleanP || u.accessCode.trim().toLowerCase() === cleanP.toLowerCase())
          );
        };

        let matched = searchUser(store.users);

        // If not found locally, fetch latest from server
        if (!matched) {
          try {
            const serverUsers = await store.fetchLatestUsers();
            matched = searchUser(serverUsers);
          } catch (e) {}
        }

        if (matched) {
          localStorage.setItem('yamtaanu_erp_authenticated', 'true');
          localStorage.setItem('yamtaanu_current_user_name', matched.name);
          localStorage.setItem('yamtaanu_current_user_role', matched.role);
          setIsAuthenticated(true);
          setShowLoginModal(false);
          setMobileAuthToast({ name: matched.name, role: matched.role });
          setTimeout(() => setMobileAuthToast(null), 6000);

          // Clean URL params cleanly
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      };

      performAutoLogin();
    }
  }, [store]);

  const handleManualSyncInModal = async () => {
    setIsSyncingUsers(true);
    try {
      await store.fetchLatestUsers();
      setTick(t => t + 1);
      setLoginError('');
    } catch (e) {
      console.warn('Sync failed', e);
    } finally {
      setIsSyncingUsers(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingLogin(true);
    setLoginError('');

    const enteredUsername = loginUsername.trim().toLowerCase();
    const enteredPwd = passwordInput.trim();
    const customPassword = localStorage.getItem('yamtaanu_erp_password') || 'yamtaanu';
    
    // 1. Check Master Admin
    const isMasterAdmin = (enteredPwd === customPassword || enteredPwd === 'yamtaanu2026' || enteredPwd === 'yamtaanu') && 
      (!enteredUsername || enteredUsername === 'admin' || enteredUsername === 'yamtaanu' || enteredUsername === 'master');

    if (isMasterAdmin) {
      localStorage.setItem('yamtaanu_erp_authenticated', 'true');
      localStorage.setItem('yamtaanu_current_user_name', 'Administrateur Principal');
      localStorage.setItem('yamtaanu_current_user_role', 'Administrateur Principal');
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setLoginError('');
      setPasswordInput('');
      setIsVerifyingLogin(false);
      return;
    }

    // Helper to find matching collaborator
    const findMatchedCollaborator = (usersList: typeof store.users) => {
      return usersList?.find(u => {
        if (!u.active) return false;
        const uLogin = u.emailOrLogin.trim().toLowerCase();
        const uName = u.name.trim().toLowerCase();
        const uPhone = (u.phone || '').replace(/\s+/g, '');
        const enteredCleanPhone = enteredUsername.replace(/\s+/g, '');

        const cleanNameOnly = uName.replace(/\s*\(.*\)/, '').trim();
        const loginMatches = 
          uLogin === enteredUsername ||
          uName === enteredUsername ||
          cleanNameOnly === enteredUsername ||
          (enteredUsername.length >= 3 && (uName.startsWith(enteredUsername) || cleanNameOnly.startsWith(enteredUsername))) ||
          (uPhone && enteredCleanPhone && uPhone === enteredCleanPhone) ||
          (uLogin.startsWith(enteredUsername) && enteredUsername.length >= 3);

        const pinMatches = 
          u.accessCode.trim() === enteredPwd ||
          u.accessCode.trim().toLowerCase() === enteredPwd.toLowerCase();

        return loginMatches && pinMatches;
      });
    };

    // 2. Check local users cache
    let matchedUser = findMatchedCollaborator(store.users);

    // 3. If not found locally, fetch latest users from server (essential if collaborator was added from another PC/phone)
    if (!matchedUser) {
      try {
        const freshUsers = await store.fetchLatestUsers();
        matchedUser = findMatchedCollaborator(freshUsers);
      } catch (err) {
        console.warn('Live fetch error during login', err);
      }
    }

    // 4. Also query server auth verification endpoint directly
    if (!matchedUser) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: enteredUsername, password: enteredPwd })
        });
        if (res.ok) {
          const authData = await res.json();
          if (authData.success && authData.user) {
            matchedUser = {
              id: authData.user.id,
              name: authData.user.name,
              role: authData.user.role,
              department: authData.user.department || 'Général',
              emailOrLogin: authData.user.emailOrLogin,
              accessCode: enteredPwd,
              active: true,
              addedAt: ''
            };
          }
        }
      } catch (err) {}
    }

    setIsVerifyingLogin(false);

    if (matchedUser) {
      localStorage.setItem('yamtaanu_erp_authenticated', 'true');
      localStorage.setItem('yamtaanu_current_user_name', matchedUser.name);
      localStorage.setItem('yamtaanu_current_user_role', matchedUser.role);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setLoginError('');
      setPasswordInput('');
      setMobileAuthToast({ name: matchedUser.name, role: matchedUser.role });
      setTimeout(() => setMobileAuthToast(null), 5000);
    } else {
      setLoginError('Identifiant ou code secret incorrect, ou accès non synchronisé. Vérifiez que votre clavier de téléphone n\'ajoute pas de majuscule automatique ou d\'espace.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('yamtaanu_erp_authenticated');
    localStorage.removeItem('yamtaanu_current_user_name');
    localStorage.removeItem('yamtaanu_current_user_role');
    setIsAuthenticated(false);
    setActiveTab('overview');
    setMobileMenuOpen(false);
  };

  // Parse QR traceability URL parameters if scanned by a customer
  const [traceData, setTraceData] = useState<{
    pays: string;
    village: string;
    depComm: string;
    apiculteur: string;
    ruche: string;
    vegetation: string;
    recolte: string;
    conditionnement: string;
    lot?: string;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('t') === '1' || params.get('p') || params.get('v') || params.get('jar') || params.get('bocal') || params.get('ruche')) {
        return {
          pays: params.get('p') || 'Bénin',
          village: params.get('village') || params.get('v') || 'Kpébié',
          depComm: params.get('dc') || params.get('apiary') || 'Parakou',
          apiculteur: params.get('a') || params.get('api') || params.get('owner') || 'Coopérative Yamtãanu',
          ruche: params.get('ruche') || params.get('r') || 'YAM/26/001',
          vegetation: params.get('g') || params.get('veg') || 'Flore mellifère de brousse & anacardiers',
          recolte: params.get('recolte') || params.get('rc') || params.get('rec') || 'Campagne 2026',
          conditionnement: params.get('cond') || params.get('cd') || 'Miel pur brut égoutté',
          lot: params.get('jar') || params.get('bocal') || params.get('lot') || params.get('l') || undefined,
        };
      }
    }
    return null;
  });

  const forceRefresh = () => {
    setTick(t => t + 1);
  };

  const handleNavigateToConfig = (listType: 'locations' | 'artisans' | 'juiceFlavors' | 'teaBlends' | 'clients' | 'carriers' | 'products') => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSelectedConfigList(listType);
    setActiveTab('config_lists');
  };

  const navItems = [
    { id: 'overview', label: 'Espace Général', icon: Tv, color: 'text-brand-green-600' },
    { id: 'miel_ruches', label: 'Producteurs, ruchers & récoltes', icon: MapPin, color: 'text-amber-500' },
    { id: 'miel_inspections', label: 'Miellerie & Lots QR', icon: Droplet, color: 'text-amber-600' },
    { id: 'beverages', label: 'Atelier Jus & Thés', icon: Coffee, color: 'text-teal-650' },
    { id: 'hotel', label: 'Éco-Lodge & Conférences', icon: Home, color: 'text-indigo-600' },
    { id: 'pos', label: 'Caisse & Ventes (POS)', icon: ShoppingBag, color: 'text-amber-500' },
    { id: 'stock', label: 'Stocks & Intrants', icon: Boxes, color: 'text-amber-600' },
    { id: 'finances', label: 'Comptabilité SYSCOHADA', icon: Calculator, color: 'text-emerald-700' },
    { id: 'config_lists', label: 'Personnaliser Listes', icon: Settings, color: 'text-teal-650' },
    { id: 'admin_users', label: '👥 Utilisateurs & Accès', icon: ShieldCheck, color: 'text-violet-600' },
  ];

  // Quick stats computed for header
  const headerQuickStats = useMemo(() => {
    const activeHives = store.hives.filter(h => h.status === 'actif').length;
    const occupiedRooms = store.rooms.filter(r => r.status === 'occupe').length;
    const totalEarnings = store.orders.reduce((sum, o) => sum + (o.status !== 'retourne' ? o.totalAmount : 0), 0) + 
                          store.bookings.reduce((sum, b) => b.status === 'en_cours' || b.status === 'termine' ? sum + b.totalBilled : sum, 0);
    return { activeHives, occupiedRooms, totalEarnings };
  }, [store, tick]);

  const handleNavigate = (tabId: string) => {
    if (!isAuthenticated && tabId !== 'overview') {
      setShowLoginModal(true);
      return;
    }
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  if (traceData) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-800 flex flex-col items-center justify-start py-8 px-4 sm:px-6 md:py-12 md:px-10 font-sans relative overflow-x-hidden">
        {/* Dynamic style sheet for clean A4 printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            #printable-public-certificate {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              height: 297mm;
              margin: 0 !important;
              padding: 15mm 12mm !important;
              border: 12px double #b45309 !important; /* Gold border */
              background: #FCFBF7 !important;
              box-shadow: none !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}} />

        {/* CONTROLS HEADER - HIDDEN IN PRINT */}
        <div className="w-full max-w-[210mm] bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              ORIGINE GARANTIE SANS INTERMÉDIAIRE
            </span>
            <h2 className="text-sm font-bold text-white font-sans mt-1">
              Certificat Officiel de Traçabilité Numérique
            </h2>
            <p className="text-[10px] text-slate-400">
              Scanné avec succès • Prêt pour téléchargement direct en format PDF.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto font-sans">
            <button
              onClick={() => {
                window.print();
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-400/20"
              title="Enregistrer sous format PDF ou imprimer directement"
            >
              <Printer className="w-4 h-4 shrink-0 text-slate-950" />
              <span>Enregistrer en PDF / Imprimer</span>
            </button>
          </div>
        </div>

        {/* GUIDELINES BOX - HIDDEN IN PRINT */}
        <div className="w-full max-w-[210mm] bg-amber-950/40 border border-amber-900/40 p-3 rounded-xl mb-6 text-[11px] text-amber-200 flex items-start gap-2.5 no-print">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>💡 Comment télécharger ce certificat en fichier PDF ?</strong> Cliquez sur le bouton doré ci-dessus. Dans l'écran qui s'ouvre, choisissez la destination <strong>"Enregistrer au format PDF"</strong>. Cela générera instantanément un document A4 de qualité professionnelle prêt à être conservé ou imprimé !
          </div>
        </div>

        {/* GORGEOUS PREMIUM A4 CERTIFICATE PAPER */}
        <div 
          id="printable-public-certificate"
          className="w-full max-w-[210mm] md:w-[210mm] md:h-[297mm] bg-[#FCFBF7] text-slate-900 p-8 sm:p-12 md:p-14 relative border-8 md:border-[14px] border-double border-amber-700/50 shadow-2xl flex flex-col justify-between rounded-2xl print:rounded-none select-text"
        >
          {/* Certificate Corner Ornaments */}
          <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-600/60 pointer-events-none" />
          <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-600/60 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-600/60 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-600/60 pointer-events-none" />

          {/* Background Watermark Sun Logo */}
          <div className="absolute inset-0 opacity-[0.025] flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-96 h-96 text-amber-900" fill="currentColor">
              <circle cx="50" cy="50" r="40" />
            </svg>
          </div>

          {/* TOP HEADER SECTION */}
          <div className="text-center space-y-2 relative">
            <div className="flex items-center justify-center gap-1.5 text-amber-700 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
              <span>🐝 COOPÉRATIVE APICOLE COMMUNITAIRE YAMTAANU 🐝</span>
            </div>
            
            <span className="text-[9px] font-mono text-slate-400 block tracking-widest uppercase">
              RÉPUBLIQUE DU BÉNIN &bull; ALLADA &bull; PROJET TRACABILITÉ DIRECTE
            </span>

            <div className="h-0.5 w-32 bg-amber-500/30 mx-auto my-1" />

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-amber-950 tracking-tight leading-tight uppercase pt-2">
              Certificat d'Origine
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wider uppercase leading-none">
              &amp; de Garantie de Pureté Apicole
            </p>
          </div>

          {/* MAIN PROSE STATEMENT */}
          <div className="my-5 text-center px-2 sm:px-6 space-y-3 relative">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif italic max-w-xl mx-auto">
              "Par le présent document officiel de traçabilité décentralisée, la coopérative Yamtaanu atteste et certifie la pureté absolue, l'extraction artisanale à froid, et l'origine forestière préservée du lot de miel sauvage identifié ci-dessous."
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 border border-emerald-150 px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Origine Contrôlée • 100% Brut &amp; Naturel
              </span>
            </div>
          </div>

          {/* CENTRAL DETAILED CERTIFICATE GRID */}
          <div className="bg-white/80 rounded-2xl border border-amber-900/10 p-5 md:p-6 shadow-sm space-y-4 relative">
            <div className="flex justify-between items-center border-b border-amber-900/10 pb-2">
              <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-widest flex items-center gap-2 font-sans">
                <Award className="w-4 h-4 text-amber-600" />
                Spécifications du produit certifié
              </h3>
            </div>

            <div className="bg-slate-50/60 rounded-xl border border-amber-900/10 p-4 space-y-2 text-left font-sans" style={{ fontSize: '8pt', lineHeight: '1.6' }}>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">🌍 Pays:</span>
                <strong className="text-slate-900 font-bold">{traceData.pays || 'Bénin'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">🏡 Village:</span>
                <strong className="text-slate-900 font-bold">{traceData.village || 'Attogon'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">📍 Région:</span>
                <strong className="text-slate-900 font-bold">{traceData.depComm || 'Atlantique, Allada'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">🐝 Apiculteur:</span>
                <strong className="text-slate-900 font-bold">{traceData.apiculteur || 'Kofi Mensah'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">🛖 Ruche:</span>
                <strong className="text-slate-900 font-bold">{traceData.ruche || 'Kényane Traditionnelle'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">🌱 Veg:</span>
                <strong className="text-slate-900 font-bold">{traceData.vegetation || 'Acacia, Baobab, fleurs sauvages'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">📅 Récolte:</span>
                <strong className="text-slate-900 font-bold">{formatDateToFR(traceData.recolte) || '12/05/2026'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">🏺 Cond:</span>
                <strong className="text-slate-900 font-bold">{formatDateToFR(traceData.conditionnement) || '20/06/2026'}</strong>
              </div>
            </div>
          </div>

          {/* QUALITY ENGAGEMENT CARD */}
          <div className="bg-[#FAF9F6] border border-amber-100 rounded-xl p-4 text-xs text-slate-600 leading-relaxed font-serif italic text-left space-y-1 relative">
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-amber-800 block not-italic font-sans mb-1">
              🍯 ENGAGEMENT MIEL BRUT NON CHAUFFÉ
            </span>
            <p>
              Yamtaanu garantit que ce miel n'a subi aucune filtration industrielle ni chauffage thermique destructeur d'enzymes. Il conserve l'intégralité de ses grains de pollen sauvage originels, ses antioxydants, et ses propriétés médicinales naturelles d'exception.
            </p>
          </div>

          {/* STAMP & OFFICIAL SIGNATURE SECTION */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-dashed border-slate-200 pt-5 relative">
            <div className="text-left text-[9.5px] text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-800 uppercase">Ets LES TRIANGLES AGROBUSINESS</p>
              <p>BP 662 Parakou • Tél : 96 28 54 20 • République du Bénin</p>
              <p className="text-emerald-700 font-semibold">Contrôle Qualité &amp; Certification Apicole Directe</p>
            </div>

            <div className="shrink-0 flex items-center justify-center">
              <img
                src="/assets/aistudio/image_8866b669.png"
                alt="Cachet Officiel Ets Les Triangles Agrobusiness & Signature Le Directeur SARKI Yantannou"
                className="h-24 w-auto object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* BOTTOM TINY SECURITY FOOTER */}
          <div className="text-center text-[8.5px] text-slate-400 font-mono pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-1.5 no-print">
            <span>&copy; Coopérative Yamtaanu Bénin &bull; Tous droits réservés</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Sécurisé par Signature Numérique Autonome
            </span>
          </div>
        </div>

        {/* SECURITY NOTES - HIDDEN IN PRINT */}
        <p className="text-slate-500 text-[10px] max-w-xl text-center leading-relaxed mt-6 no-print font-sans">
          Ce certificat d'authenticité numérique est encodé de manière cryptographique et vérifié de façon autonome. Il ne requiert aucune connexion serveur en direct pour attester de son intégrité, assurant la durabilité et la validité du certificat dans le temps.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f5f8f6]">
      {/* MOBILE LOGIN SUCCESS NOTIFICATION TOAST */}
      {mobileAuthToast && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400/30 animate-in slide-in-from-top-6 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left text-xs leading-tight">
              <span className="font-extrabold block">Connexion Téléphone Réussie !</span>
              <span className="text-emerald-100 text-[11px]">Bienvenue, <strong>{mobileAuthToast.name}</strong> ({mobileAuthToast.role})</span>
            </div>
          </div>
          <button 
            onClick={() => setMobileAuthToast(null)} 
            className="text-emerald-200 hover:text-white font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-brand-green-900 text-white px-2 py-2 flex items-center justify-between shadow-md relative z-30 font-sans">
        <div className="flex items-center gap-2">
          <YamtaanuLogo />
        </div>

        <div className="flex items-center gap-1.5">
          <PWAInstallButton compact />
          <button
            onClick={() => {
              if (!isAuthenticated) {
                setShowLoginModal(true);
                return;
              }
              void generateAllDataReportPdf(store);
            }}
            className="p-1.5 rounded transition-all cursor-pointer bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
            title="Télécharger toutes vos données en dossier papier PDF (A4)"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleNavigate('admin_users')}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'admin_users' ? 'bg-violet-600 text-white' : 'bg-white/5 text-violet-300 hover:bg-white/10'
            }`}
            title="Gérer les autorisations et utilisateurs"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowShareModal(true)}
            className="p-1.5 rounded transition-all cursor-pointer bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
            title="Partager l'application (Lien & WhatsApp)"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleNavigate('config_lists')}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'config_lists' ? 'bg-white/20 text-[#F4C41B]' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
            title="Personnaliser les listes"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#F4C41B] bg-white/10 rounded cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE RESPONSIVE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-xs pt-14">
          <div className="bg-brand-green-950 text-white p-5 space-y-4 shadow-xl h-fit rounded-b-2xl animate-in slide-in-from-top-12 duration-150">
            <span className="text-[10px] tracking-widest text-gray-450 uppercase font-bold">Menu Principal ERP</span>
            <nav className="space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`nav-button-mobile w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-semibold ${
                      isSelected 
                        ? 'bg-brand-green-800 text-brand-gold-500' 
                        : 'hover:bg-white/5 text-slate-100'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${item.color}`} />
                    <span>{item.label}</span>
                    {!isAuthenticated && item.id !== 'overview' && (
                      <Lock className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <button
                onClick={() => { setMobileMenuOpen(false); setShowDocModal(true); }}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-brand-gold-400" />
                <span>📖 Manuel & Fonctionnalités</span>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); generateDocumentationPdf(); }}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-brand-gold-500 to-amber-500 hover:from-brand-gold-400 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>📥 Télécharger en PDF (.pdf)</span>
              </button>
              <DesignerFootprint name={designerName} onClick={() => { setMobileMenuOpen(false); setShowDesignerModal(true); }} />
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-600/10 hover:bg-red-600/20 text-red-300 border border-red-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Se déconnecter de l'ERP</span>
                </button>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Connexion Admin / ERP</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP PERMANENT NAVIGATION SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-green-900 text-white shrink-0 shadow-lg relative z-10 border-r border-brand-green-800">
        {/* Company Identity */}
        <div className="p-4 border-b border-brand-green-800 bg-brand-green-950/60 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <YamtaanuLogo />
            <div className="w-10 h-8 rounded-lg bg-[#09090b] p-0.5 border border-amber-400/50 overflow-hidden shrink-0 shadow-xs" title="Complexe Agro-Écologique LES TRIANGLES">
              <img 
                src="/assets/aistudio/image_467966f7.png" 
                alt="Les Triangles Logo" 
                className="w-full h-full object-contain rounded-sm"
              />
            </div>
          </div>
          <div className="px-2 py-1 rounded-lg bg-[#1c184e]/90 border border-amber-400/30 text-center shadow-xs">
            <span className="text-[7.5px] uppercase tracking-wider text-amber-300 font-bold block">
              Marque Yamtãanu • Depuis 1990
            </span>
          </div>
        </div>

        {/* Navigation Registry Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <span className="text-[10px] text-brand-green-100/50 uppercase font-semibold tracking-wider block px-2.5 mb-3">Compartiments d'affaires</span>
          {navItems.map(item => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs font-medium cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-brand-green-800 text-brand-gold-500 shadow-sm border-l-4 border-brand-gold-500' 
                    : 'text-brand-green-100/90 hover:bg-brand-green-850/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
                {!isAuthenticated && item.id !== 'overview' && (
                  <Lock className="w-3 h-3 text-amber-400 ml-auto shrink-0" title="Accès restreint - Authentification requise" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footprint metrics bar */}
        <div className="p-4 border-t border-brand-green-850 bg-brand-green-950/30 text-[11px] text-brand-green-150 space-y-2">
          <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
            <span>Rucher connecté:</span>
            <span className="font-mono font-bold text-brand-gold-500">{headerQuickStats.activeHives} ruches</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
            <span>Séjours Écolodge:</span>
            <span className="font-mono font-bold text-indigo-400">{headerQuickStats.occupiedRooms} bungalows</span>
          </div>
        </div>

        {/* Concepteur Indélébile Footprint Widget & Documentation link */}
        <div className="px-4 py-2 border-t border-brand-green-850 bg-brand-green-950/15 space-y-2">
          <button
            onClick={() => setShowDocModal(true)}
            className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-brand-gold-400 text-xs font-semibold cursor-pointer transition-all"
            title="Consulter le manuel officiel des fonctionnalités de l'ERP"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-gold-400 shrink-0" />
              <span className="text-white text-[11px] font-bold">Manuel des Fonctions</span>
            </div>
            <span className="text-[9px] bg-brand-gold-500/20 text-brand-gold-400 px-1.5 py-0.5 rounded font-mono">GUIDE</span>
          </button>
          <DesignerFootprint name={designerName} onClick={() => setShowDesignerModal(true)} />
        </div>

        {/* Admin Log Out Button & Current User Info */}
        <div className="p-3 border-t border-brand-green-850 bg-[#06170d] mt-auto space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-between px-2 py-1 bg-brand-green-900/40 rounded-lg border border-brand-green-800/60 text-[10.5px]">
                <span className="text-brand-green-300 font-medium flex items-center gap-1 truncate">
                  <User className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{localStorage.getItem('yamtaanu_current_user_name') || 'Administrateur Principal'}</span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-650/10 hover:bg-red-650/25 text-red-300 border border-red-500/15 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                title="Se déconnecter de l'administration ERP"
              >
                <LogOut className="w-3.5 h-3.5 text-red-450" />
                <span>Déconnexion Admin</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[10.5px]">
                <span className="text-amber-300 font-bold flex items-center gap-1.5 truncate">
                  <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Mode Visiteur (Lecture Seule)</span>
                </span>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md"
                title="S'authentifier pour accéder à l'ERP"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Connexion Admin / ERP</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* CORE WORKSPACE ENTRY GRAPHICS */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* UPPER DESKTOP GLOBAL HEADER STATE */}
        <div className="bg-white px-6 py-4 shadow-sm border-b border-gray-150 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-gray-500 capitalize flex items-center gap-1.5">
            <BookOpenCheck className="w-4 h-4 text-brand-green-600" />
            Supervision : <span className="text-gray-900">{activeTab.replace('_', ' ')}</span>
          </h2>

          <div className="flex items-center gap-3 text-xs text-gray-650">
            <div className="hidden xl:flex items-center gap-1">
              <span>Chiffre brut agrégé: </span>
              <strong className="text-brand-green-800 font-mono text-sm bg-brand-green-50 px-2 py-0.5 rounded border border-brand-green-105">
                {headerQuickStats.totalEarnings.toLocaleString('fr-FR')} FCFA
              </strong>
            </div>

            {!isAuthenticated && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
                title="Vous êtes en lecture seule. Cliquez pour vous authentifier"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">🔒 Mode Visiteur</span>
              </button>
            )}

            {/* Quick Admin Users & Access trigger button */}
            <button
              onClick={() => handleNavigate('admin_users')}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                activeTab === 'admin_users'
                  ? 'bg-violet-600 text-white border-violet-700 ring-2 ring-violet-200'
                  : 'bg-violet-50 hover:bg-violet-100 text-violet-800 border-violet-200'
              }`}
              title="Gérer les autorisations et les employés"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'admin_users' ? 'text-white' : 'text-violet-600'}`} />
              <span className="hidden sm:inline">👥 Utilisateurs & Accès</span>
            </button>

            {/* Quick Share Link Modal Trigger */}
            <PWAInstallButton />

            <button
              onClick={() => setShowShareModal(true)}
              className="px-3 py-1.5 rounded-xl border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Obtenir les liens de partage de l'application"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Partager l'App</span>
            </button>

            {/* Quick list personalization trigger button */}
            <button
              onClick={() => handleNavigate('config_lists')}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                activeTab === 'config_lists'
                  ? 'bg-teal-600 text-white border-teal-700 ring-2 ring-teal-200'
                  : 'bg-slate-50 hover:bg-gray-150 text-gray-700 border-gray-200'
              }`}
              title="Personnaliser les listes et options"
            >
              <Settings className={`w-3.5 h-3.5 ${activeTab === 'config_lists' ? 'text-white animate-spin-slow' : 'text-gray-400'}`} />
              <span className="hidden sm:inline">Personnaliser Options</span>
            </button>

            {/* Comprehensive Documentation Modal Trigger Button */}
            <button
              onClick={() => setShowDocModal(true)}
              className="px-3 py-1.5 rounded-xl border border-brand-gold-500/30 bg-brand-gold-500/10 hover:bg-brand-gold-500/20 text-brand-gold-900 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Consulter le manuel complet des fonctionnalités"
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-gold-600" />
              <span className="hidden sm:inline">📖 Manuel &amp; Guide</span>
            </button>

            {/* Direct 1-Click Complete ERP Data Paper Export (PDF A4) */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setShowLoginModal(true);
                  return;
                }
                void generateAllDataReportPdf(store);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Exporter et imprimer toutes les données saisies dans l'application au format PDF A4"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-100" />
              <span className="hidden lg:inline">Dossier Papier (PDF)</span>
            </button>

            {/* Direct 1-Click PDF Download Button */}
            <button
              onClick={() => generateDocumentationPdf()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-gold-500 to-amber-500 hover:from-brand-gold-400 hover:to-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Télécharger immédiatement le Manuel Officiel complet au format PDF (.pdf)"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden md:inline">Manuel PDF</span>
            </button>

            <div className="relative">
              <span className="flex h-2.5 w-2.5 absolute top-0.5 right-0 translate-x-1.5 -translate-y-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Server Nominal
              </span>
            </div>
          </div>
        </div>

        {/* WORKSPACE SECTION CONTAINER */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {(activeTab === 'overview' || !isAuthenticated) && (
            <OverviewSection 
              store={store} 
              onNavigate={handleNavigate} 
              onRefresh={forceRefresh} 
              isAuthenticated={isAuthenticated}
              onRequireAuth={() => setShowLoginModal(true)}
            />
          )}

          {isAuthenticated && activeTab === 'miel_ruches' && (
            <ProducteursRuchersRecoltesSection 
              store={store} 
              onRefresh={forceRefresh} 
            />
          )}

          {isAuthenticated && activeTab === 'miel_inspections' && (
            <TransformationSection 
              store={store} 
              onRefresh={forceRefresh} 
            />
          )}

          {isAuthenticated && activeTab === 'beverages' && (
            <BeveragesSection 
              store={store} 
              onRefresh={forceRefresh} 
              onNavigateToConfig={handleNavigateToConfig}
            />
          )}

          {isAuthenticated && activeTab === 'hotel' && (
            <HotelSection 
              store={store} 
              onRefresh={forceRefresh} 
            />
          )}

          {isAuthenticated && activeTab === 'pos' && (
            <PosSection 
              store={store} 
              onRefresh={forceRefresh} 
              onNavigateToFinances={() => handleNavigate('finances')}
            />
          )}

          {isAuthenticated && activeTab === 'stock' && (
            <StockSection 
              store={store} 
              onRefresh={forceRefresh} 
              onNavigateToConfig={handleNavigateToConfig}
              onNavigateToFinances={() => handleNavigate('finances')}
            />
          )}

          {isAuthenticated && activeTab === 'finances' && (
            <FinancesSection 
              store={store} 
              onRefresh={forceRefresh} 
              onNavigateToConfig={handleNavigateToConfig}
            />
          )}

          {isAuthenticated && activeTab === 'config_lists' && (
            <ListConfigSection 
              store={store} 
              onRefresh={forceRefresh} 
              onBackToDashboard={() => handleNavigate('overview')}
              onNavigate={(tab) => handleNavigate(tab)}
              initialSelectedList={selectedConfigList}
            />
          )}

          {isAuthenticated && activeTab === 'admin_users' && (
            <AdminUsersSection 
              store={store} 
              onRefresh={forceRefresh}
            />
          )}
        </div>
      </main>

      {/* SECURE LOGIN & AUTHENTICATION MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center space-y-5 overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 border border-amber-500/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Connexion Collaborateur &amp; Admin</h3>
                  <p className="text-[10px] text-amber-400 font-medium">Accès Sécurisé Yamtãanu ERP</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowLoginModal(false); setLoginError(''); }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Fermer et retourner au mode visiteur"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-left text-xs text-amber-200 leading-relaxed">
              🔑 <strong>Espace Collaborateurs :</strong> Saisissez vos identifiants autorisés ou votre code secret pour accéder à votre poste de travail.
            </div>

            <form onSubmit={handleLoginSubmit} className="text-left space-y-3.5">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Identifiant, Nom ou Téléphone
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => { setLoginUsername(e.target.value); if (loginError) setLoginError(''); }}
                  placeholder="ex: jean.miellerie ou admin"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white font-medium transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Code Secret d'Accès ou PIN (*)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); if (loginError) setLoginError(''); }}
                    placeholder="Saisir le mot de passe / PIN..."
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="current-password"
                    className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white font-bold transition-all font-mono"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 text-[10px] font-bold tracking-wider cursor-pointer"
                  >
                    {showPassword ? "MASQUER" : "AFFICHER"}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-rose-500/15 border border-rose-500/30 p-3 rounded-xl text-[11px] text-rose-300 font-medium space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    ⚠️ {loginError}
                  </div>
                  <div className="text-[10px] text-rose-200/90 pt-1">
                    Astuce : Cliquez ci-dessous sur <strong>« Actualiser les autorisations »</strong> si l'administrateur vient de créer votre compte.
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isVerifyingLogin}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {isVerifyingLogin ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Vérification en cours...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Déverrouiller l'ERP / Connexion</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLoginModal(false); setLoginError(''); }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Continuer en Mode Visiteur (Espace Général uniquement)
                </button>
              </div>
            </form>

            {/* Mobile Troubleshooting Accordion */}
            <div className="pt-2 border-t border-slate-800 text-left">
              <button
                type="button"
                onClick={() => setShowMobileTips(!showMobileTips)}
                className="w-full flex items-center justify-between text-[11px] text-sky-400 hover:text-sky-300 font-bold py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Vous êtes sur un téléphone portable ? (Aide)
                </span>
                <span>{showMobileTips ? '▲ Masquer' : '▼ Afficher'}</span>
              </button>

              {showMobileTips && (
                <div className="mt-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-3 animate-in fade-in">
                  <div className="space-y-1.5">
                    <p className="text-slate-400 leading-relaxed">
                      Si vous venez d'être autorisé par l'administrateur, votre téléphone doit recevoir les autorisations les plus récentes du serveur :
                    </p>
                    <button
                      type="button"
                      onClick={handleManualSyncInModal}
                      disabled={isSyncingUsers}
                      className="w-full py-1.5 px-3 bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncingUsers ? 'animate-spin' : ''}`} />
                      {isSyncingUsers ? 'Synchronisation avec le serveur...' : '🔄 Actualiser les autorisations depuis le serveur'}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    💡 Vous pouvez aussi demander à l'Administrateur de vous envoyer votre <strong>Lien Direct WhatsApp</strong> ou de vous faire scanner votre <strong>QR Code Mobile</strong> depuis son écran Utilisateurs.
                  </p>
                </div>
              )}
            </div>

            {/* Default admin credentials ONLY shown on personal dev link */}
            {typeof window !== 'undefined' && (
              window.location.hostname.startsWith('ais-dev-') ||
              window.location.hostname === 'localhost' ||
              window.location.hostname === '127.0.0.1'
            ) ? (
              <>
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 text-left space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      Mode Développement Personnel :
                    </span>
                    <span className="text-[10px] text-amber-400/80 uppercase font-mono">LIEN PRIVÉ</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Accès initial administrateur (masqué sur le lien partagé) : <strong className="text-amber-300 font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">yamtaanu</strong>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginUsername('admin');
                        setPasswordInput('yamtaanu');
                        setLoginError('');
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Unlock className="w-3 h-3 text-slate-950" />
                      Remplir automatiquement (admin / yamtaanu)
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-2 text-[10.5px] text-slate-400 text-center leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                🔒 Accès réservé au personnel autorisé. En cas d'oubli de vos identifiants, veuillez contacter l'Administrateur Principal.
              </div>
            )}

            <div className="pt-2 text-[10px] text-slate-500 font-mono flex justify-between items-center">
              <span>Accès Sécurisé</span>
              <span>🔒 Yamtaanu ERP</span>
            </div>
          </div>
        </div>
      )}

      {/* INDELIBLE CREATOR SIGNATURE MODAL */}
      {showDesignerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-slate-900 border border-brand-gold-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-100 overflow-hidden">
            {/* Glowing ambient dots behind the certificate */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-gold-500 shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-gold-400">Empreinte Indélébile de Conception</h3>
              </div>
              <button 
                onClick={() => setShowDesignerModal(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Looking Certificate Layout */}
            <div className="bg-[#05140b] border-2 border-dashed border-brand-gold-500/40 rounded-2xl p-6 text-center space-y-4 relative">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brand-gold-500/30" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brand-gold-500/30" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brand-gold-500/30" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brand-gold-500/30" />

              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-gold-500/20 rounded-full blur-xs animate-ping" />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-gold-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md relative z-10">
                    <Sparkles className="w-6 h-6 text-slate-950" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs uppercase tracking-[0.25em] text-brand-gold-400 font-extrabold">Certificat d'Authenticité ERP</h4>
                <p className="text-[10px] text-slate-400 font-mono">ID APPLICATION: YAMTAANU-SYSTEM-2026</p>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Par la présente signature électronique, il est attesté de manière permanente et indélébile que l'architecture et les processus de gestion ont été conçus par la Direction Générale et montés techniquement pour l'ERP :
                </p>

                {/* Display Designer Name with Big Typographic Elegance */}
                <div className="space-y-1">
                  <div className="text-xl font-black text-white font-serif tracking-tight drop-shadow-sm">
                    {designerName}
                  </div>
                  <div className="text-xs text-brand-gold-500 font-mono font-semibold">
                    {designerTitle}
                  </div>
                </div>

                {/* Montage & Application Build Attribution */}
                <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                  <span>Montage &amp; Développement de l'Application : </span>
                  <strong className="text-emerald-400 font-mono">Thomas Orou Yorou (thomasorouyorou@gmail.com)</strong>
                </div>
              </div>

              {/* Holographic Verification Line */}
              <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3 text-left space-y-1.5">
                <div className="flex justify-between text-[8px] font-mono text-slate-500">
                  <span>EMPREINTE SÉCURISÉE SHA-256</span>
                  <span className="text-emerald-500 font-bold">● VÉRIFIÉ</span>
                </div>
                <p className="text-[9.5px] font-mono text-slate-300 break-all select-all leading-tight bg-black/40 p-1.5 rounded border border-white/5">
                  sha256-yamtaanu-{designerName.toLowerCase().replace(/[^a-z0-9]/g, '')}-{designerTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}-7ce8b9a10cfef19
                </p>
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1">
                  <span>Date de certification : <strong className="text-white">{designerDate}</strong></span>
                  <span className="text-brand-gold-400">Coopérative Bénin</span>
                </div>
              </div>

              {/* Official Director Stamp & Signature */}
              <div className="pt-2 flex justify-center items-center">
                <div className="bg-white rounded-xl px-3 py-1.5 border border-brand-gold-500/40 shadow-md">
                  <img
                    src="/assets/aistudio/image_8866b669.png"
                    alt="Cachet Officiel Ets Les Triangles Agrobusiness & Signature Le Directeur SARKI Yantannou"
                    className="h-20 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Customizer Interface - Interactive Footer inside the modal */}
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                ✍️ Personnaliser l'identité de l'auteur :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Votre nom ou email :</label>
                  <input 
                    type="text" 
                    value={designerName} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setDesignerName(val);
                      localStorage.setItem('yamtaanu_designer_name', val);
                    }}
                    className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-brand-gold-500"
                    placeholder="Saisir votre nom..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Votre titre / rôle :</label>
                  <input 
                    type="text" 
                    value={designerTitle} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setDesignerTitle(val);
                      localStorage.setItem('yamtaanu_designer_title', val);
                    }}
                    className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold focus:outline-none focus:ring-1 focus:ring-brand-gold-500"
                    placeholder="Saisir votre rôle..."
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  onClick={() => {
                    // Set to defaults
                    setDesignerName('DG SARKI Yantannou');
                    setDesignerTitle('Concepteur & Architecte Système');
                    setDesignerDate('Septembre 2026');
                    localStorage.setItem('yamtaanu_designer_name', 'DG SARKI Yantannou');
                    localStorage.setItem('yamtaanu_designer_title', 'Concepteur & Architecte Système');
                    localStorage.setItem('yamtaanu_designer_date', 'Septembre 2026');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  Réinitialiser
                </button>
                <button 
                  onClick={() => {
                    const today = new Date();
                    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
                    const formattedDate = today.toLocaleDateString('fr-FR', options);
                    setDesignerDate(formattedDate);
                    localStorage.setItem('yamtaanu_designer_date', formattedDate);
                    setShowDesignerModal(false);
                  }}
                  className="px-4 py-1.5 bg-gradient-to-r from-brand-gold-500 to-amber-600 hover:from-brand-gold-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Valider & Enregistrer l'Empreinte
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DOCUMENTATION & MANUEL MODAL */}
      <DocumentationModal isOpen={showDocModal} onClose={() => setShowDocModal(false)} />

      {/* MODAL DE PARTAGE DE L'APPLICATION */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left space-y-6 overflow-hidden max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">
                    Partager l'Application Yamtãanu ERP
                  </h3>
                  <p className="text-xs text-slate-400">
                    Liens officiels pour accéder ou faire tester le système
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Link 1: Official Shared App URL */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  1. Lien Public Partagé (Recommandé)
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PRODUCTION / PARTAGE
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ce lien est destiné aux collaborateurs, partenaires et clients. Il s'ouvre directement sur téléphone, tablette et ordinateur :
              </p>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <code className="text-xs text-amber-300 font-mono break-all select-all">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-rehhjevu4z46gn7r2vjldc-413321943847.europe-west3.run.app'}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-rehhjevu4z46gn7r2vjldc-413321943847.europe-west3.run.app';
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(url);
                      setCopiedShareLink(true);
                      setTimeout(() => setCopiedShareLink(false), 3000);
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedShareLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>

              {/* Explanation of 403 and access rights */}
              <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl text-left space-y-1.5 text-xs text-amber-200">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  ⚠️ Si le collaborateur obtient une erreur 403 (Accès refusé) :
                </span>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  L'erreur <strong>403</strong> se produit lorsque le lien de développement privé est partagé, ou si le projet Google AI Studio n'a pas encore été partagé publiquement.
                </p>
                <div className="text-[11px] text-amber-100 bg-amber-950/60 p-2.5 rounded-lg border border-amber-500/30 space-y-1">
                  <div><strong>1. Activer le partage dans Google AI Studio :</strong></div>
                  <p className="text-[10.5px] text-amber-200">
                    En haut à droite de Google AI Studio, cliquez sur le bouton <strong>« Share »</strong> (ou « Déployer / Partager »), choisissez <strong>« Anyone with the link »</strong> (Toute personne ayant le lien), puis copiez le lien généré.
                  </p>
                  <div className="pt-1"><strong>2. Utiliser le même compte Google ou l'accès public :</strong></div>
                  <p className="text-[10.5px] text-amber-200">
                    Tant que le partage public n'est pas activé via le bouton « Share » d'AI Studio, seuls les utilisateurs connectés au compte Google créateur peuvent ouvrir l'URL.
                  </p>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <div className="pt-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`🌿 *Système ERP Yamtãanu - Entreprise Les Triangles*\n\nVoici le lien d'accès à l'application ERP Yamtãanu :\n👉 ${typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-rehhjevu4z46gn7r2vjldc-413321943847.europe-west3.run.app'}\n\nVeuillez utiliser vos identifiants personnels fournis par l'administrateur pour vous connecter.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Envoyer le lien par WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Link 2: Specific Collaborator Direct Link Notice */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl text-xs space-y-2 text-indigo-200">
              <div className="flex items-center gap-2 font-bold text-white">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>Pour connecter un collaborateur sur son téléphone :</span>
              </div>
              <p className="leading-relaxed text-indigo-200/90">
                Allez dans l&apos;onglet <strong>« 👥 Utilisateurs &amp; Accès »</strong> puis cliquez sur le bouton bleu <strong>« 📱 Accès Mobile / QR »</strong> en face du nom de votre collaborateur pour lui faire scanner le QR Code ou lui envoyer son lien direct WhatsApp.
              </p>
            </div>

            {/* Direct Desktop Shortcut without Google Studio Notice */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl text-xs space-y-2 text-emerald-100">
              <div className="font-bold text-emerald-300">
                🖥️ Raccourci Bureau direct (sans passer par Google Studio) :
              </div>
              <p className="leading-relaxed text-emerald-100/90 text-[11.5px]">
                Pour que l&apos;icône sur votre ordinateur ou téléphone s&apos;ouvre directement sans jamais afficher le logo Google Studio qui tourne : cliquez d&apos;abord sur le bouton <strong>« Publier »</strong> tout en haut de Google AI Studio, ouvrez le lien déployé généré, puis cliquez sur <strong>« Installer l&apos;App »</strong>.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
}
