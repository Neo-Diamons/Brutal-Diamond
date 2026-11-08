<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	/** Colour of a link. */
	export type LinkVariant = 'primary' | 'secondary';

	/** Props of `Link`, an inline link. Also accepts any `<a>` attribute. */
	export type LinkProps = HTMLAnchorAttributes & {
		/** Colour of the link. Defaults to `'primary'`. */
		variant?: LinkVariant;
		/** Content of the link. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { variant = 'primary', class: className, children, ...rest }: LinkProps = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a class={['link', variant, className]} {...rest}>{@render children?.()}</a>

<style>
	@layer bd.components {
		.link {
			font: inherit;
			font-weight: var(--font-weight-bold);
			text-decoration: none;
		}
		.link:hover {
			text-decoration: underline;
		}
		.primary {
			color: var(--link-primary-fg);
		}
		.secondary {
			color: var(--link-secondary-fg);
		}
	}
</style>
