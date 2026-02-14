# SquareMaster AI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript&logoColor=white)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2.svg)

**SquareMaster AI** is a state-of-the-art adaptive mental math trainer designed to bridge the gap between rote memorization and deep conceptual understanding. By leveraging **Google Gemini**, the application provides real-time, context-aware mnemonic strategies and personalized feedback, transforming the way users master arithmetic.

Whether you are a competitive mental athlete looking to shave milliseconds off your calculation time or a student building foundational math skills, SquareMaster AI adapts to your learning curve using intelligent spaced repetition algorithms.

## ✨ Key Features

### 🧠 Adaptive Intelligence
-   **Smart Weighting Algorithm**: The app tracks your response latency and accuracy to identify "problem numbers." It dynamically adjusts the probability of these numbers appearing in future drills.
-   **Contextual AI Coaching**: Utilizing the Google GenAI SDK, the system analyzes specific mistakes (e.g., $13 \times 14$) and generates unique, catchy mnemonic devices to aid retention.

### ⚡ Dual Experience Modes
1.  **Pro Mode (Focus & Speed)**
    -   High-contrast, dark-themed interface designed for flow state.
    -   Minimalist visual design to reduce cognitive load.
    -   Advanced analytics including answers per minute, accuracy distribution, and trend analysis.

2.  **Kid Mode (Engagement & Fun)**
    -   Gamified UI with vibrant colors, particle effects, and positive reinforcement.
    -   Age-appropriate constraints (e.g., non-negative subtraction results).
    -   "Star" reward system to encourage consistent practice.

### 📚 AI Study Center
-   **Interactive Tutor**: A dedicated chat interface where users can ask conceptual questions ("Why is anything to the power of 0 equal to 1?").
-   **Reference Tables**: Quick access to square tables and common constants.

## 🛠️ Technology Stack

-   **Frontend Framework**: [React 18](https://react.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **AI Integration**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai)
-   **Visualization**: [Recharts](https://recharts.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites
-   Node.js (v18 or higher recommended)
-   npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/chetangoswami/squaremaster.git
cd squaremaster
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
SquareMaster AI requires a valid Google Gemini API key to function.
1.  Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2.  Create a `.env` file in the project root.
3.  Add the key:

```env
API_KEY=your_actual_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 📖 Usage Guide

### Configuring a Session
On the home screen, select your desired operation (**Squares**, **Addition**, **Subtraction**, **Multiplication**, **Division**).
-   **Range**: Set the minimum and maximum values for the operands.
-   **Duration**: Set the session timer (default: 60s).
-   **Smart AI**: Toggle this to enable the adaptive difficulty algorithm.

### Reviewing Results
After a session, the Results dashboard provides:
-   **Accuracy & Speed Metrics**: Quantitative analysis of performance.
-   **Mistake Review**: A list of incorrect answers. Click "Get AI Trick" to receive a generated mnemonic for that specific problem.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ by Chetan Goswami*