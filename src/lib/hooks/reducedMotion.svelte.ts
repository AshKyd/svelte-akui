const STORAGE_KEY = 'akui-reduced-motion';

/**
 * Tracks reduced-motion preferences. Uses the system setting by default,
 * but allows a user override saved in localStorage.
 */
class ReducedMotionState {
	/** Live OS-level `prefers-reduced-motion` value. */
	systemPrefers = $state(false);
	/** Explicit user choice, or `null` to follow the system setting. */
	override = $state<boolean | null>(null);

	/** The effective preference: the override if one is set, otherwise the system setting. */
	value = $derived(this.override ?? this.systemPrefers);
	/** True while an explicit override is stored, overriding the system setting. */
	isOverridden = $derived(this.override !== null);

	constructor() {
		if (typeof window === 'undefined') return;

		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) this.override = stored === 'true';

		const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		this.systemPrefers = mql.matches;
		mql.addEventListener('change', (e) => {
			this.systemPrefers = e.matches;
		});
	}

	/** Sets an explicit preference, clearing the stored override when it matches the system setting. */
	set(next: boolean): void {
		if (next === this.systemPrefers) {
			this.override = null;
			localStorage.removeItem(STORAGE_KEY);
			return;
		}
		this.override = next;
		localStorage.setItem(STORAGE_KEY, String(next));
	}

	/** Toggles the effective preference. */
	toggle(): void {
		this.set(!this.value);
	}
}

export const reducedMotion = new ReducedMotionState();
