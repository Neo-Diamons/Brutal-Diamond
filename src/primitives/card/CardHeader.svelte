<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `CardHeader`, the title area of a card. Also accepts any `<div>` attribute. */
	export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
		/** Content of the header, typically a heading. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { class: className, children, ...rest }: CardHeaderProps = $props();
</script>

<div class={['card-header', className]} {...rest}>
	{@render children?.()}
</div>

<style>
	@layer bd.components {
		.card-header :global(h3) {
			margin: 0;
		}

		.card-header {
			padding: var(--padding-card);
		}

		.card-header:first-child,
		:global(.card-media) + .card-header {
			padding-top: var(--padding-card-edge);
		}
	}
</style>
