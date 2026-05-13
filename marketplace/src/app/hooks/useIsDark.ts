import { useState, useEffect } from "react";

/**
 * Reactively returns whether the root <html> element has the "dark" class.
 * Updates instantly whenever the theme is toggled via App.tsx's isDark state.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
