<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Panel from './Panel.svelte';

  const { Story } = defineMeta({
    title: 'Components/Panel',
    component: Panel,
    tags: ['autodocs'],
    argTypes: {
      colour: {
        control: { type: 'select' },
        options: ['regular', 'secondary', 'accent'],
      },
    },
    args: {
      colour: 'regular',
    }
  });
</script>

<Story name="Regular" args={{ colour: 'regular' }}>
  <div style="padding: 1rem">This is a regular panel.</div>
</Story>

<Story name="Secondary" args={{ colour: 'secondary' }}>
  <div style="padding: 1rem">This is a secondary panel.</div>
</Story>

<Story name="Accent" args={{ colour: 'accent' }}>
  <div style="padding: 1rem">This is an accent panel.</div>
</Story>
