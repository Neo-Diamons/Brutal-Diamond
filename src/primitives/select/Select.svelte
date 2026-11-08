<script lang="ts" module>
	import type { HTMLSelectAttributes } from 'svelte/elements';

	/** One choice of a `Select`. */
	export type SelectOption = {
		/** Value bound to the select when this option is chosen. Unique within the list. */
		value: string;
		/** Text shown to the user. */
		label: string;
		/** Prevents choosing this option. */
		disabled?: boolean;
	};

	/** Props of `Select`, a labelled dropdown. Also accepts any `<select>` attribute but `children`. */
	export type SelectProps = Omit<HTMLSelectAttributes, 'children'> & {
		/** Text of the label shown above the select. */
		label?: string;
		/** Choices offered by the select. */
		options: SelectOption[];
	};
</script>

<script lang="ts">
	import { Label } from '../typography';

	let {
		label,
		id,
		required,
		options,
		value = $bindable(),
		class: className,
		...rest
	}: SelectProps = $props();

	const generatedId = $props.id();
	const selectId = $derived(id?.trim() || generatedId);
</script>

<div class="field-group">
	{#if label}
		<Label for={selectId} required={!!required}>{label}</Label>
	{/if}
	<div class="control">
		<select id={selectId} class={['select', className]} bind:value {required} {...rest}>
			{#each options as option (option.value)}
				<option value={option.value} disabled={option.disabled}>{option.label}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	@layer bd.components {
		.field-group {
			display: flex;
			flex-direction: column;
			width: 100%;
			gap: var(--gap-xs);
		}

		.control {
			position: relative;
			display: flex;
			--color-ink: var(--color-on-surface);
			--color-ink-inverse: var(--color-on-surface-inverse);
			--color-muted: var(--color-on-surface-muted);
			margin-bottom: var(--margin-field);
		}

		.control::after {
			content: '';
			position: absolute;
			top: 50%;
			inset-inline-end: var(--space-5);
			translate: 0 -50%;
			border-inline: var(--space-3) solid transparent;
			border-top: var(--space-3) solid var(--color-ink);
			pointer-events: none;
		}

		.select {
			appearance: none;
			width: 100%;
			padding: var(--padding-control);
			padding-inline-end: calc(var(--space-5) + 3 * var(--space-3));

			font: var(--font-field);

			color: var(--color-ink);
			background-color: var(--bg-main);

			border: var(--border-thin);
			border-radius: var(--radius-sharp);
			box-shadow: var(--shadow-flat);

			outline: var(--border-width-sm) solid transparent;
			cursor: pointer;
			transition:
				transform var(--duration-press) ease,
				box-shadow var(--duration-press) ease;
		}

		.select:focus {
			transform: translate(var(--offset-hover), var(--offset-hover));
			box-shadow: var(--shadow-focus);
		}

		.select:disabled {
			background-color: var(--bg-disabled);
			color: var(--color-muted);
			border-color: var(--color-muted);
			box-shadow: var(--shadow-none);
			cursor: not-allowed;
		}

		.control:has(.select:disabled)::after {
			border-top-color: var(--color-muted);
		}
	}
</style>
