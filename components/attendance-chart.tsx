import { formatDate } from "@/lib/dates";

type Point = { label: string; date: string; present: number; eligible: number };

const W = 800, H = 280, PAD = { top: 16, right: 16, bottom: 36, left: 40 };

function niceMax(n: number) {
  if (n <= 5) return 5;
  const step = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / step) * step;
}

/** Smooth path through points (monotone-ish cardinal spline). */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return pts.map(([x, y]) => `M${x},${y}`).join("");
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

/** Present vs expected members across recent services. Server-rendered SVG. */
export function AttendanceChart({ data }: { data: Point[] }) {
  const max = niceMax(Math.max(1, ...data.map((d) => Math.max(d.present, d.eligible))));
  const innerW = W - PAD.left - PAD.right, innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 4, max / 2, (3 * max) / 4, max].map(Math.round);
  const present = data.map((d, i) => [x(i), y(d.present)] as [number, number]);
  const eligible = data.map((d, i) => [x(i), y(d.eligible)] as [number, number]);
  const area = present.length > 1
    ? `${smooth(present)} L${present.at(-1)![0]},${y(0)} L${present[0][0]},${y(0)} Z`
    : "";
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img" aria-label="Attendance per service">
        <defs>
          <linearGradient id="presentFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1e328a" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#1e328a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#eef0f3" />
            <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-400 text-[11px]">{t}</text>
          </g>
        ))}
        <path d={smooth(eligible)} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
        {area && <path d={area} fill="url(#presentFill)" />}
        <path d={smooth(present)} fill="none" stroke="#1e328a" strokeWidth="2.5" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.present)} r="4" fill="white" stroke="#1e328a" strokeWidth="2">
              <title>{`${d.label} · ${formatDate(d.date)}\n${d.present} present of ${d.eligible} members`}</title>
            </circle>
            {i % labelEvery === 0 && (
              <text x={x(i)} y={H - 12} textAnchor="middle" className="fill-slate-500 text-[11px]">
                {formatDate(d.date, { day: "numeric", month: "short" })}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
