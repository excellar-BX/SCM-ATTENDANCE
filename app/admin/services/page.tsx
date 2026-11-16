import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { getServices, rate } from "@/lib/queries";
import { formatDate, todayISO } from "@/lib/dates";
import { Badge, EmptyState, PageHeader, RateBar } from "@/components/ui";
import { Stars } from "@/components/star-input";
import { NewServiceForm } from "./new-service-form";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await getServices();
  const today = todayISO();
  return (
    <>
      <PageHeader title="Services" subtitle="Create a service to get its check-in QR code, then share or project it." />

      <section className="card mb-6 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">New service</h2>
        <div className="mt-4"><NewServiceForm today={today} /></div>
      </section>

      <section className="card overflow-hidden">
        {services.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No services yet">Create one above to generate its QR code.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-line bg-slate-50/60">
                <tr><th className="th">Service</th><th className="th">Status</th><th className="th">Present</th><th className="th">Attendance</th><th className="th">Rating</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="td">
                      <Link href={`/admin/services/${s.id}`} className="font-medium hover:text-brand-800 hover:underline">{s.title}</Link>
                      <p className="text-xs text-muted">{formatDate(s.service_date)}</p>
                    </td>
                    <td className="td">
                      {s.is_open ? <Badge tone="green">Check-in open</Badge> : <Badge>Closed</Badge>}
                      {s.service_date > today && <span className="ml-1"><Badge tone="brand">Upcoming</Badge></span>}
                    </td>
                    <td className="td tabular-nums">{s.present} <span className="text-muted">/ {s.eligible}</span></td>
                    <td className="td"><RateBar value={rate(s.present, s.eligible)} /></td>
                    <td className="td">
                      <div className="flex items-center gap-2"><Stars value={s.avg_rating ? Math.round(s.avg_rating) : null} />{s.avg_rating && <span className="text-xs text-muted">{s.avg_rating}</span>}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
