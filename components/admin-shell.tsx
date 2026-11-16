"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Cake, CalendarCheck, LayoutDashboard, LogOut, Menu, PanelLeft, ScanLine, Search, UserX, Users, X } from "lucide-react";
import { logout } from "@/app/actions/auth";

type Counts = { openServices: number; inactive: number; birthdaysToday: number };

type NavItem = { href: string; label: string; icon: typeof Users; exact?: boolean; count?: keyof Counts };

const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  { group: "Services", items: [{ href: "/admin/services", label: "Services & QR", icon: CalendarCheck, count: "openServices" }] },
  {
    group: "People",
    items: [
      { href: "/admin/members", label: "Members", icon: Users },
      { href: "/admin/inactive", label: "Inactive", icon: UserX, count: "inactive" },
      { href: "/admin/birthdays", label: "Birthdays", icon: Cake, count: "birthdaysToday" },
    ],
  },
];

const TITLES: [string, string][] = [
  ["/admin/services", "Services"], ["/admin/members", "Members"], ["/admin/inactive", "Inactive"],
  ["/admin/birthdays", "Birthdays"], ["/admin", "Dashboard"],
];

export function AdminShell({ user, counts, children }: {
  user: { full_name: string }; counts: Counts; children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setMobileOpen(false), [pathname]);

  const initials = user.full_name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Dashboard";

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center gap-3 border-b border-line px-6">
        <span className="grid size-10 place-items-center rounded-xl bg-brand-900 font-display text-lg font-bold text-white">S</span>
        <span className="font-display text-xl font-semibold">SCM Admin</span>
        <button className="ml-auto rounded-lg p-1.5 text-muted hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X className="size-5" /></button>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {NAV.map((section) => (
          <div key={section.group} className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted">{section.group}</p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const count = item.count ? counts[item.count] : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
                        active ? "bg-brand-50 text-brand-900" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {active && <span className="absolute -left-4 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-900" />}
                      <item.icon className="size-5" />
                      {item.label}
                      {count > 0 && (
                        <span className={`ml-auto grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                          item.count === "openServices" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                        }`}>{count}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-line px-4 py-4">
        <Link href="/me" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-50">
          <ScanLine className="size-5" /> My check-ins
        </Link>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-50">
            <LogOut className="size-5" /> Log out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-white transition-transform lg:block ${collapsed ? "-translate-x-full" : ""}`}>
        {sidebar}
      </aside>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className={`transition-[padding] ${collapsed ? "" : "lg:pl-72"}`}>
        <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-8">
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <button className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:block" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar"><PanelLeft className="size-5" /></button>
          <nav className="hidden items-center gap-2 text-[15px] md:flex">
            <span className="text-muted">Admin</span><span className="text-slate-300">/</span><span className="font-medium">{title}</span>
          </nav>
          <form action="/admin/members" className="relative ml-auto w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input name="q" className="input pl-10" placeholder="Search members by name, email, phone…" />
          </form>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-900">{initials}</span>
            <div className="hidden leading-tight xl:block">
              <p className="text-[15px] font-medium">{user.full_name}</p>
              <p className="text-xs text-muted">Admin</p>
            </div>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
