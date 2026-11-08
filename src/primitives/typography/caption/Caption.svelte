<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `Caption`, small inline text. Also accepts any `<span>` attribute. */
	export type CaptionProps = HTMLAttributes<HTMLSpanElement> & {
		/** Text content. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children, ...rest }: CaptionProps = $props();
</script>

<span {...rest}>{@render children?.()}</span>

<style>
	@layer bd.components {
		span {
			font: var(--font-caption);
		}
	}
</style>
