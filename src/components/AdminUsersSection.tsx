import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { BambouMielStore } from '../dataStore';
import { AuthorizedUser } from '../types';
import { 
  ShieldCheck, 
  UserPlus, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  HelpCircle,
  Eye,
  EyeOff,
  Smartphone,
  QrCode,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Send,
  Sparkles,
  Info
} from 'lucide-react';

interface AdminUsersSectionProps {
  store: BambouMielStore;
  onRefresh: () => void;
}

export default function AdminUsersSection({ store, onRefresh }: AdminUsersSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthorizedUser | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [emailOrLogin, setEmailOrLogin] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AuthorizedUser['role']>('Employé');
  const [department, setDepartment] = useState<AuthorizedUser['department']>('Général');
  const [accessCode, setAccessCode] = useState('');
  const [active, setActive] = useState(true);

  // Master password state
  const [currentMasterPwd, setCurrentMasterPwd] = useState(() => {
    return localStorage.getItem('yamtaanu_erp_password') || 'yamtaanu';
  });
  const [newMasterPwd, setNewMasterPwd] = useState('');
  const [masterSuccess, setMasterSuccess] = useState(false);
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  // Mobile Access / QR Code Modal State
  const [mobileUser, setMobileUser] = useState<AuthorizedUser | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');

  // Fetch initial master password from server if available
  useEffect(() => {
    fetch('/api/master-pwd')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.masterPassword) {
          setCurrentMasterPwd(data.masterPassword);
          localStorage.setItem('yamtaanu_erp_password', data.masterPassword);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmailOrLogin('');
    setPhone('');
    setRole('Employé');
    setDepartment('Général');
    setAccessCode(Math.floor(1000 + Math.random() * 9000).toString()); // suggest random 4 digit pin
    setActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (u: AuthorizedUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmailOrLogin(u.emailOrLogin);
    setPhone(u.phone || '');
    setRole(u.role);
    setDepartment(u.department);
    setAccessCode(u.accessCode);
    setActive(u.active);
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !emailOrLogin.trim() || !accessCode.trim()) {
      alert('Veuillez remplir le nom, l\'identifiant de connexion et le code secret.');
      return;
    }

    const cleanLogin = emailOrLogin.trim().toLowerCase();
    const cleanAccessCode = accessCode.trim();

    if (editingUser) {
      store.updateAuthorizedUser(editingUser.id, {
        name: name.trim(),
        emailOrLogin: cleanLogin,
        phone: phone.trim() || undefined,
        role,
        department,
        accessCode: cleanAccessCode,
        active
      });
    } else {
      // Check if identifier already exists
      const exists = store.users.some(u => u.emailOrLogin.toLowerCase() === cleanLogin);
      if (exists) {
        alert('Cet identifiant de connexion existe déjà. Veuillez en choisir un autre.');
        return;
      }
      store.addAuthorizedUser({
        name: name.trim(),
        emailOrLogin: cleanLogin,
        phone: phone.trim() || undefined,
        role,
        department,
        accessCode: cleanAccessCode,
        active
      });
    }

    setShowModal(false);
    onRefresh();

    // Trigger explicit server persistence
    try {
      await store.persistUsersToServer();
    } catch (err) {}
  };

  const handleToggleActive = (id: string) => {
    store.toggleAuthorizedUserActive(id);
    onRefresh();
  };

  const handleDelete = (id: string, userName: string) => {
    if (store.users.length <= 1) {
      alert('Action impossible : Vous ne pouvez pas supprimer le dernier utilisateur autorisé du système.');
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'accès de "${userName}" ?`)) {
      store.deleteAuthorizedUser(id);
      onRefresh();
    }
  };

  const handleUpdateMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newMasterPwd.trim();
    if (!clean || clean.length < 4) {
      alert('Le code Master doit contenir au moins 4 caractères.');
      return;
    }
    localStorage.setItem('yamtaanu_erp_password', clean);
    setCurrentMasterPwd(clean);
    setNewMasterPwd('');
    setMasterSuccess(true);
    try {
      await fetch('/api/master-pwd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterPassword: clean })
      });
    } catch (err) {}
    setTimeout(() => setMasterSuccess(false), 4000);
  };

  const togglePinVisibility = (id: string) => {
    setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage('');
    try {
      await store.persistUsersToServer();
      await store.syncUsersWithServer();
      onRefresh();
      setSyncSuccessMessage('✓ Tous les comptes sont synchronisés avec succès avec le serveur et immédiatement disponibles sur les téléphones !');
      setTimeout(() => setSyncSuccessMessage(''), 4500);
    } catch (err) {
      setSyncSuccessMessage('Synchronisation effectuée en cache local.');
      setTimeout(() => setSyncSuccessMessage(''), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Mobile Direct Connection & QR Code Logic
  const getDirectLoginUrl = (user: AuthorizedUser) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${pathname}?login_u=${encodeURIComponent(user.emailOrLogin)}&login_p=${encodeURIComponent(user.accessCode)}`;
  };

  const handleOpenMobileAccess = async (user: AuthorizedUser) => {
    setMobileUser(user);
    setCopiedLink(false);
    const directUrl = getDirectLoginUrl(user);

    try {
      const dataUrl = await QRCode.toDataURL(directUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  };

  const handleCopyDirectLink = (user: AuthorizedUser) => {
    const url = getDirectLoginUrl(user);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      });
    }
  };

  const getWhatsAppShareLink = (user: AuthorizedUser) => {
    const url = getDirectLoginUrl(user);
    const text = `🌿 *Yamtãanu ERP - Votre Accès Collaborateur*\n\nBonjour ${user.name},\nVotre compte a été activé sur le système ERP Yamtãanu :\n\n• Identifiant : *${user.emailOrLogin}*\n• Code PIN : *${user.accessCode}*\n• Rôle : ${user.role} (${user.department})\n\n👉 *Lien de connexion directe sur votre téléphone :*\n${url}\n\n(Cliquez simplement sur ce lien pour vous connecter automatiquement sans risque d'erreur de frappe)`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Top Banner Explaining Authorization & Mobile Sync */}
      <div className="bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-violet-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/20 rounded-full border border-violet-400/30 text-violet-300 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            Sécurité, Téléphones & Contrôle d'Accès ERP
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            Autorisation et Gestion des Utilisateurs
          </h2>
          <p className="text-sm md:text-base text-violet-200 leading-relaxed">
            L'administrateur est le garant de la sécurité de l'entreprise : <strong className="text-amber-300">seules les personnes autorisées ici peuvent accéder à l'ERP</strong>. Dès que vous autorisez un collaborateur, son compte est instantanément synchronisé pour lui permettre de se connecter immédiatement depuis son téléphone ou son ordinateur.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-violet-300 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Synchronisation Téléphone Immédiate</span>
            <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-sky-400" /> Connexion Mobile par QR Code ou Lien WhatsApp</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-amber-400" /> Blocage instantané en un clic</span>
            <span className="flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-violet-400" /> Code PIN individuel sécurisé</span>
          </div>
        </div>
      </div>

      {/* Synchronisation Notification Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 rounded-2xl p-4 text-xs text-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 border border-sky-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white block text-sm">💡 Solution pour la connexion sur téléphone des collaborateurs</span>
            <span className="text-sky-300/90 text-xs">
              Pour éviter les fautes de frappe sur clavier mobile (majuscules automatiques, espaces), utilisez le bouton <strong className="text-amber-300">« 📱 Accès Mobile / QR »</strong> en face de chaque collaborateur pour lui envoyer son lien direct WhatsApp ou lui faire scanner son QR Code !
            </span>
          </div>
        </div>
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronisation...' : 'Synchroniser Tous les Téléphones'}
        </button>
      </div>

      {syncSuccessMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-bold text-center animate-in fade-in">
          {syncSuccessMessage}
        </div>
      )}

      {/* Grid: Left column (Users List), Right column (Master code & Quick Tips) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Authorized Users List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 font-display">
                  <UserCheck className="w-5 h-5 text-violet-600" />
                  Liste du Personnel Autorisé ({store.users.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Seuls les utilisateurs avec le statut <strong className="text-emerald-600">"Autorisé"</strong> peuvent ouvrir l'ERP.
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-600/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                + Autoriser un Utilisateur
              </button>
            </div>

            {store.users.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-700">Aucun utilisateur configuré</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">Cliquez sur le bouton ci-dessus pour autoriser votre premier collaborateur ou administrateur.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {store.users.map((user) => {
                  const isMaster = user.role === 'Administrateur Principal';
                  const showPin = showPins[user.id];

                  return (
                    <div 
                      key={user.id} 
                      className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        !user.active ? 'bg-rose-50/40 opacity-75 px-3 rounded-xl border border-rose-100' : 'hover:bg-gray-50/50 px-2 rounded-xl'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs ${
                          user.active 
                            ? isMaster ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300' : 'bg-violet-100 text-violet-800' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{user.name}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              isMaster 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : user.role === 'Administrateur'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {user.role}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
                              📍 {user.department}
                            </span>
                            {user.phone && (
                              <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                📞 {user.phone}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-600 font-mono flex-wrap">
                            <span>ID / Login : <strong className="text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded select-all">{user.emailOrLogin}</strong></span>
                            <span>•</span>
                            <div className="flex items-center gap-1.5">
                              <span>Code PIN : </span>
                              <strong className="bg-violet-50 text-violet-800 px-1.5 py-0.5 rounded border border-violet-100 select-all">
                                {showPin ? user.accessCode : '••••'}
                              </strong>
                              <button 
                                type="button" 
                                onClick={() => togglePinVisibility(user.id)}
                                className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                                title={showPin ? "Masquer le code" : "Afficher le code pour l'employé"}
                              >
                                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions & Authorizations */}
                      <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                        {/* Mobile Access / QR Code Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenMobileAccess(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer shadow-xs"
                          title="Générer le QR Code ou le lien WhatsApp pour le téléphone du collaborateur"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                          Accès Mobile / QR
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(user.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            user.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                          }`}
                          title={user.active ? "Cliquez pour bloquer cet utilisateur" : "Cliquez pour autoriser à nouveau"}
                        >
                          {user.active ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Autorisé
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5 text-rose-600" />
                              Accès Révoqué
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                          title="Modifier l'utilisateur ou son code"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Supprimer l'accès définitivement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Master Admin Code & Security Notice */}
        <div className="space-y-6">
          {/* Master Admin Security Card */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold border-b border-slate-800 pb-3">
              <KeyRound className="w-5 h-5 shrink-0" />
              <h4 className="text-sm uppercase tracking-wider font-display">Code Master de Secours</h4>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              En plus des comptes individuels ci-contre, un <strong className="text-amber-300 font-mono">Code Master</strong> global permet de se connecter en tant qu'Administrateur Principal en cas d'oubli de login.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Code Master Actuel :</span>
              <span className="text-amber-400 font-bold px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">{currentMasterPwd}</span>
            </div>

            <form onSubmit={handleUpdateMasterPassword} className="space-y-3 pt-1">
              <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                Changer le Code Master Admin :
              </label>
              <input
                type="text"
                placeholder="Nouveau code master (ex: yamtaanu2026)..."
                value={newMasterPwd}
                onChange={(e) => setNewMasterPwd(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Mettre à jour le Code Master
              </button>
            </form>

            {masterSuccess && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold text-center">
                ✓ Code Master mis à jour avec succès !
              </div>
            )}
          </div>

          {/* Help & Good practices for Mobile Access */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200/80 text-amber-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
              <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
              Pourquoi le collaborateur n'arrive pas à se connecter sur son téléphone ?
            </div>
            <ul className="text-xs space-y-2 list-disc list-inside text-amber-800 leading-relaxed font-medium">
              <li><strong>Majuscules automatiques :</strong> Sur les téléphones, la première lettre est souvent mise en majuscule automatiquement (ex: « Jean » au lieu de « jean »). Notre système gère désormais automatiquement la casse.</li>
              <li><strong>Espaces masqués :</strong> La saisie automatique mobile ajoute souvent un espace en fin d'identifiant. Le système le supprime désormais automatiquement.</li>
              <li><strong>Lien direct ou QR Code :</strong> Utilisez le bouton <strong className="text-amber-900">« Accès Mobile / QR »</strong> pour envoyer directement un lien WhatsApp à votre collaborateur : il n'aura rien à taper !</li>
              <li><strong>Code oublié :</strong> Cliquez sur l'icône œil 👁️ pour lui rappeler son code PIN à 4 chiffres.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Modal Add/Edit User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 font-display">
                    {editingUser ? 'Modifier l\'Utilisateur' : 'Autoriser un Nouvel Utilisateur'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Définissez les autorisations et le code secret d'accès
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Nom & Prénom / Fonction *</label>
                <input
                  type="text"
                  placeholder="ex: Jean Orou (Responsable Miellerie)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Identifiant ou Email *</label>
                  <input
                    type="text"
                    placeholder="ex: jean.orou ou admin"
                    value={emailOrLogin}
                    onChange={(e) => setEmailOrLogin(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                  <span className="text-[10px] text-gray-400 block">Sert à se connecter à l'ERP</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Code PIN / Secret *</label>
                  <input
                    type="text"
                    placeholder="ex: 8492"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono font-bold text-violet-800 bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                  <span className="text-[10px] text-gray-400 block">Code à 4 à 8 chiffres ou lettres</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Numéro de Téléphone (Optionnel)</label>
                <input
                  type="tel"
                  placeholder="ex: +229 97 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-[10px] text-gray-400 block">Permet l'envoi WhatsApp de l'accès mobile et la connexion par numéro</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Rôle dans l'entreprise</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="Administrateur Principal">Administrateur Principal (Master)</option>
                    <option value="Administrateur">Administrateur (Gestion totale)</option>
                    <option value="Employé">Employé (Saisie & Suivi)</option>
                    <option value="Opérateur">Opérateur (Consommation rapide)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Département d'affectation</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="Général">Général (Tous secteurs)</option>
                    <option value="Miellerie & Ruchers">Miellerie & Ruchers</option>
                    <option value="Atelier Jus & Thés">Atelier Jus & Thés</option>
                    <option value="Éco-Lodge">Éco-Lodge & Bungalows</option>
                    <option value="Conférences & Événements">Conférences & Événements</option>
                    <option value="Comptabilité">Comptabilité & Ventes</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
                />
                <label htmlFor="userActive" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Compte Actif (Autorisé immédiatement à se connecter sur téléphone et PC)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {editingUser ? 'Enregistrer les Modifications' : 'Autoriser l\'Utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE ACCESS & QR CODE MODAL */}
      {mobileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[95vh] overflow-y-auto text-slate-800 text-center">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 font-display">
                    Accès Téléphone Portable
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Pour : <strong className="text-indigo-600">{mobileUser.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileUser(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block shadow-inner mx-auto">
              {qrDataUrl ? (
                <div className="space-y-2">
                  <img 
                    src={qrDataUrl} 
                    alt={`QR Code de connexion pour ${mobileUser.name}`}
                    className="w-56 h-56 mx-auto rounded-xl shadow-xs"
                  />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Scannez avec l'appareil photo du téléphone
                  </span>
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Génération du code QR...
                </div>
              )}
            </div>

            {/* Login Credentials Summary */}
            <div className="bg-violet-50/70 border border-violet-100 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-violet-900">
                <span className="text-slate-500 font-medium">Identifiant :</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-violet-200 text-violet-800 select-all">
                  {mobileUser.emailOrLogin}
                </span>
              </div>
              <div className="flex justify-between items-center text-violet-900">
                <span className="text-slate-500 font-medium">Code PIN / Secret :</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-violet-200 text-violet-800 select-all">
                  {mobileUser.accessCode}
                </span>
              </div>
              <div className="flex justify-between items-center text-violet-900">
                <span className="text-slate-500 font-medium">Rôle attribué :</span>
                <span className="font-semibold text-slate-700">
                  {mobileUser.role} ({mobileUser.department})
                </span>
              </div>
            </div>

            {/* Action Buttons: WhatsApp & Copy Link */}
            <div className="space-y-2.5">
              <a
                href={getWhatsAppShareLink(mobileUser)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Envoyer le Lien d'Accès par WhatsApp
              </a>

              <button
                type="button"
                onClick={() => handleCopyDirectLink(mobileUser)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Lien copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    Copier le Lien Direct de Connexion Téléphone
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed text-left bg-amber-50 p-3 rounded-xl border border-amber-200/60">
              💡 <strong>Astuce :</strong> Lorsque le collaborateur ouvre ce lien sur son téléphone portable, il est <strong>automatiquement authentifié</strong> sans avoir besoin de taper son mot de passe.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
