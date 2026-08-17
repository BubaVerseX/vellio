export type JourneyWeekStop = {
  index: number;
  label: string;
  status: "past" | "current" | "future";
};

/** Abstract, low-contrast Caucasus-style ridge line — decorative background
 * for the journey path only, never reused elsewhere in the app. */
function RidgeSilhouette() {
  return (
    <svg
      viewBox="0 0 400 150"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
      aria-hidden
    >
      <path
        d="M0,150 L0,102 L34,66 L58,88 L92,42 L124,80 L152,50 L184,92 L214,48 L248,86 L276,40 L312,84 L344,52 L400,96 L400,150 Z"
        fill="var(--color-accent-2)"
      />
    </svg>
  );
}

export function JourneyPath({ weeks }: { weeks: JourneyWeekStop[] }) {
  const stepX = 84;
  const padX = 36;
  const midY = 62;
  const amplitude = 24;
  const width = padX * 2 + stepX * Math.max(weeks.length - 1, 0);

  const points = weeks.map((w, i) => ({
    ...w,
    x: padX + i * stepX,
    y: midY + Math.sin(i * 1.15) * amplitude,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="relative overflow-x-auto overflow-y-hidden rounded-2xl">
      <RidgeSilhouette />
      <svg
        viewBox={`0 0 ${width} 150`}
        className="relative"
        style={{ width, minWidth: "100%", height: 150 }}
        role="img"
        aria-label="Weekly journey progress"
      >
        <path
          d={pathD}
          fill="none"
          stroke="#8b95a1"
          strokeOpacity={0.5}
          strokeWidth={2}
          strokeDasharray="1 8"
          strokeLinecap="round"
        />
        {points.map((p) => (
          <g key={p.index}>
            {p.status === "current" && (
              <circle cx={p.x} cy={p.y} r={17} fill="var(--color-accent)" opacity={0.16} />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={p.status === "current" ? 9 : 6}
              fill={
                p.status === "past"
                  ? "#8b95a1"
                  : p.status === "current"
                    ? "var(--color-accent)"
                    : "var(--color-bg)"
              }
              stroke={p.status === "future" ? "#8b95a1" : "none"}
              strokeWidth={p.status === "future" ? 2 : 0}
            />
            <text
              x={p.x}
              y={p.y + 30}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill={p.status === "current" ? "var(--color-accent)" : "#8b95a1"}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
