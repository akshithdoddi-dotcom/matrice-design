import * as React from "react";

interface PatternConfig {
  id: string;
  color: string;
}

interface PatternDefsProps {
  patterns: PatternConfig[];
}

export function PatternDefs({ patterns }: PatternDefsProps) {
  if (patterns.length === 0) return null;

  return (
    <defs>
      {patterns.map(({ id, color }) => {
        switch (id) {
          case "crosshatch":
            return (
              <pattern
                key={id}
                id={`pattern-${id}-${color}`}
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 0L8 8M8 0L0 8"
                  stroke={color}
                  strokeWidth="1.5"
                  fill="none"
                />
              </pattern>
            );
          case "diagonal":
            return (
              <pattern
                key={id}
                id={`pattern-${id}-${color}`}
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 6L6 0"
                  stroke={color}
                  strokeWidth="1.5"
                  fill="none"
                />
              </pattern>
            );
          case "dots":
            return (
              <pattern
                key={id}
                id={`pattern-${id}-${color}`}
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="3" cy="3" r="1.5" fill={color} />
              </pattern>
            );
          case "horizontal-lines":
            return (
              <pattern
                key={id}
                id={`pattern-${id}-${color}`}
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
              >
                <path d="M0 3H6" stroke={color} strokeWidth="1.5" fill="none" />
              </pattern>
            );
          default:
            return null;
        }
      })}
    </defs>
  );
}

export function getPatternFill(pattern: string, color: string): string {
  return `url(#pattern-${pattern}-${color})`;
}
