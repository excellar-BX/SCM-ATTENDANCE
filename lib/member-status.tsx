import { Badge } from "@/components/ui";
import { DEFAULT_INACTIVE_THRESHOLD } from "./constants";
import type { MemberWithStats } from "./queries";

export type MemberStatus = "new" | "active" | "inactive" | "waiting";

export function memberStatus(m: MemberWithStats): MemberStatus {
  if (m.missed_streak >= DEFAULT_INACTIVE_THRESHOLD) return "inactive";
  if (Date.now() - new Date(m.created_at).getTime() < 30 * 86_400_000) return "new";
  if (m.eligible === 0) return "waiting";
  return "active";
}

export function StatusBadge({ m }: { m: MemberWithStats }) {
  const s = memberStatus(m);
  if (s === "inactive") return <Badge tone="rose">Missed {m.missed_streak} in a row</Badge>;
  if (s === "new") return <Badge tone="brand">New</Badge>;
  if (s === "waiting") return <Badge>No services yet</Badge>;
  return <Badge tone="green">Active</Badge>;
}
