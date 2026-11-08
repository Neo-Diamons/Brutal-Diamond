<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';

	import Button from '../button/Button.svelte';
	import { Card, CardContent, CardHeader } from '../card';
	import H3 from '../typography/h3/H3.svelte';
	import P from '../typography/p/P.svelte';
	import Dialog from './Dialog.svelte';

	const { Story } = defineMeta({ title: 'Primitives/Dialog', component: Dialog });
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open dialog' }));
		await expect(within(canvasElement).getByRole('dialog')).toBeVisible();
	}}
>
	{#snippet template()}
		<Dialog labelledby="dialog-greeting">
			{#snippet trigger({ open })}
				<Button onclick={open}>Open dialog</Button>
			{/snippet}
			<Card>
				<CardHeader><H3 id="dialog-greeting">Hello</H3></CardHeader>
				<CardContent><P>Press Escape or click the backdrop to dismiss.</P></CardContent>
			</Card>
		</Dialog>
	{/snippet}
</Story>
