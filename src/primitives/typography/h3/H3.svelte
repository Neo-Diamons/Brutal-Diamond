<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `H3`, a sub-section heading. Also accepts any `<h3>` attribute. */
	export type H3Props = HTMLAttributes<HTMLHeadingElement> & {
		/** Text content. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children, ...rest }: H3Props = $props();
</script>

<h3 {...rest}>{@render children?.()}</h3>

<style>
	@layer bd.components {
		h3 {
			font: var(--font-h3);
			margin: 0 0 var(--margin-text-sm) 0;
			color: var(--color-ink);
		}
	}
</style>
