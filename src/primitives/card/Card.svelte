<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `Card`, a bordered container for card parts. Also accepts any `<div>` attribute. */
	export type CardProps = HTMLAttributes<HTMLDivElement> & {
		/** Card parts (`CardMedia`, `CardHeader`, `CardContent`, `CardFooter`). */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { class: className, children, ...rest }: CardProps = $props();
</script>

<div class={['card', className]} {...rest}>
	{@render children?.()}
</div>

<style>
	@layer bd.components {
		.card {
			display: flex;
			flex-direction: column;
			background-color: var(--bg-main);
			--color-ink: var(--color-on-surface);
			--color-ink-inverse: var(--color-on-surface-inverse);
			--color-muted: var(--color-on-surface-muted);
			color: var(--color-ink);
			border: var(--border-thick);
			border-radius: var(--radius-sharp);
			box-shadow: var(--shadow-card);
			margin-bottom: var(--margin-card);
		}
	}
</style>
