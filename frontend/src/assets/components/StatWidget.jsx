

/* ── Trend arrow icons ───────────────────────────────────────────────────── */
const TrendUp = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1 10 5 5 8 8 13 2" />
    <polyline points="9 2 13 2 13 6" />
  </svg>
);

const TrendDown = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1 4 5 9 8 6 13 12" />
    <polyline points="9 12 13 12 13 8" />
  </svg>
);

/* ── Sparkline ────────────────────────────────────────────────────────────
   Generates a simple SVG polyline from an array of 0-1 normalised values.
   Falls back to a pleasant rising or falling curve when no data is given.
   ─────────────────────────────────────────────────────────────────────── */
const UP_POINTS = [0.7, 0.5, 0.65, 0.4, 0.55, 0.3, 0.2, 0.1];
const DOWN_POINTS = [0.1, 0.3, 0.15, 0.4, 0.25, 0.5, 0.35, 0.6];

function Sparkline({ trendUp, data, color }) {
  const pts = data ?? (trendUp ? UP_POINTS : DOWN_POINTS);

  const W = 72,
    H = 32,
    PAD = 2;
  const xStep = (W - PAD * 2) / (pts.length - 1);

  const points = pts
    .map((v, i) => `${PAD + i * xStep},${PAD + v * (H - PAD * 2)}`)
    .join(" ");

  const last = pts.length - 1;
  const area =
    `M ${PAD},${H} ` +
    pts
      .map((v, i) => `L ${PAD + i * xStep},${PAD + v * (H - PAD * 2)}`)
      .join(" ") +
    ` L ${PAD + last * xStep},${H} Z`;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
    >
      {/* Area */}
      <defs>
        <linearGradient
          id={`sg-${trendUp ? "u" : "d"}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${trendUp ? "u" : "d"})`} />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={PAD + last * xStep}
        cy={PAD + pts[last] * (H - PAD * 2)}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

/* ── StatWidget ───────────────────────────────────────────────────────────
 *
 * Props
 * ─────
 *   icon     — string emoji OR a React element (SVG component)
 *   title    — string
 *   amount   — string
 *   trend    — string  e.g. "12.5%"
 *   trendUp  — boolean (default true)
 *   sparkData — number[] optional array of 0-1 normalised values for the sparkline
 * 
 * ─────────────────────────────────────────────────────────────────────── */



export default function StatWidget({
  icon,
  title,
  amount,
  trend,
  trendUp = true,
  sparkData,
}) {
  const upColor = "#059669"; /* xeflow-success green */
  const downColor = "#DC2626"; /* red                  */
  const trendColor = trendUp ? upColor : downColor;

  return (
    <div
      className="
        relative bg-xeflow-surface border border-xeflow-border
        rounded-2xl overflow-hidden
        shadow-sm hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-300 cursor-pointer group
      "
    >
      {/* Coloured accent bar across the top */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl transition-opacity duration-300 opacity-60 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, ${trendColor}, color-mix(in srgb, ${trendColor} 40%, transparent))`,
        }}
      />

      <div className="p-5 pt-6">
        {/* ── Top row: icon tile + sparkline ────────────────────── */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon tile */}
          <div
            className="
              w-11 h-11 rounded-xl flex items-center justify-center shrink-0
              text-xl
              border border-xeflow-border/60
              shadow-inner
              transition-colors duration-300
            "
            style={{
              background: `color-mix(in srgb, ${trendColor} 10%, var(--color-xeflow-bg))`,
            }}
          >
            {icon}
          </div>

          {/* Sparkline — top-right */}
          <Sparkline trendUp={trendUp} data={sparkData} color={trendColor} />
        </div>

        {/* ── Label ─────────────────────────────────────────────── */}
        <p className="text-[10.5px] text-xeflow-muted font-bold uppercase tracking-[0.1em] mb-1.5">
          {title}
        </p>

        {/* ── Amount + trend row ────────────────────────────────── */}
        <div className="flex items-end justify-between gap-2">
          <h3 className="text-[1.6rem] font-black text-xeflow-text leading-none tracking-tight">
            {amount}
          </h3>

          {trend && (
            <div className="flex flex-col items-end gap-0.5 pb-0.5">
              {/* Trend pill */}
              <span
                className="
                  inline-flex items-center gap-1
                  text-[11px] font-bold px-2 py-0.5 rounded-lg
                "
                style={{
                  color: trendColor,
                  background: `color-mix(in srgb, ${trendColor} 12%, transparent)`,
                }}
              >
                {trendUp ? <TrendUp /> : <TrendDown />}
                {trend}
              </span>
              <span className="text-[9.5px] text-xeflow-muted font-medium tracking-wide">
                vs last month
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
