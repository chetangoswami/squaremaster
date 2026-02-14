import { GoogleGenAI } from "@google/genai";
import { Question } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getMentalMathTip = async (question: Question): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI unavailable (Missing API Key).";

  let prompt = "";
  const baseInstruction = "Keep it concise (under 3 sentences). Use Markdown to **bold** numbers and key operands for readability.";

  switch (question.mode) {
      case 'SQUARES':
          prompt = `Provide a mental math trick or mnemonic to calculate or remember ${question.val1}². ${baseInstruction}`;
          break;
      case 'MULTIPLICATION':
          prompt = `Provide a mental math trick to calculate ${question.val1} × ${question.val2}. ${baseInstruction}`;
          break;
      case 'ADDITION':
          prompt = `Provide a mental math strategy to add ${question.val1} + ${question.val2}. ${baseInstruction}`;
          break;
      case 'SUBTRACTION':
          prompt = `Provide a mental math strategy to subtract ${question.val1} - ${question.val2}. ${baseInstruction}`;
          break;
      case 'DIVISION':
          prompt = `Provide a mental math trick to divide ${question.val1} ÷ ${question.val2}. ${baseInstruction}`;
          break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // fast response
      }
    });
    return response.text || "No tip available.";
  } catch (error) {
    console.error("Error fetching tip:", error);
    return "Could not load tip at this time.";
  }
};

export const getGeneralStudyAdvice = async (topic: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert math tutor. The user asks: "${topic}". 
      
      Provide a structured response using Markdown:
      - Use **bold** for key terms and numbers.
      - Use bullet points or numbered lists for steps.
      - Use code blocks for formulas (e.g., \`a² + b²\`).
      - Keep the tone encouraging but professional.`,
    });
    return response.text || "No advice available.";
  } catch (error) {
    console.error("Error fetching advice:", error);
    return "Could not load advice.";
  }
};