<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, waitFor, within } from 'storybook/test';

	import Button from '../button/Button.svelte';
	import Toast from './Toast.svelte';
	import Toaster from './Toaster.svelte';
	import { toaster } from './toaster.svelte';

	const { Story } = defineMeta({
		title: 'Primitives/Toast',
		component: Toast,
		argTypes: {
			variant: { control: 'select', options: ['info', 'error'] },
			duration: { control: 'number' }
		}
	});
</script>

<Story name="Default" args={{ duration: 4000 }}>
	{#snippet template(args)}
		<div class="frozen"><Toast {...args}>Changes saved</Toast></div>
	{/snippet}
</Story>

<Story name="Error" args={{ variant: 'error', duration: 4000 }}>
	{#snippet template(args)}
		<div class="frozen"><Toast {...args}>Failed to save</Toast></div>
	{/snippet}
</Story>

<Story
	name="Stack"
	parameters={{ layout: 'fullscreen' }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Info' }));
		await userEvent.click(canvas.getByRole('button', { name: 'Error' }));
		await waitFor(() => expect(canvas.getByRole('status')).toBeVisible());
		await waitFor(() => expect(canvas.getByRole('alert')).toBeVisible());
		await new Promise((resolve) => setTimeout(resolve, 500));
	}}
>
	{#snippet template()}
		<div style="display: flex; gap: 1rem; padding: 1rem">
			<Button onclick={() => toaster.push('Changes saved')}>Info</Button>
			<Button
				variant="destructive"
				onclick={() => toaster.push('Failed to save', { variant: 'error' })}
			>
				Error
			</Button>
		</div>
		<Toaster />
	{/snippet}
</Story>

<style>
	.frozen :global(.timer) {
		animation-play-state: paused;
	}
</style>
