import { GameMode } from "../types";

const STORAGE_PREFIX = 'squaremaster_weights_';
const STATS_KEY = 'squaremaster_global_stats';

// Heuristic difficulty: 7, 8, 9, 12, 13, 14, 15 are inherently harder for most people
const HARD_NUMBERS = [7, 8, 9, 12, 13, 14, 15, 17, 18, 19];
const EASY_NUMBERS = [0, 1, 2, 5, 10, 11, 20];

export const loadWeights = (mode: GameMode): Record<number, number> => {
  try {
    const key = `${STORAGE_PREFIX}${mode}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to load weights", e);
    return {};
  }
};

export const saveWeights = (mode: GameMode, weights: Record<number, number>) => {
  try {
    const key = `${STORAGE_PREFIX}${mode}`;
    localStorage.setItem(key, JSON.stringify(weights));
  } catch (e) {
    console.error("Failed to save weights", e);
  }
};

export const clearWeights = () => {
  const modes: GameMode[] = ['SQUARES', 'MULTIPLICATION', 'ADDITION', 'SUBTRACTION', 'DIVISION'];
  modes.forEach(mode => {
      localStorage.removeItem(`${STORAGE_PREFIX}${mode}`);
  });
  localStorage.removeItem(STATS_KEY);
};

export const getInitialWeight = (num: number, storedWeight?: number): number => {
  if (storedWeight !== undefined) return storedWeight;
  if (EASY_NUMBERS.includes(num)) return 0.8;
  if (HARD_NUMBERS.includes(num)) return 1.5;
  return 1.0;
};

export const incrementGamesPlayed = () => {
    try {
        const current = parseInt(localStorage.getItem(STATS_KEY) || '0');
        localStorage.setItem(STATS_KEY, (current + 1).toString());
    } catch (e) {
        console.error("Failed to update stats", e);
    }
};

export const getTotalGamesPlayed = (): number => {
    return parseInt(localStorage.getItem(STATS_KEY) || '0');
};