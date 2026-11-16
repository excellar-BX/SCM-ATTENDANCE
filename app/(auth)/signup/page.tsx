import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Create account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next, user.role === "admin" ? "/admin" : "/me"));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-muted">
        {next?.startsWith("/c/")
          ? "One quick form, then you'll be checked in to today's service."
          : "Fill this once. After that, just scan the QR code at each service."}
      </p>
      <div className="mt-8"><SignupForm next={next} /></div>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-brand-800 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
