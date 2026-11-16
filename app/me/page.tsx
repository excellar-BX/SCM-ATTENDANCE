import Link from "next/link";
import { CalendarCheck, Flame, PartyPopper, Pencil, ScanLine, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMember, getMemberHistory, rate } from "@/lib/queries";
import { daysUntilBirthday, formatBirthday, formatDate, formatTime, todayISO } from "@/lib/dates";
import { Badge, EmptyState, StatCard } from "@/components/ui";
import { Stars } from "@/components/star-input";

export const metadata = { title: "My attendance" };

export default async function MePage() {
  const user = await requireUser("/me");
  const [member, history] = await Promise.all([getMember(user.id), getMemberHistory(user.id)]);
  if (!member) return null;

  const today = todayISO();
  const held = history.filter((h) => h.service_date <= today);
  const attended = history.filter((h) => h.checked_in_at).length;
  const pct = rate(held.filter((h) => h.checked_in_at).length, held.length);
  let streak = 0;
  for (const h of held) { if (h.checked_in_at) streak++; else break; }
  const bdayIn = member.birth_day && member.birth_month ? daysUntilBirthday(member.birth_day, member.birth_month, today) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Welcome back,</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{member.full_name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {member.level && <Badge tone="brand">{member.level}</Badge>}
            {user.role === "admin" && <Badge tone="green">Admin</Badge>}
          </div>
        </div>
        <Link href="/me/profile" className="btn btn-secondary btn-sm"><Pencil className="size-3.5" /> Edit details</Link>
      </div>

      {bdayIn === 0 && (
        <div className="flex items-center gap-4 rounded-2xl bg-linear-to-r from-brand-900 to-brand-700 p-5 text-white">
          <PartyPopper className="size-8 shrink-0" />
          <div>
            <p className="font-display text-lg font-semibold">Happy birthday, {member.full_name.split(" ")[0]}! 🎉</p>
            <p className="text-sm text-brand-100">The whole family celebrates you today.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-900 text-white"><ScanLine className="size-6" /></span>
        <p className="text-sm text-brand-950">
          <strong className="font-semibold">Checking in is easy:</strong> at service, scan the QR code with your phone camera while signed in. You&apos;ll be marked present automatically.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Services attended" value={attended} icon={CalendarCheck} />
        <StatCard label="Attendance rate" value={pct === null ? "—" : `${pct}%`} hint={held.length ? `Out of ${held.length} since you joined` : "No services yet"} icon={TrendingUp} tone="green" />
        <StatCard label="Current streak" value={streak} hint={streak === 1 ? "service in a row" : "services in a row"} icon={Flame} tone="amber" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold">My history</h2>
          {bdayIn !== null && bdayIn > 0 && <span className="text-sm text-muted">🎂 {formatBirthday(member.birth_day, member.birth_month)} · in {bdayIn} day{bdayIn > 1 ? "s" : ""}</span>}
        </div>
        {history.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No services yet">Your attendance will show up here after your first check-in.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-medium">{h.title}</p>
                  <p className="text-sm text-muted">{formatDate(h.service_date)}{h.checked_in_at && ` · ${formatTime(h.checked_in_at)}`}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {h.checked_in_at && (h.rating
                    ? <Stars value={h.rating} />
                    : <Link href={`/checkin/${h.id}`} className="text-xs font-semibold text-brand-800 hover:underline">Rate</Link>)}
                  {h.checked_in_at ? <Badge tone="green">Present</Badge>
                    : h.service_date > today ? <Badge>Upcoming</Badge>
                    : <Badge tone="rose">Absent</Badge>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
