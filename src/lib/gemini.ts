import { GoogleGenerativeAI } from "@google/generative-ai";

// REGLAS ESTRICTAS DE MODELOS (Basado en instrucciones del usuario 2026):
// 1. gemini-2.5-pro (Prioridad máxima por defecto)
// 2. gemini-3.0-pro (Si está disponible, debe ser el nuevo default)
// 3. Fallbacks: gemini-2.5-pro-exp, gemini-2.5-flash / gemini-3-flash
// Usamos el modelo configurado en el .env si existe, sino el default pro.
export const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-pro";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export const getGeminiModel = () => {
    return genAI.getGenerativeModel({ model: MODEL_NAME });
};

/**
 * Genera metadatos SEO basados en el contenido de una noticia.
 */
export async function generateSEOData(content: string) {
    const model = getGeminiModel();

    // Prompt optimizado para SEO en español
    const prompt = `
    Actúa como un experto en SEO para Uruguay. Analiza el siguiente contenido de una noticia para el "Círculo Policial de San José"
    y genera un objeto JSON con:
    1. "description": Una meta descripción de máximo 160 caracteres que sea atractiva para Google.
    2. "keywords": Una lista de 5 a 8 palabras clave separadas por comas.

    Contenido de la noticia:
    ${content.substring(0, 3000)}

    Responde SOLAMENTE el objeto JSON puro, sin markdown ni explicaciones.
    Ejemplo de salida: {"description": "...", "keywords": "..."}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Limpiar posible markdown en la respuesta
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating SEO with Gemini:", error);
        throw new Error("No se pudo generar el SEO automáticamente. Verifica tu configuración o API Key.");
    }
}
