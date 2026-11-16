"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { createSession, destroySession, safeNext } from "@/lib/auth";
import { readProfile, validateProfile, type FormState } from "@/lib/profile";

export async function signup(_prev: FormState, fd: FormData): Promise<FormState> {
  const v = readProfile(fd);
  const password = String(fd.get("password") ?? "");
  const error = validateProfile(v, { requireFirstTimer: true }) ?? (password.length < 6 ? "Password must be at least 6 characters." : null);
  if (error) return { error, values: v };

  const existing = await sql`SELECT 1 FROM users WHERE email = ${v.email}`;
  if (existing.length) return { error: "An account with this email already exists. Try signing in.", values: v };

  const hash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO users (full_name, email, password_hash, phone, gender, birth_day, birth_month, level, campus_address, first_timer)
    VALUES (${v.full_name}, ${v.email}, ${hash}, ${v.phone}, ${v.gender}, ${Number(v.birth_day)}, ${Number(v.birth_month)},
            ${v.level}, ${v.campus_address}, ${v.first_timer === "yes"})
    RETURNING id`;
  await createSession(rows[0].id as string);
  redirect(safeNext(fd.get("next"), "/me"));
}

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const rows = await sql`SELECT id, role, password_hash FROM users WHERE email = ${email}`;
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash as string))) {
    return { error: "Incorrect email or password.", values: { email } };
  }
  await createSession(user.id as string);
  redirect(safeNext(fd.get("next"), user.role === "admin" ? "/admin" : "/me"));
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
