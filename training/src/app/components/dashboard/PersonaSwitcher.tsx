import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";
import { Monitor, Briefcase, TrendingUp } from "lucide-react";

export type Persona = "monitoring" | "manager" | "director";

interface PersonaSwitcherProps {
  activePersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export const PersonaSwitcher = ({ activePersona, onPersonaChange }: PersonaSwitcherProps) => {
  const personas: { id: Persona; label: string; icon: any }[] = [
    { id: "monitoring", label: "Monitoring", icon: Monitor },
    { id: "manager", label: "Manager", icon: Briefcase },
    { id: "director", label: "Director", icon: TrendingUp },
  ];

  return (
    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full p-1 relative">
      {personas.map((persona) => {
        const isActive = activePersona === persona.id;
        return (
          <button
            key={persona.id}
            onClick={() => onPersonaChange(persona.id)}
            title={persona.label}
            aria-label={persona.label}
            className={cn(
              "relative z-10 flex items-center justify-center p-1.5 transition-colors duration-200 rounded-full",
              isActive ? "text-white" : "text-white/60 hover:text-white"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activePersona"
                className="absolute inset-0 bg-[#00775B] rounded-full shadow-sm z-[-1]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <persona.icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};
