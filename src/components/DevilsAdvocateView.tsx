import React, { useState } from 'react';
import { 
  Flame, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle2, 
  MessageSquare, 
  AlertOctagon,
  Sparkles,
  Send
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';

interface DevilsAdvocateViewProps {
  analysis: DecisionAnalysisResult;
  onOpenWhatIfModal: (initialPrompt?: string) => void;
}

export const DevilsAdvocateView: React.FC<DevilsAdvocateViewProps> = ({ analysis, onOpenWhatIfModal }) => {
  const { devilsAdvocate, tiebreakerVerdict, options } = analysis;
  const winner = options.find((o) => o.id === tiebreakerVerdict.winnerOptionId) || options[0];

  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, string>>({});
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  if (!devilsAdvocate) {
    return (
      <div className="p-8 rounded-2xl bg-[#111114] border border-slate-800 text-center">
        <Flame className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        <p className="text-slate-300 text-sm">No se generó el test de estrés para esta decisión.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-[#111114] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-indigo-400" />
            <span>Test de Estrés y Antisesgo</span>
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            El Abogado del Diablo: Desafiando a "{devilsAdvocate.targetOptionTitle || winner.title}"
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ponemos a prueba la opción ganadora con preguntas incómodas para garantizar que no estás cayendo en sesgo de confirmación.
          </p>
        </div>

        <button
          onClick={() => onOpenWhatIfModal('¿Cuáles son los 3 mayores riesgos imprevistos de la opción ganadora si el entorno cambia negativamente?')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Consultar ¿Qué pasaría si...?</span>
        </button>
      </div>

      {/* Worst-Case Scenario Simulation Box */}
      <div className="rounded-2xl bg-rose-950/20 border border-rose-500/25 p-6 shadow-xl shadow-rose-950/10">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 shrink-0 mt-1">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300 mb-1">
              Simulación del Peor Escenario Posible (Worst-Case Scenario)
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {devilsAdvocate.worstCaseScenario}
            </p>

            <div className="mt-4 pt-4 border-t border-rose-500/20">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                ¿Cómo prepararse y blindar este escenario?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {devilsAdvocate.howToPrepare.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#141418] border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hard-hitting questions list with interactive rebuttal scratchpad */}
      <div className="p-6 rounded-2xl bg-[#111114] border border-slate-800">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>Preguntas Incómodas que Debes Poder Responder</span>
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Si puedes responder con solidez a estas dudas, sabrás con 100% de convicción que tu decisión es la correcta.
        </p>

        <div className="space-y-4">
          {devilsAdvocate.hardQuestions.map((q, idx) => {
            const hasAnswer = Boolean(answeredQuestions[idx]?.trim());
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#141418] border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                      {q}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveQuestion(activeQuestion === idx ? null : idx)}
                    className="text-xs font-medium text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all shrink-0"
                  >
                    {activeQuestion === idx ? 'Cerrar' : hasAnswer ? 'Editar respuesta' : 'Responder'}
                  </button>
                </div>

                {/* Answered text display or editor */}
                {activeQuestion === idx ? (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Tu argumento de defensa / mitigación:
                    </label>
                    <textarea
                      rows={2}
                      value={answeredQuestions[idx] || ''}
                      onChange={(e) =>
                        setAnsweredQuestions({ ...answeredQuestions, [idx]: e.target.value })
                      }
                      placeholder="Escribe cómo solventarías o abordarías este punto..."
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0d10] border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => setActiveQuestion(null)}
                        className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
                      >
                        Guardar nota
                      </button>
                    </div>
                  </div>
                ) : hasAnswer ? (
                  <div className="mt-2.5 ml-9 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold block text-[10px] uppercase text-emerald-400">
                        Tu respuesta:
                      </span>
                      <span>{answeredQuestions[idx]}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
