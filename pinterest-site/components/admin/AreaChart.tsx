"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChartPoint } from "@/lib/admin/analytics-types";

const MARGIN = { top: 12, right: 20, bottom: 28, left: 40 } as const;
const AMBER = "#F59E0B";
const GRID = "#E2E8F0";
const MUTED = "#64748B";
const VIEWS_GRAY = "#94A3B8";
const MIN_LABEL_GAP = 56;
const MAX_DOT_POINTS = 31;
const TICKS = 4;
const NUMBER = new Intl.NumberFormat("en-US");

/** Whole-number tick step (1, 2, 5, 10, ...) so the y axis never shows fractions of a click. */
function niceStep(max: number): number {
  const raw = Math.max(max / TICKS, 1);
  // Small counts: the tightest whole-number step that still covers the data.
  if (raw <= 10) return Math.ceil(raw);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const nice = [1, 1.5, 2, 2.5, 3, 4, 5, 10].find((candidate) => candidate >= normalized) ?? 10;
  return nice * magnitude;
}

type AreaChartProps = {
  points: readonly ChartPoint[];
  /** Noun for tooltips and the screen-reader table, e.g. "clicks". */
  valueName: string;
  /** Adds a second thin gray line (views) when points carry `secondary`. */
  secondaryName?: string;
  ariaLabel: string;
  height?: number;
};

export function AreaChart({ points, valueName, secondaryName = "views", ariaLabel, height = 240 }: AreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const gradientId = `area${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => setWidth(Math.floor(element.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const count = points.length;
  const primary = points.map((point) => point.value);
  const hasSecondary = points.some((point) => point.secondary !== undefined);
  const secondary = points.map((point) => point.secondary ?? 0);

  const maxValue = Math.max(0, ...primary, ...(hasSecondary ? secondary : []));
  const step = niceStep(maxValue);
  const yMax = step * TICKS;
  const tickValues = Array.from({ length: TICKS + 1 }, (_, index) => index * step);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = height - MARGIN.top - MARGIN.bottom;
  const baseline = MARGIN.top + plotHeight;
  const x = (index: number) =>
    MARGIN.left + (count <= 1 ? plotWidth / 2 : (index / (count - 1)) * plotWidth);
  const y = (value: number) => MARGIN.top + plotHeight - (value / yMax) * plotHeight;

  const linePath = (values: number[]) =>
    values.map((value, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
  const areaPath =
    count === 0 ? "" : `${linePath(primary)} L${x(count - 1).toFixed(1)},${baseline} L${x(0).toFixed(1)},${baseline} Z`;

  const maxLabels = Math.max(1, Math.floor(plotWidth / MIN_LABEL_GAP));
  const labelEvery = Math.ceil(count / maxLabels);
  const columnWidth = count <= 1 ? plotWidth : plotWidth / (count - 1);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {width > 0 && count > 0 ? (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={AMBER} stopOpacity={0.28} />
              <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
            </linearGradient>
          </defs>

          {tickValues.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="central" fontSize={12} fill={MUTED}>
                {NUMBER.format(tick)}
              </text>
            </g>
          ))}

          {hasSecondary ? (
            <path d={linePath(secondary)} fill="none" stroke={VIEWS_GRAY} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
          ) : null}

          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath(primary)} fill="none" stroke={AMBER} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {count <= MAX_DOT_POINTS
            ? points.map((point, index) => (
                <circle key={`dot-${index}`} cx={x(index)} cy={y(point.value)} r={4} fill="#FFFFFF" stroke={AMBER} strokeWidth={2} />
              ))
            : null}

          {points.map((point, index) =>
            index % labelEvery === 0 ? (
              <text key={`label-${index}`} x={x(index)} y={height - 8} textAnchor="middle" fontSize={12} fill={MUTED}>
                {point.label}
              </text>
            ) : null,
          )}

          {/* Invisible columns give every day a native hover tooltip. */}
          {points.map((point, index) => (
            <rect
              key={`hit-${index}`}
              x={x(index) - columnWidth / 2}
              y={MARGIN.top}
              width={columnWidth}
              height={plotHeight}
              fill="transparent"
            >
              <title>
                {`${point.tooltip}: ${NUMBER.format(point.value)} ${valueName}${
                  point.secondary !== undefined ? `, ${NUMBER.format(point.secondary)} ${secondaryName}` : ""
                }`}
              </title>
            </rect>
          ))}
        </svg>
      ) : null}

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">{valueName}</th>
            {hasSecondary ? <th scope="col">{secondaryName}</th> : null}
          </tr>
        </thead>
        <tbody>
          {points.map((point, index) => (
            <tr key={`row-${index}`}>
              <th scope="row">{point.tooltip}</th>
              <td>{point.value}</td>
              {hasSecondary ? <td>{point.secondary ?? 0}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
