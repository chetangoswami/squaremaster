# Implementation Roadmap

This document outlines the step-by-step plan to refactor the current prototype into a production-grade application.

## Phase 1: Foundation & Scaffolding
**Goal:** Set up the new project structure and routing without breaking existing functionality.

1.  **Initialize Routing:** Install `react-router-dom` and set up the basic route structure (`/`, `/dashboard`, `/math`, `/alphabet`).
2.  **Directory Restructuring:** Create the feature-sliced directories (`src/features`, `src/components`, `src/data`, etc.).
3.  **Data Extraction:** Move hardcoded data (like the `alphabets` and `opposites` arrays) from components into dedicated files in `src/data/`.
4.  **Component Migration:** Move the existing Calculator, Math Quiz, and Secret Alphabet components into their respective `src/features/` folders.

## Phase 2: State Management & Persistence
**Goal:** Ensure user progress is saved across sessions.

1.  **Install Zustand:** Add `zustand` to the project.
2.  **Create Stores:**
    *   Create `useProgressStore` to handle scores, streaks, and accuracy.
    *   Create `useSettingsStore` for app preferences.
3.  **Implement Persistence:** Use Zustand's `persist` middleware to save the progress store to `localStorage`.
4.  **Integrate Stores:** Update the Math and Alphabet quiz components to dispatch score updates to the global store upon quiz completion.

## Phase 3: Component Refactoring & Logic Separation
**Goal:** Make the codebase DRY (Don't Repeat Yourself) and highly testable.

1.  **Extract Shared UI:** Identify repeated UI patterns (e.g., Quiz Option Buttons, Progress Bars, Result Screens) and extract them into `src/components/`.
2.  **Extract Business Logic:** Move the quiz generation logic (e.g., `generateQuestion`) out of the React components and into custom hooks (e.g., `useAlphabetQuiz`, `useMathQuiz`) or pure utility functions.
3.  **Vault Logic:** Refine the "unlock" mechanism in the Calculator to act as an authentication guard for the protected routes (`/dashboard`, etc.).

## Phase 4: Polish, Accessibility, and PWA
**Goal:** Make the app feel like a native, premium product.

1.  **Accessibility (a11y):** Ensure all interactive elements have proper ARIA labels, focus states, and keyboard navigation support.
2.  **Animations:** Standardize transitions using CSS or Framer Motion for smooth route changes and UI updates.
3.  **PWA Setup:** Install and configure `vite-plugin-pwa` to generate a Web App Manifest and Service Worker, enabling offline play and "Add to Home Screen" functionality.
4.  **Testing:** Add basic unit tests for the core quiz generation logic and scoring algorithms.
