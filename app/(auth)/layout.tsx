import { CalendarCheck, Cake, ScanLine } from "lucide-react";
import { Logo } from "@/components/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-brand-950 p-10 text-white lg:flex lg:flex-col">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-800/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white font-display text-lg font-bold text-brand-900">S</span>
          <span className="font-display text-xl font-semibold">SCM Attendance</span>
        </div>
        <div className="relative mt-auto max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight">Every service, every member, accounted for.</h2>
          <ul className="mt-8 space-y-4 text-brand-100">
            <li className="flex gap-3"><ScanLine className="mt-0.5 size-5 shrink-0" /> Scan the QR code at service and you&apos;re marked present instantly.</li>
            <li className="flex gap-3"><CalendarCheck className="mt-0.5 size-5 shrink-0" /> See your own attendance history any time.</li>
            <li className="flex gap-3"><Cake className="mt-0.5 size-5 shrink-0" /> We never forget a birthday.</li>
          </ul>
        </div>
      </aside>
      <main className="flex flex-col px-4 py-8 sm:px-8 lg:px-16">
        <div className="flex items-center gap-3 lg:hidden">
          <Logo />
          <span className="font-display text-lg font-semibold">SCM Attendance</span>
        </div>
        <div className="mx-auto my-auto w-full max-w-xl py-8">{children}</div>
      </main>
    </div>
  );
}
