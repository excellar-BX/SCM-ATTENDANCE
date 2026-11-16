"use client";
import { useActionState } from "react";
import { submitFeedback } from "@/app/actions/member";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/profile-fields";
import { StarInput } from "@/components/star-input";

export function FeedbackForm({ serviceId, rating, comment }: { serviceId: string; rating: number | null; comment: string | null }) {
  const [state, action] = useActionState(submitFeedback, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />
      <StarInput name="rating" defaultValue={rating ?? 0} />
      <div>
        <label className="label" htmlFor="comment">Comments</label>
        <textarea id="comment" name="comment" rows={3} maxLength={1000} className="input resize-y" defaultValue={comment ?? ""} placeholder="What blessed you? What could be better?" />
      </div>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton pendingText="Sending…">{rating ? "Update feedback" : "Send feedback"}</SubmitButton>
    </form>
  );
}
