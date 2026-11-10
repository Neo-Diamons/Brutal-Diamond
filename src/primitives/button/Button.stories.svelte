<script module lang="ts">
	import { createRawSnippet } from 'svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';

	import ListIcon from 'phosphor-svelte/lib/ListIcon';

	import Button from './Button.svelte';

	const label = (text: string) =>
		createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

	const { Story } = defineMeta({
		title: 'Primitives/Button',
		component: Button,
		argTypes: {
			variant: {
				control: 'select',
				options: ['primary', 'secondary', 'outline', 'destructive']
			},
			children: { control: false }
		},
		args: { children: label('Click me'), onclick: fn() }
	});
</script>

<Story
	name="Primary"
	play={async ({ args, canvasElement }) => {
		await userEvent.click(within(canvasElement).getByRole('button', { name: 'Click me' }));
		await expect(args.onclick).toHaveBeenCalledOnce();
	}}
/>

<Story name="Secondary" args={{ variant: 'secondary' }} />

<Story name="Outline" args={{ variant: 'outline' }} />

<Story name="Destructive" args={{ variant: 'destructive' }} />

{#snippet menuIcon()}<ListIcon size={24} weight="bold" aria-hidden="true" />{/snippet}
<Story
	name="Icon"
	args={{ icon: true, children: menuIcon, 'aria-label': 'Menu' }}
	play={async ({ args, canvasElement }) => {
		await userEvent.click(within(canvasElement).getByRole('button', { name: 'Menu' }));
		await expect(args.onclick).toHaveBeenCalledOnce();
	}}
/>

{#snippet labelWithIcon()}<ListIcon weight="bold" aria-hidden="true" />Menu{/snippet}
<Story name="With icon" args={{ children: labelWithIcon }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="As link" args={{ href: '#' }} />

<Story name="Pressed" args={{ 'aria-pressed': true }} />

<Story name="Current page" args={{ href: '#', 'aria-current': 'page' }} />
