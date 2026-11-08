<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';

	/** Props of `Input`, a labelled text field. Also accepts any `<input>` attribute. */
	export type InputProps = HTMLInputAttributes & {
		/** Text of the label shown above the input. */
		label?: string;
	};
</script>

<script lang="ts">
	import { Label } from '../../typography';

	let {
		label,
		id,
		required,
		value = $bindable(),
		class: className,
		...rest
	}: InputProps = $props();

	const generatedId = $props.id();
	const inputId = $derived(id?.trim() || generatedId);
</script>

<div class="field-group">
	{#if label}
		<Label for={inputId} required={!!required}>{label}</Label>
	{/if}
	<input id={inputId} class={['input', className]} bind:value {required} {...rest} />
</div>

<style>
	@layer bd.components {
		.field-group {
			display: flex;
			flex-direction: column;
			width: 100%;
			gap: var(--gap-xs);
		}

		.input {
			width: 100%;
			margin-bottom: var(--margin-field);
			padding: var(--padding-control);

			font: var(--font-field);

			color: var(--color-ink);
			background-color: var(--bg-main);
			--color-ink: var(--color-on-surface);
			--color-ink-inverse: var(--color-on-surface-inverse);
			--color-muted: var(--color-on-surface-muted);

			border: var(--border-thin);
			border-radius: var(--radius-sharp);
			box-shadow: var(--shadow-flat);

			outline: var(--border-width-sm) solid transparent;
			transition:
				transform var(--duration-press) ease,
				box-shadow var(--duration-press) ease;
		}

		.input:focus {
			transform: translate(var(--offset-hover), var(--offset-hover));
			box-shadow: var(--shadow-focus);
		}

		.input:disabled {
			background-color: var(--bg-disabled);
			color: var(--color-muted);
			border-color: var(--color-muted);
			box-shadow: var(--shadow-none);
			cursor: not-allowed;
		}

		.input::placeholder {
			color: var(--color-muted);
			font-weight: var(--font-weight-regular);
		}
	}
</style>
