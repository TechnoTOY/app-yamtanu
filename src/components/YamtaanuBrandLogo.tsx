import React from 'react';
import yamtaanuImg from '../assets/images/yamtaanu_official_logo_1790957647714.jpg';

interface YamtaanuBrandLogoProps {
  className?: string;
  variant?: 'banner' | 'badge' | 'compact' | 'horizontal';
  showTagline?: boolean;
}

export default function YamtaanuBrandLogo({
  className = '',
  variant = 'horizontal',
  showTagline = true,
}: YamtaanuBrandLogoProps) {
  if (variant === 'banner') {
    return (
      <div className={`relative overflow-hidden rounded-2xl shadow-md border border-amber-500/20 bg-[#1c184e] p-3 text-white flex flex-col items-center justify-center text-center ${className}`}>
        <img
          src={yamtaanuImg}
          alt="Marque Yamtãanu - Passion pour la nature et le naturel depuis 1990"
          className="w-full max-w-[280px] h-auto object-contain rounded-lg"
        />
        {showTagline && (
          <span className="text-[8.5px] uppercase tracking-widest text-amber-300 font-semibold mt-1">
            Marque Officielle • Depuis 1990
          </span>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-[#1c184e] p-1 border border-amber-400/30 shadow-md ${className}`}>
        <img
          src={yamtaanuImg}
          alt="Yamtãanu Logo"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative shrink-0 w-10 h-10 rounded-xl bg-[#1c184e] p-0.5 border border-amber-400/30 overflow-hidden shadow-sm flex items-center justify-center">
          <img
            src={yamtaanuImg}
            alt="Yamtãanu Logo"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="min-w-0 leading-tight">
          <span className="font-serif font-black text-amber-300 text-sm tracking-wide block truncate">
            Yamtãanu
          </span>
          <span className="text-[7.5px] uppercase tracking-widest text-slate-300 font-semibold block truncate">
            Marque d'Origine • 1990
          </span>
        </div>
      </div>
    );
  }

  // Default: horizontal with brand logo image + company subline
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0 w-12 h-10 rounded-xl bg-[#1c184e] p-0.5 border border-amber-400/40 overflow-hidden shadow-md flex items-center justify-center">
        <img
          src={yamtaanuImg}
          alt="Yamtãanu Logo"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-serif font-black text-white text-base tracking-wide">
            Yamtãanu
          </span>
          <span className="text-[8px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
            MARQUE
          </span>
        </div>
        <span className="text-[7.5px] uppercase tracking-[0.16em] block text-slate-300 font-semibold mt-0.5">
          LES TRIANGLES • Komiguéa (Bénin)
        </span>
      </div>
    </div>
  );
}
