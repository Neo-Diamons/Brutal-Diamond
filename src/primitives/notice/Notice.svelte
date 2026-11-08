<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Visual and semantic flavour of a notice. */
	export type NoticeVariant = 'info' | 'error';

	/** Props of `Notice`, an inline message block. Also accepts any `<div>` attribute. */
	export type NoticeProps = HTMLAttributes<HTMLDivElement> & {
		/** `'error'` is announced as an alert, `'info'` as a status. Defaults to `'info'`. */
		variant?: NoticeVariant;
		/** Content of the notice. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { variant = 'info', class: className, children, ...rest }: NoticeProps = $props();
</script>

<div
	role={variant === 'error' ? 'alert' : 'status'}
	class={['notice', variant, className]}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer bd.components {
		.notice {
			padding: var(--space-5);
			background: var(--bg-notice);
			--color-ink: var(--color-on-surface);
			--color-ink-inverse: var(--color-on-surface-inverse);
			--color-muted: var(--color-on-surface-muted);
			color: var(--color-ink);
			border: var(--border-dashed);
			font: var(--font-weight-medium) var(--font-size-sm) / var(--line-height-body)
				var(--font-family);
		}

		.error {
			background: var(--bg-notice-error);
		}
	}
</style>
