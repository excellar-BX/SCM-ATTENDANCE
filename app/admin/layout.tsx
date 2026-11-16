import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getMembersWithStats, withBirthdayCountdown } from "@/lib/queries";
import { DEFAULT_INACTIVE_THRESHOLD } from "@/lib/constants";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [open, members] = await Promise.all([
    sql`SELECT count(*)::int AS n FROM services WHERE is_open`,
    getMembersWithStats(),
  ]);
  const counts = {
    openServices: open[0].n as number,
    inactive: members.filter((m) => m.missed_streak >= DEFAULT_INACTIVE_THRESHOLD).length,
    birthdaysToday: withBirthdayCountdown(members).filter((m) => m.days_until === 0).length,
  };
  return <AdminShell user={user} counts={counts}>{children}</AdminShell>;
}
