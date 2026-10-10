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

{#snippet translucentTemplate(args)}
  <div style="padding: 2rem; background: linear-gradient(135deg, #f6a6c1, #8ec5fc 50%, #c3a6f6);">
    <Panel {...args}>
      <div style="padding: 1rem">This panel lets the gradient show through.</div>
    </Panel>
  </div>
{/snippet}

<Story
  name="Translucent over Background"
  template={translucentTemplate}
  args={{
    surface: {
      background: 'color-mix(in srgb, var(--akui-bg) 60%, transparent)',
      borderColour: 'rgba(var(--akui-fg-rgb), 0.12)'
    }
  }}
/>
