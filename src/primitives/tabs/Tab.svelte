<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	/** Button that selects the `TabPanel` sharing its `value`. */
	export type TabProps = Omit<
		HTMLButtonAttributes,
		'value' | 'role' | 'id' | 'tabindex' | 'aria-selected' | 'aria-controls'
	> & {
		/** Unique value, matching the `value` of its `TabPanel`. */
		value: string;
		/** Label of the tab. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { Button } from '../button';
	import { getTabs } from './context';

	let { value, disabled, class: className, style, children, onclick, ...rest }: TabProps = $props();

	const tabs = getTabs('Tab');
	const selected = $derived(tabs.value === value);

	$effect(() =>
		tabs.register({
			value,
			get disabled() {
				return !!disabled;
			}
		})
	);

	function select(event: Parameters<NonNullable<TabProps['onclick']>>[0]) {
		tabs.select(value);
		onclick?.(event);
	}
</script>

<Button
	{...rest}
	role="tab"
	id={tabs.tabId(value)}
	data-value={value}
	variant={selected ? tabs.variant : 'outline'}
	{disabled}
	class={['tab', className]}
	{style}
	aria-selected={selected}
	aria-controls={tabs.panelId(value)}
	tabindex={selected ? 0 : -1}
	onclick={select}
>
	{@render children?.()}
</Button>

<style>
	@layer bd.components {
		:global(.btn.tab) {
			--border-outline: var(--tab-border);
		}
	}
</style>
