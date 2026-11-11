<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';

	import Badge from './Badge.svelte';

	const { Story } = defineMeta({
		title: 'Primitives/Badge',
		component: Badge,
		argTypes: {
			variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'destructive'] }
		}
	});
</script>

<Story
	name="Primary"
	play={async ({ canvasElement }) => {
		await expect(within(canvasElement).getByText('Badge')).toBeVisible();
	}}
>
	{#snippet template()}
		<Badge variant="primary">Badge</Badge>
	{/snippet}
</Story>

<Story
	name="Secondary"
	play={async ({ canvasElement }) => {
		await expect(within(canvasElement).getByText('Badge')).toBeVisible();
	}}
>
	{#snippet template()}
		<Badge variant="secondary">Badge</Badge>
	{/snippet}
</Story>

<Story
	name="Outline"
	play={async ({ canvasElement }) => {
		await expect(within(canvasElement).getByText('Badge')).toBeVisible();
	}}
>
	{#snippet template()}
		<Badge variant="outline">Badge</Badge>
	{/snippet}
</Story>

<Story
	name="Destructive"
	play={async ({ canvasElement }) => {
		await expect(within(canvasElement).getByText('Badge')).toBeVisible();
	}}
>
	{#snippet template()}
		<Badge variant="destructive">Badge</Badge>
	{/snippet}
</Story>

<Story
	name="Custom fill"
	play={async ({ canvasElement }) => {
		await expect(within(canvasElement).getByText('Badge')).toBeVisible();
	}}
>
	{#snippet template()}
		<Badge fill="#22c55e">Badge</Badge>
	{/snippet}
</Story>
