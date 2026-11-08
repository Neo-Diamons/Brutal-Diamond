<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `CardFooter`, the action row of a card. Also accepts any `<div>` attribute. */
	export type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
		/** Gives every button an equal share of the row. Defaults to `false`. */
		split?: boolean;
		/** Content of the footer, typically `Button`s. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { split = false, class: className, children, ...rest }: CardFooterProps = $props();
</script>

<div class={['card-footer', split && 'split', className]} {...rest}>
	{@render children?.()}
</div>

<style>
	@layer bd.components {
		.card-footer {
			display: flex;
			justify-content: flex-end;
			align-items: stretch;
			padding: var(--padding-footer);
			gap: var(--gap-footer);
			border-top: var(--border-footer);
		}

		.card-footer:last-child {
			padding-bottom: var(--padding-footer-end);
		}

		.card-footer :global(.btn) {
			flex-grow: var(--footer-button-grow);
			width: auto;
			min-width: var(--size-action-min-width);
			margin-bottom: var(--margin-footer-button);
			border: var(--border-footer-button);
		}

		.card-footer :global(.btn + .btn) {
			border-left: var(--border-footer-divider);
		}

		.card-footer :global(.btn:is(.primary, .destructive)),
		.card-footer :global(.btn:is(.primary, .destructive) + .btn) {
			border-left-color: var(--button-filled-border-color, var(--color-line));
		}

		.card-footer.split {
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: 1fr;
		}

		.card-footer.split :global(.btn) {
			width: 100%;
			min-width: 0;
		}
	}
</style>
