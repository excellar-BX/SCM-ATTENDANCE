"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Shows the running check-in count and refreshes it every few seconds. */
export function LiveCount({ initial }: { initial: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [router]);
  return (
    <p className="font-display text-2xl">
      <span className="text-5xl font-semibold tabular-nums">{initial}</span>
      <span className="ml-2 text-brand-200">checked in</span>
    </p>
  );
}
