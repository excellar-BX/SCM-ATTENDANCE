import "server-only";
import { cache } from "react";
import { sql } from "./db";
import { TIMEZONE, todayISO, daysUntilBirthday } from "./dates";

export type Member = {
  id: string;
  full_name: string;
  email: string;
  role: "member" | "admin";
  birth_day: number | null;
  birth_month: number | null;
  level: string | null;
  first_timer: boolean;
  gender: string | null;
  campus_address: string | null;
  phone: string | null;
  created_at: Date;
  joined_on: string; // YYYY-MM-DD in app timezone
};

export type MemberWithStats = Member & {
  attended: number;
  eligible: number; // services held (up to today) since the member joined
  last_seen: Date | null;
  missed_streak: number; // services missed in a row, most recent first
};

export type Service = {
  id: string;
  title: string;
  service_date: string;
  token: string;
  is_open: boolean;
  created_at: Date;
};

export type ServiceWithCounts = Service & {
  present: number;
  eligible: number;
  avg_rating: number | null;
  feedback_count: number;
};

const MEMBER_COLUMNS = `
  u.id, u.full_name, u.email, u.role, u.birth_day, u.birth_month, u.level, u.first_timer,
  u.gender, u.campus_address, u.phone, u.created_at,
  (u.created_at AT TIME ZONE $1)::date::text AS joined_on`;

/** Every account with attendance stats. "Eligible" services are those on/after the day they joined. */
export const getMembersWithStats = cache(async (): Promise<MemberWithStats[]> => {
  const today = todayISO();
  const rows = await sql.query(
    `WITH held AS (SELECT id, service_date FROM services WHERE service_date <= $2::date),
          last_att AS (
            SELECT a.user_id, max(a.checked_in_at) AS last_seen, max(s.service_date) AS last_date, count(*)::int AS attended
            FROM attendance a JOIN services s ON s.id = a.service_id
            GROUP BY a.user_id)
     SELECT ${MEMBER_COLUMNS},
       coalesce(la.attended, 0) AS attended,
       la.last_seen,
       (SELECT count(*)::int FROM held h WHERE h.service_date >= (u.created_at AT TIME ZONE $1)::date) AS eligible,
       (SELECT count(*)::int FROM held h
          WHERE h.service_date >= (u.created_at AT TIME ZONE $1)::date
            AND h.service_date > coalesce(la.last_date, '-infinity'::date)) AS missed_streak
     FROM users u LEFT JOIN last_att la ON la.user_id = u.id
     ORDER BY u.full_name`,
    [TIMEZONE, today],
  );
  return rows as MemberWithStats[];
});

export async function getMember(id: string): Promise<Member | null> {
  if (!isUuid(id)) return null;
  const rows = await sql.query(`SELECT ${MEMBER_COLUMNS} FROM users u WHERE u.id = $2`, [TIMEZONE, id]);
  return (rows[0] as Member) ?? null;
}

/** Services the member was expected at, with whether they came. */
export async function getMemberHistory(userId: string) {
  const rows = await sql.query(
    `SELECT s.id, s.title, s.service_date::text AS service_date, a.checked_in_at, a.rating, a.comment
     FROM services s
     JOIN users u ON u.id = $2
     LEFT JOIN attendance a ON a.service_id = s.id AND a.user_id = u.id
     WHERE s.service_date >= (u.created_at AT TIME ZONE $1)::date OR a.id IS NOT NULL
     ORDER BY s.service_date DESC, s.created_at DESC`,
    [TIMEZONE, userId],
  );
  return rows as {
    id: string; title: string; service_date: string;
    checked_in_at: Date | null; rating: number | null; comment: string | null;
  }[];
}

export async function getServices(limit = 200): Promise<ServiceWithCounts[]> {
  const rows = await sql.query(
    `SELECT s.id, s.title, s.service_date::text AS service_date, s.token, s.is_open, s.created_at,
       (SELECT count(*)::int FROM attendance a WHERE a.service_id = s.id) AS present,
       (SELECT count(*)::int FROM users u
          WHERE (u.created_at AT TIME ZONE $1)::date <= s.service_date
             OR EXISTS (SELECT 1 FROM attendance a WHERE a.service_id = s.id AND a.user_id = u.id)) AS eligible,
       (SELECT round(avg(a.rating)::numeric, 1)::float FROM attendance a WHERE a.service_id = s.id) AS avg_rating,
       (SELECT count(*)::int FROM attendance a WHERE a.service_id = s.id AND (a.rating IS NOT NULL OR a.comment IS NOT NULL)) AS feedback_count
     FROM services s
     ORDER BY s.service_date DESC, s.created_at DESC
     LIMIT $2`,
    [TIMEZONE, limit],
  );
  return rows as ServiceWithCounts[];
}

export async function getService(id: string): Promise<Service | null> {
  if (!isUuid(id)) return null;
  const rows = await sql`
    SELECT id, title, service_date::text AS service_date, token, is_open, created_at
    FROM services WHERE id = ${id}`;
  return (rows[0] as Service) ?? null;
}

export type PresentRow = {
  user_id: string; full_name: string; email: string; level: string | null; phone: string | null;
  checked_in_at: Date; rating: number | null; comment: string | null; first_timer: boolean;
};
export type AbsentRow = {
  id: string; full_name: string; email: string; level: string | null; phone: string | null; last_seen: Date | null;
};

export async function getServiceRoll(serviceId: string, serviceDate: string) {
  const [present, absent] = await Promise.all([
    sql`
      SELECT u.id AS user_id, u.full_name, u.email, u.level, u.phone, u.first_timer,
             a.checked_in_at, a.rating, a.comment
      FROM attendance a JOIN users u ON u.id = a.user_id
      WHERE a.service_id = ${serviceId}
      ORDER BY a.checked_in_at`,
    sql.query(
      `SELECT u.id, u.full_name, u.email, u.level, u.phone,
              (SELECT max(a2.checked_in_at) FROM attendance a2 WHERE a2.user_id = u.id) AS last_seen
       FROM users u
       WHERE (u.created_at AT TIME ZONE $1)::date <= $2::date
         AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.service_id = $3 AND a.user_id = u.id)
       ORDER BY u.full_name`,
      [TIMEZONE, serviceDate, serviceId],
    ),
  ]);
  return { present: present as PresentRow[], absent: absent as AbsentRow[] };
}

export function withBirthdayCountdown<T extends { birth_day: number | null; birth_month: number | null }>(members: T[]) {
  const today = todayISO();
  return members
    .filter((m) => m.birth_day && m.birth_month)
    .map((m) => ({ ...m, days_until: daysUntilBirthday(m.birth_day!, m.birth_month!, today) }))
    .sort((a, b) => a.days_until - b.days_until);
}

export function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

/** Attendance rate as a whole percentage. */
export function rate(attended: number, eligible: number) {
  if (eligible <= 0) return null;
  return Math.min(100, Math.round((attended / eligible) * 100));
}
