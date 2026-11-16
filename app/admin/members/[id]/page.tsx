import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Cake, CalendarCheck, GraduationCap, Mail, MapPin, Phone, ShieldCheck, Trash2, User } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getMemberHistory, getMembersWithStats, rate } from "@/lib/queries";
import { daysUntilBirthday, formatBirthday, formatDate, formatDateTime, formatTime, timeAgo, todayISO } from "@/lib/dates";
import { StatusBadge } from "@/lib/member-status";
import { deleteMember, setRole } from "@/app/actions/admin";
import { Avatar, Badge, ContactLinks, EmptyState } from "@/components/ui";
import { Stars } from "@/components/star-input";
import { ConfirmButton } from "@/components/submit-button";

export const metadata = { title: "Member" };

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const m = (await getMembersWithStats()).find((x) => x.id === id);
  if (!m) notFound();
  const history = await getMemberHistory(m.id);
  const today = todayISO();
  const bday = m.birth_day && m.birth_month ? daysUntilBirthday(m.birth_day, m.birth_month, today) : null;
  const isSelf = m.id === admin.id;

  const details = [
    { icon: Mail, label: "Email", value: <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a> },
    { icon: Phone, label: "Phone", value: <ContactLinks phone={m.phone} /> },
    { icon: User, label: "Gender", value: m.gender ?? "—" },
    { icon: GraduationCap, label: "Level", value: m.level ?? "—" },
    { icon: Cake, label: "Birthday", value: <>{formatBirthday(m.birth_day, m.birth_month)}{bday !== null && <span className="text-muted"> · {bday === 0 ? "today 🎂" : `in ${bday} day${bday > 1 ? "s" : ""}`}</span>}</> },
    { icon: MapPin, label: "Address on campus", value: m.campus_address ?? "—" },
    { icon: CalendarCheck, label: "Joined", value: <>{formatDateTime(m.created_at)}{m.first_timer && <span className="ml-2"><Badge tone="brand">Was a first-timer</Badge></span>}</> },
  ];

  return (
    <>
      <Link href="/admin/members" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> All members</Link>

      <div className="mb-6 mt-4 flex flex-wrap items-center gap-4">
        <Avatar name={m.full_name} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{m.full_name}</h1>
          <div className="mt-1.5 flex flex-wrap gap-2"><StatusBadge m={m} />{m.role === "admin" && <Badge tone="green"><ShieldCheck className="size-3" /> Admin</Badge>}</div>
        </div>
        {!isSelf && (
          <div className="flex flex-wrap gap-2">
            <form action={setRole}>
              <input type="hidden" name="user_id" value={m.id} />
              <input type="hidden" name="role" value={m.role === "admin" ? "member" : "admin"} />
              <ConfirmButton className="btn btn-secondary" message={m.role === "admin" ? `Remove admin access from ${m.full_name}?` : `Give ${m.full_name} full admin access?`}>
                <ShieldCheck className="size-4" /> {m.role === "admin" ? "Remove admin" : "Make admin"}
              </ConfirmButton>
            </form>
            <form action={deleteMember}>
              <input type="hidden" name="user_id" value={m.id} />
              <ConfirmButton className="btn btn-danger" message={`Delete ${m.full_name}'s account and attendance history? This can't be undone.`}>
                <Trash2 className="size-4" /> Delete
              </ConfirmButton>
            </form>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="card h-fit p-5">
          <h2 className="font-display text-lg font-semibold">Details</h2>
          <dl className="mt-4 space-y-4">
            {details.map((d) => (
              <div key={d.label} className="flex gap-3">
                <d.icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted">{d.label}</dt>
                  <dd className="break-words text-sm">{d.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Mini label="Attended" value={m.attended} />
            <Mini label="Attendance rate" value={rate(m.attended, m.eligible) === null ? "—" : `${rate(m.attended, m.eligible)}%`} />
            <Mini label="Missed in a row" value={m.missed_streak} />
            <Mini label="Last seen" value={<span className="text-xl">{timeAgo(m.last_seen)}</span>} />
          </div>

          <section className="card overflow-hidden">
            <h2 className="border-b border-line px-5 py-4 font-display text-lg font-semibold">Attendance history</h2>
            {history.length === 0 ? <EmptyState icon={CalendarCheck} title="No services since they joined" /> : (
              <ul className="divide-y divide-line">
                {history.map((h) => (
                  <li key={h.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <Link href={`/admin/services/${h.id}`} className="block truncate text-sm font-medium hover:underline">{h.title}</Link>
                        <p className="text-xs text-muted">{formatDate(h.service_date)}{h.checked_in_at && ` · checked in ${formatTime(h.checked_in_at)}`}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Stars value={h.rating} />
                        {h.checked_in_at ? <Badge tone="green">Present</Badge> : h.service_date > today ? <Badge>Upcoming</Badge> : <Badge tone="rose">Absent</Badge>}
                      </div>
                    </div>
                    {h.comment && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">“{h.comment}”</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
