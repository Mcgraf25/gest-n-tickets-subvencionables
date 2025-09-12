import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES, ELIGIBILITY } from "../constants";
import { Receipt, ReceiptItem } from "../types";

// FIX: Initialize GoogleGenAI with a named apiKey object.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const schema = {
  type: Type.OBJECT,
  properties: {
    storeName: { type: Type.STRING, description: "Nombre de la tienda o proveedor." },
    transactionDate: { type: Type.STRING, description: "Fecha de la transacción en formato YYYY-MM-DD." },
    totalAmount: { type: Type.NUMBER, description: "Importe total del recibo." },
    items: {
      type: Type.ARRAY,
      description: "Lista de todos los artículos del recibo.",
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Descripción del artículo." },
          quantity: { type: Type.NUMBER, description: "Cantidad del artículo." },
          price: { type: Type.NUMBER, description: "Precio total del artículo (cantidad * precio unitario)." },
          category: {
            type: Type.STRING,
            enum: CATEGORIES as unknown as string[],
            description: "Categoría del gasto."
          },
          eligibilitySuggestion: {
            type: Type.STRING,
            enum: ELIGIBILITY as unknown as string[],
            description: "Sugerencia de elegibilidad basada en las reglas proporcionadas. Debe ser 'Subvencionable', 'No Subvencionable' o 'Dudoso'."
          }
        },
        required: ["description", "quantity", "price", "category", "eligibilitySuggestion"]
      }
    }
  },
  required: ["storeName", "transactionDate", "totalAmount", "items"]
};

export type ExtractedReceipt = Omit<Receipt, 'id' | 'fileName' | 'fileUrl' | 'base64Content' | 'mimeType' | 'items'> & {
    items: Omit<ReceiptItem, 'id' | 'manualEligibility'>[];
};


export async function extractReceiptInfo(
    fileContent: string,
    mimeType: string,
    guidelines: string
): Promise<ExtractedReceipt | null> {
  try {
    // FIX: Use the 'gemini-2.5-flash' model for general text tasks.
    const model = "gemini-2.5-flash";

    const prompt = `
        Analiza la siguiente imagen de un recibo. Extrae la información y formatea la salida como un objeto JSON que se ajuste al esquema proporcionado.
        Aplica las siguientes reglas de elegibilidad para determinar el campo 'eligibilitySuggestion' para cada artículo:
        --- REGLAS DE SUBVENCIONABILIDAD ---
        ${guidelines}
        --- FIN DE LAS REGLAS ---
        Si un artículo no se ajusta claramente a las reglas o la información es ambigua, márcalo como 'Dudoso'.
        Asegúrate de que la fecha esté en formato YYYY-MM-DD.
        Calcula el precio total para cada artículo (cantidad * precio unitario).
    `;

    // FIX: Call generateContent with model name and prompt, and a JSON schema for the response.
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: fileContent, mimeType: mimeType } },
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    // FIX: Correctly extract text from the response object.
    const jsonString = response.text.trim();
    const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
    const data = JSON.parse(cleanedJsonString);
    
    if (!data.storeName || !data.transactionDate || !data.items) {
        console.error("Invalid data structure from API:", data);
        return null;
    }

    return data as ExtractedReceipt;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Implement robust error handling, e.g., retries or user feedback.
    return null;
  }
}