import { requireUser } from "@/lib/auth";
import { MemberShell } from "@/components/member-shell";

export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/me");
  return <MemberShell user={user}>{children}</MemberShell>;
}
