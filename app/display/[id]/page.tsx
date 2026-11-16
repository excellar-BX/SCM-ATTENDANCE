import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getService } from "@/lib/queries";
import { formatDate } from "@/lib/dates";
import { checkinUrl, qrSvg } from "@/lib/qr";
import { LiveCount } from "./live-count";
import { sql } from "@/lib/db";

export const metadata = { title: "Check in" };

/** Full-screen QR for projecting at the venue. */
export default async function DisplayPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();
  const url = await checkinUrl(service.token);
  const svg = await qrSvg(url);
  const count = await sql`SELECT count(*)::int AS n FROM attendance WHERE service_id = ${service.id}`;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-brand-950 p-6 text-center text-white">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">Scan to check in</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{service.title}</h1>
        <p className="mt-2 text-lg text-brand-200">{formatDate(service.service_date, { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>
      <div className="w-full max-w-[min(70vh,520px)] rounded-3xl bg-white p-5 shadow-2xl" dangerouslySetInnerHTML={{ __html: svg }} />
      {service.is_open ? (
        <p className="text-lg text-brand-100">Open your phone camera, point it at the code, and sign in if asked.</p>
      ) : (
        <p className="rounded-full bg-amber-400/20 px-4 py-1.5 text-amber-200">Check-in is closed</p>
      )}
      <LiveCount initial={count[0].n as number} />
    </main>
  );
}
