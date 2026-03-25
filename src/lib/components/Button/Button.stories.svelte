<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';
  import { fn } from 'storybook/test';

  const { Story } = defineMeta({
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: { type: 'select' },
        options: ['regular', 'accent'],
      },
      size: {
        control: { type: 'select' },
        options: ['small', 'medium', 'large'],
      },
    },
    args: {
      onclick: fn(),
      label: 'Button',
    }
  });
</script>

<Story name="Regular" args={{ variant: 'regular', label: 'Regular Button' }} />

<Story name="Accent" args={{ variant: 'accent', label: 'Accent Button' }} />

<Story name="Small" args={{ size: 'small', label: 'Small Button' }} />

<Story name="Large" args={{ size: 'large', label: 'Large Button' }} />
<Story name="With Icon Left" args={{ name: 'Add Item', icon: 'plus-lg', variant: 'accent' }} />

<Story name="With Icon Right" args={{ name: 'Next', icon: 'arrow-right', iconPosition: 'right' }} />

<Story name="Icon Only" args={{ label: 'Delete', icon: 'trash', iconPosition: 'only', variant: 'regular' }} />

<Story name="Small Icon Only" args={{ label: 'Settings', icon: 'gear', iconPosition: 'only', size: 'small' }} />
