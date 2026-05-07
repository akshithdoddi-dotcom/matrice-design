import { cn } from "@/app/lib/utils";

type Severity = "critical" | "high" | "medium" | "low" | "info" | "resolved" | string;

interface SeverityIconProps {
  severity: Severity;
  className?: string;
  mode?: "default" | "inverse";
}

export const SeverityIcon = ({ severity, className, mode = "default" }: SeverityIconProps) => {
  const normSeverity = severity.toLowerCase();
  
  // Colors for "inverse" mode (inner glyph color)
  // For default mode, these are the main fill colors
  let colorClass = "text-neutral-500";
  
  if (normSeverity === "critical") colorClass = "text-red-600";
  else if (normSeverity === "high") colorClass = "text-[#EA580C]"; // Darker Orange (Orange-600)
  else if (normSeverity === "medium") colorClass = "text-[#CA8A04]"; // Darker Gold/Yellow (Yellow-600)
  else if (normSeverity === "low") colorClass = "text-blue-500";
  else if (normSeverity === "info") colorClass = "text-neutral-500";
  else if (normSeverity === "resolved") colorClass = "text-green-600";

  // Define Shapes
  const Triangle = (
    <path d="M1 21h22L12 2 1 21z" fill="currentColor" />
  );
  
  const Circle = (
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" />
  );

  // Define Inner Glyphs
  const Exclamation = (
    <path d="M13 18h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  );

  const InfoChar = (
    <path d="M13 17h-2v-6h2v6zm0-8h-2V7h2v2z" />
  );

  const CheckMark = (
    <path d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  );

  let MainShape = Circle;
  let InnerGlyph = InfoChar;

  switch (normSeverity) {
    case "critical":
    case "high":
    case "medium":
    case "low":
    case "warning": // legacy support
      MainShape = Triangle;
      InnerGlyph = Exclamation;
      break;
    case "resolved":
      MainShape = Circle;
      InnerGlyph = CheckMark;
      break;
    case "info":
    default:
      MainShape = Circle;
      InnerGlyph = InfoChar;
      break;
  }

  // Styling logic
  // Mode "default": MainShape is colored (using colorClass), InnerGlyph is White.
  // Mode "inverse": MainShape is White, InnerGlyph is colored (using colorClass).
  
  const mainClass = mode === "default" ? colorClass : "text-white";
  const innerFill = mode === "default" ? "white" : "currentColor"; // If inverse, inner glyph takes container color (which we set to the severity color via style or class if needed, OR we explicitly set fill)
  
  // Actually, for inverse mode, we want the inner glyph to be the severity color. 
  // But if we are placing this ON a severity-colored background, we want the inner glyph to match the background?
  // If the background is Red, and we want a "hole", the inner glyph should be Red.
  // So:
  // Inverse Mode (for Red bg): Triangle = White, Exclamation = Red.
  
  const innerStyle = mode === "inverse" 
    ? { fill: normSeverity === "critical" ? "#DC2626" 
             : normSeverity === "high" ? "#EA580C"
             : normSeverity === "medium" ? "#CA8A04"
             : normSeverity === "low" ? "#3B82F6"
             : normSeverity === "resolved" ? "#16A34A"
             : "#737373" }
    : { fill: "white" };

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={cn("shrink-0", mainClass, className)}
    >
      {MainShape}
      <g style={innerStyle}>
        {InnerGlyph}
      </g>
    </svg>
  );
};
