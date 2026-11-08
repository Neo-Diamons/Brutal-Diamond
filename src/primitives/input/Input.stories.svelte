<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';

	import Input from './Input.svelte';

	const { Story } = defineMeta({
		title: 'Primitives/Input',
		component: Input,
		args: { id: 'url', label: 'Target URL', placeholder: 'https://svelte.dev' }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const input = within(canvasElement).getByLabelText('Target URL');
		await userEvent.type(input, 'https://svelte.dev');
		await expect(input).toHaveValue('https://svelte.dev');
	}}
/>

<Story
	name="Without label"
	args={{ label: undefined, 'aria-label': 'Target URL' }}
	play={async ({ canvasElement }) => {
		const input = within(canvasElement).getByPlaceholderText('https://svelte.dev');
		await userEvent.type(input, 'https://svelte.dev');
		await expect(input).toHaveValue('https://svelte.dev');
	}}
/>

<Story name="Required" args={{ required: true }} />

<Story name="Disabled" args={{ disabled: true, value: 'Locked' }} />
