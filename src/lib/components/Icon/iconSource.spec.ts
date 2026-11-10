import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BOOTSTRAP_ICONS_VERSION, configureIcons, loadIconNames, loadIconSvg } from './iconSource';

const CDN = `https://cdn.jsdelivr.net/npm/bootstrap-icons@${BOOTSTRAP_ICONS_VERSION}`;

/** Answers each URL in `responses` with its text, and every other URL with a 404. */
const stubFetch = (responses: Record<string, string>) => {
	const fetchMock = vi.fn(async (url: string) =>
		url in responses
			? new Response(responses[url])
			: new Response('missing', { status: 404 })
	);
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
};

describe('iconSource', () => {
	beforeEach(() => {
		configureIcons({ baseUrl: '/bootstrap-icons/' });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('loads an icon from the configured folder', async () => {
		const fetchMock = stubFetch({ '/bootstrap-icons/trash.svg': '<svg>trash</svg>' });
		expect(await loadIconSvg('trash')).toBe('<svg>trash</svg>');
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('fetches each icon once, however many times it is asked for', async () => {
		const fetchMock = stubFetch({ '/bootstrap-icons/gear.svg': '<svg>gear</svg>' });
		await Promise.all([loadIconSvg('gear'), loadIconSvg('gear')]);
		await loadIconSvg('gear');
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('falls back to the CDN when the local copy is missing', async () => {
		stubFetch({ [`${CDN}/icons/star.svg`]: '<svg>star</svg>' });
		expect(await loadIconSvg('star')).toBe('<svg>star</svg>');
	});

	it('rejects when neither the folder nor the CDN has the icon, and retries later', async () => {
		const fetchMock = stubFetch({});
		await expect(loadIconSvg('nope')).rejects.toThrow();
		await expect(loadIconSvg('nope')).rejects.toThrow();
		// Two attempts, each trying the folder then the CDN: failures are not cached.
		expect(fetchMock).toHaveBeenCalledTimes(4);
	});

	it('refuses names that are not plain icon names', async () => {
		const fetchMock = stubFetch({});
		await expect(loadIconSvg('../secret')).rejects.toThrow('Invalid icon name');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('reads the icon names from index.json', async () => {
		stubFetch({ '/bootstrap-icons/index.json': JSON.stringify(['b', 'a']) });
		expect(await loadIconNames()).toEqual(['a', 'b']);
	});

	it('reads the icon names from the CDN code point map when index.json is missing', async () => {
		stubFetch({ [`${CDN}/font/bootstrap-icons.json`]: JSON.stringify({ trash: 1, star: 2 }) });
		expect(await loadIconNames()).toEqual(['star', 'trash']);
	});

	it('goes straight to the CDN when no folder is configured', async () => {
		configureIcons({});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const fetchMock = stubFetch({ [`${CDN}/icons/trash.svg`]: '<svg>cdn</svg>' });
		expect(await loadIconSvg('trash')).toBe('<svg>cdn</svg>');
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
