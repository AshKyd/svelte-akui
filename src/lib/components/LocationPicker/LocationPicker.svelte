<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import ControlGroup from '../ControlGroup/ControlGroup.svelte';
	import ControlItemText from '../ControlGroup/ControlItemText/ControlItemText.svelte';
	import ControlItemExpanded from '../ControlGroup/ControlItemExpanded/ControlItemExpanded.svelte';
	import ClearableInput from '../Input/Text/ClearableInput.svelte';
	import Loader from '../Loader/Loader.svelte';
	import Button from '../Button/Button.svelte';
	import geonamesUrl from 'browser-geocoder-geonames/geonames.txt?url';
	import {
		searchGeoNames as defaultSearchGeoNames,
		geolocateNearest as defaultGeolocateNearest,
		prefetchGeoNamesDataset,
		DEFAULT_MAX_GEOLOCATE_DISTANCE_KM,
		parseMapUrl,
		type GeoNameResult,
		type NearestLocationResult
	} from 'browser-geocoder-geonames';
	import Small from '../Small/Small.svelte';

	const MAPLIBRE_CSS_URL = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
	const MAPLIBRE_JS_URL = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
	const CONTENT_AREA_HEIGHT_PX = 260;

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
		searchFn?: (
			keyword: string,
			onProgress?: (results: GeoNameResult[]) => void,
			signal?: AbortSignal
		) => Promise<GeoNameResult[]>;
		/** Custom reverse geolocation function implementation */
		geolocateFn?: (
			lat: number,
			lon: number,
			maxDistanceKm?: number,
			onProgress?: (result: NearestLocationResult | null) => void,
			signal?: AbortSignal
		) => Promise<NearestLocationResult | null>;
		/** Class name override */
		class?: string;
	}

	let {
		longitude = $bindable(151.2093),
		latitude = $bindable(-33.8688),
		name = $bindable(''),
		dataUrl = geonamesUrl,
		readonly = false,
		mapStyle,
		ongeolocate,
		onclear,
		searchFn = (kw, cb, sig) =>
			defaultSearchGeoNames({ keyword: kw, dataUrl, onProgress: cb, signal: sig }),
		geolocateFn = (lat, lon, maxDist, cb, sig) =>
			defaultGeolocateNearest({
				latitude: lat,
				longitude: lon,
				dataUrl,
				maxDistanceKm: maxDist,
				onProgress: cb,
				signal: sig
			}),
		class: className = ''
	}: Props = $props();

	// Theme context handling
	const themeContext = getContext<{ readonly current: 'light' | 'dark' }>('akui-theme');
	const currentTheme = $derived(themeContext?.current || 'light');

	// Determine active map style using props, env vars, or default OpenFreeMap positron/dark
	const activeMapStyle = $derived.by(() => {
		if (mapStyle) return mapStyle;

		const envLight =
			typeof import.meta !== 'undefined' && import.meta.env
				? import.meta.env.PUBLIC_MAP_STYLE_LIGHT
				: undefined;
		const envDark =
			typeof import.meta !== 'undefined' && import.meta.env
				? import.meta.env.PUBLIC_MAP_STYLE_DARK
				: undefined;

		if (currentTheme === 'dark') {
			return envDark || 'https://tiles.openfreemap.org/styles/dark';
		}
		return envLight || 'https://tiles.openfreemap.org/styles/positron';
	});

	let mapContainer = $state<HTMLDivElement>();
	let map = $state<any>();
	let marker = $state<any>();

	// Search state
	let searchQuery = $state('');
	let isSearching = $state(false);
	let searchResults = $state<GeoNameResult[]>([]);
	let isSearchingActive = $state(false);
	let activeSearchController: AbortController | null = null;

	// Pan vs Click detection variables
	let isMouseDown = false;
	let startMousePos = { x: 0, y: 0 };
	let isMapMoved = false;

	/**
	 * Dynamically loads MapLibre CSS and JS bundles from CDN.
	 */
	function loadMapLibreCDN(): Promise<any> {
		if (typeof window === 'undefined') return Promise.reject();

		if (window.maplibregl) {
			return Promise.resolve(window.maplibregl);
		}

		if (!document.querySelector(`link[href="${MAPLIBRE_CSS_URL}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = MAPLIBRE_CSS_URL;
			document.head.appendChild(link);
		}

		let script = document.querySelector(`script[src="${MAPLIBRE_JS_URL}"]`) as HTMLScriptElement;
		if (!script) {
			script = document.createElement('script');
			script.src = MAPLIBRE_JS_URL;
			script.async = true;
			document.head.appendChild(script);
		}

		return new Promise((resolve, reject) => {
			if (window.maplibregl) {
				resolve(window.maplibregl);
				return;
			}
			script.addEventListener('load', () => resolve(window.maplibregl));
			script.addEventListener('error', (err) => reject(err));
		});
	}

	// Reverse geolocation handler
	async function triggerReverseGeolocate(lat: number, lon: number) {
		try {
			const res = await geolocateFn(lat, lon, DEFAULT_MAX_GEOLOCATE_DISTANCE_KM);
			if (res) {
				name = res.name;
			}
		} catch (err) {
			console.error('Reverse geolocation error:', err);
		}
	}

	// Reverse geolocate if location name is missing on initial setup or coordinate updates
	$effect(() => {
		if (!name && latitude !== undefined && longitude !== undefined) {
			triggerReverseGeolocate(latitude, longitude);
		}
	});

	// Initialize MapLibre GL map when container element is bound
	$effect(() => {
		if (!mapContainer) return;
		let isDestroyed = false;

		loadMapLibreCDN()
			.then((maplibregl) => {
				if (isDestroyed || !mapContainer) return;

				const instance = new maplibregl.Map({
					container: mapContainer,
					style: activeMapStyle,
					center: [longitude, latitude],
					zoom: 11,
					attributionControl: false
				});

				const nav = new maplibregl.NavigationControl({ showCompass: false });
				instance.addControl(nav, 'top-right');

				// Resolve primary AKUI accent colour for pin (or computed CSS var)
				const pinColor = currentTheme === 'dark' ? '#3b82f6' : '#2563eb';

				const markerInstance = new maplibregl.Marker({
					draggable: !readonly,
					color: pinColor
				})
					.setLngLat([longitude, latitude])
					.addTo(instance);

				markerInstance.on('dragend', () => {
					if (readonly) return;
					const lngLat = markerInstance.getLngLat();
					longitude = Number(lngLat.lng.toFixed(6));
					latitude = Number(lngLat.lat.toFixed(6));
					name = '';
					triggerReverseGeolocate(latitude, longitude);
				});

				// Map click & pan guard
				const canvas = instance.getCanvas();
				canvas.addEventListener('mousedown', (e: MouseEvent) => {
					isMouseDown = true;
					startMousePos = { x: e.clientX, y: e.clientY };
					isMapMoved = false;
				});

				canvas.addEventListener('mousemove', (e: MouseEvent) => {
					if (!isMouseDown) return;
					const dx = Math.abs(e.clientX - startMousePos.x);
					const dy = Math.abs(e.clientY - startMousePos.y);
					if (dx > 5 || dy > 5) {
						isMapMoved = true;
					}
				});

				canvas.addEventListener('mouseup', () => {
					isMouseDown = false;
				});

				instance.on('click', (e: any) => {
					if (readonly || isMapMoved) return;
					longitude = Number(e.lngLat.lng.toFixed(6));
					latitude = Number(e.lngLat.lat.toFixed(6));
					name = '';
					markerInstance.setLngLat([longitude, latitude]);
					triggerReverseGeolocate(latitude, longitude);
				});

				map = instance;
				marker = markerInstance;
			})
			.catch((err) => {
				console.error('Failed to load MapLibre GL from CDN:', err);
			});

		return () => {
			isDestroyed = true;
			if (marker) marker.remove();
			if (map) map.remove();
			map = undefined;
			marker = undefined;
		};
	});

	// Reactively update map style when activeMapStyle changes
	$effect(() => {
		if (map && activeMapStyle) {
			map.setStyle(activeMapStyle);
		}
	});

	// Reactively update map center & marker position immediately without flyTo
	$effect(() => {
		if (map && marker) {
			const currentLngLat = marker.getLngLat();
			if (
				Math.abs(currentLngLat.lng - longitude) > 0.0001 ||
				Math.abs(currentLngLat.lat - latitude) > 0.0001
			) {
				marker.setLngLat([longitude, latitude]);
				map.setCenter([longitude, latitude]);
				map.setZoom(12);
			}
		}
	});

	// Reactively trigger search or map URL parsing on searchQuery updates
	$effect(() => {
		const query = searchQuery.trim();

		if (activeSearchController) {
			activeSearchController.abort();
			activeSearchController = null;
		}

		if (!query) {
			searchResults = [];
			isSearchingActive = false;
			isSearching = false;
			return;
		}

		// Check if input is a map URL
		const parsedUrl = parseMapUrl(query);
		if (parsedUrl) {
			longitude = parsedUrl.longitude;
			latitude = parsedUrl.latitude;
			name = parsedUrl.label || '';
			clearSearch();
			if (map && marker) {
				marker.setLngLat([longitude, latitude]);
				map.setCenter([longitude, latitude]);
				map.setZoom(parsedUrl.zoom || 12);
			}
			return;
		}

		isSearchingActive = true;
		isSearching = true;

		const controller = new AbortController();
		activeSearchController = controller;
		const signal = controller.signal;

		(async () => {
			try {
				const results = await searchFn(
					query,
					(progressResults) => {
						if (signal.aborted || searchQuery.trim() !== query) return;
						searchResults = progressResults
							.sort((a, b) => {
								if (a.isNameMatch !== b.isNameMatch) {
									return a.isNameMatch ? -1 : 1;
								}
								return b.population - a.population;
							})
							.slice(0, 5);
					},
					signal
				);
				if (!signal.aborted && searchQuery.trim() === query) {
					searchResults = results
						.sort((a, b) => {
							if (a.isNameMatch !== b.isNameMatch) {
								return a.isNameMatch ? -1 : 1;
							}
							return b.population - a.population;
						})
						.slice(0, 5);
					isSearching = false;
				}
			} catch (err: any) {
				if (!signal.aborted && err?.name !== 'AbortError') {
					console.error('GeoNames search error:', err);
					isSearching = false;
				}
			}
		})();
	});

	function clearSearch() {
		if (activeSearchController) {
			activeSearchController.abort();
			activeSearchController = null;
		}
		searchQuery = '';
		searchResults = [];
		isSearchingActive = false;
		isSearching = false;
	}

	function handleSelectResult(result: GeoNameResult) {
		longitude = result.longitude;
		latitude = result.latitude;
		name = result.name;
		clearSearch();
	}

	function autofocus(node: HTMLElement) {
		setTimeout(() => {
			const input = node.querySelector('input') || node;
			input.focus();
		}, 50);
	}

	function formatPopulation(pop: number): string {
		if (pop <= 0) return '';
		if (pop >= 1_000_000) {
			return `${(pop / 1_000_000).toFixed(1)}M`;
		}
		if (pop >= 1_000) {
			return `${Math.round(pop / 1_000)}k`;
		}
		return pop.toLocaleString();
	}

	function handleFocus() {
		if (dataUrl) {
			prefetchGeoNamesDataset(dataUrl);
		}
	}
</script>

<div class="akui-location-picker {className}">
	<ControlGroup border={false}>
		{#if !readonly}
			<ControlItemText icon="search" role="search">
				{#snippet children()}
					<div class="akui-location-picker-search-bar" use:autofocus>
						<ClearableInput
							variant="ghost"
							placeholder="Search location..."
							bind:value={searchQuery}
							onfocus={handleFocus}
							class="akui-location-picker-clearable"
						/>
						<div class="akui-location-picker-actions">
							{#if ongeolocate}
								<Button
									variant="ghost"
									small={true}
									icon="crosshair"
									iconPosition="only"
									onclick={(e) => {
										e.stopPropagation();
										ongeolocate();
									}}
									aria-label="Use current location"
								/>
							{/if}
							{#if onclear}
								<Button
									variant="ghost"
									small={true}
									icon="trash"
									iconPosition="only"
									onclick={(e) => {
										e.stopPropagation();
										onclear();
									}}
									aria-label="Remove location"
								/>
							{/if}
						</div>
					</div>
				{/snippet}
			</ControlItemText>
		{/if}

		<div
			class="akui-location-picker-content-area"
			style="--picker-content-height: {CONTENT_AREA_HEIGHT_PX}px;"
		>
			<div class="akui-location-picker-map-pane" class:hidden={isSearchingActive}>
				<ControlItemExpanded
					label={name || 'Selected Location'}
					description="{latitude.toFixed(4)}°, {longitude.toFixed(4)}°"
				>
					<div class="akui-location-picker-map-wrapper">
						<div bind:this={mapContainer} class="akui-location-picker-map"></div>
					</div>
					<div class="attr">
						<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">
							<Small colour="secondary">OpenFreeMap</Small>
						</a>
						<a
							href="https://www.openstreetmap.org/copyright"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Small colour="secondary">© OSM</Small>
						</a>
						<a href="https://www.geonames.org" target="_blank" rel="noopener noreferrer">
							<Small colour="secondary">GeoNames</Small>
						</a>
						<a
							href="https://creativecommons.org/licenses/by/4.0/"
							target="_blank"
							rel="noopener noreferrer"><Small colour="secondary">CC BY 4.0</Small></a
						>
					</div>
				</ControlItemExpanded>
			</div>

			{#if isSearchingActive}
				<div class="akui-location-picker-results-container">
					{#if isSearching && searchResults.length === 0}
						<ControlItemText>
							{#snippet children()}
								<div class="akui-location-picker-status-row">
									<Loader size="1rem" />
									<span>Searching locations...</span>
								</div>
							{/snippet}
						</ControlItemText>
					{:else if searchResults.length === 0}
						<ControlItemText label="No locations found." />
					{:else}
						{#each searchResults as item, index (item.id ? `${item.id}-${index}` : index)}
							<ControlItemExpanded
								label={item.name}
								description={[item.state, item.country].filter(Boolean).join(', ') || undefined}
								extra={formatPopulation(item.population)
									? `Pop: ${formatPopulation(item.population)}`
									: undefined}
								layout="horizontal"
								onclick={() => handleSelectResult(item)}
							/>
						{/each}
					{/if}
				</div>
			{/if}
		</div>
	</ControlGroup>
</div>

<style>
	.akui-location-picker {
		width: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.akui-location-picker-search-bar {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 0.25rem;
	}

	:global(.akui-location-picker-clearable) {
		flex: 1;
		min-width: 0;
	}

	.akui-location-picker-actions {
		display: flex;
		align-items: center;
		gap: 0.15rem;
		flex-shrink: 0;
	}

	.akui-location-picker-content-area {
		height: var(--picker-content-height, 250px);
		width: 100%;
		position: relative;
		overflow: hidden;
	}

	.akui-location-picker-map-pane {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.akui-location-picker-map-pane.hidden {
		display: none;
	}

	.akui-location-picker-map-pane :global(.akui-control-item-expanded-wrapper),
	.akui-location-picker-map-pane :global(.akui-control-item-expanded-content),
	.akui-location-picker-map-pane :global(.akui-control-item-expanded-inner),
	.akui-location-picker-map-pane :global(.akui-control-item-expanded-container),
	.akui-location-picker-map-pane :global(.akui-control-item-expanded-control) {
		height: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.akui-location-picker-results-container {
		height: var(--picker-content-height, 250px);
		width: 100%;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		position: absolute;
		inset: 0;
		background-color: var(--akui-bg, #ffffff);
		z-index: 10;
	}

	.akui-location-picker-status-row {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m, 0.75rem);
		color: var(--akui-fg-secondary, #6b7280);
		font-size: 0.9rem;
	}

	.akui-location-picker-map-wrapper {
		width: 100%;
		flex: 1;
		min-height: 0;
		border-radius: var(--akui-radius-s, 4px);
		overflow: hidden;
		margin-top: 0.25rem;
	}

	.akui-location-picker-map {
		width: 100%;
		height: 100%;
	}
	.attr a:not(:first-child):before {
		content: '/ ';
		font-size: 0.75rem;
		opacity: 0.2;
		text-decoration: none;
		color: white;
	}
</style>
