# Technical Architecture Document (TAD)

## 1. Technology Stack
*   **Core Framework:** React 18
*   **Language:** TypeScript (Strict mode enabled)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (with CSS variables for theming)
*   **Routing:** `react-router-dom` (v6+)
*   **State Management:** `zustand` (with `persist` middleware for local storage)
*   **Icons:** `lucide-react` / Google Material Symbols
*   **PWA:** `vite-plugin-pwa`

## 2. Directory Structure (Feature-Sliced Design)
To ensure scalability and maintainability, the codebase will be organized by feature rather than by file type.

```text
src/
├── assets/            # Static assets (images, global CSS)
├── components/        # Shared UI components (Buttons, Cards, Modals, ProgressBars)
├── config/            # Global configuration and constants
├── data/              # Static data dictionaries (e.g., alphabet mnemonics)
├── features/          # Feature-specific modules
│   ├── calculator/    # Calculator UI and vault trigger logic
│   ├── math-quiz/     # Math generation logic, Quiz UI, state
│   ├── alpha-quiz/    # Alphabet logic, Quiz UI, state
│   └── dashboard/     # Main menu and progress overview after unlocking
├── hooks/             # Shared custom React hooks (e.g., useKeyboard, useHaptics)
├── store/             # Global Zustand stores (e.g., user progress, settings)
├── types/             # Global TypeScript interfaces and types
├── utils/             # Helper functions (e.g., formatting, random generators)
├── App.tsx            # Root component, Router setup, Providers
└── main.tsx           # Entry point
```

## 3. State Management Strategy
We will use **Zustand** for global state management due to its minimal boilerplate and excellent TypeScript support.

### 3.1 Global Stores
*   `useProgressStore`: Manages user scores, streaks, and historical data. Wrapped in `persist` middleware to save to `localStorage`.
*   `useSettingsStore`: Manages app preferences (theme, sound, haptics).

### 3.2 Local State
*   Component-specific state (e.g., current question, selected option, transition states) will remain in `useState` or `useReducer` within the specific feature components.

## 4. Data Models

```typescript
// types/progress.ts
export interface QuizStats {
  highScore: number;
  bestStreak: number;
  totalPlayed: number;
  averageAccuracy: number;
}

export interface UserProgress {
  math: Record<string, QuizStats>; // Keyed by difficulty/type
  alphabet: Record<string, QuizStats>; // Keyed by quiz type
  dailyStreak: {
    current: number;
    lastPlayedDate: string; // ISO Date string
  };
}

// types/settings.ts
export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  hapticFeedbackEnabled: boolean;
}
```

## 5. Routing Strategy
Using `react-router-dom` to manage navigation, enabling deep linking and proper browser history.

*   `/` - The Calculator (Disguise)
*   `/dashboard` - The unlocked main menu
*   `/math` - Math quiz configuration and gameplay
*   `/alphabet` - Alphabet reference and gameplay
*   `/stats` - User progress and statistics

*Note: Direct access to `/dashboard` or quiz routes should redirect to `/` if the "vault" has not been unlocked in the current session.*
