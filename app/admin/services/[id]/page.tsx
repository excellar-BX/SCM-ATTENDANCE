import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Lock, Maximize2, MessageSquare, RefreshCw, Trash2, Unlock, UserCheck, UserX } from "lucide-react";
import { getService, getServiceRoll, rate } from "@/lib/queries";
import { formatDate, formatTime, timeAgo } from "@/lib/dates";
import { checkinUrl, qrPng, qrSvg } from "@/lib/qr";
import { deleteService, markAbsent, markPresent, regenerateToken, setServiceOpen } from "@/app/actions/admin";
import { Badge, ContactLinks, EmptyState, Segmented } from "@/components/ui";
import { Stars } from "@/components/star-input";
import { CopyButton } from "@/components/copy-button";
import { ConfirmButton, SubmitButton } from "@/components/submit-button";

export const metadata = { title: "Service" };

export default async function ServicePage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "present" } = await searchParams;
  const service = await getService(id);
  if (!service) notFound();

  const url = await checkinUrl(service.token);
  const [svg, png, roll] = await Promise.all([qrSvg(url), qrPng(url), getServiceRoll(service.id, service.service_date)]);
  const { present, absent } = roll;
  const feedback = present.filter((p) => p.rating || p.comment);
  const pct = rate(present.length, present.length + absent.length);
  const ratings = present.filter((p) => p.rating);
  const avg = ratings.length ? (ratings.reduce((a, p) => a + p.rating!, 0) / ratings.length).toFixed(1) : null;
  const base = `/admin/services/${service.id}`;

  return (
    <>
      <Link href="/admin/services" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> All services</Link>
      <div className="mb-6 mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{service.title}</h1>
            {service.is_open ? <Badge tone="green">Check-in open</Badge> : <Badge>Check-in closed</Badge>}
          </div>
          <p className="mt-1 text-muted">{formatDate(service.service_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={setServiceOpen}>
            <input type="hidden" name="service_id" value={service.id} />
            <input type="hidden" name="open" value={String(!service.is_open)} />
            <SubmitButton className={service.is_open ? "btn btn-secondary" : "btn btn-primary"}>
              {service.is_open ? <><Lock className="size-4" /> Close check-in</> : <><Unlock className="size-4" /> Reopen check-in</>}
            </SubmitButton>
          </form>
          <form action={deleteService}>
            <input type="hidden" name="service_id" value={service.id} />
            <ConfirmButton className="btn btn-danger" message={`Delete "${service.title}" and all its attendance records? This can't be undone.`}>
              <Trash2 className="size-4" /> Delete
            </ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="card h-fit p-6">
          <div className="relative mx-auto max-w-[280px]">
            <div className={`rounded-2xl border border-line p-3 ${service.is_open ? "" : "opacity-30 grayscale"}`} dangerouslySetInnerHTML={{ __html: svg }} />
            {!service.is_open && (
              <span className="absolute inset-0 grid place-items-center"><Badge>Closed — reopen to accept scans</Badge></span>
            )}
          </div>
          <p className="mt-4 text-center text-sm text-muted">Members scan this with their phone camera while signed in.</p>
          <div className="mt-5 grid gap-2">
            <Link href={`/display/${service.id}`} target="_blank" className="btn btn-primary"><Maximize2 className="size-4" /> Show full screen</Link>
            <div className="grid grid-cols-2 gap-2">
              <a href={png} download={`${service.title} ${service.service_date} QR.png`} className="btn btn-secondary"><Download className="size-4" /> PNG</a>
              <CopyButton text={url} />
            </div>
            <form action={regenerateToken}>
              <input type="hidden" name="service_id" value={service.id} />
              <ConfirmButton className="btn w-full text-muted hover:text-ink" message="Generate a new QR code? The current code and link will stop working.">
                <RefreshCw className="size-4" /> New code (invalidate old one)
              </ConfirmButton>
            </form>
          </div>
        </section>

        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Mini label="Present" value={present.length} />
            <Mini label="Absent" value={absent.length} />
            <Mini label="Attendance" value={pct === null ? "—" : `${pct}%`} />
            <Mini label="Avg. rating" value={avg ? `${avg} / 5` : "—"} />
          </div>

          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <Segmented active={tab} items={[
                { label: `Present (${present.length})`, value: "present", href: `${base}?tab=present` },
                { label: `Absent (${absent.length})`, value: "absent", href: `${base}?tab=absent` },
                { label: `Feedback (${feedback.length})`, value: "feedback", href: `${base}?tab=feedback` },
              ]} />
            </div>

            {tab === "absent" ? (
              absent.length === 0 ? <EmptyState icon={UserCheck} title="Everyone is here 🎉" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="border-b border-line bg-slate-50/60"><tr><th className="th">Member</th><th className="th">Level</th><th className="th">Phone</th><th className="th">Last seen</th><th className="th" /></tr></thead>
                    <tbody className="divide-y divide-line">
                      {absent.map((m) => (
                        <tr key={m.id}>
                          <td className="td"><Link href={`/admin/members/${m.id}`} className="font-medium hover:underline">{m.full_name}</Link></td>
                          <td className="td text-slate-600">{m.level ?? "—"}</td>
                          <td className="td"><ContactLinks phone={m.phone} /></td>
                          <td className="td text-slate-600">{timeAgo(m.last_seen)}</td>
                          <td className="td text-right">
                            <form action={markPresent}>
                              <input type="hidden" name="service_id" value={service.id} />
                              <input type="hidden" name="user_id" value={m.id} />
                              <SubmitButton className="btn btn-secondary btn-sm">Mark present</SubmitButton>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : tab === "feedback" ? (
              feedback.length === 0 ? <EmptyState icon={MessageSquare} title="No feedback yet">Members can rate the service right after they check in.</EmptyState> : (
                <ul className="divide-y divide-line">
                  {feedback.map((f) => (
                    <li key={f.user_id} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <Link href={`/admin/members/${f.user_id}`} className="text-sm font-medium hover:underline">{f.full_name}</Link>
                        <Stars value={f.rating} />
                      </div>
                      {f.comment && <p className="mt-1.5 whitespace-pre-line text-sm text-slate-700">{f.comment}</p>}
                    </li>
                  ))}
                </ul>
              )
            ) : (
              present.length === 0 ? <EmptyState icon={UserX} title="No one has checked in yet">Share or project the QR code to get started.</EmptyState> : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="border-b border-line bg-slate-50/60"><tr><th className="th">Member</th><th className="th">Level</th><th className="th">Checked in</th><th className="th">Rating</th><th className="th" /></tr></thead>
                    <tbody className="divide-y divide-line">
                      {present.map((m) => (
                        <tr key={m.user_id}>
                          <td className="td">
                            <Link href={`/admin/members/${m.user_id}`} className="font-medium hover:underline">{m.full_name}</Link>
                            {m.first_timer && <span className="ml-2"><Badge tone="brand">First-timer</Badge></span>}
                          </td>
                          <td className="td text-slate-600">{m.level ?? "—"}</td>
                          <td className="td tabular-nums text-slate-600">{formatTime(m.checked_in_at)}</td>
                          <td className="td"><Stars value={m.rating} /></td>
                          <td className="td text-right">
                            <form action={markAbsent}>
                              <input type="hidden" name="service_id" value={service.id} />
                              <input type="hidden" name="user_id" value={m.user_id} />
                              <ConfirmButton className="btn btn-sm text-muted hover:text-rose-700" message={`Remove ${m.full_name}'s check-in?`}>Undo</ConfirmButton>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
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
