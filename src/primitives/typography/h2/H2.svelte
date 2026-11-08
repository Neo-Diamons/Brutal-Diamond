<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `H2`, a section heading. Also accepts any `<h2>` attribute. */
	export type H2Props = HTMLAttributes<HTMLHeadingElement> & {
		/** Text content. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children, ...rest }: H2Props = $props();
</script>

<h2 {...rest}>{@render children?.()}</h2>

<style>
	@layer bd.components {
		h2 {
			font: var(--font-h2);
			letter-spacing: var(--tracking-snug);
			margin: 0 0 var(--margin-text-md) 0;
			color: var(--color-ink);
		}
	}
</style>
