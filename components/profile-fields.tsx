import { LEVELS, GENDERS, MONTHS } from "@/lib/constants";
import type { ProfileValues } from "@/lib/profile";

/** Shared member detail fields for sign-up and profile editing. */
export function ProfileFields({ values = {}, showFirstTimer = true }: { values?: Partial<ProfileValues>; showFirstTimer?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="full_name">Full name</label>
        <input className="input" id="full_name" name="full_name" required autoComplete="name" defaultValue={values.full_name} placeholder="e.g. Favour Excellence Adeyemi" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required autoComplete="email" defaultValue={values.email} placeholder="you@example.com" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone number</label>
        <input className="input" id="phone" name="phone" type="tel" required autoComplete="tel" defaultValue={values.phone} placeholder="0801 234 5678" />
      </div>
      <div>
        <label className="label" htmlFor="gender">Gender</label>
        <select className="input" id="gender" name="gender" required defaultValue={values.gender ?? ""}>
          <option value="" disabled>Select…</option>
          {GENDERS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="level">Level</label>
        <select className="input" id="level" name="level" required defaultValue={values.level ?? ""}>
          <option value="" disabled>Select…</option>
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="label">Birthday <span className="font-normal text-muted">(no year needed)</span></legend>
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <select className="input" name="birth_day" aria-label="Day" required defaultValue={values.birth_day ?? ""}>
            <option value="" disabled>Day</option>
            {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
          </select>
          <select className="input" name="birth_month" aria-label="Month" required defaultValue={values.birth_month ?? ""}>
            <option value="" disabled>Month</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="campus_address">Address on campus</label>
        <input className="input" id="campus_address" name="campus_address" required defaultValue={values.campus_address} placeholder="Hall / hostel and room, or lodge name" />
      </div>
      {showFirstTimer && (
        <fieldset className="sm:col-span-2">
          <legend className="label">Is this your first time with us?</legend>
          <div className="grid grid-cols-2 gap-3">
            {[["yes", "Yes, I'm new"], ["no", "No, I've been before"]].map(([value, text]) => (
              <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:ring-4 has-checked:ring-brand-100">
                <input type="radio" name="first_timer" value={value} required defaultChecked={values.first_timer === value} className="accent-brand-800" />
                {text}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) return <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>;
  if (success) return <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{success}</p>;
  return null;
}
