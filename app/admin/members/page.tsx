import Link from "next/link";
import { Download, Search, Users } from "lucide-react";
import { getMembersWithStats, rate } from "@/lib/queries";
import { formatBirthday, timeAgo } from "@/lib/dates";
import { LEVELS } from "@/lib/constants";
import { memberStatus, StatusBadge } from "@/lib/member-status";
import { Avatar, ContactLinks, EmptyState, PageHeader, RateBar, Segmented } from "@/components/ui";

export const metadata = { title: "Members" };

export default async function MembersPage({ searchParams }: {
  searchParams: Promise<{ q?: string; level?: string; status?: string }>;
}) {
  const { q = "", level = "", status = "all" } = await searchParams;
  const all = await getMembersWithStats();
  const needle = q.trim().toLowerCase();
  const digits = needle.replace(/\D/g, "");
  const members = all.filter((m) =>
    (!needle || m.full_name.toLowerCase().includes(needle) || m.email.includes(needle) || (digits.length >= 3 && (m.phone ?? "").replace(/\D/g, "").includes(digits))) &&
    (!level || m.level === level) &&
    (status === "all" || memberStatus(m) === status),
  );

  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ q, level, status, ...patch });
    for (const [k, v] of [...p]) if (!v || (k === "status" && v === "all")) p.delete(k);
    const s = p.toString();
    return s ? `/admin/members?${s}` : "/admin/members";
  };

  return (
    <>
      <PageHeader
        title="Members"
        subtitle={`${all.length} registered member${all.length === 1 ? "" : "s"}`}
        actions={<a href="/admin/members/export" className="btn btn-secondary"><Download className="size-4" /> Export CSV</a>}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented active={status} items={[
          { label: "All", value: "all", href: qs({ status: "all" }) },
          { label: "Active", value: "active", href: qs({ status: "active" }) },
          { label: "New", value: "new", href: qs({ status: "new" }) },
          { label: "Inactive", value: "inactive", href: qs({ status: "inactive" }) },
        ]} />
        <form className="flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="status" value={status} />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input name="q" defaultValue={q} className="input pl-10 sm:w-64" placeholder="Name, email or phone" />
          </div>
          <select name="level" defaultValue={level} className="input sm:w-40">
            <option value="">All levels</option>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <button className="btn btn-secondary">Filter</button>
        </form>
      </div>

      <section className="card overflow-hidden">
        {members.length === 0 ? (
          <EmptyState icon={Users} title={all.length ? "No members match these filters" : "No members yet"}>
            {all.length ? <Link href="/admin/members" className="font-semibold text-brand-800 hover:underline">Clear filters</Link> : "Share the sign-up link or a service QR code to get members onboard."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead className="border-b border-line bg-slate-50/60">
                <tr><th className="th">Member</th><th className="th">Level</th><th className="th">Phone</th><th className="th">Birthday</th><th className="th">Attendance</th><th className="th">Last seen</th><th className="th">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="td">
                      <Link href={`/admin/members/${m.id}`} className="flex items-center gap-3">
                        <Avatar name={m.full_name} size="sm" />
                        <span className="min-w-0">
                          <span className="block font-medium hover:underline">{m.full_name}</span>
                          <span className="block truncate text-xs text-muted">{m.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="td text-slate-600">{m.level ?? "—"}</td>
                    <td className="td"><ContactLinks phone={m.phone} /></td>
                    <td className="td whitespace-nowrap text-slate-600">{formatBirthday(m.birth_day, m.birth_month)}</td>
                    <td className="td"><RateBar value={rate(m.attended, m.eligible)} /></td>
                    <td className="td whitespace-nowrap text-slate-600">{timeAgo(m.last_seen)}</td>
                    <td className="td"><StatusBadge m={m} /></td>
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
