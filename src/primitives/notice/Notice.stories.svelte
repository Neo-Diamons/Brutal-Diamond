<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';

	import Notice from './Notice.svelte';

	const { Story } = defineMeta({ title: 'Primitives/Notice', component: Notice });
</script>

<Story
	name="Info"
	play={async ({ canvasElement }) => {
		await expect(within(canvasElement).getByRole('status')).toBeVisible();
	}}
>
	{#snippet template()}
		<div style="width: 20rem"><Notice>No domains indexed.</Notice></div>
	{/snippet}
</Story>

<Story
	name="Error"
	play={async ({ canvasElement }) => {
		await expect(within(canvasElement).getByRole('alert')).toBeVisible();
	}}
>
	{#snippet template()}
		<div style="width: 20rem"><Notice variant="error">Failed to load sites</Notice></div>
	{/snippet}
</Story>
