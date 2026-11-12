<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** Props of `Dialog`, a modal closed by Escape or a click on its backdrop. */
	export type DialogProps = {
		/** Whether the dialog is shown. Bindable. Defaults to `false`. */
		open?: boolean;
		/** Renders the element that opens the dialog; receives an `open` function to call. */
		trigger?: Snippet<[{ open: () => void }]>;
		/** Content of the dialog, only rendered while it is open. */
		children?: Snippet;
		/** Accessible name of the dialog, for when it has no visible heading. */
		label?: string;
		/** Id of the element that names the dialog, usually its heading. Wins over `label`. */
		labelledby?: string;
		/** Called after the dialog has closed. */
		onclose?: () => void;
	};
</script>

<script lang="ts">
	import { isDev } from '../utils/dev';

	let {
		open = $bindable(false),
		trigger,
		label,
		labelledby,
		children,
		onclose
	}: DialogProps = $props();

	$effect(() => {
		if (isDev() && !label && !labelledby) {
			console.warn('Dialog: set `label` or `labelledby` so the dialog has an accessible name.');
		}
	});

	/** Browsers with `closedby` close the dialog on a backdrop click by themselves. */
	const closesItself =
		typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

	/**
	 * Keeps the native dialog in step with `open`.
	 *
	 * @param dialog - The `<dialog>` element to synchronise.
	 */
	function syncOpen(dialog: HTMLDialogElement): void {
		$effect(() => {
			if (open && !dialog.open) dialog.showModal();
			else if (!open && dialog.open) dialog.close();
		});
	}

	/** Whether the current press began on the dialog element itself, not on its content. */
	let pressStartedOnBackdrop = false;

	/**
	 * Remembers where a press began, so a drag from the content to the backdrop doesn't close.
	 *
	 * @param event - Pointer event received by the `<dialog>` element.
	 */
	function trackPress(event: PointerEvent): void {
		pressStartedOnBackdrop = event.target === event.currentTarget;
	}

	/**
	 * Fallback for browsers without `closedby`: closes the dialog when a click lands on its
	 * backdrop, outside the dialog box.
	 *
	 * @param event - Click event received by the `<dialog>` element.
	 */
	function closeOnBackdropClick(event: MouseEvent): void {
		const dialog = event.currentTarget as HTMLDialogElement;
		const pressedOnBackdrop = pressStartedOnBackdrop;
		pressStartedOnBackdrop = false;

		if (event.target !== dialog || !pressedOnBackdrop) return;

		const rect = dialog.getBoundingClientRect();
		const inside =
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom;
		if (!inside) open = false;
	}
</script>

{@render trigger?.({ open: () => (open = true) })}

<dialog
	{@attach syncOpen}
	closedby="any"
	aria-label={labelledby ? undefined : label}
	aria-labelledby={labelledby}
	onpointerdown={closesItself ? undefined : trackPress}
	onclick={closesItself ? undefined : closeOnBackdropClick}
	onclose={() => {
		open = false;
		onclose?.();
	}}
>
	{#if open}
		{@render children?.()}
	{/if}
</dialog>

<style>
	@layer bd.components {
		dialog {
			padding: 0;
			border: none;
			background: transparent;
			max-width: max-content;
			overflow: visible;
		}

		dialog::backdrop {
			background-color: var(--bg-overlay);
			backdrop-filter: blur(var(--blur-overlay));
		}
	}
</style>
