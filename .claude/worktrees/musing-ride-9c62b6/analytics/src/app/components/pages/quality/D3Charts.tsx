/**
 * D3Charts.tsx
 * Reusable D3-powered chart primitives for the Quality Analytics dashboard.
 * Works alongside Recharts: use these for custom SVG charts where Recharts
 * has no equivalent (gauges, heatmaps, sparklines, radial).
 */

import { useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";

// ─────────────────────────────────────────────────────────────────────────────
// D3Gauge
// Semi-circular arc gauge with colour bands (green / amber / red zones).
// Replaces the Recharts PieChart semi-circle — gives a proper arc + pointer.
// ─────────────────────────────────────────────────────────────────────────────
interface D3GaugeProps {
  value: number;          // 0–100
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  /** colour breakpoints: below first = green, below second = amber, else red */
  warnAt?: number;        // default 5
  critAt?: number;        // default 10
  width?: number;
  height?: number;
}

export const D3Gauge = ({
  value,
  min = 0,
  max = 20,
  label = "",
  unit = "%",
  warnAt = 5,
  critAt = 10,
  width = 200,
  height = 120,
}: D3GaugeProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cx = width / 2;
    const cy = height - 16;
    const R  = Math.min(cx, cy) - 8;
    const r  = R * 0.62;

    // Angle helpers: gauge spans from -π to 0 (left half of unit circle)
    const angleScale = d3.scaleLinear([min, max], [-Math.PI, 0]);

    // Colour bands
    const bands = [
      { from: min,   to: warnAt, color: "#16A34A" },
      { from: warnAt, to: critAt, color: "#F59E0B" },
      { from: critAt, to: max,    color: "#EF4444" },
    ];

    const arcGen = d3.arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(r)
      .outerRadius(R)
      .startAngle((d) => d.startAngle)
      .endAngle((d) => d.endAngle);

    const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);

    // Background track
    g.append("path")
      .attr("d", arcGen({ startAngle: -Math.PI, endAngle: 0 }) as string)
      .attr("fill", "#F1F5F9");

    // Coloured bands
    bands.forEach(({ from, to, color }) => {
      const startA = angleScale(Math.max(from, min));
      const endA   = angleScale(Math.min(to, max));
      if (startA >= endA) return;
      g.append("path")
        .attr("d", arcGen({ startAngle: startA, endAngle: endA }) as string)
        .attr("fill", color)
        .attr("opacity", 0.75);
    });

    // Value arc overlay (filled, more opaque)
    const valAngle = angleScale(Math.min(Math.max(value, min), max));
    const valColor = value < warnAt ? "#16A34A" : value < critAt ? "#F59E0B" : "#EF4444";

    g.append("path")
      .attr("d", arcGen({ startAngle: -Math.PI, endAngle: valAngle }) as string)
      .attr("fill", valColor)
      .attr("opacity", 1);

    // Needle
    const needleAngle = valAngle - Math.PI / 2; // rotate 90° so 0 is up
    const nx = (r - 6) * Math.cos(valAngle);
    const ny = (r - 6) * Math.sin(valAngle);

    g.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", nx).attr("y2", ny)
      .attr("stroke", "#1E293B")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round");

    g.append("circle").attr("r", 4).attr("fill", "#1E293B");

    // Centre value text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-4px")
      .attr("font-size", "18px")
      .attr("font-weight", "900")
      .attr("fill", valColor)
      .text(`${value}${unit}`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "14px")
      .attr("font-size", "9px")
      .attr("fill", "#94A3B8")
      .attr("letter-spacing", "0.1em")
      .text(label.toUpperCase());

    // Min / Max labels
    svg.append("text")
      .attr("x", cx - R + 2).attr("y", cy + 14)
      .attr("text-anchor", "start")
      .attr("font-size", "8px").attr("fill", "#94A3B8")
      .text(`${min}${unit}`);

    svg.append("text")
      .attr("x", cx + R - 2).attr("y", cy + 14)
      .attr("text-anchor", "end")
      .attr("font-size", "8px").attr("fill", "#94A3B8")
      .text(`${max}${unit}`);

  }, [value, min, max, warnAt, critAt, width, height, label, unit]);

  return <svg ref={svgRef} width={width} height={height} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// D3ZoneHeatmap
