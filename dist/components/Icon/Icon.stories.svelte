<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Icon from './Icon.svelte';

  const { Story } = defineMeta({
    title: 'Components/Icon',
    component: Icon,
    tags: ['autodocs'],
    argTypes: {
      name: {
        control: { type: 'text' },
        description: 'The name of the Bootstrap Icon'
      },
      size: {
        control: { type: 'text' },
        description: 'Size of the icon'
      },
      colour: {
        control: { type: 'color' },
        description: 'Colour of the icon'
      },
      alt: {
        control: { type: 'text' },
        description: 'Accessible label'
      }
    },
    args: {
      name: 'trash',
      size: '2rem',
    }
  });
</script>

<Story name="Trash Icon" args={{ name: 'trash' }} />

<Story name="Search Icon" args={{ name: 'search', colour: '#0ea5e9' }} />

<Story name="Custom Size" args={{ name: 'gear', size: '4rem' }} />

<Story name="With Alt Text" args={{ name: 'check-circle-fill', alt: 'Success', colour: 'green' }} />
