import { cn } from "@/app/lib/utils";
import { useEffect, useState } from "react";

export const GridBackground = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
       setMousePosition({ x: event.clientX, y: event.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={cn("absolute inset-0 z-0 overflow-hidden pointer-events-none", className)} {...props}>
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#00775B 1px, transparent 1px), linear-gradient(90deg, #00775B 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div 
        className="absolute w-[300px] h-[300px] bg-[#00775B]/20 rounded-full blur-[100px] transition-transform duration-75"
        style={{
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
          opacity: 0.1
        }}
      />
    </div>
  );
};
