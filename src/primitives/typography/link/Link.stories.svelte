<script module lang="ts">
	import { createRawSnippet } from 'svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';

	import { P } from '../p';
	import Link from './Link.svelte';

	const label = (text: string) =>
		createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

	const { Story } = defineMeta({
		title: 'Primitives/Typography/Link',
		component: Link,
		argTypes: {
			variant: { control: 'select', options: ['primary', 'secondary'] },
			children: { control: false }
		},
		args: {
			children: label('Read the docs'),
			href: '#docs',
			onclick: fn((event: MouseEvent) => event.preventDefault())
		}
	});
</script>

<Story
	name="Primary"
	play={async ({ args, canvasElement }) => {
		const link = within(canvasElement).getByRole('link', { name: 'Read the docs' });
		await userEvent.click(link);
		await expect(args.onclick).toHaveBeenCalledOnce();
	}}
/>

<Story name="Secondary" args={{ variant: 'secondary' }} />

<Story name="In a sentence">
	{#snippet template()}
		<div style="width: 32rem">
			<P>
				Body copy can hold a <Link href="#primary">primary link</Link> or a
				<Link href="#secondary" variant="secondary">secondary link</Link>. Hover either one to
				underline it.
			</P>
		</div>
	{/snippet}
</Story>
