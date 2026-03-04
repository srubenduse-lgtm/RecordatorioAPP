import { useState } from "react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, parseISO, isToday 
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reminder } from "../types";
import { ReminderList } from "./ReminderList";

interface CalendarViewProps {
  reminders: Reminder[];
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

export function CalendarView({ reminders, onEdit, onDelete }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 1 });
  const endDate = endOfWeek(monthEnd, { weekStarts: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const selectedDateReminders = selectedDate 
    ? reminders.filter(r => isSameDay(parseISO(r.datetime), selectedDate) && r.status === 'pending')
    : [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={prevMonth}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200"
            title="Mes anterior"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <h2 className="text-3xl font-bold capitalize text-gray-800">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>
          <button 
            onClick={nextMonth}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200"
            title="Mes siguiente"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-2 text-center">
          {weekDays.map(day => (
            <div key={day} className="text-lg font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayReminders = reminders.filter(r => isSameDay(parseISO(r.datetime), day) && r.status === 'pending');
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`group relative flex h-16 flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                  !isCurrentMonth ? "text-gray-300 border-transparent" :
                  isSelected ? "border-primary-600 bg-primary-50 text-primary-700" :
                  isDayToday ? "border-primary-200 bg-primary-50 text-primary-800" :
                  "border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className={`text-xl font-medium ${isSelected || isDayToday ? "font-bold" : ""}`}>
                  {format(day, "d")}
                </span>
                {dayReminders.length > 0 && (
                  <>
                    <div className="absolute bottom-1.5 flex gap-1">
                      {dayReminders.slice(0, 3).map((_, i) => (
                        <div key={i} className={`h-2 w-2 rounded-full ${isSelected ? "bg-primary-600" : "bg-primary-400"}`} />
                      ))}
                      {dayReminders.length > 3 && <div className="h-2 w-2 rounded-full bg-primary-400" />}
                    </div>
                    
                    {/* Tooltip (Pop-up) */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-max max-w-[280px] opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                      <div className="rounded-xl bg-gray-900 px-3 py-2 text-left text-xs text-white shadow-xl">
                        <p className="mb-1.5 border-b border-gray-700 pb-1 font-bold text-gray-300">
                          {format(day, "d 'de' MMMM", { locale: es })}
                        </p>
                        <ul className="space-y-2">
                          {dayReminders.map(r => (
                            <li key={r.id} className="flex flex-col leading-tight">
                              <span className="font-semibold text-primary-300">
                                {format(parseISO(r.datetime), "h:mm a")}
                                {r.isRecurringYearly && " (Anual)"}
                              </span>
                              <span className="whitespace-normal break-words text-gray-100">
                                {r.task}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-gray-900"></div>
                      </div>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-8">
          <ReminderList 
            reminders={selectedDateReminders} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            title={`Tareas para el ${format(selectedDate, "d 'de' MMMM", { locale: es })}`}
            emptyMessage="No hay tareas para este día"
          />
        </div>
      )}
    </div>
  );
}
