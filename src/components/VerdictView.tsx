import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  Compass, 
  Layers, 
  ShieldCheck, 
  ListChecks,
  Repeat
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';

interface VerdictViewProps {
  analysis: DecisionAnalysisResult;
  onNavigateTab: (tab: 'pros_cons' | 'matrix' | 'swot' | 'simulator' | 'devils_advocate') => void;
}

export const VerdictView: React.FC<VerdictViewProps> = ({ analysis, onNavigateTab }) => {
  const { tiebreakerVerdict, options, summary } = analysis;
  const winner = options.find((o) => o.id === tiebreakerVerdict.winnerOptionId) || options[0];

  useEffect(() => {
    // Launch a subtle celebratory confetti when verdict loads
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#38bdf8']
      });
    } catch (e) {
      // Ignored if in restricted context
    }
  }, [analysis.id]);

  return (
    <div className="space-y-6">
      {/* 1. Winner Crown / Spotlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 via-[#111114] to-[#0a0a0c] border-2 border-indigo-500/40 p-6 sm:p-8 shadow-2xl shadow-indigo-500/10">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-indigo-400" />
              <span>Opción Ganadora Recomendada</span>
            </div>

            <div className="flex items-center gap-2 bg-[#18181b] px-3.5 py-1 rounded-full border border-slate-700/80">
              <span className="text-xs text-slate-400">Nivel de Confianza:</span>
              <span className="text-sm font-bold text-indigo-300 font-display">
                {tiebreakerVerdict.confidencePercentage}%
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display mb-2">
            {winner.title}
          </h2>
          {winner.tagline && (
            <p className="text-sm sm:text-base text-indigo-200/90 font-medium mb-4">
              "{winner.tagline}"
            </p>
          )}

          {/* Deciding Factor Pill */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 mt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">
                  El Factor Decisivo (The Tiebreaker):
                </h4>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {tiebreakerVerdict.theDecidingFactor}
                </p>
              </div>
            </div>
          </div>

          {/* Core Reasoning */}
          <div className="mt-5 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>{tiebreakerVerdict.coreReason}</p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/90 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#141418] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Puntuación Global</span>
              <span className="text-xl font-bold text-emerald-400 font-display">
                {winner.overallScore}/100
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141418] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Ventajas Clave</span>
              <span className="text-xl font-bold text-emerald-400 font-display">
                {winner.pros.length} Pros
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141418] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Riesgos Identificados</span>
              <span className="text-xl font-bold text-rose-400 font-display">
                {winner.cons.length} Contras
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141418] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Plan de Mitigación</span>
              <span className="text-xl font-bold text-indigo-300 font-display">
                {winner.mitigationPlan?.length || 3} Pasos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Summary & Dilemma Context */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 bg-[#111114]">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Resumen Ejecutivo del Análisis</span>
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* 3. Scenario Switches ("¿Cuándo elegir otra opción?") */}
      {tiebreakerVerdict.conditionScenarios && tiebreakerVerdict.conditionScenarios.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 bg-[#111114]">
          <div className="flex items-center gap-2 mb-4">
            <Repeat className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              ¿Cuándo cambiaría el ganador? (Escenarios Condicionales)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tiebreakerVerdict.conditionScenarios.map((scenario, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-[#141418] border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    Si tu prioridad cambia a:
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-2 font-medium">
                  "{scenario.condition}"
                </p>
                <div className="text-xs flex items-center gap-1.5 text-indigo-300 font-semibold pt-1 border-t border-slate-800">
                  <span>Opción recomendada:</span>
                  <span className="text-white">{scenario.recommendedOptionTitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Two Columns: Blind Spots & Action Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blind spots */}
        <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-950/15">
          <div className="flex items-center gap-2 mb-3 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Puntos Ciegos y Sesgos a Evitar
            </h3>
          </div>
          <ul className="space-y-2.5">
            {tiebreakerVerdict.blindSpots.map((spot, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>{spot}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Immediate Next Steps */}
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/15">
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <ListChecks className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Pasos Inmediatos para Ejecutar
            </h3>
          </div>
          <ul className="space-y-2.5">
            {tiebreakerVerdict.immediateNextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Deep-dive navigation cards */}
      <div className="p-5 rounded-2xl bg-[#111114] border border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Explora la evidencia en detalle:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onNavigateTab('pros_cons')}
            className="p-3.5 rounded-xl bg-[#141418] hover:bg-[#1a1a22] border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
          >
            <span className="text-xs font-bold text-emerald-400 block group-hover:translate-x-0.5 transition-transform">
              Pros y Contras →
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Listado con impactos ±1 a ±5
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('matrix')}
            className="p-3.5 rounded-xl bg-[#141418] hover:bg-[#1a1a22] border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
          >
            <span className="text-xs font-bold text-indigo-400 block group-hover:translate-x-0.5 transition-transform">
              Tabla Comparativa →
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Matriz de criterios y puntuaciones
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('swot')}
            className="p-3.5 rounded-xl bg-[#141418] hover:bg-[#1a1a22] border border-slate-800 hover:border-indigo-400 text-left transition-all group"
          >
            <span className="text-xs font-bold text-indigo-300 block group-hover:translate-x-0.5 transition-transform">
              Análisis FODA →
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              4 cuadrantes por opción
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('devils_advocate')}
            className="p-3.5 rounded-xl bg-[#141418] hover:bg-[#1a1a22] border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
          >
            <span className="text-xs font-bold text-purple-400 block group-hover:translate-x-0.5 transition-transform">
              Abogado del Diablo →
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Test de estrés y preguntas difíciles
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
