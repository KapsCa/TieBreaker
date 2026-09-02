import React from 'react';
import { Scale, History, PlusCircle, Share2, Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenExport?: () => void;
  hasActiveDecision: boolean;
  onOpenPresets?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  onOpenHistory,
  onOpenExport,
  hasActiveDecision,
  onOpenPresets
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#111114]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div 
          onClick={onNewDecision}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform duration-200">
            <Scale className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-display">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-300">Tiebreaker</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                AI Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Rompe el empate y toma decisiones informadas</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenPresets && (
            <button
              onClick={onOpenPresets}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#18181b]/90 hover:bg-[#27272a] border border-slate-800 hover:text-white transition-colors"
              title="Ver ejemplos y plantillas de decisiones comunes"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Plantillas</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#18181b]/90 hover:bg-[#27272a] border border-slate-800 hover:text-white transition-colors"
            title="Historial de decisiones"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Historial</span>
          </button>

          {hasActiveDecision && onOpenExport && (
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-[#1c1c22] hover:bg-[#272730] border border-slate-700/70 transition-colors"
              title="Exportar informe o compartir"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          )}

          {hasActiveDecision && (
            <button
              onClick={onNewDecision}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nueva Decisión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
