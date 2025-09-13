// services/geminiService.ts
import { getGenAI, isAIAvailable } from "../genai";
import type { ExtractedReceipt } from "../types";

export { isAIAvailable };

/**
 * Procesa un ticket con la API de Gemini si está disponible.
 * Si no hay clave o falla el SDK, devuelve null (no rompe la app).
 */
export async function extractReceiptInfo(
  base64Content: string,
  mimeType: string,
  guidelines: string
): Promise<ExtractedReceipt | null> {
  const genai = await getGenAI();
  if (!genai) {
    console.warn("⚠️ Gemini desactivado o no inicializado. extractReceiptInfo -> null");
    return null;
  }

  try {
    // Intentamos la API clásica:
    if (typeof genai.getGenerativeModel === "function") {
      const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const res = await model.generateContent([
        { text: buildPrompt(guidelines) },
        { inlineData: { data: base64Content, mimeType } },
      ]);

      const text = typeof res?.response?.text === "function"
        ? res.response.text()
        : (res?.response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "");

      const jsonStr = pickJson(text);
      const data = JSON.parse(jsonStr);
      if (!data || !Array.isArray(data.items)) throw new Error("Formato inesperado");
      return data as ExtractedReceipt;
    }

    // Intentamos APIs alternativas (por si el SDK expone métodos distintos):
    if (genai?.responses?.generate) {
      const res = await genai.responses.generate({
        model: "gemini-1.5-flash",
        input: [
          { role: "user", content: [{ text: buildPrompt(guidelines) }, { inlineData: { data: base64Content, mimeType } }] }
        ]
      });
      const text = res?.output_text || res?.response?.text?.() || "";
      const jsonStr = pickJson(text);
      const data = JSON.parse(jsonStr);
      if (!data || !Array.isArray(data.items)) throw new Error("Formato inesperado");
      return data as ExtractedReceipt;
    }

    console.warn("SDK de Gemini sin método conocido para generar contenido.");
    return null;
  } catch (err) {
    console.error("❌ Error en extractReceiptInfo:", err);
    return null;
  }
}

function buildPrompt(guidelines: string) {
  return `
Eres un asistente que extrae información estructurada de tickets/recibos.
Devuélveme SOLO un JSON válido con este esquema:
{
  "storeName": string,
  "transactionDate": string,
  "total": number,
  "items": [
    {
      "description": string,
      "quantity": number,
      "price": number,
      "eligibilitySuggestion": "Eligible" | "NotEligible" | "Doubt"
    }
  ],
  "eligibilitySummary": string
}

Ten en cuenta estas reglas internas:
${guidelines}
`.trim();
}

function pickJson(text: string): string {
  const m = text?.match(/\{[\s\S]*\}$/);
  return m ? m[0] : text;
}
