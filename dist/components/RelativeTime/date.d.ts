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
