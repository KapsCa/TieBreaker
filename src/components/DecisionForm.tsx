import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Sliders, 
  Scale, 
  Compass, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DecisionInput, DecisionOptionInput, DecisionCriterionInput, PresetTemplate } from '../types';
import { DECISION_PRESETS } from '../data/presets';

interface DecisionFormProps {
  onSubmit: (input: DecisionInput) => void;
  isLoading: boolean;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState<'career' | 'business' | 'finance' | 'personal' | 'tech' | 'lifestyle' | 'general'>('general');
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [timeHorizon, setTimeHorizon] = useState<'short' | 'medium' | 'long'>('medium');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [options, setOptions] = useState<DecisionOptionInput[]>([
    { id: 'opt_1', title: '', description: '' },
    { id: 'opt_2', title: '', description: '' }
  ]);

  const [criteria, setCriteria] = useState<DecisionCriterionInput[]>([
    { id: 'crit_1', name: 'Impacto a largo plazo', weight: 5, description: 'Beneficio sostenible en el tiempo' },
    { id: 'crit_2', name: 'Costo financiero / Inversión', weight: 4, description: 'Recursos económicos requeridos' },
    { id: 'crit_3', name: 'Facilidad de ejecución y tiempo', weight: 3, description: 'Velocidad y esfuerzo necesario' },
    { id: 'crit_4', name: 'Paz mental y bienestar', weight: 4, description: 'Nivel de estrés vs tranquilidad' }
  ]);

  const [newCriterionName, setNewCriterionName] = useState('');

  // Handle Preset selection
  const handleSelectPreset = (preset: PresetTemplate) => {
    setTitle(preset.title);
    setContext(preset.context);
    setOptions(
      preset.options.map((opt, i) => ({
        id: `opt_${Date.now()}_${i}`,
        title: opt,
        description: ''
      }))
    );
    setCriteria(
      preset.criteria.map((c, i) => ({
        id: `crit_${Date.now()}_${i}`,
        name: c.name,
        weight: c.weight,
        description: ''
      }))
    );
  };

  // Option management
  const handleAddOption = () => {
    const newId = `opt_${Date.now()}_${options.length + 1}`;
    setOptions([...options, { id: newId, title: '', description: '' }]);
  };

