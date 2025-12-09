import { GoogleGenAI, Type } from "@google/genai";
import { FortuneResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
// Note: In a real production app, ensure the key is present.
// We handle the missing key gracefully in the UI.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateLuxuryFortune = async (ornamentType: string): Promise<FortuneResponse> => {
  if (!ai) {
    return {
      message: "Success is the best ornament. (API Key missing)",
      theme: "Classic"
    };
  }

  const modelId = "gemini-2.5-flash";
  
  let flavorText = `A guest has just picked a ${ornamentType} ornament from your magnificent Christmas tree.`;
  
  if (ornamentType === 'KITTY') {
    flavorText = `A guest has picked a rare, limited-edition Crystal Hello Kitty ornament made of pink diamonds and glass from your tree. It is cute but incredibly expensive.`;
  }

  const prompt = `
    You are a grand, sophisticated, and slightly ostentatious billionaire holiday host. 
    ${flavorText}
    
    Write a short, witty, and luxurious fortune or holiday wish for them. 
    It should sound expensive, confident, and celebratory.
    If it is the Kitty ornament, mix "cute" with "unimaginable wealth".
    Keep it under 25 words.
    
    Return the result in JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            theme: { type: Type.STRING, description: "One word summary of the vibe (e.g. Opulence, Legacy, Power, Kawaii)" }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FortuneResponse;
    }
    
    throw new Error("No response text");

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      message: "May your holidays be as golden as your future.",
      theme: "Resilience"
    };
  }
};