// genai.ts
import { GoogleGenerativeAI } from "@google/genai";

// Solo para DESARROLLO LOCAL: define VITE_GEMINI_API_KEY en un .env (NO subir a GitHub)
const key = import.meta.env.VITE_GEMINI_API_KEY;

export function isAIAvailable(): boolean {
  return typeof key === "string" && key.trim().length > 0;
}

export function getGenAI(): GoogleGenerativeAI | null {
  if (!isAIAvailable()) return null;
  try {
    return new GoogleGenerativeAI(key as string);
  } catch (err) {
    console.error("Error inicializando GoogleGenerativeAI:", err);
    return null;
  }
}
