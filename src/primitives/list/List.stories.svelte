<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';

	import List from './List.svelte';
	import ListItem from './ListItem.svelte';

	const { Story } = defineMeta({
		title: 'Primitives/List',
		component: List,
		argTypes: { variant: { control: 'select', options: ['primary', 'secondary'] } }
	});

	const sites = ['Inbox', 'Projects', 'Archive'];

	const selectSecondItem = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const all = canvas.getByRole('button', { name: /All items/ });
		const projects = canvas.getByRole('button', { name: /Projects/ });

		await userEvent.click(all);
		await expect(all).toHaveAttribute('aria-pressed', 'true');
		await userEvent.click(projects);
		await expect(projects).toHaveAttribute('aria-pressed', 'true');
		await expect(all).toHaveAttribute('aria-pressed', 'false');
	};
</script>

<script lang="ts">
	let primary = $state('all');
	let secondary = $state('all');
</script>

<Story name="Default" play={selectSecondItem}>
	{#snippet template(args)}
		<div style="width: 18rem">
			<List {...args}>
				<ListItem active={primary === 'all'} onclick={() => (primary = 'all')}>All items</ListItem>
				{#each sites as site (site)}
					<ListItem active={primary === site} onclick={() => (primary = site)}>{site}</ListItem>
				{/each}
			</List>
		</div>
	{/snippet}
</Story>

<Story name="Secondary" args={{ variant: 'secondary' }} play={selectSecondItem}>
	{#snippet template(args)}
		<div style="width: 18rem">
			<List {...args}>
				<ListItem active={secondary === 'all'} onclick={() => (secondary = 'all')}>
					All items
				</ListItem>
				{#each sites as site (site)}
					<ListItem active={secondary === site} onclick={() => (secondary = site)}>{site}</ListItem>
				{/each}
			</List>
		</div>
	{/snippet}
</Story>

<Story name="Badges">
	{#snippet template()}
		<div style="width: 18rem">
			<List>
				<ListItem badge="•" active>All items</ListItem>
				<ListItem badge="12">Inbox</ListItem>
				<ListItem badge="NEW">Projects</ListItem>
			</List>
		</div>
	{/snippet}
</Story>

<Story name="Descriptions">
	{#snippet template()}
		<div style="width: 22rem">
			<List>
				<ListItem description="Everything in one place" active>All items</ListItem>
				<ListItem description="Three unread">Inbox</ListItem>
				<ListItem>Without description</ListItem>
			</List>
		</div>
	{/snippet}
</Story>

<Story name="Ordered">
	{#snippet template()}
		<div style="width: 18rem">
			<List ordered>
				<ListItem active>First</ListItem>
				<ListItem>Second</ListItem>
				<ListItem badge="★">Own badge, still counted</ListItem>
				<ListItem>Fourth</ListItem>
			</List>
		</div>
	{/snippet}
</Story>

<Story name="Links">
	{#snippet template()}
		<div style="width: 22rem">
			<List>
				<ListItem href="#reference" active>API reference</ListItem>
				<ListItem href="#spec" target="_blank" rel="noreferrer noopener">OpenAPI document</ListItem>
			</List>
		</div>
	{/snippet}
</Story>

<Story name="Mixed">
	{#snippet template()}
		<div style="width: 22rem">
			<List>
				<ListItem badge="1" description="A button">Open settings</ListItem>
				<ListItem badge="2" description="A link" href="#reference">API reference</ListItem>
				<ListItem badge="3" description="A button" active>Sign out</ListItem>
				<ListItem badge="4" description="An external link" href="#spec" target="_blank">
					OpenAPI document
				</ListItem>
			</List>
		</div>
	{/snippet}
</Story>

<Story name="Long label">
	{#snippet template()}
		<div style="width: 18rem">
			<List>
				<ListItem badge="1" description="A description that is just as long as the label above it">
					A rather long item name that will be truncated with an ellipsis
				</ListItem>
			</List>
		</div>
	{/snippet}
</Story>
