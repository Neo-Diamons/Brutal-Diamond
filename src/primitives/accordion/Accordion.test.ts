import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import '../../styles/index.css';
import '../../styles/theming/themes/outline.css';
import '../../styles/theming/modes/dark.css';
import { THEMES, setTheme } from '../../styles/theming/theme';
import { contrast } from '../../testing/contrast';
import Accordion from './Accordion.svelte';
import AccordionHarness from './AccordionHarness.test.svelte';
import AccordionItem from './AccordionItem.svelte';

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('AccordionItem', () => {
	it('is collapsed by default', async () => {
		render(AccordionItem, { title: 'Step 1', children: text('Details') });

		await expect.element(page.getByText('Details')).not.toBeVisible();
	});

	it('can start open', async () => {
		render(AccordionItem, { title: 'Step 1', open: true, children: text('Details') });

		await expect.element(page.getByText('Details')).toBeVisible();
	});

	it('toggles on click', async () => {
		render(AccordionItem, { title: 'Step 1', children: text('Details') });

		await page.getByText('Step 1').click();
		await expect.element(page.getByText('Details')).toBeVisible();
		await page.getByText('Step 1').click();
		await expect.element(page.getByText('Details')).not.toBeVisible();
	});

	it('toggles from the keyboard', async () => {
		render(AccordionItem, { title: 'Step 1', children: text('Details') });

		await userEvent.tab();
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByText('Details')).toBeVisible();
	});

	it('renders the aside content in the header', async () => {
		render(AccordionItem, { title: 'Step 1', aside: text('OK'), children: text('Details') });

		await expect.element(page.getByText('OK')).toBeVisible();
	});

	it('merges a custom class', async () => {
		render(AccordionItem, {
			title: 'Step 1',
			class: 'extra',
			'data-testid': 'item',
			children: text('Details')
		});

		await expect.element(page.getByTestId('item')).toHaveClass('extra', 'item');
	});
});

describe('Accordion keyboard navigation', () => {
	const focused = () => document.activeElement?.textContent?.trim();

	it('moves focus to the next and previous header with the arrow keys', async () => {
		render(AccordionHarness, {});
		page.getByText('First').element().closest('summary')!.focus();

		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe('Second');
		await userEvent.keyboard('{ArrowUp}');
		expect(focused()).toBe('First');
	});

	it('wraps around at both ends', async () => {
		render(AccordionHarness, {});
		page.getByText('First').element().closest('summary')!.focus();

		await userEvent.keyboard('{ArrowUp}');
		expect(focused()).toBe('Second');
		await userEvent.keyboard('{ArrowDown}');
		expect(focused()).toBe('First');
	});

	it('jumps to the first and last header with Home and End', async () => {
		render(AccordionHarness, { multiple: true });
		page.getByText('Second').element().closest('summary')!.focus();

		await userEvent.keyboard('{End}');
		expect(focused()).toBe('Second');
		await userEvent.keyboard('{Home}');
		expect(focused()).toBe('First');
	});

	it('keeps an open item open while moving focus', async () => {
		render(AccordionHarness, { multiple: true });
		await page.getByText('First').click();
		await userEvent.keyboard('{ArrowDown}');

		expect(focused()).toBe('Second');
		await expect.element(page.getByText('First body')).toBeVisible();
	});

	it('leaves the keys alone on a disabled header', async () => {
		render(AccordionHarness, {});
		const third = page.getByText('Third').element().closest('summary')!;
		third.focus();

		await userEvent.keyboard('{ArrowUp}');

		expect(document.activeElement).toBe(third);
	});

	it('keeps the consumer keydown handler', async () => {
		const calls: string[] = [];
		render(Accordion, {
			onkeydown: (event: KeyboardEvent) => calls.push(event.key),
			children: createRawSnippet(() => ({ render: () => '<span>x</span>' }))
		});
		page
			.getByText('x')
			.element()
			.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

		expect(calls).toEqual(['a']);
	});
});

describe('Accordion expand and collapse all', () => {
	const bodies = ['First body', 'Second body'];

	it('opens every enabled item with expandAll', async () => {
		render(AccordionHarness, { multiple: true });

		await page.getByRole('button', { name: 'api expand' }).click();

		for (const body of bodies) await expect.element(page.getByText(body)).toBeVisible();
		await expect.element(page.getByText('Third body')).not.toBeVisible();
	});

	it('closes every item with collapseAll', async () => {
		render(AccordionHarness, { multiple: true });
		await page.getByRole('button', { name: 'api expand' }).click();

		await page.getByRole('button', { name: 'api collapse' }).click();

		for (const body of bodies) await expect.element(page.getByText(body)).not.toBeVisible();
	});

	it('updates bound open values', async () => {
		render(AccordionHarness, { multiple: true });

		await page.getByRole('button', { name: 'api expand' }).click();
		await expect.element(page.getByTestId('state')).toHaveTextContent('open-1=true open-2=true');
		await page.getByRole('button', { name: 'api collapse' }).click();
		await expect.element(page.getByTestId('state')).toHaveTextContent('open-1=false open-2=false');
	});

	it('warns in development when used without multiple', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(AccordionHarness, {});

		await page.getByRole('button', { name: 'api expand' }).click();

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('multiple'));
		warn.mockRestore();
	});

	it('stays silent outside development', async () => {
		vi.stubEnv('DEV', false);
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(AccordionHarness, {});

		await page.getByRole('button', { name: 'api expand' }).click();

		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
		vi.unstubAllEnvs();
	});

	it('does nothing through the API without multiple', async () => {
		render(AccordionHarness, {});

		await page.getByRole('button', { name: 'api expand' }).click();
		await expect.element(page.getByText('Second body')).not.toBeVisible();
	});
});

