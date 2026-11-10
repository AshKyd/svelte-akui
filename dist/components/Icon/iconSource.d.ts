/**
 * Where `Icon` gets its SVGs from.
 *
 * Each app publishes the Bootstrap Icons into its own public folder (see `akui-publish-icons`) and
 * calls `configureIcons({ baseUrl })` once. Icons are then plain `fetch`es of `<baseUrl>/<name>.svg`,
 * so nothing depends on a bundler and each icon loads only when it is shown.
 *
 * If the local copy is missing or unreachable, the same icon is fetched from a CDN instead. The CDN
 * is a safety net, not the offline path: apps that cache their own files (a service worker) won't
 * cache the cross-origin request.
 */
/** Keep in step with the `bootstrap-icons` dependency, so the CDN serves the same drawings. */
export declare const BOOTSTRAP_ICONS_VERSION = "1.13.1";
export interface IconSourceOptions {
    /** Public URL of the folder holding the published icons, e.g. `/bootstrap-icons`. */
    baseUrl?: string;
    /** Root of a `bootstrap-icons` package on a CDN. Defaults to jsDelivr at the pinned version. */
    cdnUrl?: string;
}
/** Sets where icons are loaded from. Call once at startup, before the first `Icon` renders. */
export declare function configureIcons({ baseUrl: newBaseUrl, cdnUrl: newCdnUrl }: IconSourceOptions): void;
/**
 * Returns the SVG markup for a Bootstrap Icon name. Rejects if neither the local folder nor the
 * CDN has it.
 */
export declare function loadIconSvg(name: string): Promise<string>;
/**
 * Every Bootstrap Icon name, sorted. Reads the `index.json` that `akui-publish-icons` writes, or
 * the CDN's `font/bootstrap-icons.json` (a name → code point map) if that is missing.
 */
export declare function loadIconNames(): Promise<string[]>;
