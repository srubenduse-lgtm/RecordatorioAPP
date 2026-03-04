import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Calendar, CheckCircle2, Pencil, Trash2, Repeat } from "lucide-react";
import { Reminder } from "../types";

interface ReminderListProps {
  reminders: Reminder[];
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  title?: string;
  emptyMessage?: string;
}

export function ReminderList({ 
  reminders, 
  onEdit, 
  onDelete,
  title = "Próximos Recordatorios",
  emptyMessage = "No tienes recordatorios pendientes"
}: ReminderListProps) {
  const pendingReminders = reminders
    .filter((r) => r.status === 'pending')
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  if (pendingReminders.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h3 className="text-2xl font-medium text-gray-600">
          {emptyMessage}
        </h3>
        <p className="mt-2 text-lg text-gray-500">
          ¡Todo está al día!
        </p>
      </div>
    );
  }

  const formatFriendlyDate = (isoString: string) => {
    const date = parseISO(isoString);
    if (isToday(date)) {
      return `Hoy a las ${format(date, "h:mm a", { locale: es })}`;
    } else if (isTomorrow(date)) {
      return `Mañana a las ${format(date, "h:mm a", { locale: es })}`;
    } else {
      return format(date, "EEEE d 'de' MMMM, h:mm a", { locale: es });
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="px-2 text-2xl font-semibold text-gray-800">
          {title}
        </h2>
      )}
      
      <div className="grid gap-4">
        {pendingReminders.map((reminder) => (
          <div 
            key={reminder.id}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-md transition-transform hover:scale-[1.02]"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Clock className="h-8 w-8" />
            </div>
            
            <div className="flex-1">
              <p className="flex items-center gap-2 text-xl font-medium text-gray-800">
                {reminder.task}
                {reminder.isRecurringYearly && (
                  <Repeat className="h-5 w-5 text-primary-500" title="Se repite cada año" />
                )}
              </p>
              <div className="mt-1 flex items-center gap-2 text-lg text-gray-500">
                <Calendar className="h-5 w-5" />
                <span className="capitalize">{formatFriendlyDate(reminder.datetime)}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button 
                onClick={() => onEdit(reminder)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-primary-100 hover:text-primary-600"
                title="Editar"
              >
                <Pencil className="h-7 w-7" />
              </button>
              <button 
                onClick={() => onDelete(reminder.id)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-red-100 hover:text-red-600"
                title="Eliminar"
              >
                <Trash2 className="h-7 w-7" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
