# Product Requirements Document (PRD)

## 1. Project Overview
**Project Name:** HiddenGenius (Working Title)
**Version:** 1.0 (Production MVP)
**Description:** A utility application that masquerades as a standard calculator but contains a hidden, comprehensive brain-training and memory-testing suite. 

## 2. Objectives & Goals
*   **Scalability:** Separate UI from business logic to easily add new quiz types (e.g., Squares/Cubes, Vocabulary) in the future.
*   **Retention:** Implement gamification (streaks, high scores, daily goals) to keep users engaged.
*   **Performance:** Ensure 60fps animations, instant load times, and offline capabilities (PWA).
*   **Discretion:** Maintain a fully functional, unsuspicious calculator interface as the primary entry point.

## 3. Target Audience
*   Students preparing for competitive exams (aptitude tests, SSC, Banking, SATs) where mental math and alphabet positioning are crucial.
*   General brain-training enthusiasts looking to improve mental acuity.
*   Users who appreciate "Easter egg" style hidden applications.

## 4. Core Features (v1.0 Scope)

### 4.1 The Disguise (Calculator)
*   Fully functional standard calculator (Add, Subtract, Multiply, Divide).
*   Accessible and responsive UI matching native OS calculators.
*   **The Vault Mechanism:** A secret gesture or tap sequence (e.g., tapping the calculator icon or a specific button sequence) to unlock the training modules.

### 4.2 Module 1: Mental Math
*   Dynamic generation of math problems.
*   Customizable difficulty levels (Easy, Medium, Hard).
*   Operations: Addition, Subtraction, Multiplication, Division.
*   Time-based or question-count-based quiz modes.

### 4.3 Module 2: Alphabet Mastery
*   **Letter → Number:** Identify the numerical position of a given letter.
*   **Number → Letter:** Identify the letter at a given numerical position.
*   **Opposite Pairs:** Identify the opposite letter (e.g., A ↔ Z, B ↔ Y).
*   **Mixed Mode:** A combination of all the above.
*   Reference section with mnemonics (e.g., EJOTY, LOVE, SHIRTG).

### 4.4 Gamification & Progress Tracking
*   **Persistent Scoring:** Track high scores and accuracy across sessions.
*   **Streaks:** Track consecutive correct answers (current and all-time best).
*   **Daily Activity:** Track days played to build a daily habit streak.

### 4.5 Offline Mode (PWA)
*   The app must function 100% offline.
*   Installable to the home screen on iOS and Android.

## 5. Future Scope (v2.0+)
*   User authentication and cloud sync for cross-device progress.
*   New modules: Squares & Cubes, Periodic Table, Vocabulary/Spelling.
*   Detailed analytics charts showing improvement over time.
*   Social leaderboards.
