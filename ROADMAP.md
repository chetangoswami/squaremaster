# Product Roadmap & Refinements

This document outlines the strategic plan for SquareMaster AI. Features are prioritized based on educational impact and technical feasibility.

## Phase 1: Pedagogical Core (The "Brain")
*Focus: Moving from random drills to scientific learning.*

- [ ] **Implement SuperMemo-2 (SM-2) Algorithm**
    - **Current:** Weighted randomization based on speed/correctness.
    - **Future:** Schedule specific flashcards (e.g., $13^2$) to reappear at calculated intervals (1 day, 3 days, 1 week).
    - *Tech:* Create a scheduling queue in `localStorage`.

- [ ] **"Focus Mode" (Error-Only Drills)**
    - Add a game mode that *only* populates questions from the user's `problematicKeys` list or items with high error weights.

- [ ] **Pattern Recognition Drills**
    - Instead of random numbers, add specific pattern drills.
    - Examples: "Squares ending in 5" ($15^2, 25^2$), "Multiplying by 11".

## Phase 2: UX & "App Feel"
*Focus: Making the web app feel native.*

- [ ] **Haptic Feedback (Mobile)**
    - Use `navigator.vibrate(5)` on numpad presses.
    - Use `navigator.vibrate([50, 50, 50])` on incorrect answers.

- [ ] **Offline Robustness (PWA)**
    - Cache Gemini API responses in `localStorage` to allow reviewing tips offline.
    - Ensure Service Worker caches all assets aggressively.

- [ ] **Cloud Sync**
    - Integrate Supabase/Firebase Auth.
    - Sync user weights and stats across Desktop and Mobile devices.

## Phase 3: Gamification & Retention
*Focus: Giving users a reason to return daily.*

- [ ] **Unlockable Skins/Themes**
    - Use "Total Score" as currency.
    - Unlock: 8-bit sound pack, Neon Numpad, Retro Theme.

- [ ] **Daily Streak Heatmap**
    - Add a GitHub-style contribution graph on the Home screen showing days played in the last year.

- [ ] **Local Leaderboard**
    - Store top 10 scores per mode in LocalStorage.
    - Display "High Score to Beat" before game starts.

## Phase 4: Advanced AI Features
*Focus: Leveraging Gemini for high-level coaching.*

- [ ] **Weekly AI Coach Report**
    - Batch send the last 50 session summaries to Gemini.
    - Ask for high-level trends (e.g., "You tend to slow down after 45 seconds" or "You struggle with 7s and 8s").

- [ ] **Voice-Input Mode**
    - Use Web Speech API + Gemini Multimodal.
    - Allow users to answer hands-free (great for walking/driving).

## Phase 5: Accessibility
*Focus: Inclusivity.*

- [ ] **High Contrast Toggle**
    - Pure Black/White/Yellow theme for users with visual impairments.
- [ ] **Keyboard Navigation**
    - Ensure full `Tab` and `Enter` support for all menus and stats screens.
