import React from 'react';
import { 
  X, 
  History, 
  Trash2, 
  ArrowRight, 
  Trophy, 
  Calendar, 
  Layers 
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionAnalysisResult[];
  onSelectDecision: (decision: DecisionAnalysisResult) => void;
  onDeleteDecision: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#111114] border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0d0d10]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Historial de Decisiones Guardadas
              </h3>
              <p className="text-xs text-slate-400">
                {savedDecisions.length} {savedDecisions.length === 1 ? 'decisión guardada' : 'decisiones guardadas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedDecisions.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                title="Borrar todo el historial"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vaciar todo</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#18181b] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDecisions.length === 0 ? (
            <div className="py-12 text-center">
              <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 text-sm font-semibold">Aún no hay decisiones guardadas</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Cada vez que analices un dilema con The Tiebreaker, quedará guardado automáticamente aquí para tu consulta futura.
              </p>
            </div>
          ) : (
            savedDecisions.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#141418] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div
                    onClick={() => {
                      onSelectDecision(item);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer min-w-0"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span className="text-slate-400">{item.options.length} opciones</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {item.input.title}
                    </h4>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                      <Trophy className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="font-semibold text-slate-300">Ganador:</span>
                      <span className="font-bold text-white truncate">
                        {item.tiebreakerVerdict.winnerOptionTitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <button
                      onClick={() => {
                        onSelectDecision(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDecision(item.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Eliminar del historial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
