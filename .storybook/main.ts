import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|ts|svelte)"
  ],
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
      build: {
        ...config.build,
        reportCompressedSize: false,
      },
    };
  },
};
export default config;