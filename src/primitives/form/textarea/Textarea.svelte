<script lang="ts" module>
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	/** Props of `Textarea`, a labelled multi-line field. Also accepts any `<textarea>` attribute. */
	export type TextareaProps = HTMLTextareaAttributes & {
		/** Text of the label shown above the textarea. */
		label?: string;
		/** Number of visible text lines. Defaults to `4`. */
		rows?: number;
	};
</script>

<script lang="ts">
	import { Label } from '../../typography';

	let {
		label,
		id,
		required,
		rows = 4,
		value = $bindable(),
		class: className,
		...rest
	}: TextareaProps = $props();

	const generatedId = $props.id();
	const inputId = $derived(id?.trim() || generatedId);
</script>

<div class="field-group">
	{#if label}
		<Label for={inputId} required={!!required}>{label}</Label>
	{/if}
	<textarea id={inputId} class={['input', className]} bind:value {required} {rows} {...rest}
	></textarea>
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
			max-width: 100%;
			min-height: calc(1lh + 2 * var(--space-5) + 2 * var(--border-width-thin));
			resize: vertical;
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
