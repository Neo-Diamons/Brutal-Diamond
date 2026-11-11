<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import {
		Badge,
		Button,
		Caption,
		Card,
		CardContent,
		CardFooter,
		CardHeader,
		Confirmation,
		Dialog,
		H1,
		H2,
		H3,
		Input,
		Label,
		Link,
		List,
		ListItem,
		Notice,
		P,
		Select,
		Tab,
		TabList,
		TabPanel,
		Tabs,
		Textarea,
		Toaster,
		toaster
	} from './primitives';

	import { expect, within } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Overview/Gallery',
		tags: ['!autodocs'],
		parameters: { layout: 'fullscreen' }
	});

	const options = [
		{ value: 'todo', label: 'To do' },
		{ value: 'doing', label: 'Doing' },
		{ value: 'done', label: 'Done' }
	];
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let listActive = $state('All items');
	let tab = $state('overview');
	let url = $state('');
	let column = $state('todo');
	let notes = $state('');

	/**
	 * Builds the docs URL of a story from the manager URL, so the selected globals (theme, mode) are
	 * kept.
	 *
	 * @param title - Storybook title of the story, such as `Primitives/Form/Input`.
	 */
	function storyHref(title: string): string {
		const params = new SvelteURLSearchParams(window.parent.location.search);
		params.set('path', `/docs/${title.toLowerCase().replaceAll('/', '-')}--docs`);
		return `${window.parent.location.pathname}?${params}`;
	}
</script>

<Story
	name="All primitives"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const links = canvas.getAllByRole('link', { name: /^View story/ });
		await expect(links).toHaveLength(14);
		await expect(canvas.getByRole('link', { name: 'View story, Form/Input' })).toHaveAttribute(
			'href',
			expect.stringContaining('primitives-form-input--docs')
		);
	}}
