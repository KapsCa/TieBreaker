import React from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Briefcase, 
  Home, 
  TrendingUp, 
  Code, 
  GraduationCap 
} from 'lucide-react';
import { DECISION_PRESETS } from '../data/presets';
import { PresetTemplate } from '../types';

interface PresetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetTemplate) => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-4 h-4 text-indigo-400" />,
  Home: <Home className="w-4 h-4 text-indigo-400" />,
  TrendingUp: <TrendingUp className="w-4 h-4 text-indigo-400" />,
  Code: <Code className="w-4 h-4 text-indigo-400" />,
  GraduationCap: <GraduationCap className="w-4 h-4 text-indigo-400" />
};

export const PresetsDrawer: React.FC<PresetsDrawerProps> = ({ isOpen, onClose, onSelectPreset }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#111114] border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0d0d10]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Plantillas de Decisiones Comunes
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona un dilema preconfigurado para probar el motor de análisis de The Tiebreaker.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#18181b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {DECISION_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-4 rounded-xl bg-[#141418] border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all hover:bg-[#181820] group"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {ICONS_MAP[preset.icon] || <Sparkles className="w-3.5 h-3.5" />}
                  {preset.category}
                </span>
                <span className="text-xs text-slate-400 group-hover:text-indigo-300 font-semibold flex items-center gap-1">
                  Cargar plantilla <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                {preset.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {preset.context}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium">Opciones:</span>
                {preset.options.map((opt, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#1d1d24] text-slate-300 border border-slate-700/60"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
