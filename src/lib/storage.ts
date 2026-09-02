import { DecisionAnalysisResult } from '../types';

const STORAGE_KEY = 'the_tiebreaker_saved_decisions_v1';

export function getSavedDecisions(): DecisionAnalysisResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading decisions from localStorage:', e);
    return [];
  }
}

export function saveDecision(decision: DecisionAnalysisResult): void {
  try {
    const existing = getSavedDecisions();
    const filtered = existing.filter((d) => d.id !== decision.id);
    const updated = [decision, ...filtered].slice(0, 30); // Keep last 30
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving decision to localStorage:', e);
  }
}

export function deleteDecision(id: string): void {
  try {
    const existing = getSavedDecisions();
    const updated = existing.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting decision from localStorage:', e);
  }
}

export function clearAllDecisions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing decisions:', e);
  }
}
