import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="font-display text-6xl font-semibold text-brand-900">404</p>
        <p className="mt-2 text-muted">We couldn&apos;t find that page.</p>
        <Link href="/" className="btn btn-primary mt-6">Go home</Link>
      </div>
    </main>
  );
}
