import { getContext, setContext } from 'svelte';

const KEY = Symbol('accordion');

/** Shared state of an `Accordion`, read by its items. */
export type AccordionContext = {
	/** Native group name; items sharing it open one at a time. Undefined when several can be open. */
	name: string | undefined;
};

export const setAccordionContext = (context: AccordionContext) => setContext(KEY, context);

export const getAccordionContext = (): AccordionContext | undefined =>
	getContext<AccordionContext | undefined>(KEY);
