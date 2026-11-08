<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';

	import Textarea from './Textarea.svelte';

	const { Story } = defineMeta({
		title: 'Primitives/Textarea',
		component: Textarea,
		args: { label: 'Targets', rows: 5, placeholder: 'One URL per line' }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const area = within(canvasElement).getByPlaceholderText('One URL per line');
		await userEvent.type(area, 'a{enter}b');
		await expect(area).toHaveValue('a\nb');
	}}
/>

<Story
	name="Without label"
	args={{ label: undefined, 'aria-label': 'Targets' }}
	play={async ({ canvasElement }) => {
		const area = within(canvasElement).getByPlaceholderText('One URL per line');
		await userEvent.type(area, 'a{enter}b');
		await expect(area).toHaveValue('a\nb');
	}}
/>

<Story
	name="Required"
	args={{ required: true }}
	play={async ({ canvasElement }) => {
		await expect(within(canvasElement).getByLabelText(/Targets/)).toBeRequired();
	}}
/>

<Story name="Disabled" args={{ disabled: true }} />
