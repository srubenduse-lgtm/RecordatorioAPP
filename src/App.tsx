/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { ReminderInput } from "./components/ReminderInput";
import { ReminderList } from "./components/ReminderList";
import { ReminderPopup } from "./components/ReminderPopup";
import { EditReminderModal } from "./components/EditReminderModal";
import { CalendarView } from "./components/CalendarView";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Reminder, UserProfile } from "./types";
import { isPast, parseISO, format, addYears, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

export default function App() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem("reminders");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [totalTokens, setTotalTokens] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("userProfile");
    return saved ? JSON.parse(saved) : null;
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Save to localStorage whenever reminders change
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      if (userProfile.gender === 'F') {
        document.documentElement.classList.add('theme-female');
      } else {
        document.documentElement.classList.remove('theme-female');
      }
    }
  }, [userProfile]);

  // Check for due reminders every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeReminder) return; // Don't show another if one is already active

      const dueReminder = reminders.find(
        (r) => r.status === 'pending' && isPast(parseISO(r.datetime))
      );

      if (dueReminder) {
        setActiveReminder(dueReminder);
        // Play a sound if possible
        try {
          const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
          audio.play().catch(e => console.log("Audio play blocked", e));

          // Read the reminder out loud
          if ('speechSynthesis' in window) {
            const title = userProfile?.gender === 'F' ? 'Señora' : 'Señor';
            const name = userProfile?.name || '';
            const text = `Atención ${title} ${name}, tiene un recordatorio: ${dueReminder.task}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9; // Slightly slower for better comprehension
            window.speechSynthesis.speak(utterance);
          }
        } catch (e) {
          // ignore
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, activeReminder, userProfile]);

  const handleAddReminder = (newReminderData: Omit<Reminder, 'id' | 'status' | 'createdAt'>, tokens?: number) => {
    if (tokens) {
      setTotalTokens(prev => prev + tokens);
    }

    // Check for duplicates (same task text and same day)
    const isDuplicate = reminders.some(r => 
      r.status === 'pending' && 
      r.task.toLowerCase().trim() === newReminderData.task.toLowerCase().trim() &&
      isSameDay(parseISO(r.datetime), parseISO(newReminderData.datetime))
    );

    if (isDuplicate) {
      return { success: false, error: "Ya tienes este mismo recordatorio programado para ese día." };
    }

    const newReminder: Reminder = {
      ...newReminderData,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [...prev, newReminder]);
    return { success: true };
  };

  const handleDismissReminder = (id: string) => {
    // Stop reading if it's currently speaking
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setReminders((prev) => {
      const reminderToDismiss = prev.find((r) => r.id === id);
      const updated = prev.map((r) => (r.id === id ? { ...r, status: 'completed' } : r));

      if (reminderToDismiss?.isRecurringYearly) {
        const nextYearDate = addYears(parseISO(reminderToDismiss.datetime), 1);
        updated.push({
          ...reminderToDismiss,
          id: crypto.randomUUID(),
          datetime: nextYearDate.toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }

      return updated;
    });
    setActiveReminder(null);
  };

  const handleUpdateReminder = (id: string, task: string, datetime: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, task, datetime } : r))
    );
    setEditingReminder(null);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  if (!userProfile) {
    return <WelcomeScreen onComplete={setUserProfile} />;
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] px-4 py-8 font-sans text-gray-900 md:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-900 md:text-5xl">
            Asistente de {userProfile.name}
          </h1>
          <div className="mt-4 inline-block rounded-2xl bg-primary-100 px-6 py-3 text-2xl font-medium capitalize text-primary-800 shadow-sm">
            {format(currentTime, "EEEE d 'de' MMMM, h:mm a", { locale: es })}
          </div>
          <p className="mt-4 text-xl text-gray-600">
            Dime qué necesitas recordar y yo te avisaré.
          </p>
        </header>

        <main className="space-y-8">
          <ReminderInput onAddReminder={handleAddReminder} />
          
          <div className="flex rounded-2xl bg-gray-200 p-1 shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 rounded-xl py-4 text-xl font-bold transition-all ${
                viewMode === 'list' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Próximas Tareas
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 rounded-xl py-4 text-xl font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Calendario
            </button>
          </div>

          {viewMode === 'list' ? (
            <ReminderList 
              reminders={reminders} 
              onEdit={setEditingReminder}
              onDelete={handleDeleteReminder}
            />
          ) : (
            <CalendarView 
              reminders={reminders}
              onEdit={setEditingReminder}
              onDelete={handleDeleteReminder}
            />
          )}
        </main>
      </div>

      {totalTokens > 0 && (
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Tokens de IA utilizados en esta sesión: {totalTokens.toLocaleString()}</p>
          <p>Restantes (límite gratuito de 1 millón por minuto): {(1000000 - totalTokens).toLocaleString()}</p>
        </div>
      )}

      <ReminderPopup 
        reminder={activeReminder} 
        onDismiss={handleDismissReminder} 
      />

      <EditReminderModal
        reminder={editingReminder}
        onSave={handleUpdateReminder}
        onCancel={() => setEditingReminder(null)}
      />
    </div>
  );
}
