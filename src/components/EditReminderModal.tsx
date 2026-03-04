import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Save, X } from "lucide-react";
import { Reminder } from "../types";
import { format, parseISO } from "date-fns";

interface EditReminderModalProps {
  reminder: Reminder | null;
  onSave: (id: string, task: string, datetime: string) => void;
  onCancel: () => void;
}

export function EditReminderModal({ reminder, onSave, onCancel }: EditReminderModalProps) {
  const [task, setTask] = useState("");
  const [datetime, setDatetime] = useState("");

  useEffect(() => {
    if (reminder) {
      setTask(reminder.task);
      // Format for datetime-local input: YYYY-MM-DDThh:mm
      setDatetime(format(parseISO(reminder.datetime), "yyyy-MM-dd'T'HH:mm"));
    }
  }, [reminder]);

  if (!reminder) return null;

  const handleSave = () => {
    if (!task.trim() || !datetime) return;
    const isoString = new Date(datetime).toISOString();
    onSave(reminder.id, task, isoString);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between bg-primary-600 p-6 text-white">
            <h2 className="text-3xl font-bold">Editar Tarea</h2>
            <button 
              onClick={onCancel} 
              className="rounded-full bg-primary-700 p-3 transition-colors hover:bg-primary-800"
              title="Cancelar"
            >
              <X className="h-8 w-8" />
            </button>
          </div>
          
          <div className="space-y-6 p-8">
            <div>
              <label className="mb-3 block text-xl font-medium text-gray-700">
                ¿Qué necesitas recordar?
              </label>
              <input 
                type="text" 
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 text-2xl text-gray-800 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
              />
            </div>
            
            <div>
              <label className="mb-3 block text-xl font-medium text-gray-700">
                ¿Cuándo? (Fecha y Hora)
              </label>
              <input 
                type="datetime-local" 
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 text-2xl text-gray-800 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
              />
            </div>
            
            <button
              onClick={handleSave}
              disabled={!task.trim() || !datetime}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-5 text-2xl font-bold text-white transition-colors hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              <Save className="h-8 w-8" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
