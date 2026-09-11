/**
 * Shared date-mode filter logic used by all three report screens (Sales,
 * Purchase, Stock). Mirrors the web app's helper exactly — see the task spec.
 *
 * `toDateKey`/`parseDateKey`/`formatDateDisplay` now live in the neutral
 * `@/utils/date` module (other feature folders — dashboard, inventory — need
 * them too) and are re-exported here so existing imports keep working.
 */

export { toDateKey, parseDateKey, formatDateDisplay } from "@/utils/date";
import { toDateKey } from "@/utils/date";

export type DateMode = "range" | "asOn";

export interface ReportDateFilterValues {
  dateMode: DateMode;
  fromDate: Date | null;
  toDate: Date | null;
  asOnDate: Date | null;
}

/**
 * Builds the {fromDate?, toDate?} | {asOnDate?} query fragment for Sales and
 * Purchase reports. When dateMode is "asOn", ONLY asOnDate is sent (fromDate/
 * toDate are omitted entirely) — the backend treats asOnDate as an inclusive
 * upper bound with no lower bound.
 */
export function toReportDateQuery(
  values: Pick<ReportDateFilterValues, "dateMode" | "fromDate" | "toDate" | "asOnDate">
): { fromDate?: string; toDate?: string; asOnDate?: string } {
  if (values.dateMode === "asOn") {
    return { asOnDate: values.asOnDate ? toDateKey(values.asOnDate) : undefined };
  }
  return {
    fromDate: values.fromDate ? toDateKey(values.fromDate) : undefined,
    toDate: values.toDate ? toDateKey(values.toDate) : undefined,
  };
}
