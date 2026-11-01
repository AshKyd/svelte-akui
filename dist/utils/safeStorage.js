/**
 * The usable browser storage, or `null` when there isn't one. Node 25+ defines a global
 * `localStorage` during SSR, but without `getItem` etc. unless `--localstorage-file` is set, so a
 * `typeof` check alone isn't enough. Merely reading the global can also throw (blocked site data,
 * sandboxed iframes).
 */
function resolveStorage(kind) {
    try {
        const storage = globalThis[kind];
        return typeof storage?.getItem === 'function' ? storage : null;
    }
    catch {
        return null;
    }
}
/**
 * Browser storage that never throws. Reads return `null` and writes do nothing when storage is
 * missing (SSR), blocked, or full (older Safari private mode throws on `setItem`). A saved
 * preference isn't worth breaking the app over; the choice still applies for the session.
 * Storage is looked up on every call, so it is safe to create at module level.
 */
export function createSafeStorage(kind) {
    return {
        getItem(key) {
            try {
                return resolveStorage(kind)?.getItem(key) ?? null;
            }
            catch {
                return null;
            }
        },
        setItem(key, value) {
            try {
                resolveStorage(kind)?.setItem(key, value);
            }
            catch {
                // Best-effort persistence.
            }
        },
        removeItem(key) {
            try {
                resolveStorage(kind)?.removeItem(key);
            }
            catch {
                // Best-effort persistence.
            }
        }
    };
}
export const safeLocalStorage = createSafeStorage('localStorage');
