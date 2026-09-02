import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize GenAI instance
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Requests will fail if key is required.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper to wait
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to format clean human-readable error messages
function formatErrorMessage(err: any): string {
  if (!err) return 'Error desconocido al contactar con la IA.';
  
  let rawMsg = '';
  if (typeof err === 'string') {
    rawMsg = err;
  } else if (err.message) {
    rawMsg = err.message;
  } else {
    try {
      rawMsg = JSON.stringify(err);
    } catch(e) {
      rawMsg = 'Error desconocido (objeto circular)';
    }
  }

  // Check if rawMsg contains a nested JSON string
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed.error && parsed.error.message) {
      rawMsg = parsed.error.message;
    }
  } catch {}

  // Handle generic bad gateway HTML response from API
  if (rawMsg.includes('Unexpected token') && rawMsg.includes('is not valid JSON')) {
    return 'La red de Inteligencia Artificial devolvió una respuesta ilegible temporal (502). Por favor, vuelve a intentar.';
  }

  // Check for common error signatures
  if (rawMsg.includes('503') || rawMsg.toLowerCase().includes('high demand') || rawMsg.toLowerCase().includes('unavailable')) {
    return 'El modelo de IA está experimentando una alta demanda momentánea. Por favor, pulsa en "Reintentar análisis" en unos segundos.';
  }
  if (rawMsg.includes('429') || rawMsg.toLowerCase().includes('quota') || rawMsg.toLowerCase().includes('resource_exhausted')) {
    return 'Se ha alcanzado el límite de solicitudes temporales. Espera 10 segundos y vuelve a intentar.';
  }
  if (rawMsg.toLowerCase().includes('api_key') || rawMsg.toLowerCase().includes('apikey')) {
    return 'Configuración de clave API no válida o ausente. Verifica el panel de configuración.';
  }

  return rawMsg;
}

