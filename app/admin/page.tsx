import Link from "next/link";
import { CalendarCheck, CalendarPlus, Cake, DoorOpen, Download, Star, TrendingUp, UserPlus, UserX, Users } from "lucide-react";
import { getMembersWithStats, getServices, rate, withBirthdayCountdown } from "@/lib/queries";
import { formatBirthday, formatDate, todayISO } from "@/lib/dates";
import { DEFAULT_INACTIVE_THRESHOLD } from "@/lib/constants";
import { Avatar, Badge, EmptyState, PageHeader, Segmented, StatCard } from "@/components/ui";
import { AttendanceChart } from "@/components/attendance-chart";

export const metadata = { title: "Dashboard" };

const RANGES = ["4", "8", "12"] as const;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range: r } = await searchParams;
  const range = (RANGES as readonly string[]).includes(r ?? "") ? Number(r) : 8;
  const today = todayISO();

  const [members, allServices] = await Promise.all([getMembersWithStats(), getServices(range * 2 + 10)]);
  const held = allServices.filter((s) => s.service_date <= today);
  const current = held.slice(0, range);
  const previous = held.slice(range, range * 2);

  const avgPct = (list: typeof held) => {
    const rates = list.map((s) => rate(s.present, s.eligible)).filter((x): x is number => x !== null);
    return rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : null;
  };
  const curPct = avgPct(current), prevPct = avgPct(previous);
  const rated = current.filter((s) => s.avg_rating !== null);
  const avgRating = rated.length ? (rated.reduce((a, s) => a + s.avg_rating!, 0) / rated.length).toFixed(1) : null;
  const last = held[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
  const newMembers = members.filter((m) => new Date(m.created_at) >= thirtyDaysAgo);
  const newFirstTimers = newMembers.filter((m) => m.first_timer);
  const inactive = members.filter((m) => m.missed_streak >= DEFAULT_INACTIVE_THRESHOLD);
  const birthdays = withBirthdayCountdown(members).filter((m) => m.days_until < 7);
  const openServices = allServices.filter((s) => s.is_open && s.service_date < today);

  const levels = Object.entries(
    members.reduce<Record<string, number>>((acc, m) => { const k = m.level ?? "Not set"; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const chartData = [...current].reverse().map((s) => ({ label: s.title, date: s.service_date, present: s.present, eligible: s.eligible }));
  const trend = curPct !== null && prevPct !== null ? curPct - prevPct : null;

  const attention = [
    inactive.length > 0 && { icon: UserX, tone: "bg-rose-50 text-rose-600", title: `${inactive.length} member${inactive.length > 1 ? "s" : ""} missed ${DEFAULT_INACTIVE_THRESHOLD}+ services in a row`, sub: "Reach out and check on them", href: "/admin/inactive" },
    birthdays.some((b) => b.days_until === 0) && { icon: Cake, tone: "bg-amber-50 text-amber-600", title: `${birthdays.filter((b) => b.days_until === 0).length} birthday${birthdays.filter((b) => b.days_until === 0).length > 1 ? "s" : ""} today`, sub: birthdays.filter((b) => b.days_until === 0).map((b) => b.full_name.split(" ")[0]).join(", "), href: "/admin/birthdays" },
    newFirstTimers.length > 0 && { icon: UserPlus, tone: "bg-brand-50 text-brand-700", title: `${newFirstTimers.length} first-timer${newFirstTimers.length > 1 ? "s" : ""} joined this month`, sub: "Follow up and welcome them", href: "/admin/members?status=new" },
    openServices.length > 0 && { icon: DoorOpen, tone: "bg-emerald-50 text-emerald-600", title: `${openServices.length} past service${openServices.length > 1 ? "s" : ""} still open for check-in`, sub: "Close check-in so codes can't be reused", href: "/admin/services" },
  ].filter(Boolean) as { icon: typeof UserX; tone: string; title: string; sub: string; href: string }[];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Last ${range} services${previous.length ? ", compared with the ones before" : ""}`}
        actions={<>
          <Segmented active={String(range)} items={RANGES.map((v) => ({ label: `Last ${v}`, value: v, href: `/admin?range=${v}` }))} />
          <a href="/admin/members/export" className="btn btn-secondary"><Download className="size-4" /> Export</a>
          <Link href="/admin/services?new=1" className="btn btn-primary"><CalendarPlus className="size-4" /> New service</Link>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Members" value={members.length} icon={Users}
          hint={newMembers.length ? <><span className="font-medium text-emerald-700">+{newMembers.length}</span> joined in the last 30 days</> : "No new members in 30 days"} />
        <StatCard label="Last service" icon={CalendarCheck} tone="green"
          value={last ? <>{last.present}<span className="text-lg font-normal text-muted"> / {last.eligible}</span></> : "—"}
          hint={last ? `${last.title} · ${formatDate(last.service_date, { day: "numeric", month: "short" })}` : "No services yet"} />
        <StatCard label="Avg. attendance" icon={TrendingUp} tone="brand"
          value={curPct === null ? "—" : `${curPct}%`}
          hint={trend === null ? "No earlier services to compare" : trend === 0 ? "Same as the period before"
            : <><span className={trend > 0 ? "font-medium text-emerald-700" : "font-medium text-rose-700"}>{trend > 0 ? "▲" : "▼"} {Math.abs(trend)} pts</span> vs the {previous.length} before</>} />
        <StatCard label="Avg. service rating" icon={Star} tone="amber"
          value={avgRating ? <>{avgRating}<span className="text-lg font-normal text-muted"> / 5</span></> : "—"}
          hint={rated.length ? `From member feedback across ${rated.length} service${rated.length > 1 ? "s" : ""}` : "No ratings yet"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Attendance over time</h2>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-brand-900" /> Present</span>
                <span className="flex items-center gap-2"><span className="h-0 w-4 border-t-2 border-dashed border-slate-400" /> Members expected</span>
              </div>
            </div>
          </div>
          {chartData.length ? <AttendanceChart data={chartData} /> : (
            <EmptyState icon={CalendarCheck} title="No services yet">
              <Link href="/admin/services?new=1" className="font-semibold text-brand-800 hover:underline">Create your first service</Link> to start tracking attendance.
            </EmptyState>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Needs attention</h2>
            <p className="text-sm text-muted">Things waiting on you</p>
          </div>
          {attention.length ? (
            <ul className="divide-y divide-line">
              {attention.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${a.tone}`}><a.icon className="size-5" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium">{a.title}</p>
                      <p className="truncate text-sm text-muted">{a.sub}</p>
                    </div>
                    <span className="text-sm font-semibold">View</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={CalendarCheck} title="All caught up">Nothing needs your attention right now.</EmptyState>}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Birthdays this week</h2>
            <Link href="/admin/birthdays" className="text-sm font-semibold text-brand-800 hover:underline">All</Link>
          </div>
          {birthdays.length ? (
            <ul className="divide-y divide-line">
              {birthdays.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={b.full_name} size="sm" />
                  <Link href={`/admin/members/${b.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">{b.full_name}</Link>
                  {b.days_until === 0 ? <Badge tone="amber">🎂 Today</Badge> : <span className="text-sm text-muted">{formatBirthday(b.birth_day, b.birth_month)}</span>}
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={Cake} title="No birthdays this week" />}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Recent services</h2>
            <Link href="/admin/services" className="text-sm font-semibold text-brand-800 hover:underline">All</Link>
          </div>
          {allServices.length ? (
            <ul className="divide-y divide-line">
              {allServices.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/services/${s.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted">{formatDate(s.service_date)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {s.is_open && <Badge tone="green">Open</Badge>}
                      <span className="text-sm tabular-nums text-slate-700">{s.present}/{s.eligible}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={CalendarCheck} title="No services yet" />}
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg font-semibold">Members by level</h2>
          {levels.length ? (
            <ul className="mt-4 space-y-3">
              {levels.map(([level, n]) => (
                <li key={level}>
                  <div className="mb-1 flex justify-between text-sm"><span>{level}</span><span className="tabular-nums text-muted">{n}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-800" style={{ width: `${(n / members.length) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={Users} title="No members yet" />}
        </section>
      </div>
    </>
  );
}
