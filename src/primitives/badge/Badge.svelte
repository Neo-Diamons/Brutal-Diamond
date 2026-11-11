<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Visual style of a badge. */
	export type BadgeVariant = 'primary' | 'secondary' | 'outline' | 'destructive';

	/** Props of `Badge`, a small inline label. Also accepts any `<span>` attribute. */
	export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
		/** Visual style. Defaults to `'primary'`. */
		variant?: BadgeVariant;
		/**
		 * Custom fill, any CSS colour. Overrides the variant's background; the text switches between
		 * light and dark to stay readable.
		 */
		fill?: string;
		/** Content of the badge. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		variant = 'primary',
		fill,
		class: className,
		style,
		children,
		...rest
	}: BadgeProps = $props();
</script>

<span
	class={['badge', variant, { custom: fill }, className]}
	style={[fill ? `--badge-fill: ${fill}` : '', style].filter(Boolean).join(';') || undefined}
	{...rest}
>
	{@render children?.()}
</span>

<style>
	@layer bd.components {
		.badge {
			display: inline-block;
			width: fit-content;
			text-align: center;
			text-box: trim-both cap alphabetic;
			padding: var(--padding-badge);
			font: var(--font-weight-bold) var(--font-size-xs) / var(--line-height-normal)
				var(--font-family);
			letter-spacing: var(--tracking-wide);
			text-transform: uppercase;
			border: var(--border-sm);
			border-radius: var(--radius-sharp);
			box-shadow: var(--shadow-badge);
		}

		.primary {
			background-color: var(--button-primary-bg);
			color: var(--button-primary-fg);
		}

		.secondary {
			background-color: var(--button-secondary-bg);
			color: var(--button-secondary-fg);
		}

		.outline {
			background-color: var(--bg-main);
			color: var(--color-on-surface);
			border: var(--border-outline);
			border-width: var(--border-width-sm);
		}

		.destructive {
			background-color: var(--bg-destructive);
			color: var(--color-on-accent);
		}

		.custom {
			background-color: var(--badge-fill);
			color: oklch(from var(--badge-fill) clamp(0, (0.65 - l) * 1000, 1) 0 0);
		}
	}
</style>
