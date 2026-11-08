<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Button from '../button/Button.svelte';
	import H3 from '../typography/h3/H3.svelte';
	import P from '../typography/p/P.svelte';
	import Card from './Card.svelte';
	import CardContent from './CardContent.svelte';
	import CardFooter from './CardFooter.svelte';
	import CardHeader from './CardHeader.svelte';
	import CardMedia from './CardMedia.svelte';

	const { Story } = defineMeta({ title: 'Primitives/Card', component: Card });
</script>

<Story name="Basic">
	{#snippet template()}
		<div style="width: 24rem">
			<Card>
				<CardHeader><H3>Card title</H3></CardHeader>
				<CardContent><P>Cards compose a header, content and footer slot.</P></CardContent>
				<CardFooter>
					<Button variant="outline">Cancel</Button>
					<Button>Save</Button>
				</CardFooter>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Split footer">
	{#snippet template()}
		<div style="width: 24rem">
			<Card>
				<CardContent><P>Buttons share the footer 50/50.</P></CardContent>
				<CardFooter split>
					<Button variant="outline">Cancel</Button>
					<Button>Save</Button>
				</CardFooter>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="With media">
	{#snippet template()}
		<div style="width: 24rem">
			<Card>
				<CardMedia
					src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='140'><rect width='400' height='140' fill='%23a855f7'/></svg>"
					alt="Preview"
				/>
				<CardContent><P>Media sits flush at the top of the card.</P></CardContent>
			</Card>
		</div>
	{/snippet}
</Story>

<Story name="Broken media">
	{#snippet template()}
		<div style="width: 24rem">
			<Card>
				<CardMedia src="/missing.jpg" alt="Preview" />
				<CardContent><P>The image failed to load, so a placeholder is shown.</P></CardContent>
			</Card>
		</div>
	{/snippet}
</Story>
