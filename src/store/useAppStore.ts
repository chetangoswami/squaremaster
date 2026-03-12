import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameSettings, GameStats, SessionRecord, GameMode } from '../types';

interface AppState {
  settings: GameSettings;
  setSettings: (settings: Partial<GameSettings>) => void;
  
  lastStats: GameStats | null;
  setLastStats: (stats: GameStats | null) => void;
  
  historicalSettings: GameSettings | null;
  setHistoricalSettings: (settings: GameSettings | null) => void;

  // Persisted Stats & Sessions
  sessions: SessionRecord[];
  addSession: (session: SessionRecord) => void;
  
  totalGamesPlayedKid: number;
  totalGamesPlayedNorm: number;
  incrementGamesPlayed: (isKid: boolean) => void;

  // Mode configs (to remember settings per mode)
  modeConfigsKid: Partial<Record<GameMode, Partial<GameSettings>>>;
  modeConfigsNorm: Partial<Record<GameMode, Partial<GameSettings>>>;
  saveModeConfig: (mode: GameMode, isKid: boolean, config: Partial<GameSettings>) => void;

  // Weights for smart mode
  weightsKid: Record<string, Record<number, number>>;
  weightsNorm: Record<string, Record<number, number>>;
  saveWeights: (mode: GameMode, isKid: boolean, weights: Record<number, number>) => void;

  clearProgress: () => void;
}

const defaultSettings: GameSettings = {
  mode: 'ADDITION',
  min: 1,
  max: 20,
  min2: 1,   
  max2: 10,  
  duration: 60,
  smartMode: true,
  kidMode: false
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      
      lastStats: null,
      setLastStats: (stats) => set({ lastStats: stats }),
      
      historicalSettings: null,
      setHistoricalSettings: (settings) => set({ historicalSettings: settings }),

      sessions: [],
      addSession: (session) => set((state) => ({
        sessions: [session, ...state.sessions].slice(0, 50)
      })),

      totalGamesPlayedKid: 0,
      totalGamesPlayedNorm: 0,
      incrementGamesPlayed: (isKid) => set((state) => ({
        totalGamesPlayedKid: isKid ? state.totalGamesPlayedKid + 1 : state.totalGamesPlayedKid,
        totalGamesPlayedNorm: !isKid ? state.totalGamesPlayedNorm + 1 : state.totalGamesPlayedNorm,
      })),

      modeConfigsKid: {},
      modeConfigsNorm: {},
      saveModeConfig: (mode, isKid, config) => set((state) => {
        if (isKid) {
          return { modeConfigsKid: { ...state.modeConfigsKid, [mode]: config } };
        } else {
          return { modeConfigsNorm: { ...state.modeConfigsNorm, [mode]: config } };
        }
      }),

      weightsKid: {},
      weightsNorm: {},
      saveWeights: (mode, isKid, weights) => set((state) => {
        if (isKid) {
          return { weightsKid: { ...state.weightsKid, [mode]: weights } };
        } else {
          return { weightsNorm: { ...state.weightsNorm, [mode]: weights } };
        }
      }),

      clearProgress: () => set({
        sessions: [],
        totalGamesPlayedKid: 0,
        totalGamesPlayedNorm: 0,
        weightsKid: {},
        weightsNorm: {}
      })
    }),
    {
      name: 'squaremaster-storage',
      partialize: (state) => ({
        settings: state.settings,
        sessions: state.sessions,
        totalGamesPlayedKid: state.totalGamesPlayedKid,
        totalGamesPlayedNorm: state.totalGamesPlayedNorm,
        modeConfigsKid: state.modeConfigsKid,
        modeConfigsNorm: state.modeConfigsNorm,
        weightsKid: state.weightsKid,
        weightsNorm: state.weightsNorm,
      }),
    }
  )
);
