import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  Trophy, 
  Zap, 
  TrendingUp, 
  Flame, 
  Heart, 
  DollarSign, 
  Shield 
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';

interface WeightSimulatorViewProps {
  analysis: DecisionAnalysisResult;
}

export const WeightSimulatorView: React.FC<WeightSimulatorViewProps> = ({ analysis }) => {
  const { comparisonMatrix, options, tiebreakerVerdict } = analysis;

  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    comparisonMatrix.criteria.forEach((c) => {
      init[c.id] = c.weight || 3;
    });
    return init;
  });

  const handleSliderChange = (criteriaId: string, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const handleApplyPreset = (presetType: 'finance' | 'wellbeing' | 'growth' | 'risk_free' | 'reset') => {
    if (presetType === 'reset') {
      const init: Record<string, number> = {};
      comparisonMatrix.criteria.forEach((c) => {
        init[c.id] = c.weight || 3;
      });
      setWeights(init);
      return;
    }

    const updated: Record<string, number> = {};
    comparisonMatrix.criteria.forEach((c) => {
      const name = c.name.toLowerCase();
      if (presetType === 'finance') {
        if (name.includes('cost') || name.includes('dinero') || name.includes('financ') || name.includes('económ') || name.includes('salario') || name.includes('ingreso')) {
          updated[c.id] = 5;
        } else {
          updated[c.id] = 2;
        }
      } else if (presetType === 'wellbeing') {
        if (name.includes('paz') || name.includes('bienestar') || name.includes('vida') || name.includes('estrés') || name.includes('tiempo') || name.includes('familia') || name.includes('flexib')) {
          updated[c.id] = 5;
        } else {
          updated[c.id] = 2;
        }
      } else if (presetType === 'growth') {
        if (name.includes('crecimiento') || name.includes('aprendiz') || name.includes('roi') || name.includes('largo plazo') || name.includes('futuro') || name.includes('carrera') || name.includes('escalab')) {
          updated[c.id] = 5;
        } else {
          updated[c.id] = 2;
        }
      } else if (presetType === 'risk_free') {
        if (name.includes('riesgo') || name.includes('seguridad') || name.includes('estabil') || name.includes('certeza')) {
          updated[c.id] = 5;
        } else {
          updated[c.id] = 2;
        }
      }
    });

    setWeights(updated);
  };

  // Compute live scores
  const computeScores = () => {
    let totalWeight = 0;
    (Object.values(weights) as number[]).forEach((w) => {
      totalWeight += Number(w) || 0;
    });

    return options.map((opt) => {
      let scoreSum = 0;
      comparisonMatrix.criteria.forEach((crit) => {
        const w = weights[crit.id] ?? 3;
        const rawScore = comparisonMatrix.scores[opt.id]?.[crit.id] ?? 5;
        scoreSum += rawScore * w;
      });

      const normalized = totalWeight > 0 ? (scoreSum / (totalWeight * 10)) * 100 : 0;
      return {
        ...opt,
        simulatedScore: Math.round(normalized * 10) / 10
      };
    }).sort((a, b) => b.simulatedScore - a.simulatedScore);
  };

  const simulatedOptions = computeScores();
  const currentLeader = simulatedOptions[0];
  const initialWinnerId = tiebreakerVerdict.winnerOptionId;
  const isWinnerChanged = currentLeader && currentLeader.id !== initialWinnerId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#111114] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Sliders className="w-4 h-4" />
            </span>
            <span>Simulador de Escenarios y Sensibilidad</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mueve los deslizadores de importancia para explorar cómo cambiaría la decisión bajo diferentes prioridades de vida o negocio.
          </p>
        </div>

        <button
          onClick={() => handleApplyPreset('reset')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1f1f26] text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Preset Scenarios Buttons */}
      <div className="p-4 rounded-2xl bg-[#111114] border border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
          Probar Escenarios Extremos Predeterminados:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleApplyPreset('finance')}
            className="p-3 rounded-xl bg-[#141418] hover:bg-[#1f1f26] border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Prioridad Financiera</span>
            </div>
            <p className="text-[11px] text-slate-400">Maximizar dinero, minimizar costes.</p>
          </button>

          <button
            onClick={() => handleApplyPreset('wellbeing')}
            className="p-3 rounded-xl bg-[#141418] hover:bg-[#1f1f26] border border-slate-800 hover:border-pink-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400 mb-1">
              <Heart className="w-3.5 h-3.5" />
              <span>Calidad de Vida</span>
            </div>
            <p className="text-[11px] text-slate-400">Paz mental, tiempo y equilibrio.</p>
          </button>

          <button
            onClick={() => handleApplyPreset('growth')}
            className="p-3 rounded-xl bg-[#141418] hover:bg-[#1f1f26] border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Máximo Crecimiento</span>
            </div>
            <p className="text-[11px] text-slate-400">Aprendizaje y retorno a largo plazo.</p>
          </button>

          <button
            onClick={() => handleApplyPreset('risk_free')}
            className="p-3 rounded-xl bg-[#141418] hover:bg-[#1f1f26] border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Aversión al Riesgo</span>
            </div>
            <p className="text-[11px] text-slate-400">Seguridad y estabilidad ante todo.</p>
          </button>
        </div>
      </div>

      {/* Live Winner Banner */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${
        isWinnerChanged
          ? 'bg-[#111114] border-indigo-500/50 shadow-lg shadow-indigo-500/10'
          : 'bg-[#111114] border-indigo-500/30'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isWinnerChanged ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isWinnerChanged ? 'text-indigo-300' : 'text-indigo-400'
              }`}>
                {isWinnerChanged ? '¡Giro en el Veredicto!' : 'Líder en esta Simulación'}
              </span>
              <h3 className="text-xl font-bold text-white font-display">
                {currentLeader?.title} ({currentLeader?.simulatedScore} pts)
              </h3>
            </div>
          </div>

          {isWinnerChanged && (
            <div className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs font-semibold text-indigo-200">
              ⚡ Esta opción supera al ganador original con estas prioridades
            </div>
          )}
        </div>
      </div>

      {/* Grid: Sliders Controls + Visual Live Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111114] border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Ajuste de Ponderaciones por Criterio
          </h3>

          <div className="space-y-4">
            {comparisonMatrix.criteria.map((crit) => {
              const currentVal = weights[crit.id] ?? 3;
              return (
                <div key={crit.id} className="space-y-1.5 p-3 rounded-xl bg-[#141418] border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{crit.name}</span>
                    <span className="font-bold text-indigo-300 bg-[#18181b] px-2 py-0.5 rounded border border-slate-800">
                      Peso: {currentVal} / 5
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={currentVal}
                    onChange={(e) => handleSliderChange(crit.id, parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-[#1f1f24] rounded-lg appearance-none"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                    <span>1: Mínimo</span>
                    <span>3: Moderado</span>
                    <span>5: Crítico</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Visual Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111114] border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Resultado en Tiempo Real
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Comparativa dinámica de puntuación normalizada de 0 a 100.
            </p>

            <div className="space-y-4">
              {simulatedOptions.map((opt, idx) => {
                const isTop = idx === 0;
                return (
                  <div key={opt.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-bold ${
                          isTop ? 'bg-indigo-600 text-white' : 'bg-[#18181b] text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="truncate max-w-[180px]">{opt.title}</span>
                      </span>
                      <span className="font-bold text-indigo-300 font-display">
                        {opt.simulatedScore} pts
                      </span>
                    </div>

                    <div className="w-full bg-[#18181b] h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isTop
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.min(100, opt.simulatedScore)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141418] border border-slate-800 text-xs text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-300">Conclusión del simulador:</strong> Observa si una opción domina en todos los escenarios o si el resultado es frágil ante pequeños cambios en tus prioridades.
          </div>
        </div>
      </div>
    </div>
  );
};
