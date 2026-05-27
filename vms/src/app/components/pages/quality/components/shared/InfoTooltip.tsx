import { Info } from "lucide-react";
import { useState } from "react";

interface InfoTooltipProps { text: string }

export const InfoTooltip = ({ text }: InfoTooltipProps) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <Info
        className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute right-0 top-5 z-50 w-56 rounded-lg bg-neutral-900 text-white text-xs p-2.5 shadow-xl leading-relaxed">
          {text}
        </div>
      )}
    </div>
  );
};
