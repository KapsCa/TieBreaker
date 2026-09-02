import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Table, 
  Target, 
  Sliders, 
  Flame, 
  MessageSquare, 
  Share2, 
  RotateCcw, 
  Sparkles, 
  ArrowLeft, 
  Scale, 
  Compass,
  AlertCircle
} from 'lucide-react';
import { DecisionInput, DecisionAnalysisResult, ViewTab, PresetTemplate } from './types';
import { Header } from './components/Header';
import { DecisionForm } from './components/DecisionForm';
import { VerdictView } from './components/VerdictView';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonMatrixView } from './components/ComparisonMatrixView';
import { SwotMatrixView } from './components/SwotMatrixView';
import { WeightSimulatorView } from './components/WeightSimulatorView';
import { DevilsAdvocateView } from './components/DevilsAdvocateView';
import { WhatIfChatModal } from './components/WhatIfChatModal';
import { HistoryModal } from './components/HistoryModal';
import { ExportModal } from './components/ExportModal';
import { PresetsDrawer } from './components/PresetsDrawer';
import { getSavedDecisions, saveDecision, deleteDecision, clearAllDecisions } from './lib/storage';

export default function App() {
  const [activeAnalysis, setActiveAnalysis] = useState<DecisionAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('verdict');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [whatIfPrompt, setWhatIfPrompt] = useState<string | undefined>(undefined);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  // History state
  const [savedDecisionsList, setSavedDecisionsList] = useState<DecisionAnalysisResult[]>([]);
  const [lastSubmittedInput, setLastSubmittedInput] = useState<DecisionInput | null>(null);

  useEffect(() => {
    setSavedDecisionsList(getSavedDecisions());
  }, []);

  // Loading steps animation
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setLoadingStep(0);
      const steps = [0, 1, 2, 3];
      let current = 0;
      timer = setInterval(() => {
        current = (current + 1) % steps.length;
        setLoadingStep(current);
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const loadingMessages = [
    'Sopesando ventajas y desventajas en múltiples dimensiones...',
    'Estructurando matriz estratégica FODA / SWOT para cada opción...',
    'Calculando matriz de puntuaciones y ponderaciones de impacto...',
    'Determinando el factor decisivo y redactando el veredicto de desempate...'
  ];

  // Submit decision to API
  const handleAnalyzeDecision = async (input: DecisionInput) => {
    setLastSubmittedInput(input);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let extractedError = errorData.error || 'Error en el análisis de la decisión';
        if (typeof extractedError === 'object') {
          extractedError = extractedError.message || JSON.stringify(extractedError);
        }
        throw new Error(extractedError);
      }

      let result: DecisionAnalysisResult;
      try {
        result = await response.json();
      } catch (parseErr) {
        throw new Error('El servidor devolvió una respuesta no válida. Es posible que esté reiniciándose por alta demanda. Por favor, espera unos segundos y vuelve a intentar.');
      }
      
      setActiveAnalysis(result);
      setActiveTab('verdict');

      // Save to localStorage
      saveDecision(result);
      setSavedDecisionsList(getSavedDecisions());
    } catch (err: any) {
      console.error('Error analyzing decision:', err);
      let msg = err.message || 'Ocurrió un error inesperado al conectar con el motor de IA.';
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error?.message) {
          msg = parsed.error.message;
        }
      } catch {}
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (decision: DecisionAnalysisResult) => {
    setActiveAnalysis(decision);
    setActiveTab('verdict');
    setErrorMessage(null);
  };

  const handleDeleteHistoryItem = (id: string) => {
    deleteDecision(id);
    setSavedDecisionsList(getSavedDecisions());
    if (activeAnalysis?.id === id) {
      setActiveAnalysis(null);
    }
  };

  const handleClearHistory = () => {
    clearAllDecisions();
    setSavedDecisionsList([]);
  };

  const handleOpenWhatIf = (prompt?: string) => {
    setWhatIfPrompt(prompt);
    setIsWhatIfOpen(true);
  };

  const handleSelectPreset = (preset: PresetTemplate) => {
    // Fill the form directly
    const inputPayload: DecisionInput = {
      title: preset.title,
      context: preset.context,
      options: preset.options.map((opt, i) => ({
        id: `opt_${Date.now()}_${i}`,
        title: opt,
        description: ''
      })),
      criteria: preset.criteria.map((c, i) => ({
        id: `crit_${Date.now()}_${i}`,
        name: c.name,
        weight: c.weight,
        description: ''
      })),
      category: 'general',
      riskTolerance: 'moderate',
      timeHorizon: 'medium'
    };
    handleAnalyzeDecision(inputPayload);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <Header
        onNewDecision={() => {
          setActiveAnalysis(null);
          setErrorMessage(null);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        hasActiveDecision={Boolean(activeAnalysis)}
        onOpenPresets={() => setIsPresetsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">No se pudo completar el análisis</span>
                <span className="text-rose-200/90 text-xs">{errorMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {lastSubmittedInput && (
                <button
                  onClick={() => handleAnalyzeDecision(lastSubmittedInput)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reintentar ahora</span>
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="px-2.5 py-1.5 text-xs text-rose-400 hover:text-white transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-600/30 animate-pulse">
                <Scale className="w-10 h-10 text-white animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-400 text-slate-950 flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white font-display mb-2">
              The Tiebreaker está analizando tu dilema...
            </h3>
            <p className="text-sm text-indigo-300/90 font-medium max-w-md mx-auto min-h-[40px] transition-all duration-300">
              {loadingMessages[loadingStep]}
            </p>

            <div className="w-64 bg-[#141418] h-2 rounded-full mt-4 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* State 1: Form Builder View */}
        {!isLoading && !activeAnalysis && (
          <DecisionForm onSubmit={handleAnalyzeDecision} isLoading={isLoading} />
        )}

        {/* State 2: Full Decision Analysis Dashboard */}
        {!isLoading && activeAnalysis && (
          <div className="space-y-6">
            {/* Dilemma Header Bar */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setActiveAnalysis(null)}
                  className="p-2 rounded-xl bg-[#141418] hover:bg-[#202028] text-slate-400 hover:text-white border border-slate-800 transition-colors shrink-0 mt-0.5"
                  title="Volver al formulario para editar"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
                    <span className="uppercase tracking-wider text-[10px]">Dilema Analizado</span>
                    <span>•</span>
                    <span className="text-slate-400 font-normal">
                      {new Date(activeAnalysis.timestamp).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white font-display leading-tight">
                    {activeAnalysis.input.title}
                  </h2>
                </div>
              </div>

              {/* Quick Action Chips */}
              <div className="flex items-center gap-2 self-start lg:self-center">
                <button
                  onClick={() => handleOpenWhatIf()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Consultar "¿Qué pasaría si...?"</span>
                </button>

                <button
                  onClick={() => setIsExportOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-slate-200 border border-slate-700/70 text-xs font-semibold transition-all shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="border-b border-slate-800 pb-1 overflow-x-auto">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
                <button
                  onClick={() => setActiveTab('verdict')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'verdict'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#18181b] border border-transparent'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Veredicto de Desempate</span>
                </button>

                <button
                  onClick={() => setActiveTab('pros_cons')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'pros_cons'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#18181b] border border-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pros & Contras</span>
                </button>

                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'matrix'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#18181b] border border-transparent'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Tabla Comparativa</span>
                </button>

                <button
                  onClick={() => setActiveTab('swot')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'swot'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#18181b] border border-transparent'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Análisis FODA</span>
                </button>

                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'simulator'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#18181b] border border-transparent'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Simulador de Escenarios</span>
                </button>

                <button
                  onClick={() => setActiveTab('devils_advocate')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'devils_advocate'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#18181b] border border-transparent'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Abogado del Diablo</span>
                </button>
              </div>
            </div>

            {/* Active Tab View Rendering */}
            <div className="pt-2">
              {activeTab === 'verdict' && (
                <VerdictView
                  analysis={activeAnalysis}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'pros_cons' && (
                <ProsConsView analysis={activeAnalysis} />
              )}

              {activeTab === 'matrix' && (
                <ComparisonMatrixView analysis={activeAnalysis} />
              )}

              {activeTab === 'swot' && (
                <SwotMatrixView analysis={activeAnalysis} />
              )}

              {activeTab === 'simulator' && (
                <WeightSimulatorView analysis={activeAnalysis} />
              )}

              {activeTab === 'devils_advocate' && (
                <DevilsAdvocateView
                  analysis={activeAnalysis}
                  onOpenWhatIfModal={(prompt) => handleOpenWhatIf(prompt)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#0d0d0f] py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">The Tiebreaker</span>
            <span>— Desempate analítico impulsado por Google Gemini</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Pros/Contras · Tabla Comparativa Ponderada · Análisis FODA Estratégico
          </p>
        </div>
      </footer>

      {/* Modals */}
      {activeAnalysis && (
        <>
          <WhatIfChatModal
            isOpen={isWhatIfOpen}
            onClose={() => setIsWhatIfOpen(false)}
            analysis={activeAnalysis}
            initialPrompt={whatIfPrompt}
          />
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            analysis={activeAnalysis}
          />
        </>
      )}

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisionsList}
        onSelectDecision={handleSelectHistoryItem}
        onDeleteDecision={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />

      <PresetsDrawer
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