>
	{#snippet template()}
		{#snippet showcase(name: string, title: string, content: Snippet)}
			<section class="showcase">
				<header class="showcase-header">
					<Label>{name}</Label>
					<Caption>
						<Link
							variant="secondary"
							href={storyHref(title)}
							onclick={(event) => {
								event.preventDefault();
								window.parent.location.href = storyHref(title);
							}}
							target="_top"
							aria-label="View story, {name}"
						>
							View story
						</Link>
					</Caption>
				</header>
				<div class="cell">{@render content()}</div>
			</section>
		{/snippet}

		{#snippet buttons()}
			<div class="row">
				<Button onclick={() => toaster.push('Primary clicked')}>Primary</Button>
				<Button variant="secondary" onclick={() => toaster.push('Secondary clicked')}>
					Secondary
				</Button>
				<Button variant="outline" onclick={() => toaster.push('Outline clicked')}>Outline</Button>
				<Button variant="destructive" onclick={() => toaster.push('Destructive clicked')}>
					Destructive
				</Button>
			</div>
		{/snippet}

		{#snippet cards()}
			<Card>
				<CardHeader><H3>Card title</H3></CardHeader>
				<CardContent><P>Header, content and footer.</P></CardContent>
				<CardFooter>
					<Button variant="outline" onclick={() => toaster.push('Cancelled')}>Cancel</Button>
					<Button onclick={() => toaster.push('Changes saved')}>Save</Button>
				</CardFooter>
			</Card>
		{/snippet}

		{#snippet confirmations()}
			<Confirmation itemName="Item" onconfirm={() => toaster.push('Item deleted')} />
		{/snippet}

		{#snippet dialogs()}
			<Dialog>
				{#snippet trigger({ open })}
					<Button onclick={open}>Open dialog</Button>
				{/snippet}
				<Card>
					<CardHeader><H3>Hello</H3></CardHeader>
					<CardContent><P>Press Escape or click the backdrop to dismiss.</P></CardContent>
				</Card>
			</Dialog>
		{/snippet}

		{#snippet inputs()}
			<Input
				id="gallery-url"
				bind:value={url}
				label="Target URL"
				placeholder="https://svelte.dev"
			/>
		{/snippet}

		{#snippet links()}
			<P>
				Read the <Link href="#primary">primary link</Link> or the
				<Link variant="secondary" href="#secondary">secondary link</Link> inside a sentence.
			</P>
		{/snippet}

		{#snippet lists()}
			<List>
				{#each ['All items', 'Projects', 'Archive'] as item (item)}
					<ListItem
						active={listActive === item}
						onclick={() => {
							listActive = item;
							toaster.push(`${item} selected`);
						}}
					>
						{item}
					</ListItem>
				{/each}
			</List>
		{/snippet}

		{#snippet badges()}
			<div class="row">
				<Badge>Primary</Badge>
				<Badge variant="secondary">Secondary</Badge>
				<Badge variant="outline">Outline</Badge>
				<Badge variant="destructive">Destructive</Badge>
				<Badge fill="#22c55e">Custom</Badge>
			</div>
		{/snippet}

		{#snippet notices()}
			<div class="col">
				<Notice>No domains indexed.</Notice>
				<Notice variant="error">Failed to load sites</Notice>
			</div>
		{/snippet}

		{#snippet selects()}
			<Select id="gallery-column" label="Column" bind:value={column} {options} />
		{/snippet}

		{#snippet textareas()}
			<Textarea
				id="gallery-notes"
				bind:value={notes}
				label="Notes"
				rows={4}
				placeholder="One URL per line"
			/>
		{/snippet}

		{#snippet tabsDemo()}
			<Tabs bind:value={tab}>
				<TabList aria-label="Project sections">
					<Tab value="overview">Overview</Tab>
					<Tab value="activity">Activity</Tab>
					<Tab value="settings">Settings</Tab>
				</TabList>
				<TabPanel value="overview">
					<Card class="tabs-demo-panel">
						<CardContent>
							<div class="col">
								<H3>Overview</H3>
								<P>A summary of the project: owner, status and last deployment.</P>
							</div>
						</CardContent>
					</Card>
				</TabPanel>
				<TabPanel value="activity">
					<Card class="tabs-demo-panel">
						<CardContent>
							<div class="col">
								<H3>Activity</H3>
								<List>
									<ListItem badge="NEW" description="2 minutes ago">Deployment succeeded</ListItem>
									<ListItem description="1 hour ago">Comment added</ListItem>
								</List>
							</div>
						</CardContent>
					</Card>
				</TabPanel>
				<TabPanel value="settings">
					<Card class="tabs-demo-panel">
						<CardContent>
							<div class="col">
								<H3>Settings</H3>
								<Notice>Changes apply to every environment.</Notice>
							</div>
						</CardContent>
					</Card>
				</TabPanel>
			</Tabs>
		{/snippet}

		{#snippet toasts()}
			<div class="row">
				<Button onclick={() => toaster.push('Changes saved')}>Info</Button>
				<Button
					variant="destructive"
					onclick={() => toaster.push('Failed to save', { variant: 'error' })}
				>
					Error
				</Button>
			</div>
		{/snippet}

		{#snippet typography()}
			<div class="col">
				<H1>Heading 1</H1>
				<H2>Heading 2</H2>
				<H3>Heading 3</H3>
				<Label>Label</Label>
				<Caption>Caption</Caption>
				<P>Body copy.</P>
			</div>
		{/snippet}

		<div class="grid">
			{@render showcase('Badge', 'Primitives/Badge', badges)}
			{@render showcase('Button', 'Primitives/Button', buttons)}
			{@render showcase('Card', 'Primitives/Card', cards)}
			{@render showcase('Confirmation', 'Primitives/Confirmation', confirmations)}
			{@render showcase('Dialog', 'Primitives/Dialog', dialogs)}
			{@render showcase('List', 'Primitives/List', lists)}
			{@render showcase('Notice', 'Primitives/Notice', notices)}
			{@render showcase('Tabs', 'Primitives/Tabs', tabsDemo)}
			{@render showcase('Toast', 'Primitives/Toast', toasts)}
			{@render showcase('Form/Input', 'Primitives/Form/Input', inputs)}
			{@render showcase('Form/Select', 'Primitives/Form/Select', selects)}
			{@render showcase('Form/Textarea', 'Primitives/Form/Textarea', textareas)}
			{@render showcase('Typography/Link', 'Primitives/Typography/Link', links)}
			{@render showcase('Typography/Text', 'Primitives/Typography/Text', typography)}
		</div>

		<Toaster />
	{/snippet}
</Story>

<style>
	@layer bd.components {
		.grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(var(--width-card), 1fr));
			grid-auto-rows: 1fr;
			gap: var(--gap-lg);
			padding: var(--space-9);
			box-sizing: border-box;
			min-height: 100vh;
		}
		.showcase {
			display: flex;
			flex-direction: column;
		}
		.showcase-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: var(--space-4);
		}
		.cell {
			flex: 1;
			padding: var(--space-8);
			border: var(--border-dashed);
			min-height: var(--size-media-height);
		}
		.row,
		.col {
			display: flex;
			gap: var(--gap-md);
		}
		.row {
			flex-wrap: wrap;
			align-items: flex-start;
		}
		.col {
			flex-direction: column;
		}
		.grid :global(.tabs-demo-panel) {
			min-height: 15rem;
		}
	}
</style>
