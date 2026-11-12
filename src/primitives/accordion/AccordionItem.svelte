<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLDetailsAttributes } from 'svelte/elements';

	/** Heading level of an item title. */
	export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

	/** Props of `AccordionItem`, one collapsible section. Also accepts any `<details>` attribute. */
	export type AccordionItemProps = Omit<HTMLDetailsAttributes, 'open' | 'title'> & {
		/** Header, always visible. A string, or a snippet for rich content such as an icon. */
		title: string | Snippet;
		/** Whether the item is expanded. Bindable. Defaults to `false`. */
		open?: boolean;
		/** Renders the title as a heading of this level, so it shows up in the page outline. */
		level?: AccordionHeadingLevel;
		/** Prevents the item from opening or closing. Defaults to `false`. */
		disabled?: boolean;
		/** Extra content on the right of the header, such as a `Badge` with a status. */
		aside?: Snippet;
		/** Content revealed when the item is open. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { getAccordionContext } from './context';

	let {
		title,
		open = $bindable(false),
		level,
		disabled = false,
		aside,
		class: className,
		children,
		...rest
	}: AccordionItemProps = $props();

	const accordion = getAccordionContext();

	/** A disabled item keeps the state it had when disabled, whatever tries to toggle it. */
	let locked: boolean | undefined;

	$effect(() => {
		if (!disabled) {
			locked = undefined;
			return;
		}
		locked ??= untrack(() => open);
		if (open !== locked) open = locked;
	});
</script>

{#snippet label()}
	{#if typeof title === 'string'}{title}{:else}{@render title()}{/if}
{/snippet}

<details
	{...rest}
	class={['item', className]}
	name={accordion ? accordion.name : rest.name}
	bind:open
>
	<summary
		aria-disabled={disabled || undefined}
		tabindex={disabled ? -1 : undefined}
		onclick={(event) => disabled && event.preventDefault()}
	>
		{#if level}
			<svelte:element this={`h${level}`} class="title">{@render label()}</svelte:element>
		{:else}
			<span class="title">{@render label()}</span>
		{/if}
		{#if aside}<span class="aside">{@render aside()}</span>{/if}
		<span class="chevron" aria-hidden="true"></span>
	</summary>
	<div class="panel" inert={disabled || undefined}>
		{@render children?.()}
	</div>
</details>

<style>
	@layer bd.components {
		.item {
			background-color: var(--bg-main);
			color: var(--color-on-surface);
			border: var(--accordion-border);
			border-radius: var(--radius-sharp);
			box-shadow: var(--accordion-shadow);
			interpolate-size: allow-keywords;
		}

		@supports (interpolate-size: allow-keywords) {
			@media (prefers-reduced-motion: no-preference) {
				.item::details-content {
					block-size: 0;
					overflow: clip;
					transition:
						block-size var(--duration-accordion) ease,
						content-visibility var(--duration-accordion) allow-discrete;
				}

				.item[open]::details-content {
					block-size: auto;
				}
			}
		}

		summary {
			display: flex;
			align-items: center;
			gap: var(--gap-sm);
			padding: var(--padding-action);
			font: var(--font-action);
			cursor: pointer;
			list-style: none;
		}

		summary::-webkit-details-marker {
			display: none;
		}

		.item:not(:has(> summary[aria-disabled='true'])) > summary:focus-visible {
			outline: var(--border-thin);
			outline-offset: calc(var(--border-width-thin) * -3);
		}

		.item:not(:has(> summary[aria-disabled='true'])) > summary:hover {
			background-color: var(--accordion-hover-bg);
		}

		.item:has(> summary[aria-disabled='true']) {
			background-color: var(--bg-disabled);
			color: var(--color-muted);
			border-color: var(--color-muted);
			box-shadow: var(--shadow-none);
		}

		.item > summary[aria-disabled='true'] {
			cursor: not-allowed;
		}

		.title {
			flex: 1;
			margin: 0;
			font: inherit;
		}

		.aside {
			display: flex;
			align-items: center;
			gap: var(--gap-xs);
			block-size: var(--accordion-aside-height);
		}

		.chevron {
			width: var(--accordion-chevron-size);
			height: var(--accordion-chevron-size);
			border-right: var(--border-md);
			border-bottom: var(--border-md);
			transform: rotate(45deg);
		}

		.item[open] > summary .chevron {
			transform: rotate(-135deg);
		}

		.panel {
			padding: var(--padding-item);
			border-top: var(--accordion-border);
		}
	}
</style>
