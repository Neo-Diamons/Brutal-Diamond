<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `CardContent`, the body of a card. Also accepts any `<div>` attribute. */
	export type CardContentProps = HTMLAttributes<HTMLDivElement> & {
		/** Content of the card body. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { class: className, children, ...rest }: CardContentProps = $props();
</script>

<div class={['card-content', className]} {...rest}>
	{@render children?.()}
</div>

<style>
	@layer bd.components {
		.card-content {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			padding: var(--padding-card);
			gap: var(--gap-sm);
		}

		.card-content:first-child,
		:global(.card-media) + .card-content {
			padding-top: var(--padding-card-edge);
		}

		.card-content > :global(:last-child) {
			margin-bottom: 0;
		}

		.card-content:last-child {
			padding-bottom: var(--padding-card-edge);
		}
	}
</style>
