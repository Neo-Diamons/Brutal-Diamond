<script lang="ts" module>
	/** Props of `Toaster`, the stack that displays every toast pushed to the `toaster`. */
	export type ToasterProps = {
		/** Accessible name of the notification region. Defaults to `'Notifications'`. */
		label?: string;
	};
</script>

<script lang="ts">
	import { flip } from 'svelte/animate';

	import Toast from './Toast.svelte';
	import { toaster } from './toaster.svelte';

	let { label = 'Notifications' }: ToasterProps = $props();

	let lastId = -1;

	/**
	 * Keeps the toasts above any open modal `Dialog` by reopening the popover on each new toast, and
	 * closes it shortly after the last toast leaves.
	 *
	 * @param region - The toaster element, shown as a popover.
	 */
	function keepOnTop(region: HTMLElement): void {
		$effect(() => {
			const count = toaster.items.length;
			const newestId = toaster.items.at(-1)?.id ?? lastId;

			if (newestId > lastId && region.matches(':popover-open')) region.hidePopover();
			lastId = newestId;

			const open = region.matches(':popover-open');
			if (count > 0) {
				if (!open) region.showPopover();
				return;
			}

			const timer = setTimeout(() => {
				if (region.matches(':popover-open')) region.hidePopover();
			}, 200);

			return () => clearTimeout(timer);
		});
	}
</script>

<section {@attach keepOnTop} popover="manual" aria-label={label} class="toaster">
	{#each toaster.items as item (item.id)}
		<div class="slot" animate:flip={{ duration: 200 }}>
			<Toast
				variant={item.variant}
				duration={item.duration}
				ondismiss={() => toaster.dismiss(item.id)}
			>
				{item.message}
			</Toast>
		</div>
	{/each}
</section>

<style>
	@layer bd.components {
		.toaster {
			position: fixed;
			inset: auto var(--space-9) var(--space-9) auto;
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: var(--gap-md);
			width: min(var(--width-card), calc(100vw - 2 * var(--space-9)));
			margin: 0;
			padding: 0;
			border: none;
			background: transparent;
			color: inherit;
			overflow: visible;
			pointer-events: none;
		}

		.slot {
			display: flex;
			justify-content: flex-end;
			max-width: 100%;
		}
	}
</style>
