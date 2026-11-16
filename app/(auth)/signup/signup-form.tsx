"use client";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage, ProfileFields } from "@/components/profile-fields";

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signup, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage error={state.error} />
      {/* key remounts fields so they keep what the member typed after a validation error */}
      <ProfileFields key={JSON.stringify(state.values ?? {})} values={state.values} />
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" />
      </div>
      <SubmitButton className="btn btn-primary w-full py-3" pendingText="Creating account…">Create account</SubmitButton>
    </form>
  );
}
