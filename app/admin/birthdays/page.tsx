import Link from "next/link";
import { Cake, PartyPopper } from "lucide-react";
import { getMembersWithStats, withBirthdayCountdown } from "@/lib/queries";
import { formatBirthday, todayISO } from "@/lib/dates";
import { MONTHS } from "@/lib/constants";
import { Avatar, Badge, ContactLinks, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Birthdays" };

export default async function BirthdaysPage() {
  const members = withBirthdayCountdown(await getMembersWithStats());
  const todays = members.filter((m) => m.days_until === 0);
  const upcoming = members.filter((m) => m.days_until > 0 && m.days_until <= 30);
  const currentMonth = Number(todayISO().slice(5, 7));
  const byMonth = MONTHS.map((name, i) => ({
    name, month: i + 1,
    people: members.filter((m) => m.birth_month === i + 1).sort((a, b) => a.birth_day! - b.birth_day!),
  }));
  // Start the calendar from the current month
  const ordered = [...byMonth.slice(currentMonth - 1), ...byMonth.slice(0, currentMonth - 1)];

  return (
    <>
      <PageHeader title="Birthdays" subtitle="Celebrate your members — today, coming up, and all year round." />

      {todays.length > 0 && (
        <section className="mb-6 overflow-hidden rounded-2xl bg-linear-to-r from-brand-950 to-brand-800 p-6 text-white">
          <div className="flex items-center gap-3"><PartyPopper className="size-6" /><h2 className="font-display text-xl font-semibold">Celebrating today</h2></div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {todays.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
                <span className="grid size-10 place-items-center rounded-full bg-white text-sm font-semibold text-brand-900">{m.full_name.split(" ").slice(0, 2).map((p) => p[0]).join("")}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/members/${m.id}`} className="block truncate font-medium hover:underline">{m.full_name}</Link>
                  <p className="text-sm text-brand-200">{m.level ?? ""}</p>
                </div>
                {m.phone && <a href={`tel:${m.phone}`} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-900">Call</a>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section className="card h-fit overflow-hidden">
          <h2 className="border-b border-line px-5 py-4 font-display text-lg font-semibold">Next 30 days</h2>
          {upcoming.length === 0 ? <EmptyState icon={Cake} title="No birthdays in the next 30 days" /> : (
            <ul className="divide-y divide-line">
              {upcoming.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={m.full_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/members/${m.id}`} className="block truncate text-sm font-medium hover:underline">{m.full_name}</Link>
                    <ContactLinks phone={m.phone} />
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">{formatBirthday(m.birth_day, m.birth_month)}</p>
                    <p className="text-xs text-muted">{m.days_until === 1 ? "Tomorrow" : `in ${m.days_until} days`}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card overflow-hidden">
          <h2 className="border-b border-line px-5 py-4 font-display text-lg font-semibold">All year</h2>
          <div className="grid gap-px bg-line sm:grid-cols-2">
            {ordered.map((mo) => (
              <div key={mo.name} className="bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{mo.name}</h3>
                  {mo.month === currentMonth ? <Badge tone="brand">This month</Badge> : <span className="text-xs text-muted">{mo.people.length}</span>}
                </div>
                {mo.people.length === 0 ? <p className="text-sm text-slate-400">—</p> : (
                  <ul className="space-y-1">
                    {mo.people.map((m) => (
                      <li key={m.id} className="flex items-baseline gap-2 text-sm">
                        <span className="w-6 shrink-0 tabular-nums text-muted">{m.birth_day}</span>
                        <Link href={`/admin/members/${m.id}`} className="truncate hover:underline">{m.full_name}</Link>
                        {m.days_until === 0 && <span>🎂</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
