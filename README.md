# SquareMaster AI

[![Live Demo](https://img.shields.io/badge/demo-online-success)](https://squaremaster-ai.vercel.app/)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech Stack](https://img.shields.io/badge/stack-React_TypeScript_Vite-3178C6)

**[🚀 Launch Live App](https://squaremaster-ai.vercel.app/)**

**SquareMaster AI** is a high-performance progressive web application (PWA) designed to optimize mental arithmetic through adaptive algorithms and generative AI. 

The application bridges the gap between rote memorization and conceptual mastery by leveraging **Google Gemini** to provide real-time, context-aware mnemonic strategies. It features a dual-interface architecture that caters to both cognitive training (Pro Mode) and gamified learning (Kid Mode).

## Key Features

### 1. Adaptive Learning Engine
*   **Weighted Randomization**: Implements a custom algorithm that tracks response latency and historical accuracy. "Problematic" operands are dynamically weighted to appear more frequently, ensuring efficient spaced repetition.
*   **Performance Heuristics**: Initial difficulty weights are seeded based on common cognitive bottlenecks (e.g., $7 \times 8$, $13^2$).

### 2. GenAI Integration (Google Gemini)
*   **Contextual Analysis**: When a user makes a specific error (e.g., $14 \times 16$), the system queries the Gemini API to generate a unique, memorable mnemonic or mental math trick specific to those operands.
*   **AI Tutor**: A dedicated "Study Center" allows users to query the model for conceptual explanations of mathematical properties.

### 3. Dual-Interface Architecture
*   **Pro Mode**: A minimalist, high-contrast interface designed to minimize cognitive load and maximize flow state for rapid data entry.
*   **Kid Mode**: A fully distinct UI theme featuring gamification elements, particle effects, and simplified constraints to maintain engagement for younger users.

### 4. Analytics Dashboard
*   **Data Visualization**: Utilizes `recharts` to render accuracy distribution and performance breakdowns.
*   **Session Metrics**: Tracks Answers Per Minute (APM), accuracy percentage, and specific error logs.

## Technical Architecture

The project is built as a client-side Single Page Application (SPA) for maximum responsiveness and low latency.

*   **Frontend Framework**: React 18
*   **Language**: TypeScript (Strict Mode)
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS (Utility-first architecture)
*   **AI SDK**: `@google/genai`
*   **State Management**: React Hooks (local state) + LocalStorage (persistence)

## Roadmap & Future Refinements

We are actively working to improve the pedagogical and technical aspects of the app. See [ROADMAP.md](./ROADMAP.md) for the full implementation plan.

**Highlights:**
*   [ ] **Spaced Repetition System (SRS)**: Moving to a SuperMemo-2 algorithm for long-term retention.
*   [ ] **Voice Input**: Hands-free practice mode.
*   [ ] **Cloud Sync**: Cross-device progress tracking.
*   [ ] **Gamification**: Daily streaks and unlockable themes.

## Installation & Development

### Prerequisites
*   Node.js v18+
*   NPM or Yarn

### Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/squaremaster-ai.git
    cd squaremaster-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. You must obtain a valid API key from [Google AI Studio](https://aistudio.google.com/).

    ```env
    # For local development
    API_KEY=your_google_gemini_api_key
    ```
    
    *Note: For Vercel deployments, use `GEMINI_API_KEY` in the project settings.*

4.  **Start Development Server**
    ```bash
    npm run dev
    ```

## Project Structure

```
src/
├── components/       # UI Components (Game, Home, Results, Study)
├── services/         # External integrations (Gemini AI, LocalStorage)
├── types.ts          # TypeScript interfaces and shared types
├── App.tsx           # Main application router/controller
└── main.tsx          # Entry point
```

## Contributing

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/Optimization`).
3.  Commit your changes (`git commit -m 'Optimize weight calculation'`).
4.  Push to the branch (`git push origin feature/Optimization`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.