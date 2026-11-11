<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/**
	 * Row of `Tab`s. Arrow keys move the selection (left/right, or up/down when vertical);
	 * `Home`/`End` jump to the ends.
	 */
	export type TabListProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
		/** The `Tab`s. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { getTabs } from './context';

	let { class: className, children, onkeydown, ...rest }: TabListProps = $props();

	const tabs = getTabs('TabList');
	let list: HTMLDivElement;

	function enabledTabs(root: HTMLElement) {
		return [...root.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)')];
	}

	$effect(() => {
		const usable = tabs.tabs.filter((tab) => !tab.disabled).map((tab) => tab.value);
		if (tabs.value !== undefined && usable.includes(tabs.value)) return;
		const first = enabledTabs(list)[0]?.dataset.value;
		if (first !== undefined) tabs.select(first);
	});

	function step(key: string, vertical: boolean, rtl: boolean) {
		if (vertical) return { ArrowUp: -1, ArrowDown: 1 }[key];
		return { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[key];
	}

	function targetIndex(key: string, index: number, count: number, vertical: boolean, rtl: boolean) {
		if (key === 'Home') return 0;
		if (key === 'End') return count - 1;
		const delta = step(key, vertical, rtl);
		return delta === undefined ? undefined : (index + delta + count) % count;
	}

	function handleKeydown(event: Parameters<NonNullable<TabListProps['onkeydown']>>[0]) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;

		const current = (event.target as Element).closest('[role="tab"]');
		const enabled = enabledTabs(event.currentTarget);
		const index = current ? enabled.indexOf(current as HTMLElement) : -1;
		if (index === -1) return;

		const vertical = tabs.orientation === 'vertical';
		const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
		const nextIndex = targetIndex(event.key, index, enabled.length, vertical, rtl);
		if (nextIndex === undefined) return;

		event.preventDefault();
		const next = enabled[nextIndex];
		next.focus();
		next.click();
	}
</script>

<div
	{...rest}
	bind:this={list}
	role="tablist"
	aria-orientation={tabs.orientation}
	class={['tablist', className]}
	onkeydown={handleKeydown}
>
	{@render children?.()}
</div>

<style>
	@layer bd.components {
		.tablist {
			display: flex;
			flex-wrap: wrap;
			gap: var(--gap-md);
			padding-bottom: var(--gap-md);
		}
		.tablist[aria-orientation='vertical'] {
			flex-direction: column;
			flex-wrap: nowrap;
			padding-bottom: 0;
			padding-inline-end: var(--gap-md);
		}
		.tablist > :global(.btn) {
			width: auto;
		}
		.tablist :global(.btn.tab[aria-selected='true']) {
			transform: none;
		}
	}
</style>
