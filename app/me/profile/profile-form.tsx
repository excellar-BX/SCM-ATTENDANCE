"use client";
import { useActionState } from "react";
import { updateProfile } from "@/app/actions/member";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage, ProfileFields } from "@/components/profile-fields";
import type { ProfileValues } from "@/lib/profile";

export function ProfileForm({ values }: { values: Partial<ProfileValues> }) {
  const [state, action] = useActionState(updateProfile, { values });
  return (
    <form action={action} className="space-y-5">
      <ProfileFields key={JSON.stringify(state.values ?? {})} values={state.values} showFirstTimer={false} />
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </form>
  );
}
