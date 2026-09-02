export interface DecisionOptionInput {
  id: string;
  title: string;
  description?: string;
}

export interface DecisionCriterionInput {
  id: string;
  name: string;
  weight: number; // 1 to 5
  description?: string;
}

export interface DecisionInput {
  title: string;
  context?: string;
  options: DecisionOptionInput[];
  criteria: DecisionCriterionInput[];
  category?: 'career' | 'business' | 'finance' | 'personal' | 'tech' | 'lifestyle' | 'general';
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon?: 'short' | 'medium' | 'long';
}

export type FactorCategory = 'cost' | 'time' | 'growth' | 'risk' | 'wellbeing' | 'flexibility' | 'general';
export type TimeframeType = 'short_term' | 'long_term' | 'both';

export interface ProConItem {
  id: string;
  text: string;
  impact: number; // 1 to 5
  category: FactorCategory;
  timeframe: TimeframeType;
}

export interface SwotAnalysis {
  strengths: string[];     // Fortalezas
  weaknesses: string[];    // Debilidades
  opportunities: string[]; // Oportunidades
  threats: string[];       // Amenazas
  strategicTips?: string[];
}

export interface CriteriaScore {
  criteriaId: string;
  criteriaName: string;
  score: number; // 1 to 10
  reasoning: string;
}

export interface OptionAnalysis {
  id: string;
  title: string;
  tagline: string;
  overallScore: number; // 0 to 100
  recommendationRank: number;
  pros: ProConItem[];
  cons: ProConItem[];
  swot: SwotAnalysis;
  criteriaScores: CriteriaScore[];
  keyRisks: string[];
  mitigationPlan: string[];
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 1 to 5
}

export interface ComparisonMatrix {
  criteria: ComparisonCriterion[];
  // optionId -> criteriaId -> score (1 to 10)
  scores: Record<string, Record<string, number>>;
  // optionId -> criteriaId -> explanation
  explanations: Record<string, Record<string, string>>;
}

export interface ConditionScenario {
  condition: string;
  recommendedOptionId: string;
  recommendedOptionTitle: string;
}

export interface TiebreakerVerdict {
  winnerOptionId: string;
  winnerOptionTitle: string;
  confidencePercentage: number;
  coreReason: string;
  theDecidingFactor: string; // "El Factor Decisivo"
  conditionScenarios: ConditionScenario[];
  blindSpots: string[];
  immediateNextSteps: string[];
}

export interface DevilsAdvocateAnalysis {
  targetOptionTitle: string;
  hardQuestions: string[];
  worstCaseScenario: string;
  howToPrepare: string[];
}

export interface DecisionAnalysisResult {
  id: string;
  timestamp: number;
  input: DecisionInput;
  summary: string;
  options: OptionAnalysis[];
  comparisonMatrix: ComparisonMatrix;
  tiebreakerVerdict: TiebreakerVerdict;
  devilsAdvocate?: DevilsAdvocateAnalysis;
}

export type ViewTab = 'verdict' | 'pros_cons' | 'matrix' | 'swot' | 'simulator' | 'devils_advocate';

export interface PresetTemplate {
  id: string;
  icon: string;
  category: string;
  title: string;
  context: string;
  options: string[];
  criteria: { name: string; weight: number }[];
}
