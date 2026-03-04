import { useState } from "react";
import { UserProfile } from "../types";
import { User, CheckCircle2 } from "lucide-react";

interface WelcomeScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<'M' | 'F' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && gender) {
      onComplete({ name: name.trim(), gender });
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] px-4 py-12 font-sans text-gray-900 md:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-800">
            ¡Bienvenido!
          </h1>
          <p className="mt-4 text-2xl text-gray-600">
            Para empezar, cuénteme un poco sobre usted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="mb-4 block text-2xl font-medium text-gray-700">
              ¿Cómo le gustaría que le llamemos?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGender('M')}
                className={`flex flex-col items-center justify-center rounded-2xl border-4 p-6 transition-all ${
                  gender === 'M' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-3xl font-bold">Señor</span>
                <span className="mt-2 text-xl">(Sr.)</span>
              </button>
              
              <button
                type="button"
                onClick={() => setGender('F')}
                className={`flex flex-col items-center justify-center rounded-2xl border-4 p-6 transition-all ${
                  gender === 'F' 
                    ? 'border-pink-500 bg-pink-50 text-pink-700' 
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-3xl font-bold">Señora</span>
                <span className="mt-2 text-xl">(Sra.)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-4 block text-2xl font-medium text-gray-700">
              ¿Cuál es su nombre?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Antonio, María..."
              className="w-full rounded-2xl border-4 border-gray-200 bg-gray-50 p-6 text-3xl text-gray-800 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !gender}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-6 text-3xl font-bold text-white transition-colors hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            <CheckCircle2 className="h-10 w-10" />
            <span>Comenzar</span>
          </button>
        </form>
      </div>
    </div>
  );
}
