#!/usr/bin/env node
/**
 * Copies the Bootstrap Icons SVGs into a public folder, plus an `index.json` listing every name.
 * Run it from the consuming app: `akui-publish-icons static/bootstrap-icons`, then call
 * `configureIcons({ baseUrl: '/bootstrap-icons' })`. Git-ignore the output folder.
 */
import { createRequire } from 'node:module';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [outDirArgument] = process.argv.slice(2);
if (!outDirArgument) {
	console.error('Usage: akui-publish-icons <output folder>');
	process.exit(1);
}

const outDir = path.resolve(outDirArgument);
// Resolved through Node, so it works whether bootstrap-icons is hoisted, nested or linked.
const iconsDir = path.join(
	path.dirname(createRequire(import.meta.url).resolve('bootstrap-icons/package.json')),
	'icons'
);

/** Writes a file only when its content differs, so file times and watchers stay quiet. */
const writeIfChanged = async (filePath, content) => {
	const existing = await readFile(filePath, 'utf8').catch(() => null);
	if (existing !== content) await writeFile(filePath, content);
};

const fileNames = (await readdir(iconsDir)).filter((fileName) => fileName.endsWith('.svg')).sort();

await mkdir(outDir, { recursive: true });
await Promise.all([
	...fileNames.map(async (fileName) =>
		writeIfChanged(path.join(outDir, fileName), await readFile(path.join(iconsDir, fileName), 'utf8'))
	),
	writeIfChanged(
		path.join(outDir, 'index.json'),
		JSON.stringify(fileNames.map((fileName) => fileName.replace(/\.svg$/, '')))
	)
]);

console.log(`[akui-publish-icons] ${fileNames.length} icons → ${outDir}`);
