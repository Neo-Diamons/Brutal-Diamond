<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Layout axis of a set of tabs. */
	export type TabsOrientation = 'horizontal' | 'vertical';

	/** Colour scheme of the selected tab. */
	export type TabsVariant = 'primary' | 'secondary';

	/** Root of a set of tabs; owns the selected value. */
	export type TabsProps = HTMLAttributes<HTMLDivElement> & {
		/** Value of the selected tab. Bindable. */
		value?: string;
		/** Layout axis. `'vertical'` puts the list beside the panels. Defaults to `'horizontal'`. */
		orientation?: TabsOrientation;
		/** Colour scheme of the selected tab. Defaults to `'primary'`. */
		variant?: TabsVariant;
		/** The `TabList` and the `TabPanel`s. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { setContext, untrack } from 'svelte';

	import { TABS, type TabEntry, type TabsContext } from './context';

	let {
		value = $bindable(),
		orientation = 'horizontal',
		variant = 'primary',
		class: className,
		children,
		...rest
	}: TabsProps = $props();

	const id = $props.id();
	let tabs = $state.raw<readonly TabEntry[]>([]);

	function register(tab: TabEntry) {
		untrack(() => {
			if (tabs.some((other) => other.value === tab.value)) {
				console.warn(`Tabs: duplicate Tab value "${tab.value}"; ids will collide.`);
			}
			tabs = [...tabs, tab];
		});
		return function unregister() {
			tabs = tabs.filter((other) => other !== tab);
		};
	}

	function select(next: string) {
		value = next;
	}

	function tabId(key: string) {
		return `${id}-tab-${encodeURIComponent(key)}`;
	}

	function panelId(key: string) {
		return `${id}-panel-${encodeURIComponent(key)}`;
	}

	setContext<TabsContext>(TABS, {
		get value() {
			return value;
		},
		get orientation() {
			return orientation;
		},
		get variant() {
			return variant;
		},
		get tabs() {
			return tabs;
		},
		register,
		select,
		tabId,
		panelId
	});
</script>

<div class={['tabs', className]} data-orientation={orientation} {...rest}>
	{@render children?.()}
</div>

<style>
	@layer bd.components {
		.tabs {
			display: flex;
			flex-direction: column;
			width: 100%;
		}
		.tabs[data-orientation='vertical'] {
			flex-direction: row;
			align-items: stretch;
		}
		.tabs[data-orientation='vertical'] > :global(.tabpanel) {
			flex: 1;
			min-width: 0;
		}
	}
</style>
