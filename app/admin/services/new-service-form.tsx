"use client";
import { useActionState } from "react";
import { QrCode } from "lucide-react";
import { createService } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/profile-fields";

export function NewServiceForm({ today }: { today: string }) {
  const [state, action] = useActionState(createService, {});
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="title">Service name</label>
          <input id="title" name="title" className="input" required list="service-names" placeholder="e.g. Sunday Service" />
          <datalist id="service-names">
            <option value="Sunday Service" /><option value="Midweek Service" /><option value="Bible Study" /><option value="Prayer Meeting" /><option value="Fellowship Night" />
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="service_date">Date</label>
          <input id="service_date" name="service_date" type="date" className="input" required defaultValue={today} />
        </div>
        <SubmitButton pendingText="Creating…"><QrCode className="size-4" /> Create & get QR</SubmitButton>
      </div>
      <FormMessage error={state.error} />
    </form>
  );
}
