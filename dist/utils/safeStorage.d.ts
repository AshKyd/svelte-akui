type StorageKind = 'localStorage' | 'sessionStorage';
/** The `Storage` methods the app uses; every one is safe to call anywhere. */
export type SafeStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
/**
 * Browser storage that never throws. Reads return `null` and writes do nothing when storage is
 * missing (SSR), blocked, or full (older Safari private mode throws on `setItem`). A saved
 * preference isn't worth breaking the app over; the choice still applies for the session.
 * Storage is looked up on every call, so it is safe to create at module level.
 */
export declare function createSafeStorage(kind: StorageKind): SafeStorage;
export declare const safeLocalStorage: SafeStorage;
export {};