// Grid of coloured cells using d3.scaleSequential with RdYlGn interpolator.
// complianceRate drives color: 100 = green, 0 = red.
// ─────────────────────────────────────────────────────────────────────────────
export interface ZoneCell {
  id: string;
  name: string;
  complianceRate: number;   // 0–100
  violations: number;
  status: "safe" | "warning" | "critical";
}

interface D3ZoneHeatmapProps {
  zones: ZoneCell[];
  violationLabel: string;
  columns?: number;
  cellHeight?: number;
  /** Domain for compliance color scale — default [0,100]. Use e.g. [60,100] for
   *  dashboards where sub-60% compliance never occurs, giving better color discrimination. */
  colorDomain?: [number, number];
}

export const D3ZoneHeatmap = ({
  zones,
  violationLabel,
  columns = 6,
  cellHeight = 64,
  colorDomain = [0, 100],
}: D3ZoneHeatmapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);

  const colorScale = useMemo(
    () => d3.scaleSequential(colorDomain, d3.interpolateRdYlGn),
    [colorDomain[0], colorDomain[1]]
  );

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const totalW  = containerRef.current.clientWidth || 600;
    const cellW   = totalW / columns;
    const rows    = Math.ceil(zones.length / columns);
    const totalH  = rows * cellHeight;

    const svg = d3.select(svgRef.current)
      .attr("width", totalW)
      .attr("height", totalH);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    zones.forEach((zone, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x   = col * cellW;
      const y   = row * cellHeight;
      const fill = colorScale(zone.complianceRate);
      const isCritical = zone.status === "critical";

      // Cell background
      const cell = g.append("g").attr("transform", `translate(${x},${y})`);

      cell.append("rect")
        .attr("width", cellW - 2)
        .attr("height", cellHeight - 2)
        .attr("rx", 4)
        .attr("fill", fill)
        .attr("opacity", 0.85)
        .attr("stroke", isCritical ? "#EF4444" : "rgba(0,0,0,0.08)")
        .attr("stroke-width", isCritical ? 1.5 : 0.5);

      // Zone name
      cell.append("text")
        .attr("x", 6).attr("y", 16)
        .attr("font-size", "9px")
        .attr("font-weight", "700")
        .attr("fill", zone.complianceRate > 50 ? "#1E293B" : "#F8FAFC")
        .text(zone.name.length > 13 ? zone.name.slice(0, 12) + "…" : zone.name);

      // Compliance rate
      cell.append("text")
        .attr("x", 6).attr("y", 36)
        .attr("font-size", "16px")
        .attr("font-weight", "900")
        .attr("fill", zone.complianceRate > 50 ? "#1E293B" : "#F8FAFC")
        .text(`${zone.complianceRate}%`);

      // Violation count
      cell.append("text")
        .attr("x", 6).attr("y", 52)
        .attr("font-size", "9px")
        .attr("fill", zone.complianceRate > 50 ? "#475569" : "#CBD5E1")
        .text(`${zone.violations} ${violationLabel.toLowerCase()}s`);

      // Critical pulse indicator
      if (isCritical) {
        cell.append("circle")
          .attr("cx", cellW - 10)
          .attr("cy", 10)
          .attr("r", 4)
          .attr("fill", "#EF4444");
      }
    });
  }, [zones, columns, cellHeight, colorScale, violationLabel, colorDomain]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// D3StaffingHeatmap
// 7-day × 24-hour activity heatmap using d3.scaleSequential Blues.
// ─────────────────────────────────────────────────────────────────────────────
interface D3StaffingHeatmapProps {
  data: number[][];   // [day][hour] = 0–100
  days?: string[];
}

