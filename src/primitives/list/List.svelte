<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLOlAttributes } from 'svelte/elements';

	/** Colour scheme of the active item of a list. */
	export type ListVariant = 'primary' | 'secondary';

	/**
	 * Props of `List`, a vertical list of `ListItem`s, rendered as `<ol>` when `ordered` and `<ul>`
	 * otherwise. Also accepts any `<ol>` attribute but `reversed` and `type`.
	 */
	export type ListProps = Omit<HTMLOlAttributes, 'reversed' | 'type'> & {
		/** Colour scheme of the active item. Defaults to `'primary'`. */
		variant?: ListVariant;
		/** Numbers the items. Defaults to `false`. */
		ordered?: boolean;
		/** The `ListItem`s. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { setContext } from 'svelte';

	import { LIST, type ListContext } from './context';

	let {
		variant = 'primary',
		ordered = false,
		start,
		class: className,
		children,
		...rest
	}: ListProps = $props();

	setContext<ListContext>(LIST, {
		get ordered() {
			return ordered;
		}
	});
</script>

<svelte:element
	this={ordered ? 'ol' : 'ul'}
	role="list"
	class={['list', variant, className]}
	start={ordered ? start : undefined}
	style:counter-reset={ordered ? `bd-list-item ${(start ?? 1) - 1}` : undefined}
	{...rest}
>
	{@render children?.()}
</svelte:element>

<style>
	@layer bd.components {
		.list {
			display: flex;
			flex-direction: column;

			width: 100%;
			gap: var(--gap-list);
			margin: 0;
			padding: 0;
			list-style: none;
		}
		.primary {
			--list-current: var(--button-primary-bg);
			--list-current-fg: var(--button-primary-fg);
		}
		.secondary {
			--list-current: var(--list-secondary-bg);
			--list-current-fg: var(--list-secondary-fg);
			--list-item-bg: var(--list-secondary-item-bg);
			--list-item-border: var(--list-secondary-border);
		}
	}
</style>
