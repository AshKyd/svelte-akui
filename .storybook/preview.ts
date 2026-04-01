import type { Preview } from '@storybook/sveltekit'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import StorybookDecorator from '../src/lib/components/StorybookDecorator.svelte'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    (Story, { globals }) => {
      return {
        Component: StorybookDecorator,
        props: {
          mode: globals.theme as 'light' | 'dark',
        },
      }
    },
  ],
};

export default preview;