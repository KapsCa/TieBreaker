import React, { useState } from 'react';
import { 
  Table, 
  Sliders, 
  HelpCircle, 
  Sparkles, 
  Check, 
  Info,
  Trophy,
  RotateCcw
} from 'lucide-react';
import { DecisionAnalysisResult, ComparisonCriterion } from '../types';

interface ComparisonMatrixViewProps {
  analysis: DecisionAnalysisResult;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({ analysis }) => {
  const { comparisonMatrix, options } = analysis;

  // Local state for interactive weights
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    comparisonMatrix.criteria.forEach((c) => {
      initial[c.id] = c.weight || 3;
    });
    return initial;
  });

  const [activeTooltip, setActiveTooltip] = useState<{
    optionId: string;
    criteriaId: string;
    text: string;
  } | null>(null);

  const handleWeightChange = (criteriaId: string, newWeight: number) => {
    setWeights((prev) => ({
      ...prev,
      [criteriaId]: newWeight
    }));
  };

  const handleResetWeights = () => {
    const reset: Record<string, number> = {};
    comparisonMatrix.criteria.forEach((c) => {
      reset[c.id] = c.weight || 3;
    });
    setWeights(reset);
  };

  // Calculate dynamic weighted score for each option
  const calculateOptionScore = (optionId: string) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    comparisonMatrix.criteria.forEach((crit) => {
      const weight = weights[crit.id] ?? 3;
      const score = comparisonMatrix.scores[optionId]?.[crit.id] ?? 5;
      totalWeightedScore += score * weight;
      totalWeight += weight;
    });

    if (totalWeight === 0) return 0;
    // Normalize to 100
    const normalized = (totalWeightedScore / (totalWeight * 10)) * 100;
    return Math.round(normalized * 10) / 10;
  };

  // Rank options based on dynamic scores
  const rankedOptions = [...options].map((opt) => ({
    ...opt,
    currentScore: calculateOptionScore(opt.id)
  })).sort((a, b) => b.currentScore - a.currentScore);

  const highestScore = rankedOptions[0]?.currentScore || 0;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (score >= 6) return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    if (score >= 4) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Intro & Controls banner */}
      <div className="p-5 rounded-2xl bg-[#111114] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Table className="w-4 h-4" />
            </span>
            <span>Tabla Comparativa Ponderada</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ajusta los controles de importancia en cada criterio para ver cómo evoluciona la puntuación global en tiempo real.
          </p>
        </div>

        <button
          onClick={handleResetWeights}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1f1f26] text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restablecer pesos</span>
        </button>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-[#111114] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0d0d10]">
                <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-300 min-w-[220px]">
                  Criterio de Decisión
                </th>
                <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-300 w-[140px] text-center">
                  Importancia
                </th>
                {options.map((option, idx) => {
                  const isCurrentWinner = rankedOptions[0]?.id === option.id;
                  return (
                    <th
                      key={option.id}
                      className={`p-4 sm:p-5 min-w-[180px] text-center transition-colors ${
                        isCurrentWinner ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#18181b] text-indigo-300 mb-1 border border-slate-700">
                          Opción {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm font-bold text-white font-display line-clamp-1" title={option.title}>
                          {option.title}
                        </span>
                        {isCurrentWinner && (
                          <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
                            <Trophy className="w-3 h-3" /> Puntero Actual
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {comparisonMatrix.criteria.map((crit) => {
                const currentWeight = weights[crit.id] ?? 3;
                return (
                  <tr key={crit.id} className="hover:bg-[#141418]/60 transition-colors">
                    {/* Criterion Name & Description */}
                    <td className="p-4 sm:p-5 align-middle">
                      <div className="font-semibold text-slate-200 text-sm">{crit.name}</div>
                      {crit.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{crit.description}</div>
                      )}
                    </td>

                    {/* Weight Controls */}
                    <td className="p-4 sm:p-5 align-middle text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleWeightChange(crit.id, lvl)}
                              className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                                currentWeight >= lvl
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-[#1f1f24] text-slate-500 hover:bg-slate-700'
                              }`}
                              title={`Nivel ${lvl}/5`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-500">Peso: {currentWeight}/5</span>
                      </div>
                    </td>

                    {/* Option Scores for this criterion */}
                    {options.map((option) => {
                      const score = comparisonMatrix.scores[option.id]?.[crit.id] ?? 5;
                      const explanation = comparisonMatrix.explanations[option.id]?.[crit.id] || '';
                      const isCurrentWinner = rankedOptions[0]?.id === option.id;

                      return (
                        <td
                          key={option.id}
                          className={`p-4 sm:p-5 align-middle text-center ${
                            isCurrentWinner ? 'bg-indigo-950/10' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-bold border ${getScoreColor(
                                score
                              )} shadow-xs`}
                              title={`Puntuación: ${score}/10`}
                            >
                              {score} / 10
                            </span>

                            {explanation && (
                              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-tight">
                                {explanation}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-[#0d0d10] font-bold border-t-2 border-slate-700">
                <td className="p-5 text-sm text-white uppercase tracking-wider" colSpan={2}>
                  Puntuación Global Ponderada (sobre 100)
                </td>
                {options.map((option) => {
                  const score = calculateOptionScore(option.id);
                  const isTop = score === highestScore;
                  return (
                    <td
                      key={option.id}
                      className={`p-5 text-center ${isTop ? 'bg-indigo-950/25' : ''}`}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-2xl font-bold font-display ${
                            isTop ? 'text-indigo-400' : 'text-slate-300'
                          }`}
                        >
                          {score}
                        </span>
                        <div className="w-full bg-[#18181b] h-1.5 rounded-full mt-2 overflow-hidden max-w-[120px]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isTop ? 'bg-indigo-500' : 'bg-slate-600'
                            }`}
                            style={{ width: `${Math.min(100, score)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Ranking Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {rankedOptions.map((opt, rankIdx) => (
          <div
            key={opt.id}
            className={`p-4 rounded-xl border flex items-center justify-between ${
              rankIdx === 0
                ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'
                : 'bg-[#111114] border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                rankIdx === 0 ? 'bg-indigo-600 text-white' : 'bg-[#18181b] text-slate-400'
              }`}>
                #{rankIdx + 1}
              </span>
              <div>
                <span className="text-xs font-bold text-white block">{opt.title}</span>
                <span className="text-[11px] text-slate-400">
                  {rankIdx === 0 ? 'Liderando ponderación' : 'Alternativa'}
                </span>
              </div>
            </div>
            <span className="text-lg font-bold font-display">
              {opt.currentScore} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
