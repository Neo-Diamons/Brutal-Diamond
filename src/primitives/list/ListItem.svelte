<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	/** Props of `ListItem`, rendered as a link when `href` is set and as a button otherwise. */
	export type ListItemProps = {
		/** Short text shown in a badge; replaces the number of an ordered list. */
		badge?: string;
		/** Secondary line shown under the content. */
		description?: string;
		/** Marks the item as the current one. Defaults to `false`. */
		active?: boolean;
		/** Renders an `<a>` pointing to this URL instead of a `<button>`. */
		href?: string;
		/** Browsing context of the link, only used with `href`. */
		target?: HTMLAnchorAttributes['target'];
		/** Relationship of the link to its target, only used with `href`. */
		rel?: HTMLAnchorAttributes['rel'];
		/** Called when the item is clicked. */
		onclick?: (event: MouseEvent) => void;
		/** Main content of the item. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { getContext } from 'svelte';

	import { Caption } from '../typography';
	import { LIST, type ListContext } from './context';

	let {
		badge,
		description,
		active = false,
		href,
		target,
		rel,
		onclick,
		children
	}: ListItemProps = $props();

	const list = getContext<ListContext | undefined>(LIST);
	const numbered = $derived(list?.ordered ?? false);
</script>

{#snippet body()}
	{#if badge}
		<span class="badge"><Caption>{badge}</Caption></span>
	{:else if numbered}
		<span class="badge number"></span>
	{/if}
	<span class="text">
		<span class="content">{@render children?.()}</span>
		{#if description}
			<span class="description">{description}</span>
		{/if}
	</span>
{/snippet}

<li class:numbered>
	{#if href}
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<a
			{href}
			{target}
			{rel}
			class="item"
			class:active
			aria-current={active ? 'page' : undefined}
			{onclick}
		>
			{@render body()}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	{:else}
		<button type="button" class="item" class:active aria-pressed={active} {onclick}>
			{@render body()}
		</button>
	{/if}
</li>

<style>
	@layer bd.components {
		.item {
			display: flex;
			align-items: center;
			gap: var(--gap-md);
			width: 100%;
			padding: var(--padding-item);

			background: var(--list-item-bg, var(--bg-main));
			--color-ink: var(--color-on-surface);
			--color-ink-inverse: var(--color-on-surface-inverse);
			--color-muted: var(--color-on-surface-muted);
			color: var(--color-ink);
			text-align: left;
			text-decoration: none;

			border: var(--list-item-border, var(--border-md));
			box-shadow: var(--shadow-flat);

			font: var(--font-field);

			cursor: pointer;
			transition:
				transform var(--duration-press) ease,
				box-shadow var(--duration-press) ease,
				background-color var(--duration-press) ease;
		}

		.badge {
			flex-shrink: 0;
			order: var(--list-badge-order);

			background: var(--list-badge-bg);
			color: var(--list-badge-fg);

			border: var(--list-badge-border);
			box-shadow: var(--shadow-badge);

			padding: var(--list-badge-padding);
		}

		.numbered {
			counter-increment: bd-list-item;
		}

		.number::before {
			content: counter(bd-list-item);
			font: var(--font-caption);
		}

		.text {
			flex: 1;
			min-width: 0;

			display: flex;
			flex-direction: column;
			gap: var(--space-1);
		}

		.content,
		.description {
			overflow-wrap: anywhere;
		}

		.description {
			font: var(--font-body);
			font-size: var(--font-size-xs);
		}

		.item {
			position: relative;
		}
		.item:hover {
			z-index: 1;
			transform: translate(var(--offset-hover), var(--offset-hover));
			box-shadow: var(--shadow-hover);
		}

		.item:active {
			transform: translate(var(--offset-press-sm), var(--offset-press-sm));
			box-shadow: var(--shadow-sm);
		}

		.item.active {
			background: var(--list-current, var(--bg-primary));
			color: var(--list-current-fg, var(--color-on-accent));
			transform: translate(var(--offset-press-sm), var(--offset-press-sm));
			box-shadow: var(--shadow-active);
		}

		.item.active .badge {
			background: var(--list-badge-active-bg, var(--color-ink));
			color: var(--list-badge-active-fg, var(--list-current, var(--bg-primary)));
		}
	}
</style>
