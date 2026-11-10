<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	/** Visual style of a button. */
	export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';

	type CommonProps = {
		/** Visual style. Defaults to `'primary'`. */
		variant?: ButtonVariant;
		/** Renders a square button sized for a single icon. Defaults to `false`. */
		icon?: boolean;
		/**
		 * Content of the button. An `<svg>` placed next to the text is sized by `--size-action-icon`
		 * without making the button taller.
		 */
		children?: Snippet;
	};

	/** Props of a `Button` rendered as a `<button>`. Also accepts any `<button>` attribute. */
	export type ButtonElementProps = CommonProps & HTMLButtonAttributes & { href?: undefined };

	/**
	 * Props of a `Button` rendered as a link. Also accepts any `<a>` attribute.
	 * `disabled` marks the link `aria-disabled`, removes it from the tab order and blocks clicks.
	 */
	export type ButtonLinkProps = CommonProps &
		HTMLAnchorAttributes & {
			/** URL the link points to; its presence turns the button into an `<a>`. */
			href: string;
			/** Disables the link. */
			disabled?: boolean;
		};

	/** Props of `Button`: a `<button>`, or a link when `href` is set. */
	export type ButtonProps = ButtonElementProps | ButtonLinkProps;
</script>

<script lang="ts">
	let {
		variant = 'primary',
		icon = false,
		href,
		disabled,
		class: className,
		children,
		...rest
	}: ButtonProps = $props();

	const classes = $derived(['btn', variant, { icon }, className]);

	/** Stops a disabled link from navigating or reaching the consumer's `onclick`. */
	function blockWhenDisabled(event: MouseEvent): void {
		event.preventDefault();
		event.stopImmediatePropagation();
	}
</script>

{#if href !== undefined}
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		{href}
		class={classes}
		aria-disabled={disabled ? 'true' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...rest as HTMLAnchorAttributes}
		onclickcapture={disabled ? blockWhenDisabled : (rest as HTMLAnchorAttributes).onclickcapture}
	>
		{@render children?.()}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<button type="button" class={classes} {disabled} {...rest as HTMLButtonAttributes}>
		{@render children?.()}
	</button>
{/if}

<style>
	@layer bd.components {
		.btn {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			font: var(--font-action);
			text-transform: uppercase;
			padding: var(--padding-action);
			margin-bottom: var(--margin-button);
			gap: var(--gap-xs);
			cursor: pointer;
			text-decoration: none;

			border: var(--border-thin);
			border-radius: var(--radius-sharp);
			box-shadow: var(--shadow-flat);
			transition:
				transform var(--duration-press) ease,
				box-shadow var(--duration-press) ease,
				filter var(--duration-press) ease;

			&:not(.icon) > :global(svg) {
				flex-shrink: 0;
				width: var(--size-action-icon);
				height: var(--size-action-icon);
				margin-block: calc((1em - var(--size-action-icon)) / 2);
			}

			&:not(.icon) > :global(svg:first-child) {
				margin-inline-start: var(--margin-action-icon);
			}

			&:is(:disabled, [aria-disabled='true']) {
				background-color: var(--bg-disabled);
				color: var(--color-muted);
				border-color: var(--color-muted);
				box-shadow: var(--shadow-none);
				cursor: not-allowed;
			}

			&:not(:is(:disabled, [aria-disabled='true'])) {
				&:hover {
					z-index: 1;
					transform: translate(var(--offset-hover), var(--offset-hover));
					box-shadow: var(--shadow-hover);
				}
				&:active {
					transform: translate(var(--offset-press), var(--offset-press));
					box-shadow: var(--shadow-pressed);
					filter: var(--button-pressed-filter);
				}
				&[aria-current='page'],
				&[aria-pressed='true'] {
					transform: translate(var(--offset-press), var(--offset-press));
					box-shadow: var(--shadow-pressed);
				}

				&.secondary:hover {
					background-color: var(--button-secondary-hover-bg);
				}
				&.outline:hover {
					background-color: var(--bg-surface-muted);
				}

				&:is(.primary, .destructive) {
					&:hover {
						box-shadow: var(--button-filled-shadow, var(--shadow-hover));
					}
					&:active,
					&[aria-current='page'],
					&[aria-pressed='true'] {
						box-shadow: var(--button-filled-shadow, var(--shadow-pressed));
					}
				}
			}
		}

		.primary {
			background-color: var(--button-primary-bg);
			color: var(--button-primary-fg);
			border-color: var(--button-filled-border-color, var(--color-line));
		}

		.secondary {
			background-color: var(--button-secondary-bg);
			color: var(--button-secondary-fg);
		}

		.outline {
			background-color: var(--bg-main);
			--color-ink: var(--color-on-surface);
			--color-ink-inverse: var(--color-on-surface-inverse);
			--color-muted: var(--color-on-surface-muted);
			color: var(--color-ink);
			border: var(--border-outline);
		}

		.destructive {
			background-color: var(--bg-destructive);
			color: var(--color-on-accent);
			border-color: var(--button-filled-border-color, var(--color-line));
		}

		.icon {
			width: fit-content;
			aspect-ratio: 1 / 1;
			padding: var(--padding-icon);
		}
	}
</style>
