import { useState, useRef, useEffect } from "react";
import { Mic, Send, Loader2, Square } from "lucide-react";
import { parseReminderRequest } from "../services/gemini";
import { Reminder } from "../types";

interface ReminderInputProps {
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'status' | 'createdAt'>) => { success: boolean; error?: string };
}

export function ReminderInput({ onAddReminder }: ReminderInputProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition if available
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setError("Error al escuchar. Por favor, intente escribir.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("El reconocimiento de voz no está soportado en este navegador. Por favor, escribe tu recordatorio.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError(null);
      setInput("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
        setError("El micrófono no está disponible.");
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const nowISO = new Date().toISOString();
      const parsed = await parseReminderRequest(input, nowISO);
      
      if (parsed && parsed.task && parsed.datetime) {
        const result = onAddReminder({
          task: parsed.task,
          datetime: parsed.datetime,
          isRecurringYearly: parsed.isRecurringYearly || false
        });
        
        if (result.success) {
          setInput("");
        } else {
          setError(result.error || "El recordatorio ya existe.");
        }
      } else {
        setError("No pude entender el recordatorio. Intenta decirlo de otra forma.");
      }
    } catch (err) {
      setError("Hubo un error al procesar tu solicitud.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-semibold text-gray-800">
        ¿Qué necesitas recordar?
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ej: "Recuérdame a las 3 de la tarde apagar la luz"'
            className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 pr-16 text-xl text-gray-800 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
            rows={3}
            disabled={isProcessing}
          />
          
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full transition-all ${
              isListening 
                ? "animate-pulse bg-red-100 text-red-600" 
                : "bg-primary-100 text-primary-600 hover:bg-primary-200"
            }`}
            title={isListening ? "Detener grabación" : "Hablar"}
          >
            {isListening ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-6 w-6" />}
          </button>
        </div>

        {error && (
          <p className="text-lg font-medium text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary-600 py-5 text-2xl font-bold text-white transition-colors hover:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>Pensando...</span>
            </>
          ) : (
            <>
              <Send className="h-8 w-8" />
              <span>Programar Recordatorio</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