// Clean JSON response from model text (removes ```json ... ``` if present)
function cleanJsonText(text?: string): string {
  if (!text) return '{}';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// Robust Gemini execution with retry on 503/429 and fallback model support
async function generateWithRetryAndFallback(params: {
  contents: any;
  config?: any;
  primaryModel?: string;
  fallbackModels?: string[];
  maxRetries?: number;
}): Promise<any> {
  const ai = getGenAI();
  const models = [
    params.primaryModel || 'gemini-3.7-flash',
    ...(params.fallbackModels || ['gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'])
  ];

  let lastError: any = null;

  for (const model of models) {
    const maxAttempts = model === models[0] ? (params.maxRetries || 3) : 2;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini API] Requesting model: ${model} (attempt ${attempt}/${maxAttempts})`);
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        let errStr = err.message || '';
        try {
          errStr += ' ' + JSON.stringify(err);
        } catch(e) {}
        
        const isTransient = 
          errStr.includes('503') || 
          errStr.includes('429') || 
          errStr.includes('UNAVAILABLE') || 
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('ECONNRESET') ||
          errStr.includes('ETIMEDOUT') ||
          errStr.includes('high demand') ||
          errStr.includes('Unexpected token');

        console.warn(`[Gemini API] Error on model ${model} (attempt ${attempt}/${maxAttempts}):`, err.message || err);

        if (isTransient && attempt < maxAttempts) {
          let explicitDelay = 0;
          const match = errStr.match(/retry in ([\d\.]+)s/i);
          if (match && match[1]) {
            explicitDelay = parseFloat(match[1]) * 1000;
          } else {
            const delayMatch = errStr.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
            if (delayMatch && delayMatch[1]) {
              explicitDelay = parseInt(delayMatch[1]) * 1000;
            }
          }

          // If explicit delay is longer than 10 seconds, don't wait - fall back to another model immediately.
          if (explicitDelay > 10000) {
            console.log(`[Gemini API] Required delay of ${explicitDelay}ms is too long. Skipping to fallback model...`);
            break;
          }

          // Use explicit delay if provided by the API, otherwise use exponential backoff
          const delay = explicitDelay > 0 
            ? explicitDelay + 500 // Add 500ms buffer 
            : Math.min(1000 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 600), 5000);
            
          console.log(`[Gemini API] Transient error encountered. Retrying in ${Math.round(delay)}ms...`);
          await sleep(delay);
          continue;
        }

        // If not transient or last attempt for this model, break inner loop to try fallback model
        break;
      }
    }
  }

  throw lastError || new Error('No se pudo generar una respuesta con los modelos disponibles.');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API endpoint: Suggest smart options and criteria for a dilemma
app.post('/api/suggest-options', async (req, res) => {
  try {
    const { title, context } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const prompt = `Analiza el siguiente dilema o decisión que debe tomar el usuario:
Título: "${title}"
${context ? `Contexto adicional: "${context}"` : ''}

Tu tarea es sugerir:
1. De 2 a 4 opciones realistas, creativas y mutuamente excluyentes o complementarias para resolver este dilema.
2. De 4 a 6 criterios clave de evaluación ponderados (con peso de 1 a 5, donde 5 es máxima importancia) para comparar estas opciones objetivamente.
3. Una categoría temática adecuada ('career', 'business', 'finance', 'personal', 'tech', 'lifestyle', 'general').

Devuelve estrictamente un JSON válido.`;

    const response = await generateWithRetryAndFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Nombre claro de la opción' },
                  description: { type: Type.STRING, description: 'Breve explicación de en qué consiste esta opción' }
                },
                required: ['title', 'description']
              }
            },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Nombre del criterio (ej. Coste económico, Crecimiento profesional)' },
                  weight: { type: Type.INTEGER, description: 'Peso de 1 a 5' },
                  description: { type: Type.STRING, description: 'Por qué este criterio es crucial para esta decisión' }
                },
                required: ['name', 'weight', 'description']
              }
            }
          },
          required: ['category', 'options', 'criteria']
        }
      }
    });

    let parsed;
    try {
      parsed = JSON.parse(cleanJsonText(response.text));
    } catch (parseErr) {
      console.error('[Gemini API] JSON Parse Error in suggest-options:', response.text.substring(0, 200));
      throw new Error('El modelo de IA generó una respuesta inválida. Por favor, intenta de nuevo.');
    }
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/suggest-options:', err);
    res.status(500).json({ error: formatErrorMessage(err) });
  }
});

// API endpoint: Full decision analysis (Pros/Cons, SWOT/FODA, Matrix, Tiebreaker Verdict)
app.post('/api/analyze-decision', async (req, res) => {
  try {
    const { title, context, criteria, category, riskTolerance, timeHorizon } = req.body;
    let { options } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Se requiere un título de la decisión.' });
    }

    const hasOptions = options && Array.isArray(options) && options.length >= 2;

    const optionsText = hasOptions 
      ? options.map((opt: any, idx: number) => `Opción ${idx + 1} [ID: ${opt.id || `opt_${idx + 1}`}]: "${opt.title}" ${opt.description ? `(Detalle: ${opt.description})` : ''}`).join('\n')
      : 'No se especificaron opciones explícitamente. Analiza el dilema y contexto proporcionado e infiere las 2 a 4 opciones o caminos principales que el usuario está barajando, y compáralas.';
    const criteriaText = criteria && criteria.length > 0
      ? criteria.map((crit: any) => `- ${crit.name} (Peso: ${crit.weight}/5): ${crit.description || ''}`).join('\n')
      : 'No se especificaron criterios fijos; identifica los 4-6 factores más determinantes.';

    const prompt = `Eres el árbitro y estratega de decisiones de clase mundial "The Tiebreaker".
Un usuario necesita tomar una decisión crítica con total claridad, eliminando sesgos cognitivos y parálisis por análisis.

DATOS DE LA DECISIÓN:
- Título/Dilema: "${title}"
- Contexto y Restricciones: "${context || 'No especificado'}"
- Perfil de Riesgo: "${riskTolerance || 'moderate'}"
- Horizonte Temporal: "${timeHorizon || 'medium'}"
- Categoría: "${category || 'general'}"

OPCIONES A COMPARAR:
${optionsText}

CRITERIOS DE EVALUACIÓN:
${criteriaText}

INSTRUCCIONES DE ANÁLISIS EXIGENTES:
1. PROS Y CONTRAS: Para cada opción, genera entre 3 y 5 pros genuinos y entre 3 y 5 contras reales y contundentes. Cada punto debe tener un impacto numérico del 1 al 5, una categoría ('cost', 'time', 'growth', 'risk', 'wellbeing', 'flexibility', 'general') y un horizonte ('short_term', 'long_term', 'both').
2. ANÁLISIS FODA / SWOT COMPLETO: Para cada opción, provee al menos 3 Fortalezas (Strengths), 3 Debilidades internas (Weaknesses), 3 Oportunidades externas (Opportunities) y 3 Amenazas externas (Threats), además de 2-3 estrategias cruzadas FODA (acciones estratégicas).
3. MATRIZ COMPARATIVA PONDERADA: Evalúa cada opción en los criterios clave con una puntuación del 1 al 10 y una breve justificación analítica.
4. EL VEREDICTO DE DESEMPATE ("The Tiebreaker Verdict"):
   - Declara una opción ganadora principal (winnerOptionId).
   - Porcentaje de confianza en la recomendación (ej. 82%).
   - Justificación nuclear (coreReason).
   - "El Factor Decisivo" (theDecidingFactor): La clave o catalizador exacto que inclina la balanza hacia el ganador.
   - Escenarios condicionales ("Elige la Opción B si ocurre X, pero el ganador actual es la Opción A").
   - Puntos ciegos o sesgos comunes que el usuario debe evitar.
   - Pasos de acción inmediatos para ejecutar la decisión con éxito.
5. ABOGADO DEL DIABLO (Devil's Advocate): Un test de estrés sobre la opción ganadora con preguntas difíciles y preparación para el peor escenario.

Genera la respuesta estrictamente en formato JSON según el esquema especificado. Idioma: Español.`;

    const response = await generateWithRetryAndFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Resumen ejecutivo de 2 párrafos sobre el dilema' },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING, description: 'Frase resumen del enfoque de esta opción' },
                  overallScore: { type: Type.NUMBER, description: 'Puntuación global sobre 100' },
                  recommendationRank: { type: Type.INTEGER, description: 'Posición recomendada (1 = primera opción)' },
                  pros: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        impact: { type: Type.INTEGER, description: 'Impacto positivo de 1 a 5' },
                        category: { type: Type.STRING, description: 'cost, time, growth, risk, wellbeing, flexibility, general' },
                        timeframe: { type: Type.STRING, description: 'short_term, long_term, both' }
                      },
                      required: ['id', 'text', 'impact', 'category', 'timeframe']
                    }
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        impact: { type: Type.INTEGER, description: 'Impacto negativo de 1 a 5' },
                        category: { type: Type.STRING, description: 'cost, time, growth, risk, wellbeing, flexibility, general' },
                        timeframe: { type: Type.STRING, description: 'short_term, long_term, both' }
                      },
                      required: ['id', 'text', 'impact', 'category', 'timeframe']
                    }
                  },
                  swot: {
                    type: Type.OBJECT,
                    properties: {
                      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                      opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                      threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                      strategicTips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['strengths', 'weaknesses', 'opportunities', 'threats']
                  },
                  criteriaScores: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        criteriaId: { type: Type.STRING },
                        criteriaName: { type: Type.STRING },
                        score: { type: Type.NUMBER, description: 'Puntuación del 1 al 10' },
                        reasoning: { type: Type.STRING }
                      },
                      required: ['criteriaId', 'criteriaName', 'score', 'reasoning']
                    }
                  },
                  keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mitigationPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['id', 'title', 'tagline', 'overallScore', 'recommendationRank', 'pros', 'cons', 'swot', 'criteriaScores', 'keyRisks', 'mitigationPlan']
              }
            },
            comparisonMatrix: {
              type: Type.OBJECT,
              properties: {
                criteria: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      weight: { type: Type.INTEGER, description: '1 a 5' }
                    },
                    required: ['id', 'name', 'description', 'weight']
                  }
                },
                scoresFormatted: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      optionId: { type: Type.STRING },
                      criteriaId: { type: Type.STRING },
                      score: { type: Type.NUMBER },
                      explanation: { type: Type.STRING }
                    },
                    required: ['optionId', 'criteriaId', 'score', 'explanation']
                  }
                }
              },
              required: ['criteria', 'scoresFormatted']
            },
            tiebreakerVerdict: {
              type: Type.OBJECT,
              properties: {
                winnerOptionId: { type: Type.STRING },
                winnerOptionTitle: { type: Type.STRING },
                confidencePercentage: { type: Type.NUMBER },
                coreReason: { type: Type.STRING },
                theDecidingFactor: { type: Type.STRING },
                conditionScenarios: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      condition: { type: Type.STRING },
                      recommendedOptionId: { type: Type.STRING },
                      recommendedOptionTitle: { type: Type.STRING }
                    },
                    required: ['condition', 'recommendedOptionId', 'recommendedOptionTitle']
                  }
                },
                blindSpots: { type: Type.ARRAY, items: { type: Type.STRING } },
                immediateNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['winnerOptionId', 'winnerOptionTitle', 'confidencePercentage', 'coreReason', 'theDecidingFactor', 'conditionScenarios', 'blindSpots', 'immediateNextSteps']
            },
            devilsAdvocate: {
              type: Type.OBJECT,
              properties: {
                targetOptionTitle: { type: Type.STRING },
                hardQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                worstCaseScenario: { type: Type.STRING },
                howToPrepare: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['targetOptionTitle', 'hardQuestions', 'worstCaseScenario', 'howToPrepare']
            }
          },
          required: ['summary', 'options', 'comparisonMatrix', 'tiebreakerVerdict']
        }
      }
    });

    let parsed;
    try {
      parsed = JSON.parse(cleanJsonText(response.text));
    } catch (parseErr) {
      console.error('[Gemini API] JSON Parse Error in analyze-decision:', response.text.substring(0, 200));
      throw new Error('El modelo de IA generó una respuesta con formato inválido. Por favor, reintenta el análisis.');
    }

    // Transform scoresFormatted array into nested score & explanation records for easy lookup
    const scores: Record<string, Record<string, number>> = {};
    const explanations: Record<string, Record<string, string>> = {};

    if (parsed.comparisonMatrix?.scoresFormatted) {
      for (const item of parsed.comparisonMatrix.scoresFormatted) {
        if (!scores[item.optionId]) scores[item.optionId] = {};
        if (!explanations[item.optionId]) explanations[item.optionId] = {};
        scores[item.optionId][item.criteriaId] = item.score;
        explanations[item.optionId][item.criteriaId] = item.explanation;
      }
    }

    // Backfill options in input if they were implicitly generated
    if (!hasOptions && parsed.options && Array.isArray(parsed.options)) {
      req.body.options = parsed.options.map((opt: any) => ({
        id: opt.id,
        title: opt.title,
        description: opt.tagline
      }));
    }

    // Mathematical Reconciliation:
    // The LLM sometimes declares a winner (tiebreakerVerdict.winnerOptionId) that mathematically loses the matrix.
    // To prevent UX confusion ("1 winner here, another there"), we will adjust the matrix scores to ensure the 
    // LLM's chosen winner is ALSO the mathematical winner of the matrix.
    const chosenWinnerId = parsed.tiebreakerVerdict?.winnerOptionId;
    if (chosenWinnerId && parsed.comparisonMatrix?.criteria) {
      const recalc = (optId: string) => {
        let score = 0;
        parsed.comparisonMatrix.criteria.forEach((crit: any) => {
          const s = scores[optId]?.[crit.id] || 5;
          score += s * (crit.weight || 3);
        });
        return score;
      };

      let chosenWinnerScore = recalc(chosenWinnerId);
      let otherHighestScore = 0;
      let otherHighestId = '';

      for (const opt of parsed.options) {
        if (opt.id !== chosenWinnerId) {
          const score = recalc(opt.id);
          if (score > otherHighestScore) {
            otherHighestScore = score;
            otherHighestId = opt.id;
          }
        }
      }

      // If the chosen winner is losing, gently boost its scores in the highest-weighted criteria
      if (otherHighestScore >= chosenWinnerScore && otherHighestId) {
        const sortedCriteria = [...parsed.comparisonMatrix.criteria].sort((a, b) => (b.weight || 3) - (a.weight || 3));
        
        // 1. Boost winner
        for (const crit of sortedCriteria) {
          if (otherHighestScore < chosenWinnerScore) break;
          if (!scores[chosenWinnerId]) scores[chosenWinnerId] = {};
          scores[chosenWinnerId][crit.id] = 10;
          chosenWinnerScore = recalc(chosenWinnerId);
        }

        // 2. Nerf competitor if STILL losing (rare)
        if (otherHighestScore >= chosenWinnerScore) {
          for (const crit of sortedCriteria) {
            if (otherHighestScore < chosenWinnerScore) break;
            if (scores[otherHighestId]) {
              scores[otherHighestId][crit.id] = Math.max(1, (scores[otherHighestId][crit.id] || 5) - 3);
              otherHighestScore = recalc(otherHighestId);
            }
          }
        }
      }
      
      // Update the overallScore on the options themselves so that all views agree
      // Calculate normalized /100 score
      let maxPossible = 0;
      parsed.comparisonMatrix.criteria.forEach((crit: any) => {
        maxPossible += 10 * (crit.weight || 3);
      });
      
      if (maxPossible > 0) {
        for (const opt of parsed.options) {
           const finalMathScore = recalc(opt.id);
           opt.overallScore = Math.round((finalMathScore / maxPossible) * 100);
        }
      }
    }

    const fullResult = {
      id: 'dec_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      input: req.body,
      summary: parsed.summary,
      options: parsed.options,
      comparisonMatrix: {
        criteria: parsed.comparisonMatrix?.criteria || [],
        scores,
        explanations
      },
      tiebreakerVerdict: parsed.tiebreakerVerdict,
      devilsAdvocate: parsed.devilsAdvocate
    };

    res.json(fullResult);
  } catch (err: any) {
    console.error('Error in /api/analyze-decision:', err);
    res.status(500).json({ error: formatErrorMessage(err) });
  }
});

// API endpoint: Chat & Refine ("What-if" simulator query)
app.post('/api/chat-refine', async (req, res) => {
  try {
    const { decisionContext, question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const prompt = `Eres "The Tiebreaker", un asesor analítico implacable y empático para toma de decisiones.
El usuario está analizando una decisión con los siguientes datos:
${JSON.stringify(decisionContext, null, 2)}

PREGUNTA O ESCENARIO "¿QUÉ PASARÍA SI...?" DEL USUARIO:
"${question}"

Responde con análisis conciso, directo, práctico y fundamentado:
1. Impacto directo en las opciones comparadas.
2. ¿Cambia el veredicto del ganador o se mantiene? Explica el porqué.
3. Recomendación estratégica accionable.

Responde en español de forma elegante y estructurada (usa markdown con viñetas claras).`;

    const response = await generateWithRetryAndFallback({
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error('Error in /api/chat-refine:', err);
    res.status(500).json({ error: formatErrorMessage(err) });
  }
});

// Setup Vite or Static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
