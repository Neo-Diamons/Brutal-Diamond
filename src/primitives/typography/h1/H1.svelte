<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `H1`, a top-level heading. Also accepts any `<h1>` attribute. */
	export type H1Props = HTMLAttributes<HTMLHeadingElement> & {
		/** Text content. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children, ...rest }: H1Props = $props();
</script>

<h1 {...rest}>{@render children?.()}</h1>

<style>
	@layer bd.components {
		h1 {
			font: var(--font-h1);
			letter-spacing: var(--tracking-tight);
			margin: 0 0 var(--margin-text-lg) 0;
			color: var(--color-ink);
		}
	}
</style>
