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
export const BOOTSTRAP_ICONS_VERSION = "1.13.1";

const DEFAULT_CDN_URL = `https://cdn.jsdelivr.net/npm/bootstrap-icons@${BOOTSTRAP_ICONS_VERSION}`;

export interface IconSourceOptions {
  /** Public URL of the folder holding the published icons, e.g. `/bootstrap-icons`. */
  baseUrl?: string;
  /** Root of a `bootstrap-icons` package on a CDN. Defaults to jsDelivr at the pinned version. */
  cdnUrl?: string;
}

let baseUrl = "";
let cdnUrl = DEFAULT_CDN_URL;
let hasWarnedAboutMissingBaseUrl = false;

/** In-flight and finished loads, so each icon is fetched once however many `Icon`s show it. */
const svgRequests = new Map<string, Promise<string>>();
let iconNamesRequest: Promise<string[]> | undefined;

const trimTrailingSlashes = (url: string) => url.replace(/\/+$/, "");

/** Sets where icons are loaded from. Call once at startup, before the first `Icon` renders. */
export function configureIcons({
  baseUrl: newBaseUrl = "",
  cdnUrl: newCdnUrl = DEFAULT_CDN_URL,
}: IconSourceOptions) {
  baseUrl = trimTrailingSlashes(newBaseUrl);
  cdnUrl = trimTrailingSlashes(newCdnUrl);
  svgRequests.clear();
  iconNamesRequest = undefined;
}

/** Warns once, then leaves every icon to the CDN. */
function warnIfBaseUrlMissing() {
  if (baseUrl || hasWarnedAboutMissingBaseUrl) return;
  hasWarnedAboutMissingBaseUrl = true;
  console.warn(
    "[Akui] Icons are loading from the CDN. Run `akui-publish-icons <folder>` and call configureIcons({ baseUrl }) to serve them yourself.",
  );
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

/** Tries each URL in order and returns the first that loads. Rejects if all fail. */
const fetchFirstThatLoads = (urls: string[]): Promise<string> =>
  urls.reduce<Promise<string>>(
    (previous, url) => previous.catch(() => fetchText(url)),
    Promise.reject(new Error("No URLs")),
  );

/**
 * Returns the SVG markup for a Bootstrap Icon name. Rejects if neither the local folder nor the
 * CDN has it.
 */
export function loadIconSvg(name: string): Promise<string> {
  // Names go straight into a URL, so anything that isn't a plain icon name is refused.
  if (!/^[a-z0-9-]+$/.test(name))
    return Promise.reject(new Error(`Invalid icon name "${name}"`));

  const existing = svgRequests.get(name);
  if (existing) return existing;

  warnIfBaseUrlMissing();
  const urls = [
    ...(baseUrl ? [`${baseUrl}/${name}.svg`] : []),
    `${cdnUrl}/icons/${name}.svg`,
  ];
  const request = fetchFirstThatLoads(urls);
  svgRequests.set(name, request);
  // A failed load isn't kept, so a later attempt can retry.
  request.catch(() => svgRequests.delete(name));
  return request;
}

/**
 * Every Bootstrap Icon name, sorted. Reads the `index.json` that `akui-publish-icons` writes, or
 * the CDN's `font/bootstrap-icons.json` (a name → code point map) if that is missing.
 */
export function loadIconNames(): Promise<string[]> {
  if (iconNamesRequest) return iconNamesRequest;

  warnIfBaseUrlMissing();
  const urls = [
    ...(baseUrl ? [`${baseUrl}/index.json`] : []),
    `${cdnUrl}/font/bootstrap-icons.json`,
  ];
  const request = fetchFirstThatLoads(urls).then((text): string[] => {
    const parsed: unknown = JSON.parse(text);
    const names = Array.isArray(parsed)
      ? parsed
      : Object.keys(parsed as Record<string, unknown>);
    return names.map(String).sort();
  });
  iconNamesRequest = request;
  request.catch(() => (iconNamesRequest = undefined));
  return request;
}