export const D3StaffingHeatmap = ({
  data,
  days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
}: D3StaffingHeatmapProps) => {
  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const colorScale = useMemo(
    () => d3.scaleSequential([0, 100], d3.interpolateBlues),
    []
  );

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const totalW  = containerRef.current.clientWidth || 600;
    const dayLabelW = 30;
    const gridW   = totalW - dayLabelW;
    const cellW   = gridW / 24;
    const cellH   = 16;
    const hourLabelH = 16;
    const totalH  = days.length * (cellH + 1) + hourLabelH + 4;

    const SHIFT_STARTS = [6, 14, 22]; // draw dividers

    const svg = d3.select(svgRef.current)
      .attr("width", totalW)
      .attr("height", totalH);
    svg.selectAll("*").remove();

    const HOURS = Array.from({ length: 24 }, (_, i) =>
      i === 0 ? "12a" : i < 12 ? `${i}a` : i === 12 ? "12p" : `${i - 12}p`
    );

    // Hour labels (every 2nd)
    HOURS.forEach((h, i) => {
      if (i % 2 !== 0) return;
      svg.append("text")
        .attr("x", dayLabelW + i * cellW + cellW / 2)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", "#94A3B8")
        .text(h);
    });

    days.forEach((day, dayIdx) => {
      const y = hourLabelH + dayIdx * (cellH + 1);

      // Day label
      svg.append("text")
        .attr("x", dayLabelW - 4)
        .attr("y", y + cellH - 3)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("font-weight", "500")
        .attr("fill", "#64748B")
        .text(day);

      data[dayIdx].forEach((val, hourIdx) => {
        const x = dayLabelW + hourIdx * cellW;
        const fill = colorScale(val);
        const isShiftStart = SHIFT_STARTS.includes(hourIdx);

        // Cell
        svg.append("rect")
          .attr("x", x + 0.5)
          .attr("y", y)
          .attr("width", cellW - 1)
          .attr("height", cellH)
          .attr("rx", 1)
          .attr("fill", fill)
          .attr("opacity", 0.9);

        // Shift divider
        if (isShiftStart) {
          svg.append("line")
            .attr("x1", x).attr("y1", y - 1)
            .attr("x2", x).attr("y2", y + cellH)
            .attr("stroke", "#00775B")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.5);
        }
      });
    });

    // Colour legend
    const legendY = totalH - 2;
    const legendX = dayLabelW + gridW - 100;
    const stops = 20;
    for (let i = 0; i < stops; i++) {
      svg.append("rect")
        .attr("x", legendX + i * (80 / stops))
        .attr("y", legendY - 6)
        .attr("width", 80 / stops)
        .attr("height", 6)
        .attr("fill", colorScale((i / stops) * 100));
    }
    svg.append("text").attr("x", legendX - 4).attr("y", legendY).attr("text-anchor", "end").attr("font-size", "8px").attr("fill", "#94A3B8").text("Low");
    svg.append("text").attr("x", legendX + 84).attr("y", legendY).attr("font-size", "8px").attr("fill", "#94A3B8").text("High");

  }, [data, days, colorScale]);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg ref={svgRef} className="min-w-[500px]" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// D3Sparkline
// Tiny D3 line chart — replaces the Recharts LineChart in repeat-violator panel.
// ─────────────────────────────────────────────────────────────────────────────
interface D3SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}

export const D3Sparkline = ({
  data,
  width = 120,
  height = 28,
  color = "#EF4444",
  fill = true,
}: D3SparklineProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3.scaleLinear([0, data.length - 1], [0, width]);
    const yScale = d3.scaleLinear([0, d3.max(data) ?? 1], [height - 2, 2]);

    const lineGen = d3.line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveCatmullRom);

    if (fill) {
      const areaGen = d3.area<number>()
        .x((_, i) => xScale(i))
        .y0(height)
        .y1((d) => yScale(d))
        .curve(d3.curveCatmullRom);

      const gradId = `spark-grad-${Math.random().toString(36).slice(2)}`;
      const defs = svg.append("defs");
      const grad = defs.append("linearGradient")
        .attr("id", gradId).attr("x1", "0").attr("y1", "0").attr("x2", "0").attr("y2", "1");
      grad.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.3);
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0);

      svg.append("path").datum(data)
        .attr("d", areaGen as any)
        .attr("fill", `url(#${gradId})`);
    }

    svg.append("path").datum(data)
      .attr("d", lineGen as any)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.5);

    // Last point dot
    const last = data[data.length - 1];
    svg.append("circle")
      .attr("cx", xScale(data.length - 1))
      .attr("cy", yScale(last))
      .attr("r", 2.5)
      .attr("fill", color);

  }, [data, width, height, color, fill]);

  return <svg ref={svgRef} width={width} height={height} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// D3RadarChart
