import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Tag, 
  Layers,
  Sparkles
} from 'lucide-react';
import { DecisionAnalysisResult, OptionAnalysis, FactorCategory, TimeframeType } from '../types';

interface ProsConsViewProps {
  analysis: DecisionAnalysisResult;
}

const CATEGORY_LABELS: Record<FactorCategory, string> = {
  cost: 'Financiero / Costo',
  time: 'Tiempo / Velocidad',
  growth: 'Crecimiento / ROI',
  risk: 'Riesgo / Seguridad',
  wellbeing: 'Bienestar / Paz',
  flexibility: 'Flexibilidad',
  general: 'General'
};

export const ProsConsView: React.FC<ProsConsViewProps> = ({ analysis }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');

  const { options } = analysis;

  // Calculate impact sum for each option
  const calculateBalance = (option: OptionAnalysis) => {
    const prosSum = option.pros.reduce((acc, p) => acc + p.impact, 0);
    const consSum = option.cons.reduce((acc, c) => acc + c.impact, 0);
    return { prosSum, consSum, net: prosSum - consSum };
  };

  const filterItem = (item: { category: FactorCategory; timeframe: TimeframeType }) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedTimeframe !== 'all') {
      if (selectedTimeframe === 'short_term' && item.timeframe === 'long_term') return false;
      if (selectedTimeframe === 'long_term' && item.timeframe === 'short_term') return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="p-5 rounded-2xl bg-[#111114] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span>Ventajas y Desventajas (Pros & Contras)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluación punto por punto con nivel de impacto ponderado del 1 al 5.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Timeframe Filter */}
          <div className="flex items-center gap-1.5 bg-[#141418] px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141418]">Todos los plazos</option>
              <option value="short_term" className="bg-[#141418]">Corto plazo</option>
              <option value="long_term" className="bg-[#141418]">Largo plazo</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-[#141418] px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141418]">Todas las categorías</option>
              <option value="cost" className="bg-[#141418]">Financiero / Costo</option>
              <option value="time" className="bg-[#141418]">Tiempo / Velocidad</option>
              <option value="growth" className="bg-[#141418]">Crecimiento / ROI</option>
              <option value="risk" className="bg-[#141418]">Riesgo / Seguridad</option>
              <option value="wellbeing" className="bg-[#141418]">Bienestar / Paz</option>
              <option value="flexibility" className="bg-[#141418]">Flexibilidad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Options Side by Side / Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {options.map((option, idx) => {
          const balance = calculateBalance(option);
          const filteredPros = option.pros.filter(filterItem);
          const filteredCons = option.cons.filter(filterItem);
          const isWinner = option.id === analysis.tiebreakerVerdict.winnerOptionId;

          return (
            <div
              key={option.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                isWinner
                  ? 'bg-[#111114] border-indigo-500/40 shadow-xl shadow-indigo-500/10'
                  : 'bg-[#111114] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Option Header Banner */}
              <div className="p-5 border-b border-slate-800 bg-[#0d0d10]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#18181b] text-indigo-300 text-xs font-bold flex items-center justify-center border border-slate-700">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <h3 className="text-lg font-bold text-white font-display">
                      {option.title}
                    </h3>
                  </div>

                  {isWinner && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                      ★ Ganador
                    </span>
                  )}
                </div>

                {option.tagline && (
                  <p className="text-xs text-slate-400 mb-3 italic">
                    "{option.tagline}"
                  </p>
                )}

                {/* Net Balance Pill */}
                <div className="flex items-center justify-between text-xs bg-[#141418] px-3 py-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Balance de Impacto:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> +{balance.prosSum}
                    </span>
                    <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" /> -{balance.consSum}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      balance.net > 0 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : balance.net < 0 
                        ? 'bg-rose-500/20 text-rose-300' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      Neto: {balance.net > 0 ? `+${balance.net}` : balance.net}
                    </span>
                  </div>
                </div>
              </div>

              {/* Columns for Pros and Cons */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Pros Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ventajas ({filteredPros.length})</span>
                  </div>

                  {filteredPros.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No hay ventajas con los filtros aplicados.
                    </p>
                  ) : (
                    filteredPros.map((pro) => (
                      <div
                        key={pro.id}
                        className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {CATEGORY_LABELS[pro.category] || pro.category}
                          </span>
                          <div className="flex items-center gap-1" title={`Impacto positivo: +${pro.impact}/5`}>
                            <span className="text-[10px] font-bold text-emerald-400">+{pro.impact}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <div
                                  key={lvl}
                                  className={`w-1.5 h-2.5 rounded-xs ${
                                    pro.impact >= lvl ? 'bg-emerald-400' : 'bg-slate-800'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {pro.text}
                        </p>

                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {pro.timeframe === 'short_term'
                              ? 'Efecto a Corto Plazo'
                              : pro.timeframe === 'long_term'
                              ? 'Efecto a Largo Plazo'
                              : 'Corto y Largo Plazo'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cons Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 pb-2 border-b border-rose-500/20">
                    <XCircle className="w-4 h-4" />
                    <span>Desventajas ({filteredCons.length})</span>
                  </div>

                  {filteredCons.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No hay desventajas con los filtros aplicados.
                    </p>
                  ) : (
                    filteredCons.map((con) => (
                      <div
                        key={con.id}
                        className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            {CATEGORY_LABELS[con.category] || con.category}
                          </span>
                          <div className="flex items-center gap-1" title={`Impacto negativo: -${con.impact}/5`}>
                            <span className="text-[10px] font-bold text-rose-400">-{con.impact}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <div
                                  key={lvl}
                                  className={`w-1.5 h-2.5 rounded-xs ${
                                    con.impact >= lvl ? 'bg-rose-400' : 'bg-slate-800'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {con.text}
                        </p>

                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {con.timeframe === 'short_term'
                              ? 'Efecto a Corto Plazo'
                              : con.timeframe === 'long_term'
                              ? 'Efecto a Largo Plazo'
                              : 'Corto y Largo Plazo'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
