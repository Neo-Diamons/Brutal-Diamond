<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/** Props of `Accordion`, a stack of collapsible items. Also accepts any `<div>` attribute. */
	export type AccordionProps = HTMLAttributes<HTMLDivElement> & {
		/** Lets several items stay open at once. Defaults to `false`: opening one closes the others. */
		multiple?: boolean;
		/** The `AccordionItem`s. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { setAccordionContext } from './context';

	let {
		multiple = false,
		class: className,
		onkeydown,
		children,
		...rest
	}: AccordionProps = $props();

	const id = $props.id();
	let root: HTMLDivElement | undefined = $state();

	setAccordionContext({
		get name() {
			return multiple ? undefined : `accordion-${id}`;
		}
	});

	const isDisabled = (item: HTMLDetailsElement) =>
		item.querySelector(':scope > summary')?.getAttribute('aria-disabled') === 'true';

	/** Enabled items owned by this accordion, wherever they sit in its subtree (not nested accordions). */
	function enabledItems(): HTMLDetailsElement[] {
		const items = root!.querySelectorAll<HTMLDetailsElement>('details');
		return [...items].filter((item) => item.closest('.accordion') === root && !isDisabled(item));
	}

	/** Sets the DOM state; each item's bound `open` follows on the resulting `toggle` event. */
	function setAll(open: boolean) {
		if (!multiple) {
			if (import.meta.env?.DEV) {
				console.warn('Accordion: expandAll/collapseAll need the `multiple` prop; ignored.');
			}
			return;
		}
		for (const item of enabledItems()) item.open = open;
	}

	const MOVES: Record<string, (index: number, last: number) => number> = {
		ArrowDown: (index, last) => (index === last ? 0 : index + 1),
		ArrowUp: (index, last) => (index === 0 ? last : index - 1),
		Home: () => 0,
		End: (_, last) => last
	};

	function moveFocus(event: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		onkeydown?.(event as never);

		const move = MOVES[event.key];
		const target = event.target as HTMLElement;
		if (!move || event.defaultPrevented || !target.matches('details > summary')) return;
		const headers = enabledItems().map((item) =>
			item.querySelector<HTMLElement>(':scope > summary')!
		);

		const index = headers.indexOf(target);
		if (index === -1) return;

		event.preventDefault();
		headers[move(index, headers.length - 1)].focus();
	}

	/** Opens every enabled item. Does nothing unless `multiple` is set. */
	export function expandAll() {
		setAll(true);
	}

	/** Closes every enabled item. Does nothing unless `multiple` is set. */
	export function collapseAll() {
		setAll(false);
	}
</script>

<div class={['accordion', className]} bind:this={root} {...rest} onkeydown={moveFocus}>
	{@render children?.()}
</div>

<style>
	@layer bd.components {
		.accordion {
			display: flex;
			flex-direction: column;
			gap: var(--gap-accordion);
		}
	}
</style>
