import { getCurrentUser } from "@/lib/auth";
import { getMembersWithStats, rate } from "@/lib/queries";
import { formatBirthday, todayISO } from "@/lib/dates";

/** CSV of every member with their details and attendance stats. */
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return new Response("Forbidden", { status: 403 });

  const members = await getMembersWithStats();
  const header = ["Full name", "Email", "Phone", "Gender", "Level", "Birthday", "Campus address", "First timer", "Joined", "Services attended", "Attendance %", "Last seen", "Missed in a row", "Role"];
  const rows = members.map((m) => [
    m.full_name, m.email, m.phone, m.gender, m.level, formatBirthday(m.birth_day, m.birth_month), m.campus_address,
    m.first_timer ? "Yes" : "No", m.joined_on, m.attended, rate(m.attended, m.eligible) ?? "",
    m.last_seen ? new Date(m.last_seen).toISOString().slice(0, 10) : "", m.missed_streak, m.role,
  ]);
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members-${todayISO()}.csv"`,
    },
  });
}
