// services/geminiService.ts
import { getGenAI, isAIAvailable } from "../genai";
import type { ExtractedReceipt } from "../types";

export { isAIAvailable }; // lo usaremos en App para saber si mostrar aviso o no

/**
 * Procesa un ticket con la API de Gemini si está disponible.
 * Si no hay clave, devuelve null en lugar de romper la app.
 */
export async function extractReceiptInfo(
  base64Content: string,
  mimeType: string,
  guidelines: string
): Promise<ExtractedReceipt | null> {
  const genai = getGenAI();
  if (!genai) {
    console.warn("⚠️ Gemini desactivado: no hay API key. extractReceiptInfo -> null");
    return null;
  }

  try {
    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Eres un asistente que extrae información estructurada de tickets/recibos.
Devuélveme SOLO un JSON válido con este esquema:
{
  "storeName": string,
  "transactionDate": string,     // ISO o 'YYYY-MM-DD'
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
`;

    const res = await model.generateContent([
      { text: prompt },
      { inlineData: { data: base64Content, mimeType } },
    ]);

    const text = res.response.text();

    // Si la IA devuelve texto con más cosas, intenta quedarte con el JSON
    const jsonMatch = text.match(/\{[\s\S]*\}$/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;

    const data = JSON.parse(jsonStr);

    if (!data || !Array.isArray(data.items)) {
      throw new Error("La respuesta de IA no tiene el formato esperado");
    }

    return data as ExtractedReceipt;
  } catch (err) {
    console.error("❌ Error en extractReceiptInfo:", err);
    return null;
  }
}
