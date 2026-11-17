import React, { useState } from 'react';
import { MonitorDown, WifiOff, X, ExternalLink, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-950/95 border border-amber-500/40 px-4 py-2.5 text-xs font-bold text-amber-200 shadow-2xl backdrop-blur-md"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Mode Hors-Ligne — Données locales actives, synchronisation automatique au retour du réseau.</span>
    </div>
  );
}

export function PWAInstallButton({ compact = false }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, isAIStudioProxy, promptInstall } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    // If running on AI Studio preview/dev proxy, warn user first so they don't create another proxy shortcut
    if (isAIStudioProxy) {
      setShowGuide(true);
      return;
    }

    if (isInstallable) {
      const result = await promptInstall();
      if (result === 'unavailable') {
        setShowGuide(true);
      }
      return;
    }

    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          compact
            ? 'p-1.5 rounded transition-all cursor-pointer bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
            : 'px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs'
        }
        title="Installer Yamtãanu ERP comme application directe sur Bureau ou Mobile"
      >
        <MonitorDown className={compact ? 'w-4 h-4' : 'w-3.5 h-3.5 text-emerald-700'} />
        {!compact && <span className="hidden lg:inline">Installer l&apos;App</span>}
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-sans">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="Icône Yamtãanu"
                  className="w-11 h-11 rounded-xl border border-amber-400/40 shadow-sm shrink-0"
                />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Installer Yamtãanu ERP en accès direct
                  </h3>
                  <p className="text-xs text-slate-400">
                    Icône officielle sur le Bureau / Écran d&apos;accueil sans passer par Google Studio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAIStudioProxy && (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-2 text-xs text-amber-100">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Important : Vous êtes actuellement sur un lien de prévisualisation Google AI Studio</span>
                </div>
                <p className="leading-relaxed text-amber-200/90">
                  Les liens de prévisualisation (<code className="bg-black/30 px-1 rounded">ais-pre-...</code> ou <code className="bg-black/30 px-1 rounded">ais-dev-...</code>) passent toujours par Google AI Studio et peuvent se bloquer sur le logo qui tourne quand la session se met en veille.
                </p>
                <div className="rounded-xl bg-amber-950/70 border border-amber-500/30 p-3 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Comment obtenir l&apos;ouverture directe sur votre Bureau :</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-100">
                    <li>Supprimez l&apos;ancien raccourci Chrome du bureau s&apos;il affiche un « Y » gris.</li>
                    <li>En haut de Google AI Studio, cliquez sur le bouton <strong>« Publier »</strong> pour déployer l&apos;application sur son adresse Cloud Run définitive (<code className="bg-black/30 px-1 rounded">*.run.app</code> sans <code className="bg-black/30 px-1 rounded">ais-pre-</code>).</li>
                    <li>Ouvrez ce <strong>lien publié</strong> dans Chrome ou Edge (l&apos;application s&apos;ouvrira immédiatement, sans jamais afficher le logo Google Studio).</li>
                    <li>Cliquez ensuite sur <strong>« Installer l&apos;App »</strong> (ou sur l&apos;icône <strong>Installer</strong> à droite de la barre d&apos;adresse Chrome) pour créer la vraie icône <strong>Yamtãanu</strong> sur votre bureau.</li>
                  </ol>
                </div>
              </div>
            )}

            {isIOS ? (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <span>Installation sur iPhone / iPad (Safari)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11.5px] leading-relaxed">
                  <li>Appuyez sur le bouton <strong>Partager</strong> (carré avec une flèche vers le haut) en bas de Safari.</li>
                  <li>Faites défiler et touchez <strong>« Sur l&apos;écran d&apos;accueil »</strong>.</li>
                  <li>Confirmez en appuyant sur <strong>« Ajouter »</strong> en haut à droite.</li>
                </ol>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Installation sur Ordinateur (Chrome / Edge) ou Android</span>
                </div>
                {isInstallable && !isAIStudioProxy ? (
                  <button
                    type="button"
                    onClick={() => {
                      void promptInstall();
                      setShowGuide(false);
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MonitorDown className="w-4 h-4" />
                    <span>Lancer l&apos;installation directe sur cet appareil</span>
                  </button>
                ) : (
                  <ol className="list-decimal list-inside space-y-1.5 text-[11.5px] leading-relaxed">
                    <li>Sur Chrome / Edge (Ordinateur) : cliquez sur l&apos;icône <strong>Installer Yamtãanu</strong> à droite de la barre d&apos;adresse (ou Menu <strong>⋮ → Enregistrer et partager → Installer Yamtãanu...</strong>).</li>
                    <li>Sur Android (Chrome) : Menu <strong>⋮ → Ajouter à l&apos;écran d&apos;accueil / Installer l&apos;application</strong>.</li>
                    <li>L&apos;application aura alors sa propre fenêtre et le logo officiel <strong>Yamtãanu</strong>.</li>
                  </ol>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
