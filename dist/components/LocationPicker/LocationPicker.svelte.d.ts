import { type GeoNameResult, type NearestLocationResult } from 'browser-geocoder-geonames';
interface Props {
    /** Longitude coordinate (-180 to 180) */
    longitude?: number;
    /** Latitude coordinate (-90 to 90) */
    latitude?: number;
    /** Location name */
    name?: string;
    /** Configurable URL or path to the geonames dataset */
    dataUrl?: string;
    /** Readonly state - disables marker dragging, map click placement, and search box */
    readonly?: boolean;
    /** Override map style URL (defaults to OpenFreeMap styles via env vars / theme context) */
    mapStyle?: string;
    /** Optional callback to trigger device HTML5 geolocation */
    ongeolocate?: () => void;
    /** Optional callback to clear/remove location */
    onclear?: () => void;
    /** Custom search function implementation */
    searchFn?: (keyword: string, onProgress?: (results: GeoNameResult[]) => void, signal?: AbortSignal) => Promise<GeoNameResult[]>;
    /** Custom reverse geolocation function implementation */
    geolocateFn?: (lat: number, lon: number, maxDistanceKm?: number, onProgress?: (result: NearestLocationResult | null) => void, signal?: AbortSignal) => Promise<NearestLocationResult | null>;
    /** Class name override */
    class?: string;
}
declare const LocationPicker: import("svelte").Component<Props, {}, "name" | "longitude" | "latitude">;
type LocationPicker = ReturnType<typeof LocationPicker>;
export default LocationPicker;
