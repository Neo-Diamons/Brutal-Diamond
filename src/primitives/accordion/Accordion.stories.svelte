<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';

	import Badge from '../badge/Badge.svelte';
	import Button from '../button/Button.svelte';
	import Accordion from './Accordion.svelte';
	import AccordionItem from './AccordionItem.svelte';

	const { Story } = defineMeta({
		title: 'Primitives/Accordion',
		component: Accordion,
		argTypes: { multiple: { control: 'boolean' } }
	});

	type Status = 'OK' | 'WARN' | 'FAILED' | 'SKIPPED';

	type Step = { title: string; status: Status; duration: string; log: string };

	const variants = {
		OK: 'primary',
		WARN: 'secondary',
		FAILED: 'destructive',
		SKIPPED: 'outline'
	} as const;

	const steps: Step[] = [
		{
			title: '1. Validate request',
			status: 'OK',
			duration: '3 ms',
			log: 'POST /api/orders\nbody: 4 items, total 129.90 EUR\nschema: valid'
		},
		{
			title: '2. Load customer',
			status: 'OK',
			duration: '18 ms',
			log: 'SELECT * FROM customers WHERE id = 4821\n1 row (cache miss)'
		},
		{
			title: '3. Check stock',
			status: 'WARN',
			duration: '42 ms',
			log: 'sku A-1042: 2 requested, 2 available\nsku B-0007: 1 requested, 1 available\nwarning: low stock on B-0007'
		},
		{
			title: '4. Charge card',
			status: 'FAILED',
			duration: '1204 ms',
			log: 'POST https://payments.example.com/v1/charges\n<- 402 card_declined (insufficient_funds)\nretry 3/3 failed, giving up'
		},
		{
			title: '5. Send confirmation email',
			status: 'SKIPPED',
			duration: '-',
			log: 'skipped: previous step failed'
		}
	];
</script>

<script lang="ts">
	let accordion: Accordion | undefined = $state();
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText(/schema: valid/)).not.toBeVisible();
		await userEvent.click(canvas.getByText('1. Validate request'));
		await expect(canvas.getByText(/schema: valid/)).toBeVisible();
		await userEvent.click(canvas.getByText('4. Charge card'));
		await expect(canvas.getByText(/schema: valid/)).not.toBeVisible();
		await expect(canvas.getByText(/card_declined/)).toBeVisible();
	}}
>
	{#snippet template(args)}
		<div class="stage">
			<Accordion {...args}>
				{#each steps as step (step.title)}
					<AccordionItem title={step.title}><pre class="log">{step.log}</pre></AccordionItem>
				{/each}
			</Accordion>
		</div>
	{/snippet}
</Story>

<Story
	name="Multiple"
	args={{ multiple: true }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByText('1. Validate request'));
		await userEvent.click(canvas.getByText('4. Charge card'));
		await expect(canvas.getByText(/schema: valid/)).toBeVisible();
		await expect(canvas.getByText(/card_declined/)).toBeVisible();
	}}
>
	{#snippet template(args)}
		<div class="stage">
			<Accordion {...args}>
				{#each steps as step (step.title)}
					<AccordionItem title={step.title}><pre class="log">{step.log}</pre></AccordionItem>
				{/each}
			</Accordion>
		</div>
	{/snippet}
</Story>

<Story
	name="Open by default"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText(/card_declined/)).toBeVisible();
		await expect(canvas.getByText(/schema: valid/)).not.toBeVisible();
	}}
>
	{#snippet template(args)}
		<div class="stage">
			<Accordion {...args}>
				{#each steps as step (step.title)}
					<AccordionItem title={step.title} open={step.status === 'FAILED'}>
						<pre class="log">{step.log}</pre>
					</AccordionItem>
				{/each}
			</Accordion>
		</div>
	{/snippet}
</Story>

<Story
	name="With badge"
	args={{ multiple: true }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('FAILED')).toBeVisible();
		await expect(canvas.getByText('1204 ms')).toBeVisible();
		await expect(canvas.getAllByText('OK')).toHaveLength(2);
	}}
>
	{#snippet template(args)}
		<div class="stage">
			<Accordion {...args}>
				{#each steps as step (step.title)}
					<AccordionItem title={step.title}>
						{#snippet aside()}
							<span class="duration">{step.duration}</span>
							<Badge variant={variants[step.status]}>{step.status}</Badge>
						{/snippet}
						<pre class="log">{step.log}</pre>
					</AccordionItem>
				{/each}
			</Accordion>
		</div>
	{/snippet}
</Story>

<Story
	name="Disabled"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByText('5. Send confirmation email'));
		await expect(canvas.getByText(/skipped: previous step failed/)).not.toBeVisible();
		await userEvent.click(canvas.getByText('4. Charge card'));
		await expect(canvas.getByText(/card_declined/)).toBeVisible();
	}}
>
	{#snippet template(args)}
		<div class="stage">
			<Accordion {...args}>
				{#each steps as step (step.title)}
					<AccordionItem title={step.title} disabled={step.status === 'SKIPPED'}>
						<pre class="log">{step.log}</pre>
					</AccordionItem>
				{/each}
			</Accordion>
		</div>
	{/snippet}
</Story>

<Story
	name="Heading level"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(steps.length);
	}}
>
	{#snippet template(args)}
		<div class="stage">
			<Accordion {...args}>
				{#each steps as step (step.title)}
					<AccordionItem title={step.title} level={3}>
						<pre class="log">{step.log}</pre>
					</AccordionItem>
				{/each}
			</Accordion>
		</div>
	{/snippet}
</Story>

<Story
	name="Expand and collapse all"
	args={{ multiple: true }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Expand all' }));
		await expect(canvas.getByText(/schema: valid/)).toBeVisible();
		await expect(canvas.getByText(/skipped: previous step failed/)).toBeVisible();
		await userEvent.click(canvas.getByRole('button', { name: 'Collapse all' }));
		await expect(canvas.getByText(/schema: valid/)).not.toBeVisible();
		await expect(canvas.getByText(/card_declined/)).not.toBeVisible();
	}}
>
	{#snippet template(args)}
		<div class="stage">
			<div class="actions">
				<Button variant="outline" onclick={() => accordion?.expandAll()}>Expand all</Button>
				<Button variant="outline" onclick={() => accordion?.collapseAll()}>Collapse all</Button>
			</div>
			<Accordion bind:this={accordion} {...args}>
				{#each steps as step (step.title)}
					<AccordionItem title={step.title}>
						<pre class="log">{step.log}</pre>
					</AccordionItem>
				{/each}
			</Accordion>
		</div>
	{/snippet}
</Story>

<style>
	.stage {
		width: 32rem;
		max-width: 100%;
	}

	.actions {
		display: flex;
		gap: var(--gap-sm);
		margin-bottom: var(--gap-md);
	}

	.duration {
		font-size: var(--font-size-sm);
		color: var(--color-on-surface-muted);
		font-variant-numeric: tabular-nums;
	}

	.log {
		margin: 0;
		font-family: ui-monospace, monospace;
		font-size: var(--font-size-sm);
		white-space: pre-wrap;
		overflow-x: auto;
	}
</style>
