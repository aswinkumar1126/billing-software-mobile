/**
 * Shared date helpers used across the whole app.
 *
 * `toDateKey` produces yyyy-MM-dd — this is the backend's wire format and
 * MUST NOT change. `formatDateDisplay` is the display-only counterpart: it
 * renders dd-mm-yyyy for anything shown on screen (lists, reports, the
 * dashboard). Never send the output of `formatDateDisplay` to the API.
 */

/** Converts a Date to yyyy-MM-dd (local time) — the API's wire format. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses a yyyy-MM-dd string (or empty) back into a Date, for controlled inputs. */
export function parseDateKey(text: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/**
 * Renders a Date, or an ISO/yyyy-MM-dd string from an API response, as
 * dd-mm-yyyy for display. Returns an em dash for anything unparseable.
 */
export function formatDateDisplay(date: Date | string | null | undefined): string {
  if (!date) return "—";

  if (typeof date === "string") {
    // Fast path for the common yyyy-MM-dd / ISO-prefixed cases — avoids
    // timezone-shift surprises from `new Date("yyyy-MM-dd")` (which parses
    // as UTC midnight and can render as the previous day in western zones).
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date.trim());
    if (match) {
      const [, y, m, d] = match;
      return `${d}-${m}-${y}`;
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";
    return formatDateDisplay(parsed);
  }

  if (Number.isNaN(date.getTime())) return "—";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${d}-${m}-${y}`;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Renders a Date as a friendly long form, e.g. "15 September 2026". */
export function formatDateLong(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Short weekday name, e.g. "Mon". No Intl dependency — reliable in RN. */
export function weekdayShort(date: Date): string {
  return WEEKDAY_NAMES[date.getDay()];
}

const WEEKDAY_NAMES_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Full weekday name, e.g. "Monday". */
export function weekdayLong(date: Date): string {
  return WEEKDAY_NAMES_LONG[date.getDay()];
}

/** Formats a time as e.g. "3:45 PM" from the device's local clock. */
export function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${suffix}`;
}
