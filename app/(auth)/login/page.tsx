import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next, user.role === "admin" ? "/admin" : "/me"));
  const isCheckin = next?.startsWith("/c/");

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-muted">
        {isCheckin ? "Sign in to finish checking in. You'll be marked present straight away." : "Sign in to your account."}
      </p>
      <div className="mt-8"><LoginForm next={next} /></div>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-brand-800 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
