import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseReminderRequest(input: string, currentTimeISO: string): Promise<{ 
  data: { task: string; datetime: string; isRecurringYearly?: boolean } | null;
  tokens?: number;
}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Eres un asistente para adultos mayores. Analiza la siguiente solicitud de recordatorio y extrae la tarea y la fecha/hora exacta para el recordatorio. 
La hora local actual es: ${currentTimeISO}.
Si la solicitud es ambigua (ej. "a las 3"), asume que es la próxima ocurrencia de esa hora (ej. hoy a las 15:00 si son las 10:00, o mañana a las 15:00 si son las 16:00).
Si la solicitud NO menciona una hora específica (ej. "el viernes", "mañana", "el 15 de mayo"), DEBES asignar las 08:00 AM (08:00:00) como hora por defecto para ese día.
Si la solicitud menciona un cumpleaños o aniversario, marca isRecurringYearly como true.
Solicitud: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING, description: "La tarea a recordar, escrita de forma clara y directa (ej. 'Apagar la luz', 'Cumpleaños de Juan')." },
            datetime: { type: Type.STRING, description: "La fecha y hora exacta para el recordatorio en formato ISO 8601. Si no se especificó hora, debe ser a las 08:00:00 del día correspondiente." },
            isRecurringYearly: { type: Type.BOOLEAN, description: "Verdadero si la tarea es un cumpleaños, aniversario o evento que se repite cada año." }
          },
          required: ["task", "datetime"]
        }
      }
    });
    
    const tokens = response.usageMetadata?.totalTokenCount;

    if (response.text) {
      return { data: JSON.parse(response.text), tokens };
    }
    return { data: null, tokens };
  } catch (error) {
    console.error("Error parsing reminder:", error);
    return { data: null };
  }
}
