/**
 * Formats a date relative to the current time (e.g. "just now", "5 minutes ago", "3 hours ago", "2 days ago").
 * If the relative difference is greater than or equal to the threshold in days, it falls back
 * to a short date formatted according to the user's native browser locale settings.
 *
 * @param date - The date to format (can be a Date object, timestamp, or string).
 * @param thresholdDays - The threshold in days before falling back to a short date format (default: 7).
 * @returns The formatted relative time string or short date.
 */
export function formatRelativeTime(
	date: Date | number | string,
	thresholdDays: number = 7
): string {
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

/**
 * Returns a human-friendly day group for a date.
 * Groups are: "Today", "Yesterday", the day name (e.g. "Sunday", going back up to 3 days),
 * or the formatted date (e.g. "May 30th" or "December 15th, 2025").
 *
 * @param date - The date to group (can be a Date object, timestamp, or string).
 * @returns The group string.
 */
export function getDayGroup(date: Date | number | string): string {
	const d = new Date(date);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const target = new Date(d);
	target.setHours(0, 0, 0, 0);

	const diffMs = today.getTime() - target.getTime();
	const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return 'Today';
	}
	if (diffDays === 1) {
		return 'Yesterday';
	}
	if (diffDays === 2 || diffDays === 3) {
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		return dayNames[d.getDay()];
	}

	const getOrdinal = (n: number) => {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	};

	const months = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const monthStr = months[d.getMonth()];
	const dayStr = getOrdinal(d.getDate());

	if (d.getFullYear() === today.getFullYear()) {
		return `${monthStr} ${dayStr}`;
	}

	return `${monthStr} ${dayStr}, ${d.getFullYear()}`;
}

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
export function getIntelligentGroup(date: Date | number | string): string | null {
	const d = new Date(date);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const target = new Date(d);
	target.setHours(0, 0, 0, 0);

	const diffMs = today.getTime() - target.getTime();
	const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return 'Future';
	}
	if (diffDays === 0) {
		return 'Today';
	}
	if (diffDays === 1) {
		return 'Yesterday';
	}
	if (diffDays === 2 || diffDays === 3) {
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		return dayNames[d.getDay()];
	}
	if (diffDays >= 4 && diffDays <= 7) {
		return 'This Week';
	}
	if (diffDays >= 8 && diffDays <= 14) {
		return 'Last Week';
	}

	const currentYear = today.getFullYear();
	const targetYear = d.getFullYear();

	if (targetYear === currentYear) {
		const months = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];
		return months[d.getMonth()];
	}

	if (targetYear === currentYear - 1) {
		return String(targetYear);
	}

	return null;
}
