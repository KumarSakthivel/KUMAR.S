// Fix: Update package to @google/genai
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { Language } from "../types";

// Fix: Initialize GoogleGenAI client according to guidelines.
// The API key is sourced from the environment variable `process.env.API_KEY`.
// It is assumed to be pre-configured and available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateChatResponse = async (userPrompt: string, language: Language, history: { text: string, sender: 'user' | 'ai' }[] = []): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  // Fix: Use systemInstruction for better prompt structure.
  const systemInstruction = `You are a helpful assistant for Learnio.AI.
The user requires a response in ${language === 'en' ? 'English' : 'Tamil'}.
Your entire response must be in ${language === 'en' ? 'English' : 'Tamil'}.

Strictly adhere to the following formatting rules:
1. Your response must be a numbered list (e.g., 1., 2., 3.).
2. Each numbered point must start with a subtitle, formatted in bold using markdown (e.g., **Subtitle:**).
3. The explanation text must follow the subtitle on the same line.
4. Ensure there is one blank line between each numbered point to create clean separation.
5. Do not use any other special symbols, asterisks, or markdown formatting. The only markdown allowed is for the bold subtitle.
6. The tone must be clear, polite, and professional.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: userPrompt,
        config: {
          systemInstruction,
        }
    });
    
    return response.text.trim();

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
};

export const summarizeText = async (text: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const fullPrompt = `Summarize the following conversation/text into a few key points, using a numbered list. Keep it concise and clear:\n\n${text}`;
  
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
          model: model,
          contents: fullPrompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error("Error summarizing text with Gemini API:", error);
      return "Sorry, I couldn't summarize the text.";
    }
  };