"use server";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/queries";
import type { FormState } from "@/lib/profile";

const id = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "");
  if (!isUuid(v)) throw new Error(`Invalid ${k}`);
  return v;
};

function refresh() {
  revalidatePath("/admin", "layout");
}

export async function createService(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const title = String(fd.get("title") ?? "").trim();
  const date = String(fd.get("service_date") ?? "");
  if (title.length < 2) return { error: "Give the service a name." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Pick the service date." };

  const token = randomBytes(18).toString("base64url");
  const rows = await sql`
    INSERT INTO services (title, service_date, token, created_by)
    VALUES (${title}, ${date}, ${token}, ${admin.id}) RETURNING id`;
  refresh();
  redirect(`/admin/services/${rows[0].id}`);
}

export async function setServiceOpen(fd: FormData) {
  await requireAdmin();
  const open = fd.get("open") === "true";
  await sql`UPDATE services SET is_open = ${open} WHERE id = ${id(fd, "service_id")}`;
  refresh();
}

/** Issue a new QR code, so old photos/screenshots of the code stop working. */
export async function regenerateToken(fd: FormData) {
  await requireAdmin();
  await sql`UPDATE services SET token = ${randomBytes(18).toString("base64url")} WHERE id = ${id(fd, "service_id")}`;
  refresh();
}

export async function deleteService(fd: FormData) {
  await requireAdmin();
  await sql`DELETE FROM services WHERE id = ${id(fd, "service_id")}`;
  refresh();
  redirect("/admin/services");
}

/** For members who were there but couldn't scan (dead phone etc.). */
export async function markPresent(fd: FormData) {
  await requireAdmin();
  await sql`
    INSERT INTO attendance (service_id, user_id) VALUES (${id(fd, "service_id")}, ${id(fd, "user_id")})
    ON CONFLICT (service_id, user_id) DO NOTHING`;
  refresh();
}

export async function markAbsent(fd: FormData) {
  await requireAdmin();
  await sql`DELETE FROM attendance WHERE service_id = ${id(fd, "service_id")} AND user_id = ${id(fd, "user_id")}`;
  refresh();
}

export async function setRole(fd: FormData) {
  const admin = await requireAdmin();
  const userId = id(fd, "user_id");
  const role = fd.get("role") === "admin" ? "admin" : "member";
  if (userId === admin.id && role === "member") throw new Error("You can't remove your own admin access.");
  await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`;
  refresh();
}

export async function deleteMember(fd: FormData) {
  const admin = await requireAdmin();
  const userId = id(fd, "user_id");
  if (userId === admin.id) throw new Error("You can't delete your own account here.");
  await sql`DELETE FROM users WHERE id = ${userId}`;
  refresh();
  redirect("/admin/members");
}
