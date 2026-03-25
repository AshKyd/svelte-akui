import type { Preview } from '@storybook/sveltekit'
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
    () => StorybookDecorator,
  ],
};

export default preview;