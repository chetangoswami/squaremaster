import { GameMode, GameSettings } from "../types";

const STORAGE_PREFIX = 'squaremaster_weights_';
const STATS_KEY = 'squaremaster_global_stats';
const SETTINGS_KEY = 'squaremaster_settings_v1';

// Heuristic difficulty: 7, 8, 9, 12, 13, 14, 15 are inherently harder for most people
const HARD_NUMBERS = [7, 8, 9, 12, 13, 14, 15, 17, 18, 19];
const EASY_NUMBERS = [0, 1, 2, 5, 10, 11, 20];

const getKey = (mode: GameMode, isKid: boolean) => {
    return isKid ? `${STORAGE_PREFIX}kid_${mode}` : `${STORAGE_PREFIX}${mode}`;
};

const getStatsKey = (isKid: boolean) => {
    return isKid ? `${STATS_KEY}_kid` : STATS_KEY;
};

export const loadWeights = (mode: GameMode, isKid: boolean = false): Record<number, number> => {
  try {
    const key = getKey(mode, isKid);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to load weights", e);
    return {};
  }
};

export const saveWeights = (mode: GameMode, weights: Record<number, number>, isKid: boolean = false) => {
  try {
    const key = getKey(mode, isKid);
    localStorage.setItem(key, JSON.stringify(weights));
  } catch (e) {
    console.error("Failed to save weights", e);
  }
};

export const clearWeights = () => {
  const modes: GameMode[] = ['SQUARES', 'MULTIPLICATION', 'ADDITION', 'SUBTRACTION', 'DIVISION'];
  modes.forEach(mode => {
      localStorage.removeItem(`${STORAGE_PREFIX}${mode}`);
      localStorage.removeItem(`${STORAGE_PREFIX}kid_${mode}`);
  });
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(`${STATS_KEY}_kid`);
};

export const getInitialWeight = (num: number, storedWeight?: number): number => {
  if (storedWeight !== undefined) return storedWeight;
  if (EASY_NUMBERS.includes(num)) return 0.8;
  if (HARD_NUMBERS.includes(num)) return 1.5;
  return 1.0;
};

export const incrementGamesPlayed = (isKid: boolean = false) => {
    try {
        const key = getStatsKey(isKid);
        const current = parseInt(localStorage.getItem(key) || '0');
        localStorage.setItem(key, (current + 1).toString());
    } catch (e) {
        console.error("Failed to update stats", e);
    }
};

export const getTotalGamesPlayed = (isKid: boolean = false): number => {
    const key = getStatsKey(isKid);
    return parseInt(localStorage.getItem(key) || '0');
};

export const loadSettings = (): GameSettings | null => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const saveSettings = (settings: GameSettings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save settings", e);
    }
};