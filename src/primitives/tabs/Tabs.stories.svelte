<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';

	import Tabs from './Tabs.svelte';
	import TabList from './TabList.svelte';
	import Tab from './Tab.svelte';
	import TabPanel from './TabPanel.svelte';
	import { Card, CardContent } from '../card';
	import { H3, P } from '../typography';

	const { Story } = defineMeta({
		title: 'Primitives/Tabs',
		component: Tabs,
		argTypes: {
			orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
			variant: { control: 'select', options: ['primary', 'secondary'] }
		}
	});

	const switchTab = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const projects = canvas.getByRole('tab', { name: 'Projects' });

		await userEvent.click(projects);
		await expect(projects).toHaveAttribute('aria-selected', 'true');
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Your projects');
	};
</script>

<script lang="ts">
	let primary = $state('inbox');
	let secondary = $state('inbox');
	let withDisabled = $state('inbox');
</script>

{#snippet card(title: string, text: string)}
	<Card style="min-height: 12rem">
		<CardContent>
			<H3>{title}</H3>
			<P>{text}</P>
		</CardContent>
	</Card>
{/snippet}

{#snippet panels()}
	<TabPanel value="inbox">
		{@render card('Inbox', 'Your inbox: 3 unread messages, last received 2 minutes ago.')}
	</TabPanel>
	<TabPanel value="projects">
		{@render card('Projects', 'Your projects: 5 active, 2 awaiting review.')}
	</TabPanel>
	<TabPanel value="archive">
		{@render card('Archive', 'Your archive: 42 items older than 30 days.')}
	</TabPanel>
{/snippet}

<Story name="Default" play={switchTab}>
	{#snippet template(args)}
		<Tabs {...args} style="width: 32rem; max-width: 100vw" bind:value={primary}>
			<TabList aria-label="Sections">
				<Tab value="inbox">Inbox</Tab>
				<Tab value="projects">Projects</Tab>
				<Tab value="archive">Archive</Tab>
			</TabList>
			{@render panels()}
		</Tabs>
	{/snippet}
</Story>

<Story name="Vertical" args={{ orientation: 'vertical' }} play={switchTab}>
	{#snippet template(args)}
		<Tabs {...args} style="width: 32rem; max-width: 100vw" bind:value={primary}>
			<TabList aria-label="Sections">
				<Tab value="inbox">Inbox</Tab>
				<Tab value="projects">Projects</Tab>
				<Tab value="archive">Archive</Tab>
			</TabList>
			{@render panels()}
		</Tabs>
	{/snippet}
</Story>

<Story name="Secondary" args={{ variant: 'secondary' }} play={switchTab}>
	{#snippet template(args)}
		<Tabs {...args} style="width: 32rem; max-width: 100vw" bind:value={secondary}>
			<TabList aria-label="Sections">
				<Tab value="inbox">Inbox</Tab>
				<Tab value="projects">Projects</Tab>
				<Tab value="archive">Archive</Tab>
			</TabList>
			{@render panels()}
		</Tabs>
	{/snippet}
</Story>

<Story name="Disabled tab">
	{#snippet template(args)}
		<Tabs {...args} style="width: 32rem; max-width: 100vw" bind:value={withDisabled}>
			<TabList aria-label="Sections">
				<Tab value="inbox">Inbox</Tab>
				<Tab value="projects">Projects</Tab>
				<Tab value="archive" disabled>Archive</Tab>
			</TabList>
			{@render panels()}
		</Tabs>
	{/snippet}
</Story>