// Radar/spider chart for the Director's compliance scorecard —
// visualises multi-metric KPI scores simultaneously.
// ─────────────────────────────────────────────────────────────────────────────
export interface RadarDatum { label: string; value: number; max?: number }

interface D3RadarChartProps {
  data: RadarDatum[];
  size?: number;
  color?: string;
  showLabels?: boolean;
}

export const D3RadarChart = ({
  data,
  size = 200,
  color = "#00775B",
  showLabels = true,
}: D3RadarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length < 3) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cx = size / 2;
    const cy = size / 2;
    const R  = size / 2 - (showLabels ? 28 : 8);
    const n  = data.length;
    const angleStep = (2 * Math.PI) / n;
    const angle = (i: number) => i * angleStep - Math.PI / 2;

    // Rings
    [0.25, 0.5, 0.75, 1].forEach((pct) => {
      const pts = data.map((_, i) => {
        const a = angle(i);
        return [cx + R * pct * Math.cos(a), cy + R * pct * Math.sin(a)];
      });
      svg.append("polygon")
        .attr("points", pts.map((p) => p.join(",")).join(" "))
        .attr("fill", "none")
        .attr("stroke", "#E2E8F0")
        .attr("stroke-width", 1);
    });

    // Axes
    data.forEach((_, i) => {
      const a = angle(i);
      svg.append("line")
        .attr("x1", cx).attr("y1", cy)
        .attr("x2", cx + R * Math.cos(a))
        .attr("y2", cy + R * Math.sin(a))
        .attr("stroke", "#E2E8F0")
        .attr("stroke-width", 1);
    });

    // Data polygon
    const pts = data.map((d, i) => {
      const pct = d.value / (d.max ?? 100);
      const a   = angle(i);
      return [cx + R * pct * Math.cos(a), cy + R * pct * Math.sin(a)];
    });

    const gradId = `radar-grad-${Math.random().toString(36).slice(2)}`;
    svg.append("defs").append("radialGradient")
      .attr("id", gradId)
      .selectAll("stop").data([
        { offset: "0%", opacity: 0.4 },
        { offset: "100%", opacity: 0.1 },
      ]).join("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", color)
      .attr("stop-opacity", (d) => d.opacity);

    svg.append("polygon")
      .attr("points", pts.map((p) => p.join(",")).join(" "))
      .attr("fill", `url(#${gradId})`)
      .attr("stroke", color)
      .attr("stroke-width", 2);

    // Dots
    pts.forEach(([x, y]) => {
      svg.append("circle").attr("cx", x).attr("cy", y).attr("r", 3).attr("fill", color);
    });

    // Labels
    if (showLabels) {
      data.forEach((d, i) => {
        const a    = angle(i);
        const pad  = 12;
        const lx   = cx + (R + pad) * Math.cos(a);
        const ly   = cy + (R + pad) * Math.sin(a);
        const anchor = Math.cos(a) > 0.1 ? "start" : Math.cos(a) < -0.1 ? "end" : "middle";

        svg.append("text")
          .attr("x", lx).attr("y", ly + 4)
          .attr("text-anchor", anchor)
          .attr("font-size", "9px")
          .attr("font-weight", "700")
          .attr("fill", "#64748B")
          .text(d.label.length > 10 ? d.label.slice(0, 10) + "…" : d.label);
      });
    }
  }, [data, size, color, showLabels]);

  return <svg ref={svgRef} width={size} height={size} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// d3ColorFor
// Utility: returns a CSS color string for a 0–100 compliance value using
// the RdYlGn scale — ready to use in inline style={{ backgroundColor }}.
// ─────────────────────────────────────────────────────────────────────────────
const _complianceScale = d3.scaleSequential([0, 100], d3.interpolateRdYlGn);
export const d3ColorFor = (complianceRate: number, opacity = 1): string => {
  const rgb = d3.color(_complianceScale(complianceRate));
  if (!rgb) return "transparent";
  const c = rgb as d3.RGBColor;
  return `rgba(${c.r},${c.g},${c.b},${opacity})`;
};