describe('AccordionItem title', () => {
	it('renders a snippet as the title', async () => {
		render(AccordionItem, {
			title: createRawSnippet(() => ({ render: () => '<em>Rich title</em>' })),
			children: text('Details')
		});

		await expect.element(page.getByText('Rich title')).toBeVisible();
	});

	it('is not a heading by default', async () => {
		render(AccordionItem, { title: 'Step 1', children: text('Details') });

		expect(page.getByRole('heading').elements()).toHaveLength(0);
	});

	it.each([2, 3, 6] as const)('is a level %i heading with level', async (level) => {
		render(AccordionItem, { title: 'Step 1', level, children: text('Details') });

		await expect.element(page.getByRole('heading', { name: 'Step 1', level })).toBeVisible();
	});
});

describe('disabled AccordionItem', () => {
	it('does not open on click', async () => {
		render(AccordionItem, { title: 'Step 1', disabled: true, children: text('Details') });

		await page.getByText('Step 1').click({ force: true });
		await expect.element(page.getByText('Details')).not.toBeVisible();
	});

	it('does not open from the keyboard', async () => {
		render(AccordionItem, { title: 'Step 1', disabled: true, children: text('Details') });

		await userEvent.tab();
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByText('Details')).not.toBeVisible();
	});

	it('exposes aria-disabled', async () => {
		render(AccordionItem, {
			title: 'Step 1',
			disabled: true,
			children: text('Details')
		});

		expect(document.querySelector('summary')).toHaveAttribute('aria-disabled', 'true');
	});

	it('reverts a toggle made from the DOM', async () => {
		render(AccordionItem, { title: 'Step 1', disabled: true, children: text('Details') });
		const details = document.querySelector('details')!;

		details.open = true;

		await expect.poll(() => details.open).toBe(false);
	});

	it('can still start open', async () => {
		render(AccordionItem, {
			title: 'Step 1',
			disabled: true,
			open: true,
			children: text('Details')
		});

		await expect.element(page.getByText('Details')).toBeVisible();
	});
});

describe('Accordion', () => {
	it('closes the other items when one opens', async () => {
		render(AccordionHarness, {});

		await page.getByText('First').click();
		await page.getByText('Second').click();

		await expect.element(page.getByText('First body')).not.toBeVisible();
		await expect.element(page.getByText('Second body')).toBeVisible();
	});

	it('keeps several items open with multiple', async () => {
		render(AccordionHarness, { multiple: true });

		await page.getByText('First').click();
		await page.getByText('Second').click();

		await expect.element(page.getByText('First body')).toBeVisible();
		await expect.element(page.getByText('Second body')).toBeVisible();
	});

	it('reflects the open state in a bound value', async () => {
		render(AccordionHarness, {});

		await page.getByText('First').click();
		await expect.element(page.getByTestId('state')).toHaveTextContent('open-1=true open-2=false');
		await page.getByText('Second').click();
		await expect.element(page.getByTestId('state')).toHaveTextContent('open-1=false open-2=true');
	});

	it('merges a custom class', async () => {
		render(Accordion, { class: 'extra', 'data-testid': 'acc' });

		await expect.element(page.getByTestId('acc')).toHaveClass('extra', 'accordion');
	});
});

afterEach(() => {
	delete document.documentElement.dataset.theme;
	delete document.documentElement.dataset.mode;
});

describe.each(THEMES)('accordion legibility in the %s theme', (theme) => {
	it.each(['light', 'dark'] as const)('has readable header text in %s mode', async (mode) => {
		await setTheme(theme);
		document.documentElement.dataset.mode = mode;
		render(AccordionItem, { title: 'Step 1', 'data-testid': 'item', children: text('Details') });
		const summary = document.querySelector('summary')!;
		const item = page.getByTestId('item').element();

		const rest = getComputedStyle(summary);
		expect(contrast(rest.color, getComputedStyle(item).backgroundColor)).toBeGreaterThanOrEqual(
			4.5
		);

		await page.getByText('Step 1').hover();
		await expect.poll(() => getComputedStyle(summary).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		const hover = getComputedStyle(summary);
		expect(contrast(hover.color, hover.backgroundColor)).toBeGreaterThanOrEqual(4.5);
	});

	it('is flat in the outline theme only', async () => {
		await setTheme(theme);
		render(AccordionItem, { title: 'Step 1', 'data-testid': 'item', children: text('Details') });

		const shadow = getComputedStyle(page.getByTestId('item').element()).boxShadow;

		expect(shadow === 'none').toBe(theme === 'outline');
	});
});
