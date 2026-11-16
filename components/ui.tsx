import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "size-12 text-xl" : "size-10 text-lg";
  return (
    <span className={`${box} grid shrink-0 place-items-center rounded-xl bg-brand-900 font-display font-bold text-white`}>S</span>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "brand" }: {
  label: string; value: React.ReactNode; hint?: React.ReactNode; icon: LucideIcon; tone?: "brand" | "amber" | "green" | "rose";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-800",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-600">{label}</p>
        <span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "brand" | "green" | "amber" | "rose" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    brand: "bg-brand-50 text-brand-800",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-700",
  };
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-800"><Icon className="size-6" /></span>
      <p className="mt-4 font-medium">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const s = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-16 text-xl" }[size];
  return <span className={`${s} grid shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-900`}>{initials || "?"}</span>;
}

export function Segmented({ items, active }: { items: { label: string; href: string; value: string }[]; active: string }) {
  return (
    <div className="inline-flex rounded-xl bg-slate-200/60 p-1">
      {items.map((i) => (
        <Link
          key={i.value}
          href={i.href}
          scroll={false}
          className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
            active === i.value ? "bg-white text-ink shadow-sm" : "text-slate-600 hover:text-ink"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
}

export function RateBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-sm text-muted">—</span>;
  const color = value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm tabular-nums text-slate-700">{value}%</span>
    </div>
  );
}

/** Links to call or WhatsApp a member. Nigerian 0-prefixed numbers are converted to +234 for WhatsApp. */
export function ContactLinks({ phone }: { phone: string | null }) {
  if (!phone) return <span className="text-sm text-muted">—</span>;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) digits = "234" + digits.slice(1);
  return (
    <div className="flex items-center gap-2 whitespace-nowrap text-sm">
      <a href={`tel:${phone}`} className="text-slate-700 hover:text-brand-800">{phone}</a>
      <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">WhatsApp</a>
    </div>
  );
}
