/**
 * Formats a date relative to the current time (e.g. "just now", "5 minutes ago", "3 hours ago", "2 days ago").
 * If the relative difference is greater than or equal to the threshold in days, it falls back
 * to a short date formatted according to the user's native browser locale settings.
 *
 * @param date - The date to format (can be a Date object, timestamp, or string).
 * @param thresholdDays - The threshold in days before falling back to a short date format (default: 7).
 * @returns The formatted relative time string or short date.
 */
export declare function formatRelativeTime(date: Date | number | string, thresholdDays?: number): string;
/**
 * Returns a human-friendly day group for a date.
 * Groups are: "Today", "Yesterday", the day name (e.g. "Sunday", going back up to 3 days),
 * or the formatted date (e.g. "May 30th" or "December 15th, 2025").
 *
 * @param date - The date to group (can be a Date object, timestamp, or string).
 * @returns The group string.
 */
export declare function getDayGroup(date: Date | number | string): string;
/**
 * Returns an intelligent group for a date based on its age.
 * - Today (0 days ago) -> "Today"
 * - Yesterday (1 day ago) -> "Yesterday"
 * - 2-3 days ago -> Day Name (e.g. "Sunday")
 * - 4-7 days ago -> "This Week"
 * - 8-14 days ago -> "Last Week"
 * - 15 days ago to start of current year -> Month Name (e.g. "May")
 * - Previous year -> Year (e.g. "2025")
 * - Older than previous year -> null (disabled)
 */
export declare function getIntelligentGroup(date: Date | number | string): string | null;
