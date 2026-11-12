<script lang="ts">
	import Accordion from './Accordion.svelte';
	import AccordionItem from './AccordionItem.svelte';

	let { multiple = false }: { multiple?: boolean } = $props();

	let accordion: Accordion | undefined = $state();
	let one = $state(false);
	let two = $state(false);
</script>

<button type="button" onclick={() => accordion?.expandAll()}>api expand</button>
<button type="button" onclick={() => accordion?.collapseAll()}>api collapse</button>
<Accordion bind:this={accordion} {multiple}>
	<AccordionItem title="First" bind:open={one}>First body</AccordionItem>
	<AccordionItem title="Second" bind:open={two}>Second body</AccordionItem>
	<AccordionItem title="Third" disabled>Third body</AccordionItem>
</Accordion>
<p data-testid="state">open-1={one} open-2={two}</p>
