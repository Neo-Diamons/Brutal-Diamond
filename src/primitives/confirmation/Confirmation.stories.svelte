<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';

	import Confirmation from './Confirmation.svelte';

	const { Story } = defineMeta({ title: 'Primitives/Confirmation', component: Confirmation });
	const onconfirm = fn();
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
		await expect(canvas.getByRole('dialog')).toBeVisible();
		await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }));
		await expect(onconfirm).toHaveBeenCalledOnce();
	}}
>
	{#snippet template()}
		<Confirmation itemName="Item" {onconfirm} />
	{/snippet}
</Story>

<Story name="Split">
	{#snippet template()}
		<Confirmation itemName="Item" split {onconfirm} />
	{/snippet}
</Story>
