import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';

interface WhatIfChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: DecisionAnalysisResult;
  initialPrompt?: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export const WhatIfChatModal: React.FC<WhatIfChatModalProps> = ({
  isOpen,
  onClose,
  analysis,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `Hola, soy The Tiebreaker. Puedo responder preguntas específicas sobre tu decisión "${analysis.input.title}", simular escenarios inesperados o profundizar en riesgos. ¿Qué duda o situación hipotética quieres explorar?`
    }
  ]);
  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionContext: {
            title: analysis.input.title,
            options: analysis.options.map((o) => ({ id: o.id, title: o.title })),
            winner: analysis.tiebreakerVerdict.winnerOptionTitle,
            decidingFactor: analysis.tiebreakerVerdict.theDecidingFactor,
            criteria: analysis.comparisonMatrix.criteria
          },
          question: q
        })
      });

      if (!res.ok) throw new Error('Error al consultar');
      let data;
      try {
        data = await res.json();
      } catch(e) {
        throw new Error('Respuesta del servidor inválida');
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply || 'No se pudo generar una respuesta.' }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Ocurrió un error al contactar con la IA. Por favor, intenta de nuevo.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    '¿Qué pasa si mi presupuesto se reduce un 30%?',
    '¿Cómo afectaría esta decisión a mi calidad de vida en 3 años?',
    '¿Qué plan B debería tener listo si la opción ganadora falla?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#111114] border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d0d10]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                Consultar a The Tiebreaker (Simulación "¿Qué pasa si...?")
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                Dilema: {analysis.input.title}
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

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'ai' && (
                <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                  <Sparkles className="w-3 h-3" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white font-semibold rounded-br-xs'
                    : 'bg-[#141418] border border-slate-800 text-slate-200 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-6 h-6 rounded-md bg-[#18181b] text-slate-300 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs justify-start items-center text-slate-400 italic">
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30 animate-pulse">
                <Sparkles className="w-3 h-3 animate-spin" />
              </div>
              <span>The Tiebreaker está evaluando el escenario...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-[#0d0d10] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">Sugerencias:</span>
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="px-2.5 py-1 rounded-full bg-[#141418] hover:bg-[#1f1f26] border border-slate-800 hover:border-indigo-500/40 text-slate-300 whitespace-nowrap transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-[#0d0d10] border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta o plantea un cambio de circunstancias..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#141418] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
