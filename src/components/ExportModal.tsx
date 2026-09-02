import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  FileText, 
  Share2 
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: DecisionAnalysisResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, analysis }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    const { input, summary, options, tiebreakerVerdict, comparisonMatrix } = analysis;
    let md = `# Informe de Decisión: ${input.title}\n\n`;
    md += `> Generado por **The Tiebreaker** el ${new Date(analysis.timestamp).toLocaleDateString('es-ES')}\n\n`;
    md += `## 🏆 Opción Ganadora Recomendada\n`;
    md += `**${tiebreakerVerdict.winnerOptionTitle}** (Confianza: ${tiebreakerVerdict.confidencePercentage}%)\n\n`;
    md += `### ⚡ El Factor Decisivo (The Tiebreaker)\n${tiebreakerVerdict.theDecidingFactor}\n\n`;
    md += `### 📋 Justificación Principal\n${tiebreakerVerdict.coreReason}\n\n`;
    md += `## 📌 Resumen Ejecutivo\n${summary}\n\n`;

    md += `## ⚖️ Comparativa de Pros y Contras\n\n`;
    options.forEach((opt) => {
      md += `### ${opt.title} (Puntaje Global: ${opt.overallScore}/100)\n`;
      md += `**Ventajas (Pros):**\n`;
      opt.pros.forEach((p) => {
        md += `- [Impacto +${p.impact}/5] ${p.text} (${p.category})\n`;
      });
      md += `\n**Desventajas (Contras):**\n`;
      opt.cons.forEach((c) => {
        md += `- [Impacto -${c.impact}/5] ${c.text} (${c.category})\n`;
      });
      md += `\n`;
    });

    md += `## 🎯 Matriz FODA / SWOT\n\n`;
    options.forEach((opt) => {
      md += `### FODA: ${opt.title}\n`;
      md += `- **Fortalezas:** ${opt.swot.strengths.join(', ')}\n`;
      md += `- **Oportunidades:** ${opt.swot.opportunities.join(', ')}\n`;
      md += `- **Debilidades:** ${opt.swot.weaknesses.join(', ')}\n`;
      md += `- **Amenazas:** ${opt.swot.threats.join(', ')}\n\n`;
    });

    md += `## ✅ Pasos Inmediatos para Ejecutar\n`;
    tiebreakerVerdict.immediateNextSteps.forEach((step) => {
      md += `- [ ] ${step}\n`;
    });

    return md;
  };

  const handleCopy = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMd = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tiebreaker_${analysis.input.title.slice(0, 30).replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-[#111114] border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0d0d10]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Exportar Informe de Decisión
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-sm">
                {analysis.input.title}
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

        {/* Action Options */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-4 rounded-xl bg-[#141418] hover:bg-[#1f1f26] border border-slate-800 hover:border-indigo-500/40 text-center transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform">
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </div>
              <span className="text-xs font-bold text-white">
                {copied ? '¡Copiado!' : 'Copiar Texto'}
              </span>
              <span className="text-[10px] text-slate-400">Formato Markdown</span>
            </button>

            {/* Download MD */}
            <button
              onClick={handleDownloadMd}
              className="p-4 rounded-xl bg-[#141418] hover:bg-[#1f1f26] border border-slate-800 hover:border-indigo-500/40 text-center transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Descargar .MD</span>
              <span className="text-[10px] text-slate-400">Archivo de texto</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="p-4 rounded-xl bg-[#141418] hover:bg-[#1f1f26] border border-slate-800 hover:border-emerald-500/40 text-center transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Imprimir / PDF</span>
              <span className="text-[10px] text-slate-400">Vista limpia</span>
            </button>
          </div>

          {/* Preview Box */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#0d0d10] border border-slate-800 text-xs text-slate-400 max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
            {generateMarkdown()}
          </div>
        </div>
      </div>
    </div>
  );
};
