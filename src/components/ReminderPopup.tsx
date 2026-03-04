import { motion, AnimatePresence } from "motion/react";
import { Bell, Check } from "lucide-react";
import { Reminder } from "../types";

interface ReminderPopupProps {
  reminder: Reminder | null;
  onDismiss: (id: string) => void;
}

export function ReminderPopup({ reminder, onDismiss }: ReminderPopupProps) {
  return (
    <AnimatePresence>
      {reminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="bg-primary-600 p-8 text-center text-white">
              <Bell className="mx-auto mb-4 h-20 w-20 animate-bounce" />
              <h2 className="text-4xl font-bold tracking-tight">¡Recordatorio!</h2>
            </div>
            
            <div className="p-8 text-center">
              <p className="mb-8 text-3xl font-medium leading-tight text-gray-800">
                {reminder.task}
              </p>
              
              <button
                onClick={() => onDismiss(reminder.id)}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-6 text-2xl font-bold text-white transition-colors hover:bg-green-700 active:bg-green-800"
              >
                <Check className="h-8 w-8" />
                <span>Entendido</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