  const handleUpdateOption = (id: string, field: 'title' | 'description', value: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)));
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((opt) => opt.id !== id));
  };

  // Criteria management
  const handleAddCriterion = () => {
    if (!newCriterionName.trim()) return;
    const newId = `crit_${Date.now()}_${criteria.length + 1}`;
    setCriteria([...criteria, { id: newId, name: newCriterionName.trim(), weight: 3, description: '' }]);
    setNewCriterionName('');
  };

  const handleUpdateCriterionWeight = (id: string, weight: number) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, weight } : c)));
  };

  const handleRemoveCriterion = (id: string) => {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  // AI Auto-suggest options & criteria based on title
  const handleAiSuggest = async () => {
    if (!title.trim()) {
      setSuggestionError('Ingresa primero el título o dilema para que la IA sugiera opciones.');
      return;
    }
    setSuggestionError(null);
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/suggest-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, context })
      });
      if (!res.ok) throw new Error('No se pudieron obtener sugerencias');
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Respuesta inválida del servidor. Intenta de nuevo.');
      }
      
      if (data.options && data.options.length > 0) {
        setOptions(
          data.options.map((opt: any, i: number) => ({
            id: `opt_${Date.now()}_${i}`,
            title: opt.title,
            description: opt.description || ''
          }))
        );
      }
      if (data.criteria && data.criteria.length > 0) {
        setCriteria(
          data.criteria.map((c: any, i: number) => ({
            id: `crit_${Date.now()}_${i}`,
            name: c.name,
            weight: c.weight || 3,
            description: c.description || ''
          }))
        );
      }
      if (data.category) {
        setCategory(data.category as any);
      }
    } catch (err: any) {
      console.error(err);
      setSuggestionError('Error al conectar con la IA. Inténtalo nuevamente.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validOptions = options.filter((o) => o.title.trim() !== '');

    const payload: DecisionInput = {
      title: title.trim(),
      context: context.trim(),
      options: validOptions,
      criteria: criteria.filter((c) => c.name.trim() !== ''),
      category,
      riskTolerance,
      timeHorizon
    };

    onSubmit(payload);
  };

  const hasStartedTyping = title.trim().length > 0 || context.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Welcome banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Matriz de Pros/Contras · Análisis FODA · Veredicto de Desempate</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
          Describe tu dilema para empezar
        </h2>
        <p className="mt-2 text-base text-slate-400 max-w-2xl mx-auto">
          Ingresa tu dilema y deja que la IA analice objetivamente los pros y contras, construya una tabla comparativa ponderada y aplique un análisis FODA para romper el empate.
        </p>
      </div>

      {/* Main Decision Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111114] border border-slate-800 shadow-xl relative transition-all duration-500">
          {/* Section 1: The Dilemma */}
          <div className="space-y-4">
            <div>
              <label htmlFor="decision-title" className="block text-sm font-semibold text-slate-200 mb-1.5">
                ¿Cuál es el dilema o decisión que necesitas resolver? <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="decision-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: ¿Debería aceptar la oferta de trabajo remota o quedarme en mi puesto actual?"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0d0d10] border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 text-base transition-all pr-32"
                />
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isSuggesting || !title.trim()}
                  className="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Sugerir opciones y criterios automáticamente usando IA"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isSuggesting ? 'animate-spin' : ''}`} />
                  <span>{isSuggesting ? 'Pensando...' : 'Auto-sugerir'}</span>
                </button>
              </div>
              {suggestionError && (
                <p className="mt-1.5 text-xs text-rose-400">{suggestionError}</p>
              )}
            </div>

            {/* Context & Constraints details */}
            <div>
              <label htmlFor="decision-context" className="block text-xs font-medium text-slate-400 mb-1">
                Contexto adicional, limitaciones o prioridades clave (opcional):
              </label>
              <textarea
                id="decision-context"
                rows={2}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ej: Mi prioridad es tener tiempo para mi familia, pero necesito mantener al menos $X de ingresos mensuales. No me gusta viajar constantemente..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d10] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-slate-200 placeholder-slate-500 text-sm transition-all"
              />
            </div>
          </div>

          {!hasStartedTyping && (
            <div className="mt-8 pt-6 border-t border-slate-800/80 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-400" /> O elige una plantilla rápida:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DECISION_PRESETS.slice(0, 3).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-left p-3.5 rounded-xl bg-[#141418] hover:bg-[#1a1a22] border border-slate-800 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-1 block">
                        {preset.category}
                      </span>
                      <p className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2">
                        {preset.title}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <span>Usar plantilla</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasStartedTyping && (
            <div className="animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="my-6 border-t border-slate-800/80" />

              {/* Section 2: The Options to Compare */}
              <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  2. Opciones a comparar <span className="text-slate-400 font-normal">(Opcional)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Define las alternativas. Si las dejas en blanco, la IA las deducirá de tu título o contexto.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Opción</span>
              </button>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
                return (
                  <div
                    key={option.id}
                    className="flex flex-col sm:flex-row gap-2.5 p-3.5 rounded-xl bg-[#0d0d10] border border-slate-800 focus-within:border-slate-700 transition-colors relative group"
                  >
                    <div className="flex items-center gap-2 sm:w-1/3">
                      <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30 shrink-0">
                        {optionLetter}
                      </span>
                      <input
                        type="text"
                        value={option.title}
                        onChange={(e) => handleUpdateOption(option.id, 'title', e.target.value)}
                        placeholder={`Nombre Opción ${optionLetter} (ej. Aceptar empleo)`}
                        className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 sm:w-2/3">
                      <input
                        type="text"
                        value={option.description || ''}
                        onChange={(e) => handleUpdateOption(option.id, 'description', e.target.value)}
                        placeholder="Detalles clave o matices (ej. +30% salario pero en startup)"
                        className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(option.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                          title="Eliminar opción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="my-6 border-t border-slate-800/80" />

          {/* Section 3: Evaluation Criteria */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  3. Criterios de Evaluación y Ponderación
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ajusta el peso de cada factor. La escala va de <span className="font-semibold text-slate-300">1 (Menos crítico)</span> a <span className="font-semibold text-indigo-300">5 (Más crítico)</span>.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0d0d10]">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-[#141418] text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th className="px-4 py-3 font-medium">Criterio</th>
                    <th className="px-1 py-3 font-medium text-center text-[10px] w-12"><span className="block text-slate-500 uppercase mb-1">1<br/>Poco</span></th>
                    <th className="px-1 py-3 font-medium text-center text-[10px] w-10"><span className="block text-slate-400 mb-1">2</span></th>
                    <th className="px-1 py-3 font-medium text-center text-[10px] w-10"><span className="block text-slate-400 mb-1">3</span></th>
                    <th className="px-1 py-3 font-medium text-center text-[10px] w-10"><span className="block text-slate-400 mb-1">4</span></th>
                    <th className="px-1 py-3 font-medium text-center text-[10px] w-12"><span className="block text-indigo-400 uppercase mb-1">5<br/>Vital</span></th>
                    <th className="px-4 py-3 font-medium text-right w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {criteria.map((crit) => (
                    <tr key={crit.id} className="hover:bg-[#111114] transition-colors">
                      <td className="px-4 py-3 align-middle">
                        <span className="font-medium text-slate-200 block truncate max-w-[150px] sm:max-w-xs" title={crit.name}>
                          {crit.name}
                        </span>
                        {crit.description && (
                          <span className="text-[10px] text-slate-500 mt-0.5 block truncate max-w-[150px] sm:max-w-xs">
                            {crit.description}
                          </span>
                        )}
                      </td>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <td key={level} className="px-1 py-3 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateCriterionWeight(crit.id, level)}
                            className={`mx-auto w-5 h-5 sm:w-6 sm:h-6 rounded-md border flex items-center justify-center transition-all ${
                              crit.weight === level
                                ? 'bg-indigo-600 border-indigo-500 shadow-xs'
                                : crit.weight >= level
                                  ? 'bg-indigo-600/20 border-indigo-500/30'
                                  : 'bg-[#1a1a22] border-slate-700 hover:border-slate-500'
                            }`}
                            title={`Seleccionar peso ${level}/5`}
                          >
                            {crit.weight === level && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"></div>}
                            {crit.weight > level && crit.weight !== level && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full"></div>}
                          </button>
                        </td>
                      ))}
                      <td className="px-4 py-3 align-middle text-right">
                        {criteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(crit.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors inline-flex justify-center"
                            title="Eliminar criterio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Custom Criterion input */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <div className="flex gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={newCriterionName}
                  onChange={(e) => setNewCriterionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCriterion();
                    }
                  }}
                  placeholder="Añadir otro criterio (ej. Flexibilidad)..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#0d0d10] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCriterion}
                  disabled={!newCriterionName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-slate-300 text-xs font-medium transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  Añadir
                </button>
              </div>
              
              <p className="text-[11px] text-slate-400">
                ¿Deseas incluir tolerancia al riesgo o tiempo?{' '}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 transition-colors"
                >
                  Abre los Ajustes Avanzados
                </button>
              </p>
            </div>
          </div>

          {/* Section 4: Advanced Parameters (Risk & Horizon) */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ajustes avanzados de perfil y horizonte temporal</span>
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#0d0d10] border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Tolerancia al Riesgo:
                  </label>
                  <select
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141418] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="conservative">Conservador (Minimizar pérdidas)</option>
                    <option value="moderate">Moderado (Equilibrio riesgo/retorno)</option>
                    <option value="aggressive">Agresivo (Maximizar oportunidades)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Horizonte Temporal Principal:
                  </label>
                  <select
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141418] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="short">Corto Plazo (1 - 6 meses)</option>
                    <option value="medium">Mediano Plazo (1 - 3 años)</option>
                    <option value="long">Largo Plazo (5+ años)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Categoría del Dilema:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141418] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="general">General</option>
                    <option value="career">Carrera & Trabajo</option>
                    <option value="business">Negocios & Startups</option>
                    <option value="finance">Finanzas & Inversiones</option>
                    <option value="tech">Tecnología & Arquitectura</option>
                    <option value="lifestyle">Estilo de Vida & Vivienda</option>
                    <option value="personal">Personal & Relaciones</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
        </div>

        {hasStartedTyping && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>La IA procesará pros/contras, FODA y veredicto definitivo.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Analizando matriz y desempatando...</span>
                </>
              ) : (
                <>
                  <Scale className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                  <span>Romper el Empate y Analizar</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
