<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import { Caption } from './caption';
	import { H1 } from './h1';
	import { H2 } from './h2';
	import { H3 } from './h3';
	import { Label } from './label';
	import { P } from './p';

	const { Story } = defineMeta({ title: 'Primitives/Typography/Text' });
</script>

<Story name="Scale">
	{#snippet template()}
		<div style="width: 32rem">
			<H1>Heading 1</H1>
			<H2>Heading 2</H2>
			<H3>Heading 3</H3>
			<div><Label>Label</Label></div>
			<div><Caption>Caption</Caption></div>
			<P>Body copy looks like this, with a comfortable line height for reading.</P>
		</div>
	{/snippet}
</Story>

<Story name="H1">
	{#snippet template()}<H1>Heading 1</H1>{/snippet}
</Story>

<Story name="H2">
	{#snippet template()}<H2>Heading 2</H2>{/snippet}
</Story>

<Story name="H3">
	{#snippet template()}<H3>Heading 3</H3>{/snippet}
</Story>

<Story name="Label">
	{#snippet template()}<Label>Label</Label>{/snippet}
</Story>

<Story name="Caption">
	{#snippet template()}<Caption>Caption</Caption>{/snippet}
</Story>

<Story name="Paragraph">
	{#snippet template()}<P>Body copy looks like this.</P>{/snippet}
</Story>
