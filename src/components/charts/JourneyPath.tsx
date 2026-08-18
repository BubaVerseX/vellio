export type JourneyWeekStop = {
  index: number;
  label: string;
  status: "past" | "current" | "future";
};

const MONO_STACK = "var(--font-mono-label), ui-monospace, 'SFMono-Regular', monospace";
const GEORGIAN_STACK = "var(--font-georgian), sans-serif";
const DISPLAY_STACK = "var(--font-anton), 'Arial Narrow', sans-serif";

export function JourneyPath({ weeks, currentLabel }: { weeks: JourneyWeekStop[]; currentLabel: string }) {
  const stepX = 84;
  const padX = 30;
  const height = 170;
  const topY = 44;
  const bottomY = 130;
  const width = padX * 2 + stepX * Math.max(weeks.length - 1, 0);

  const points = weeks.map((w, i) => {
    const progress = weeks.length > 1 ? i / (weeks.length - 1) : 0;
    const y = bottomY - progress * (bottomY - topY) + Math.sin(i * 1.3) * 9;
    return { ...w, x: padX + i * stepX, y };
  });

  let pathD = "";
  points.forEach((p, i) => {
    if (i === 0) {
      pathD += `M ${p.x} ${p.y}`;
      return;
    }
    const prev = points[i - 1];
    const cx1 = prev.x + stepX / 2;
    const cx2 = p.x - stepX / 2;
    pathD += ` C ${cx1} ${prev.y}, ${cx2} ${p.y}, ${p.x} ${p.y}`;
  });

  return (
    <div className="relative overflow-x-auto overflow-y-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, minWidth: "100%", height }}
        role="img"
        aria-label="Weekly journey progress"
      >
        <polygon
          points={`0,${height} 0,${height - 55} ${width * 0.22},${height - 100} ${width * 0.4},${height - 62} ${width * 0.4},${height}`}
          fill="#101720"
        />
        <polygon
          points={`${width * 0.26},${height} ${width * 0.26},${height - 72} ${width * 0.55},${height - 118} ${width * 0.76},${height - 80} ${width * 0.76},${height}`}
          fill="#131c27"
        />
        <polygon
          points={`${width * 0.6},${height} ${width * 0.6},${height - 62} ${width * 0.85},${height - 104} ${width},${height - 76} ${width},${height}`}
          fill="#101720"
        />

        <path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.34)"
          strokeWidth={3}
          strokeDasharray="2 11"
          strokeLinecap="round"
        />

        {points.map((p) => (
          <g key={p.index}>
            {p.status === "current" ? (
              <>
                <rect x={p.x - 13} y={p.y - 13} width={26} height={26} fill="var(--color-accent)" />
                <text
                  x={p.x}
                  y={p.y - 22}
                  textAnchor="middle"
                  fontSize={22}
                  style={{ fontFamily: DISPLAY_STACK }}
                  fill="var(--color-accent)"
                >
                  {p.index}
                </text>
                <text
                  x={p.x}
                  y={p.y + 38}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={900}
                  style={{ fontFamily: GEORGIAN_STACK }}
                  fill="var(--color-accent)"
                >
                  {currentLabel}
                </text>
              </>
            ) : p.status === "past" ? (
              <>
                <rect x={p.x - 7} y={p.y - 7} width={14} height={14} fill="#ffffff" />
                <text
                  x={p.x}
                  y={p.y + 28}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  letterSpacing="0.08em"
                  style={{ fontFamily: MONO_STACK }}
                  fill="rgba(255,255,255,0.4)"
                >
                  {p.label}
                </text>
              </>
            ) : (
              <>
                <rect
                  x={p.x - 7}
                  y={p.y - 7}
                  width={14}
                  height={14}
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={1.5}
                />
                <text
                  x={p.x}
                  y={p.y + 28}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  letterSpacing="0.08em"
                  style={{ fontFamily: MONO_STACK }}
                  fill="rgba(255,255,255,0.3)"
                >
                  {p.label}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
