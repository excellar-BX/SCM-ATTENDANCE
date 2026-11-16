export const LEVELS = ["100lv", "200lv", "300lv", "400lv", "500lv", "600lv", "Postgraduate", "Graduate", "Other"] as const;
export const GENDERS = ["Male", "Female"] as const;
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
export const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** A member who has missed this many services in a row is flagged as inactive by default. */
export const DEFAULT_INACTIVE_THRESHOLD = 3;
