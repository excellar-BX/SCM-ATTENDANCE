"use server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isUuid } from "@/lib/queries";
import { readProfile, validateProfile, type FormState } from "@/lib/profile";

export async function submitFeedback(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const serviceId = String(fd.get("service_id") ?? "");
  const rating = Number(fd.get("rating"));
  const comment = String(fd.get("comment") ?? "").trim().slice(0, 1000);
  if (!isUuid(serviceId)) return { error: "Unknown service." };
  if (!(rating >= 1 && rating <= 5)) return { error: "Tap a star to rate the service." };

  const rows = await sql`
    UPDATE attendance SET rating = ${rating}, comment = ${comment || null}
    WHERE service_id = ${serviceId} AND user_id = ${user.id}
    RETURNING id`;
  if (!rows.length) return { error: "You need to be checked in to rate this service." };
  revalidatePath("/me");
  return { success: "Thank you! Your feedback has been received." };
}

export async function updateProfile(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const v = readProfile(fd);
  const error = validateProfile(v, { requireFirstTimer: false });
  if (error) return { error, values: v };

  const clash = await sql`SELECT 1 FROM users WHERE email = ${v.email} AND id <> ${user.id}`;
  if (clash.length) return { error: "Another account already uses that email.", values: v };

  await sql`
    UPDATE users SET full_name = ${v.full_name}, email = ${v.email}, phone = ${v.phone}, gender = ${v.gender},
      birth_day = ${Number(v.birth_day)}, birth_month = ${Number(v.birth_month)}, level = ${v.level},
      campus_address = ${v.campus_address}
    WHERE id = ${user.id}`;
  revalidatePath("/", "layout");
  return { success: "Your details have been saved.", values: v };
}
