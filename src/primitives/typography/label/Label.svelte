<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	/** Props of `Label`, the caption of a form field. Also accepts any `<label>` attribute. */
	export type LabelProps = HTMLLabelAttributes & {
		/** Prefixes the text with a required marker. Defaults to `false`. */
		required?: boolean;
		/** Text of the label. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { required = false, children, ...rest }: LabelProps = $props();
</script>

<label {...rest}>
	{#if required}
		<span class="required" aria-hidden="true">*</span>
	{/if}
	{@render children?.()}
</label>

<style>
	@layer bd.components {
		label {
			font: var(--font-label);
			letter-spacing: var(--tracking-wide);
			text-transform: uppercase;
			color: var(--color-ink);
		}
		.required {
			color: var(--color-required);
			font-size: 1.5em;
			line-height: 0;
			vertical-align: middle;
		}
	}
</style>
