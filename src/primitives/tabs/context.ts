import { getContext } from 'svelte';

/** Context key under which `Tabs` shares its state with `TabList`, `Tab` and `TabPanel`. */
export const TABS = Symbol('bd-tabs');

/** A mounted `Tab` as seen by `TabList`. */
export type TabEntry = {
	readonly value: string;
	readonly disabled: boolean;
};

/** State `Tabs` shares with its parts. */
export type TabsContext = {
	/** Value of the selected tab. */
	readonly value: string | undefined;
	/** Button variant of the selected tab. */
	readonly variant: 'primary' | 'secondary';
	/** Layout axis of the tab list. */
	readonly orientation: 'horizontal' | 'vertical';
	/** Tabs currently mounted, in registration order. Reactive. */
	readonly tabs: readonly TabEntry[];
	/** Registers a mounted tab; returns the function that unregisters it. */
	register: (tab: TabEntry) => () => void;
	/** Selects the tab with this value. */
	select: (value: string) => void;
	/** DOM id of the tab with this value. */
	tabId: (value: string) => string;
	/** DOM id of the panel with this value. */
	panelId: (value: string) => string;
};

/**
 * Reads the state of the enclosing `Tabs`.
 *
 * @param part - Name of the calling component, used in the error message.
 * @throws When called outside a `Tabs`.
 */
export function getTabs(part: string): TabsContext {
	const tabs = getContext<TabsContext | undefined>(TABS);
	if (!tabs) throw new Error(`${part} must be used inside Tabs`);
	return tabs;
}
