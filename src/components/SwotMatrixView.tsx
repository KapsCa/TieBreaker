import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  Flame, 
  Target, 
  Lightbulb, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';

interface SwotMatrixViewProps {
  analysis: DecisionAnalysisResult;
}

export const SwotMatrixView: React.FC<SwotMatrixViewProps> = ({ analysis }) => {
  const { options } = analysis;
  const [selectedOptionId, setSelectedOptionId] = useState<string>(options[0]?.id || '');

  const currentOption = options.find((o) => o.id === selectedOptionId) || options[0];

  return (
    <div className="space-y-6">
      {/* Header & Option Switcher Tabs */}
      <div className="p-5 rounded-2xl bg-[#111114] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Target className="w-4 h-4" />
            </span>
            <span>Matriz de Análisis FODA / SWOT</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluación estratégica de factores internos (Fortalezas y Debilidades) y externos (Oportunidades y Amenazas).
          </p>
        </div>

        {/* Option Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0d0d10] border border-slate-800 self-stretch md:self-auto overflow-x-auto">
          {options.map((opt, idx) => {
            const isSelected = opt.id === currentOption.id;
            const isWinner = opt.id === analysis.tiebreakerVerdict.winnerOptionId;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#18181b]'
                }`}
              >
                <span>{opt.title}</span>
                {isWinner && (
                  <span className={`text-[10px] px-1 rounded ${
                    isSelected ? 'bg-white/20 text-white font-bold' : 'text-indigo-400'
                  }`}>
                    ★
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Option Tagline */}
      <div className="p-4 rounded-xl bg-[#111114] border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
            Analizando FODA para:
          </span>
          <h3 className="text-base font-bold text-white font-display mt-0.5">
            {currentOption.title}
          </h3>
          {currentOption.tagline && (
            <p className="text-xs text-slate-400 italic mt-0.5">"{currentOption.tagline}"</p>
          )}
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Puntaje Global</span>
          <span className="text-lg font-bold text-indigo-300 font-display">
            {currentOption.overallScore}/100
          </span>
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quadrant 1: Fortalezas (Strengths) - Internal Positive */}
        <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/25 p-5 flex flex-col justify-between shadow-lg shadow-emerald-950/20">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300 font-display">
                    Fortalezas (F)
                  </h4>
                  <span className="text-[10px] text-emerald-400/80 font-medium">
                    Factores internos y ventajas competitivas
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                {currentOption.swot.strengths.length}
              </span>
            </div>

            <ul className="space-y-2.5">
              {currentOption.swot.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quadrant 2: Oportunidades (Opportunities) - External Positive */}
        <div className="rounded-2xl bg-indigo-950/20 border border-indigo-500/25 p-5 flex flex-col justify-between shadow-lg shadow-indigo-950/20">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-300 font-display">
                    Oportunidades (O)
                  </h4>
                  <span className="text-[10px] text-indigo-400/80 font-medium">
                    Tendencias y factores externos favorables
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                {currentOption.swot.opportunities.length}
              </span>
            </div>

            <ul className="space-y-2.5">
              {currentOption.swot.opportunities.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quadrant 3: Debilidades (Weaknesses) - Internal Negative */}
        <div className="rounded-2xl bg-amber-950/20 border border-amber-500/25 p-5 flex flex-col justify-between shadow-lg shadow-amber-950/20">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300 font-display">
                    Debilidades (D)
                  </h4>
                  <span className="text-[10px] text-amber-400/80 font-medium">
                    Limitaciones internas o vulnerabilidades
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {currentOption.swot.weaknesses.length}
              </span>
            </div>

            <ul className="space-y-2.5">
              {currentOption.swot.weaknesses.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quadrant 4: Amenazas (Threats) - External Negative */}
        <div className="rounded-2xl bg-rose-950/20 border border-rose-500/25 p-5 flex flex-col justify-between shadow-lg shadow-rose-950/20">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-300 font-display">
                    Amenazas (A)
                  </h4>
                  <span className="text-[10px] text-rose-400/80 font-medium">
                    Riesgos externos fuera de control directo
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                {currentOption.swot.threats.length}
              </span>
            </div>

            <ul className="space-y-2.5">
              {currentOption.swot.threats.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Strategic FODA Tips & Action Guidance */}
      {currentOption.swot.strategicTips && currentOption.swot.strategicTips.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#111114] border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3 text-indigo-400">
            <Lightbulb className="w-4 h-4" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Estrategias Cruzadas FODA para {currentOption.title}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentOption.swot.strategicTips.map((tip, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#141418] border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  #{i + 1}
                </span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mitigation Plan for this option */}
      {currentOption.mitigationPlan && currentOption.mitigationPlan.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#111114] border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Plan de Mitigación de Riesgos para esta opción</span>
          </h4>
          <div className="space-y-2">
            {currentOption.mitigationPlan.map((plan, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{plan}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
