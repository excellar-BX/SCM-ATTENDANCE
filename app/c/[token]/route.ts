import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * The URL inside each service QR code. Scanning it while signed in marks the member present;
 * otherwise they sign in / sign up first and are sent back here.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);

  const services = await sql`SELECT id, is_open FROM services WHERE token = ${token}`;
  const service = services[0];
  if (!service) return go("/checkin/invalid");

  const user = await getCurrentUser();
  if (!user) return go(`/login?next=${encodeURIComponent(`/c/${token}`)}`);

  if (!service.is_open) {
    const existing = await sql`SELECT 1 FROM attendance WHERE service_id = ${service.id} AND user_id = ${user.id}`;
    return go(`/checkin/${service.id}?s=${existing.length ? "already" : "closed"}`);
  }

  const inserted = await sql`
    INSERT INTO attendance (service_id, user_id) VALUES (${service.id}, ${user.id})
    ON CONFLICT (service_id, user_id) DO NOTHING
    RETURNING id`;
  return go(`/checkin/${service.id}?s=${inserted.length ? "ok" : "already"}`);
}
