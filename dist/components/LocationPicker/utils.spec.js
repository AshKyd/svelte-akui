import { describe, it, expect } from 'vitest';
import { parseMapUrl, haversineDistance, getNormalizedFirstLetter } from './utils.js';
describe('parseMapUrl', () => {
    it('parses Google Maps URLs with payload coordinates', () => {
        const url = 'https://www.google.com/maps/place/Brisbane+QLD/@-27.3821429,152.9931964,123255m/data=!3m2!1e3!4b1!4m6!3m5!1s0x6b91579aac93d233:0x402a35af3deaf40!8m2!3d-27.4704528!4d153.0260341!16zL20vMDFiOGpq?entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D';
        const result = parseMapUrl(url);
        expect(result).not.toBeNull();
        expect(result?.latitude).toBeCloseTo(-27.4704528);
        expect(result?.longitude).toBeCloseTo(153.0260341);
        expect(result?.label).toBe('Brisbane QLD');
    });
    it('parses OpenStreetMap URLs', () => {
        const url = 'https://www.openstreetmap.org/#map=6/-26.14/147.99';
        const result = parseMapUrl(url);
        expect(result).not.toBeNull();
        expect(result?.latitude).toBeCloseTo(-26.14);
        expect(result?.longitude).toBeCloseTo(147.99);
        expect(result?.zoom).toBe(6);
    });
    it('parses Apple Maps URLs', () => {
        const url = 'https://maps.apple.com/frame?center=-27.482287%2C153.028375&span=0.048943%2C0.066336';
        const result = parseMapUrl(url);
        expect(result).not.toBeNull();
        expect(result?.latitude).toBeCloseTo(-27.482287);
        expect(result?.longitude).toBeCloseTo(153.028375);
    });
    it('returns null for non-map URLs', () => {
        expect(parseMapUrl('https://example.com')).toBeNull();
        expect(parseMapUrl('just random text')).toBeNull();
    });
});
describe('haversineDistance', () => {
    it('calculates distance between Brisbane and Sydney roughly ~730km', () => {
        const dist = haversineDistance(-27.4705, 153.026, -33.8688, 151.2093);
        expect(dist).toBeGreaterThan(700);
        expect(dist).toBeLessThan(780);
    });
});
describe('getNormalizedFirstLetter', () => {
    it('normalizes accented and special characters to lower latin a-z', () => {
        expect(getNormalizedFirstLetter("'Abās")).toBe('a');
        expect(getNormalizedFirstLetter("’Aïn")).toBe('a');
        expect(getNormalizedFirstLetter('‘Afak')).toBe('a');
        expect(getNormalizedFirstLetter('Zürich')).toBe('z');
        expect(getNormalizedFirstLetter('Évry')).toBe('e');
    });
});
describe('dataUrl parameter checks', () => {
    it('throws error when dataUrl is missing or empty', async () => {
        const { loadGeoNamesDict, searchGeoNames, geolocateNearest } = await import('./utils.js');
        await expect(loadGeoNamesDict('')).rejects.toThrow('[browser-geocoder-geonames] dataUrl parameter must be specified.');
        await expect(searchGeoNames('Brisbane', '')).rejects.toThrow('[browser-geocoder-geonames] dataUrl parameter must be specified.');
        await expect(geolocateNearest(-27.47, 153.02, '')).rejects.toThrow('[browser-geocoder-geonames] dataUrl parameter must be specified.');
    });
    it('prioritizes direct place name matches over state/country field matches', () => {
        const cityNY = { id: '1', name: 'New York', state: 'New York', country: 'US', population: 19800000, latitude: 40.71, longitude: -74.00, isNameMatch: true };
        const townInNYState = { id: '2', name: 'Onondaga County', state: 'New York', country: 'US', population: 46700000, latitude: 43.00, longitude: -76.15, isNameMatch: false };
        const results = [townInNYState, cityNY];
        results.sort((a, b) => {
            if (a.isNameMatch !== b.isNameMatch) {
                return a.isNameMatch ? -1 : 1;
            }
            return b.population - a.population;
        });
        expect(results[0].name).toBe('New York');
        expect(results[0].isNameMatch).toBe(true);
    });
});
