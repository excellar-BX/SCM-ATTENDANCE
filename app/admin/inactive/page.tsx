import Link from "next/link";
import { UserCheck } from "lucide-react";
import { getMembersWithStats, rate } from "@/lib/queries";
import { timeAgo } from "@/lib/dates";
import { DEFAULT_INACTIVE_THRESHOLD } from "@/lib/constants";
import { Avatar, ContactLinks, EmptyState, PageHeader, RateBar, Segmented } from "@/components/ui";

export const metadata = { title: "Inactive members" };

const THRESHOLDS = ["2", "3", "4", "6"];

export default async function InactivePage({ searchParams }: { searchParams: Promise<{ missed?: string }> }) {
  const { missed } = await searchParams;
  const n = THRESHOLDS.includes(missed ?? "") ? Number(missed) : DEFAULT_INACTIVE_THRESHOLD;
  const members = (await getMembersWithStats())
    .filter((m) => m.missed_streak >= n)
    .sort((a, b) => b.missed_streak - a.missed_streak);

  return (
    <>
      <PageHeader
        title="Inactive members"
        subtitle={`Members who have missed ${n} or more services in a row. Reach out and check on them.`}
        actions={<Segmented active={String(n)} items={THRESHOLDS.map((t) => ({ label: `${t}+ missed`, value: t, href: `/admin/inactive?missed=${t}` }))} />}
      />
      <section className="card overflow-hidden">
        {members.length === 0 ? (
          <EmptyState icon={UserCheck} title="No one is inactive 🙌">Every member has attended at least once in their last {n} services.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-line bg-slate-50/60">
                <tr><th className="th">Member</th><th className="th">Missed in a row</th><th className="th">Last seen</th><th className="th">Overall rate</th><th className="th">Contact</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="td">
                      <Link href={`/admin/members/${m.id}`} className="flex items-center gap-3">
                        <Avatar name={m.full_name} size="sm" />
                        <span><span className="block font-medium hover:underline">{m.full_name}</span><span className="block text-xs text-muted">{m.level ?? "—"} · {m.campus_address ?? "No address"}</span></span>
                      </Link>
                    </td>
                    <td className="td"><span className="font-display text-lg font-semibold text-rose-700">{m.missed_streak}</span> <span className="text-muted">services</span></td>
                    <td className="td whitespace-nowrap text-slate-600">{m.last_seen ? timeAgo(m.last_seen) : "Never checked in"}</td>
                    <td className="td"><RateBar value={rate(m.attended, m.eligible)} /></td>
                    <td className="td"><ContactLinks phone={m.phone} /></td>
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
