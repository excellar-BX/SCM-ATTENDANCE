import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMember } from "@/lib/queries";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "My details" };

export default async function ProfilePage() {
  const user = await requireUser("/me/profile");
  const m = await getMember(user.id);
  if (!m) return null;
  return (
    <div>
      <Link href="/me" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Back</Link>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">My details</h1>
      <p className="mt-1 text-muted">Keep these up to date so we can reach you.</p>
      <div className="card mt-6 p-6">
        <ProfileForm values={{
          full_name: m.full_name, email: m.email, phone: m.phone ?? "", gender: m.gender ?? "",
          birth_day: m.birth_day ? String(m.birth_day) : "", birth_month: m.birth_month ? String(m.birth_month) : "",
          level: m.level ?? "", campus_address: m.campus_address ?? "",
        }} />
      </div>
    </div>
  );
}
