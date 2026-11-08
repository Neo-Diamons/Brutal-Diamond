<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `P`, a paragraph. Also accepts any `<p>` attribute. */
	export type PProps = HTMLAttributes<HTMLParagraphElement> & {
		/** Text content. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children, ...rest }: PProps = $props();
</script>

<p {...rest}>{@render children?.()}</p>

<style>
	@layer bd.components {
		p {
			font: var(--font-body);
			margin: 0 0 var(--margin-text-md) 0;
			color: var(--color-ink);
		}
	}
</style>
