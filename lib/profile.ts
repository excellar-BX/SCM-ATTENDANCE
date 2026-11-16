import { LEVELS, GENDERS, MONTH_DAYS } from "./constants";

export type ProfileValues = {
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  birth_day: string;
  birth_month: string;
  level: string;
  campus_address: string;
  first_timer: string; // "yes" | "no"
};

export type FormState = {
  error?: string;
  success?: string;
  values?: Partial<ProfileValues>;
};

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export function readProfile(fd: FormData): ProfileValues {
  return {
    full_name: str(fd, "full_name").replace(/\s+/g, " "),
    email: str(fd, "email").toLowerCase(),
    phone: str(fd, "phone"),
    gender: str(fd, "gender"),
    birth_day: str(fd, "birth_day"),
    birth_month: str(fd, "birth_month"),
    level: str(fd, "level"),
    campus_address: str(fd, "campus_address"),
    first_timer: str(fd, "first_timer"),
  };
}

/** Returns an error message, or null when valid. */
export function validateProfile(v: ProfileValues, { requireFirstTimer }: { requireFirstTimer: boolean }): string | null {
  if (v.full_name.length < 3) return "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return "Please enter a valid email address.";
  if (!/^\+?[\d\s-]{7,20}$/.test(v.phone)) return "Please enter a valid phone number.";
  if (!(GENDERS as readonly string[]).includes(v.gender)) return "Please select your gender.";
  const day = Number(v.birth_day), month = Number(v.birth_month);
  if (!month || month < 1 || month > 12) return "Please select your birth month.";
  if (!day || day < 1 || day > MONTH_DAYS[month - 1]) return "That birthday day doesn't exist in the selected month.";
  if (!(LEVELS as readonly string[]).includes(v.level)) return "Please select your level.";
  if (v.campus_address.length < 2) return "Please enter your address on campus.";
  if (requireFirstTimer && v.first_timer !== "yes" && v.first_timer !== "no") return "Please tell us if this is your first time.";
  return null;
}
