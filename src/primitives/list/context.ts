/** Context key under which `List` shares its settings with its `ListItem` children. */
export const LIST = Symbol('bd-list');

/** Settings `List` shares with its `ListItem` children. */
export type ListContext = {
	/** Whether items render a numbered badge. */
	readonly ordered: boolean;
};
