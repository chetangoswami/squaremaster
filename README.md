# SquareMaster AI

**SquareMaster AI** is an adaptive mental math application designed to master arithmetic through high-speed drills and intelligent feedback. It features two distinct experiences: a high-contrast "Pro Mode" for serious training and a playful "Kid Mode" for students (Class 2+).

Powered by **Google Gemini**, the app provides personalized mnemonic tricks and study advice based on your specific mistakes.

## 🌟 Features

### 🚀 Pro Mode
- **High-Velocity Interface**: Minimalist, dark-themed UI inspired by top mental math tools (Zetamac).
- **Spaced Repetition**: "Smart Mode" tracks weak numbers and prioritizes them automatically.
- **Detailed Analytics**: Pie charts, speed metrics (Answers/Min), and mistake analysis.

### 🎈 Kid Mode
- **Gamified Design**: Bright colors, bouncing animations, and "Star" rewards.
- **Class 2 Optimized**: 
  - Positive-only subtraction (larger number always first).
  - One-tap presets for age-appropriate difficulty (e.g., Tables 2-5).
  - Encouraging AI feedback and visual celebrations.

### 🧠 AI Integration
- **Contextual Tips**: If you miss `13 × 14`, the AI generates a specific mental math trick for those exact numbers.
- **Study Center**: A chat interface to ask general math questions or get study advice from an AI Math Tutor.

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`@google/genai`)
- **Icons**: Lucide React
- **Charts**: Recharts

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/squaremaster-ai.git
   cd squaremaster-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   - Get a free API key from [Google AI Studio](https://aistudio.google.com/).
   - Create a `.env` file in the root directory:
     ```
     API_KEY=your_gemini_api_key_here
     ```

4. **Run the application**
   ```bash
   npm start
   ```

## 🎮 Game Modes
- **Squares**: Calculate squares of numbers (e.g., 25²).
- **Addition**: Sum two numbers within a custom range.
- **Subtraction**: Find the difference (Smart handling ensures positive results in Kid Mode).
- **Multiplication**: Times tables and advanced multiplication.
- **Division**: Calculate quotients (e.g., 20 ÷ 5).

## 📄 License
MIT
