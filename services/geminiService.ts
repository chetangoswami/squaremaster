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
  switch (question.mode) {
      case 'SQUARES':
          prompt = `Provide a very short, catchy mental math trick or mnemonic to instantly calculate or remember the square of ${question.val1}. Keep it under 2 sentences.`;
          break;
      case 'MULTIPLICATION':
          prompt = `Provide a very short, catchy mental math trick to calculate ${question.val1} multiplied by ${question.val2} mentally. Keep it under 2 sentences.`;
          break;
      case 'ADDITION':
          prompt = `Provide a very short mental math strategy to quickly add ${question.val1} and ${question.val2}. Keep it under 2 sentences.`;
          break;
      case 'SUBTRACTION':
          prompt = `Provide a very short mental math strategy to quickly subtract ${question.val2} from ${question.val1}. Keep it under 2 sentences.`;
          break;
      case 'DIVISION':
          prompt = `Provide a very short mental math trick to divide ${question.val1} by ${question.val2} (Answer is ${question.answer}). Keep it under 2 sentences.`;
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
      contents: `You are a friendly and encouraging math tutor. The user asks: "${topic}". Provide a clear, concise explanation with examples. Use Markdown formatting.`,
    });
    return response.text || "No advice available.";
  } catch (error) {
    console.error("Error fetching advice:", error);
    return "Could not load advice.";
  }
};
