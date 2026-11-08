<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Visual and semantic flavour of a toast. */
	export type ToastVariant = 'info' | 'error';

	/** Props of `Toast`, a transient message card. Also accepts any `<div>` attribute. */
	export type ToastProps = HTMLAttributes<HTMLDivElement> & {
		/** `'error'` is announced as an alert, `'info'` as a status. Defaults to `'info'`. */
		variant?: ToastVariant;
		/** Milliseconds before `ondismiss` is called; `0` never dismisses. Pauses while hovered or focused, and restarts when changed. Defaults to `4000`. */
		duration?: number;
		/** Accessible name of the dismiss button. Defaults to `'Dismiss'`. */
		dismissLabel?: string;
		/** Called when the toast times out or its dismiss button is used. */
		ondismiss?: () => void;
		/** Content of the toast. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

	let {
		variant = 'info',
		duration = 4000,
		dismissLabel = 'Dismiss',
		ondismiss,
		onmouseenter,
		onmouseleave,
		onfocusin,
		onfocusout,
		class: className,
		children,
		...rest
	}: ToastProps = $props();

	let hovered = $state(false);
	let focused = $state(false);
	const paused = $derived(hovered || focused);
	const icon = $derived(variant === 'error' ? '!' : 'i');

	let remaining = 0;
	let lastDuration: number | undefined;

	const reducedMotion = () =>
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	$effect(() => {
		if (duration !== lastDuration) {
			lastDuration = duration;
			remaining = duration;
		}
		if (duration <= 0 || paused || remaining <= 0) return;

		const startedAt = Date.now();
		const timer = setTimeout(() => {
			remaining = 0;
			ondismiss?.();
		}, remaining);

		return () => {
			clearTimeout(timer);
			remaining -= Date.now() - startedAt;
		};
	});
</script>

<div
	role={variant === 'error' ? 'alert' : 'status'}
	class={['toast', variant, className]}
	style:--toast-duration={`${duration}ms`}
	in:fly|global={reducedMotion() ? { duration: 0 } : { x: 64, duration: 300, easing: cubicOut }}
	out:fade|global={{ duration: reducedMotion() ? 0 : 150 }}
	{...rest}
	onmouseenter={(event) => {
		hovered = true;
		onmouseenter?.(event);
	}}
	onmouseleave={(event) => {
		hovered = false;
		onmouseleave?.(event);
	}}
	onfocusin={(event) => {
		focused = true;
		onfocusin?.(event);
	}}
	onfocusout={(event) => {
		focused = false;
		onfocusout?.(event);
	}}
>
	<span class="icon" aria-hidden="true">{icon}</span>
	<div class="message">{@render children?.()}</div>
	<button type="button" class="dismiss" aria-label={dismissLabel} onclick={() => ondismiss?.()}>
		×
	</button>
	{#if duration > 0}
		{#key duration}
			<span class="timer" aria-hidden="true"></span>
		{/key}
	{/if}
</div>

<style>
	@layer bd.components {
		.toast {
			position: relative;
			display: flex;
			align-items: center;
			gap: var(--gap-md);
			width: max-content;
			max-width: 100%;
			padding: var(--space-5) var(--space-6) var(--space-5) var(--space-5);
			box-sizing: border-box;
			overflow: hidden;
			pointer-events: auto;

			--toast-accent: var(--bg-primary);
			background: var(--bg-main);
			--color-ink: var(--color-on-surface);
			--color-ink-inverse: var(--color-on-surface-inverse);
			--color-muted: var(--color-on-surface-muted);
			color: var(--color-ink);

			border: var(--toast-border);
			box-shadow: var(--shadow-card);

			font: var(--font-weight-medium) var(--font-size-md) / var(--line-height-body)
				var(--font-family);
		}

		.error {
			--toast-accent: var(--bg-destructive);
		}

		.icon {
			flex-shrink: 0;
			display: grid;
			place-items: center;
			width: calc(8 * var(--space-unit));
			aspect-ratio: 1 / 1;

			--block: calc(var(--toast-icon-block, 0) * 100%);
			--accent: calc(var(--toast-icon-accent, 0) * 100%);
			background: color-mix(in srgb, var(--toast-accent) var(--block), transparent);
			color: color-mix(in srgb, var(--toast-accent) var(--accent), var(--color-on-accent));
			border: var(--toast-icon-border-width) solid
				color-mix(in srgb, var(--toast-accent) var(--accent), var(--color-line));
			font: var(--font-weight-bold) var(--font-size-md) / 1 var(--font-family);
		}

		.message {
			flex: 1;
			min-width: 0;
		}

		.dismiss {
			all: unset;
			flex-shrink: 0;
			display: grid;
			place-items: center;
			width: calc(6 * var(--space-unit));
			aspect-ratio: 1 / 1;
			cursor: pointer;
			font: var(--font-weight-bold) var(--font-size-lg) / 1 var(--font-family);

			&:hover {
				background: var(--bg-surface-muted);
			}
			&:focus-visible {
				outline: var(--border-width-sm) solid var(--toast-accent);
			}
		}

		.timer {
			position: absolute;
			inset-inline: 0;
			inset-block-end: 0;
			height: var(--toast-timer-height);
			background: var(--toast-accent);
			transform-origin: left;
			animation: bd-toast-timer var(--toast-duration) linear forwards;
		}

		.toast:is(:hover, :focus-within) .timer {
			animation-play-state: paused;
		}

		@media (prefers-reduced-motion: reduce) {
			.timer {
				display: none;
			}
		}

		@keyframes bd-toast-timer {
			from {
				transform: scaleX(1);
			}
			to {
				transform: scaleX(0);
			}
		}
	}
</style>
