import { MONTHS } from "./constants";

export const TIMEZONE = process.env.APP_TIMEZONE || "Africa/Lagos";

/** Today's date in the app timezone as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "Sun, 15 Nov 2026" for a YYYY-MM-DD string. */
export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(parseISODate(iso));
}

export function formatDateTime(d: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(d));
}

export function formatTime(d: Date | string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TIMEZONE, hour: "numeric", minute: "2-digit" }).format(new Date(d));
}

/** "3 days ago", "2 weeks ago" etc. */
export function timeAgo(d: Date | string | null): string {
  if (!d) return "Never";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) { const w = Math.floor(days / 7); return `${w} week${w > 1 ? "s" : ""} ago`; }
  if (days < 365) { const m = Math.floor(days / 30); return `${m} month${m > 1 ? "s" : ""} ago`; }
  const y = Math.floor(days / 365);
  return `${y} year${y > 1 ? "s" : ""} ago`;
}

export function formatBirthday(day: number | null, month: number | null) {
  if (!day || !month) return "—";
  return `${day} ${MONTHS[month - 1]}`;
}

function isLeap(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/**
 * How many days until this birthday (0 = today), in the app timezone.
 * 29 Feb birthdays are celebrated on 28 Feb in non-leap years.
 */
export function daysUntilBirthday(day: number, month: number, today = todayISO()): number {
  const start = parseISODate(today);
  for (let i = 0; i < 366; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, dd = d.getUTCDate();
    if (m === month && dd === day) return i;
    if (month === 2 && day === 29 && !isLeap(y) && m === 2 && dd === 28) return i;
  }
  return 366;
}
