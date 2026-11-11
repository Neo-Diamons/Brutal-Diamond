<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/**
	 * Panel shown while its `Tab` is selected. Unstyled.
	 * Only rendered while selected, so inputs and scroll reset on every switch;
	 * keep such state in the parent.
	 */
	export type TabPanelProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
		/** Value of the `Tab` controlling this panel. */
		value: string;
		/** Content of the panel. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { getTabs } from './context';

	let { value, class: className, children, ...rest }: TabPanelProps = $props();

	const tabs = getTabs('TabPanel');
</script>

<div
	role="tabpanel"
	id={tabs.panelId(value)}
	aria-labelledby={tabs.tabId(value)}
	hidden={tabs.value !== value}
	tabindex="0"
	class={['tabpanel', className]}
	{...rest}
>
	{#if tabs.value === value}
		{@render children?.()}
	{/if}
</div>

<style>
	@layer bd.components {
		.tabpanel[hidden] {
			display: none;
		}
	}
</style>
