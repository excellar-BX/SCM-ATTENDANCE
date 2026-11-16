import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Logo } from "./ui";
import type { CurrentUser } from "@/lib/auth";

/** Simple top-bar layout for the member-facing pages. */
export function MemberShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
          <Link href="/me" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-display text-lg font-semibold">SCM Attendance</span>
          </Link>
          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <Link href="/admin" className="btn btn-secondary btn-sm"><LayoutDashboard className="size-4" /> <span className="hidden sm:inline">Admin</span></Link>
            )}
            <form action={logout}>
              <button className="btn btn-secondary btn-sm" aria-label="Log out"><LogOut className="size-4" /> <span className="hidden sm:inline">Log out</span></button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
