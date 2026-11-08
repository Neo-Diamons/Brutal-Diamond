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

<Story name="Disabled" args={{ disabled: true, value: 'Locked' }} />

<Story name="Required" args={{ required: true }} />
