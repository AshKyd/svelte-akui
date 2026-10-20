import fs from 'node:fs';
import path from 'node:path';
import type { StorybookConfig } from '@storybook/sveltekit';
import type { Plugin } from 'vite';

const ICON_GLOB_PREFIX = '/node_modules/bootstrap-icons/icons/';

/**
 * Icon.svelte globs `/node_modules/bootstrap-icons/icons/*.svg` from the Vite root. Here the root
 * is this package, but npm hoists bootstrap-icons to the workspace root, so the glob matches
 * nothing and every icon falls back. This rewrites that prefix to a path relative to Icon.svelte,
 * for this Storybook only, so neither the library nor the app's Vite config has to change.
 */
function resolveBootstrapIcons(): Plugin {
	const iconComponentDir = path.resolve(import.meta.dirname, '../src/lib/components/Icon');
	const iconsDir = ['../node_modules', '../../../node_modules']
		.map((dir) => path.resolve(import.meta.dirname, dir, 'bootstrap-icons/icons'))
		.find((dir) => fs.existsSync(dir));

	return {
		name: 'akui-storybook-bootstrap-icons',
		enforce: 'pre',
		transform(code, id) {
			if (!iconsDir || !id.split('?')[0].endsWith('/Icon/Icon.svelte')) return;
			const relativeIconsDir = path.relative(iconComponentDir, iconsDir).split(path.sep).join('/');
			return code.replaceAll(ICON_GLOB_PREFIX, `${relativeIconsDir}/`);
		}
	};
}

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|ts|svelte)"
  ],
  "staticDirs": ["../static"],
  "addons": [
    "@storybook/addon-svelte-csf",
    "@storybook/addon-themes"
  ],
  "framework": "@storybook/sveltekit",
  "core": {
    "disableTelemetry": true,
    "disableWhatsNewNotifications": true
  },
  "features": {
    "sidebarOnboardingChecklist": false
  },
  async viteFinal(config) {
    return {
      ...config,
      plugins: [...(config.plugins ?? []), resolveBootstrapIcons()],
      build: {
        ...config.build,
        reportCompressedSize: false,
      },
    };
  },
};
export default config;