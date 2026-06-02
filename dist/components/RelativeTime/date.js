/**
 * Formats a date relative to the current time (e.g. "just now", "5 minutes ago", "3 hours ago", "2 days ago").
 * If the relative difference is greater than or equal to the threshold in days, it falls back
 * to a short date formatted according to the user's native browser locale settings.
 *
 * @param date - The date to format (can be a Date object, timestamp, or string).
 * @param thresholdDays - The threshold in days before falling back to a short date format (default: 7).
 * @returns The formatted relative time string or short date.
 */
export function formatRelativeTime(date, thresholdDays = 7) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    // If the date is in the future, return a native short date format
    if (diffMs < 0) {
        return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    }
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    // Fallback to native browser locale short date after threshold
    if (diffDays >= thresholdDays) {
        return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    }
    if (diffSeconds < 60) {
        return 'just now';
    }
    if (diffMinutes < 60) {
        return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }
    if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
}
