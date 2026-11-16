import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, CircleX, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getService } from "@/lib/queries";
import { formatDate, formatTime } from "@/lib/dates";
import { MemberShell } from "@/components/member-shell";
import { FeedbackForm } from "./feedback-form";

export const metadata = { title: "Check-in" };

export default async function CheckinPage({ params, searchParams }: {
  params: Promise<{ serviceId: string }>; searchParams: Promise<{ s?: string }>;
}) {
  const { serviceId } = await params;
  const { s } = await searchParams;
  const user = await requireUser();

  if (serviceId === "invalid") {
    return (
      <MemberShell user={user}>
        <Result icon={<CircleX className="size-8" />} tone="rose" title="This QR code isn't valid">
          It may be from an old service. Ask an usher for the current code.
        </Result>
      </MemberShell>
    );
  }

  const service = await getService(serviceId);
  if (!service) notFound();
  const rows = await sql`SELECT checked_in_at, rating, comment FROM attendance WHERE service_id = ${service.id} AND user_id = ${user.id}`;
  const att = rows[0] as { checked_in_at: Date; rating: number | null; comment: string | null } | undefined;
  const firstName = user.full_name.split(" ")[0];

  return (
    <MemberShell user={user}>
      {att ? (
        <Result icon={<CircleCheck className="size-8" />} tone="green" title={s === "ok" ? `You're in, ${firstName}!` : "You're already checked in"}>
          Marked present for <strong className="text-ink">{service.title}</strong> · {formatDate(service.service_date)} at {formatTime(att.checked_in_at)}
        </Result>
      ) : (
        <Result icon={<Clock className="size-8" />} tone="amber" title="Check-in is closed">
          Check-in for <strong className="text-ink">{service.title}</strong> has closed. If you were there, speak to an admin.
        </Result>
      )}

      {att && (
        <section className="card mt-6 p-6">
          <h2 className="font-display text-lg font-semibold">How was the service?</h2>
          <p className="mt-1 text-sm text-muted">Optional — your rating and comments help us improve.</p>
          <div className="mt-5"><FeedbackForm serviceId={service.id} rating={att.rating} comment={att.comment} /></div>
        </section>
      )}

      <p className="mt-6 text-center"><Link href="/me" className="text-sm font-semibold text-brand-800 hover:underline">Go to my attendance →</Link></p>
    </MemberShell>
  );
}

function Result({ icon, tone, title, children }: { icon: React.ReactNode; tone: "green" | "amber" | "rose"; title: string; children: React.ReactNode }) {
  const tones = { green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600" };
  return (
    <section className="card flex flex-col items-center px-6 py-10 text-center">
      <span className={`grid size-16 place-items-center rounded-full ${tones[tone]}`}>{icon}</span>
      <h1 className="mt-4 font-display text-2xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-md text-muted">{children}</p>
    </section>
  );
}
