<script lang="ts">
	import Badge from '../badge/Badge.svelte';
	import AccordionItem from './AccordionItem.svelte';
</script>

<AccordionItem title="Charge card" data-testid="with-badge">
	{#snippet aside()}
		<span>1204 ms</span>
		<Badge variant="destructive">FAILED</Badge>
	{/snippet}
	Card declined
</AccordionItem>
