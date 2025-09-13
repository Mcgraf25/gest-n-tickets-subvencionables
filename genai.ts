// genai.ts
// ⚠️ NO hagas import estático de '@google/genai' para evitar errores de build.
// Usamos importación dinámica y soportamos distintas formas del SDK.

const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export function isAIAvailable(): boolean {
  return !!(key && key.trim());
}

/**
 * Crea el cliente de Gemini de forma segura y compatible con distintas versiones del SDK.
 * - Si no hay clave, devuelve null.
 * - Si el SDK cambia el nombre del constructor (GoogleAI vs GoogleGenerativeAI), lo resolvemos.
 * - Probamos ambas firmas de constructor: { apiKey } y apiKey plano.
 */
export async function getGenAI(): Promise<any | null> {
  if (!isAIAvailable()) return null;

  try {
    const mod: any = await import("@google/genai"); // import dinámico
    // Distintas posibilidades según versión del paquete
    const Ctor =
      mod.GoogleAI ||
      mod.GoogleGenerativeAI ||
      mod.default ||
      null;

    if (!Ctor) {
      console.warn("No se pudo localizar el constructor del SDK de Gemini en '@google/genai'.");
      return null;
    }

    // Algunas versiones usan new Ctor({ apiKey }), otras new Ctor(apiKey)
    try {
      return new Ctor({ apiKey: key });
    } catch {
      try {
        return new Ctor(key);
      } catch (e) {
        console.error("No fue posible instanciar el cliente de Gemini:", e);
        return null;
      }
    }
  } catch (e) {
    console.error("Fallo al importar dinámicamente '@google/genai':", e);
    return null;
  }
}
