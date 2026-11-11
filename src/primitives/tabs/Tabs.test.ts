import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet, getContext, mount, unmount, type Component, type Snippet } from 'svelte';

import '../../styles/index.css';
import '../../styles/theming/themes/outline.css';
import '../../styles/theming/modes/dark.css';
import { THEMES, setTheme } from '../../styles/theming/theme';
import Button from '../button/Button.svelte';
import { TABS } from './context';
import Tab from './Tab.svelte';
import TabList from './TabList.svelte';
import TabPanel from './TabPanel.svelte';
import Tabs from './Tabs.svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = [component: Component<any>, props: Record<string, unknown>, children?: Node[]];

/** `Tab` instances mounted by `snippetOf`, so tests can unmount one like an `{#if}` would. */
const mounted = new Map<string, Record<string, unknown>>();

/**
 * Builds a snippet that mounts `nodes` into the enclosing `Tabs`, since a raw snippet can only
 * emit HTML and the parts need the `Tabs` context.
 */
function snippetOf(nodes: Node[]): Snippet {
	return createRawSnippet(() => ({
		render: () => '<div style="display: contents"></div>',
		setup: (host) => {
			const context = new Map([[TABS, getContext(TABS)]]);
			const instances = nodes.map(([component, props, children]) => {
				const instance = mount(component, {
					target: host,
					context,
					props: { ...props, ...(children && { children: snippetOf(children) }) }
				});
				if (component === Tab) mounted.set(String(props.value), instance);
				return instance;
			});
			return () => instances.forEach((instance) => unmount(instance));
		}
	}));
}

const tab = (value: string, label: string, props = {}): Node => [
	Tab,
	{ value, ...props, children: createRawSnippet(() => ({ render: () => `<span>${label}</span>` })) }
];
const panel = (value: string, text: string): Node => [
	TabPanel,
	{ value, children: createRawSnippet(() => ({ render: () => `<span>${text}</span>` })) }
];

type Options = {
	disableAlpha?: boolean;
	listProps?: Record<string, unknown>;
	betaProps?: Record<string, unknown>;
	extra?: Node[];
};

/** Renders Alpha, Beta and a disabled Gamma. `props` is passed through so bindings keep working. */
function renderTabs(props: Record<string, unknown> = {}, options: Options = {}) {
	props.children = snippetOf([
		[
			TabList,
			{ 'aria-label': 'Letters', ...options.listProps },
			[
				tab('a', 'Alpha', { disabled: options.disableAlpha }),
				tab('b', 'Beta', options.betaProps),
				tab('c', 'Gamma', { disabled: true }),
				...(options.extra ?? [])
			]
		],
		panel('a', 'Panel A'),
		panel('b', 'Panel B'),
		panel('c', 'Panel C')
	]);
	return render(Tabs, props);
}

const alpha = () => page.getByRole('tab', { name: 'Alpha' });
const beta = () => page.getByRole('tab', { name: 'Beta' });
const height = (el: Element) => el.getBoundingClientRect().height;

afterEach(() => {
	mounted.clear();
	delete document.documentElement.dataset.theme;
	delete document.documentElement.dataset.mode;
});

describe('Tabs', () => {
	it('selects the tab matching value and shows its panel', async () => {
		renderTabs({ value: 'b' });

		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
		await expect.element(alpha()).toHaveAttribute('aria-selected', 'false');
		await expect.element(page.getByRole('tabpanel')).toHaveTextContent('Panel B');
	});

	it('lets the tablist onkeydown cancel arrow navigation', async () => {
		const onkeydown = vi.fn((event: KeyboardEvent) => event.preventDefault());
		renderTabs({ value: 'a' }, { listProps: { onkeydown } });

		alpha().element().focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(onkeydown).toHaveBeenCalled();
		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
	});

	it('ignores keys pressed on the list or on a disabled tab', async () => {
		renderTabs({ value: 'a' });
		const press = (target: Element) =>
			target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

		press(page.getByRole('tablist').element());
		press(page.getByRole('tab', { name: 'Gamma' }).element());

		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
	});

	it('switches panel on click', async () => {
		renderTabs({ value: 'a' });

		await beta().click();

		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByRole('tabpanel')).toHaveTextContent('Panel B');
	});

	it('propagates the selection to a bound value', async () => {
		let value: string | undefined = 'a';
		renderTabs({
			get value() {
				return value;
			},
			set value(next) {
				value = next;
			}
		});

		await beta().click();

		expect(value).toBe('b');
	});

	it('links tabs and panels through ARIA', async () => {
		renderTabs({ value: 'a' });

		const tabEl = alpha().element();
		const panelEl = page.getByRole('tabpanel').element();
		expect(tabEl.getAttribute('aria-controls')).toBe(panelEl.id);
		expect(panelEl.getAttribute('aria-labelledby')).toBe(tabEl.id);
	});

	it('keeps only the selected tab in the tab order', async () => {
		renderTabs({ value: 'a' });

		await expect.element(alpha()).toHaveAttribute('tabindex', '0');
		await expect.element(beta()).toHaveAttribute('tabindex', '-1');
	});

	it('builds valid ids from values with spaces', async () => {
		renderTabs({ value: 'a b' }, { extra: [tab('a b', 'Spaced'), panel('a b', 'Panel spaced')] });

		const spaced = page.getByRole('tab', { name: 'Spaced' }).element();
		expect(spaced.id).not.toMatch(/\s/);
		expect(page.getByRole('tabpanel').element().getAttribute('aria-labelledby')).toBe(spaced.id);
	});

	it('warns about duplicate values', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		renderTabs({ value: 'a' }, { extra: [tab('b', 'Beta again')] });

		await expect.element(page.getByRole('tab', { name: 'Beta again' })).toBeInTheDocument();
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate Tab value "b"'));
		warn.mockRestore();
	});

	it('still calls a consumer onclick on a tab', async () => {
		const onclick = vi.fn();
		renderTabs({ value: 'a' }, { betaProps: { onclick } });

		await beta().click();

		expect(onclick).toHaveBeenCalledOnce();
		await expect.element(page.getByRole('tabpanel')).toHaveTextContent('Panel B');
	});
});

describe('Tabs keyboard', () => {
	it('moves selection with the arrow keys, wrapping and skipping disabled tabs', async () => {
		renderTabs({ value: 'a' });

		alpha().element().focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
	});

	it('jumps with Home and End', async () => {
		renderTabs({ value: 'a' });

		alpha().element().focus();
		await userEvent.keyboard('{End}');
		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{Home}');
		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
	});

	it('uses ArrowUp/ArrowDown, and ignores ArrowLeft/ArrowRight, when vertical', async () => {
		renderTabs({ value: 'a', orientation: 'vertical' });

		await expect.element(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
		alpha().element().focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{ArrowUp}');
		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
	});

	it('ignores ArrowUp/ArrowDown when horizontal', async () => {
		renderTabs({ value: 'a' });

		alpha().element().focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
	});

	it('lays vertical tabs out in a column beside the panel', async () => {
		renderTabs({ value: 'a', orientation: 'vertical' });

		const list = page.getByRole('tablist').element();
		const panelEl = page.getByRole('tabpanel').element();
		expect(getComputedStyle(list).flexDirection).toBe('column');
		expect(list.getBoundingClientRect().right).toBeLessThanOrEqual(
			panelEl.getBoundingClientRect().left
		);
	});

	it.each(['horizontal', 'vertical'])(
		'keeps the selected tab in place when %s',
		async (orientation) => {
			renderTabs({ value: 'b', orientation });

			await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
			await expect.poll(() => getComputedStyle(beta().element()).transform).toBe('none');
		}
	);

	it('mirrors the arrow keys in a right-to-left list', async () => {
		renderTabs({ value: 'a' }, { listProps: { dir: 'rtl' }, extra: [tab('d', 'Delta')] });

		alpha().element().focus();
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{ArrowRight}');
		await expect
			.element(page.getByRole('tab', { name: 'Delta' }))
			.toHaveAttribute('aria-selected', 'true');
	});

	it('keeps arrow navigation when the tablist has its own onkeydown', async () => {
		const onkeydown = vi.fn();
		renderTabs({ value: 'a' }, { listProps: { onkeydown } });

		alpha().element().focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(onkeydown).toHaveBeenCalled();
		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
	});

	it('keeps the tablist role', async () => {
		renderTabs({ value: 'a' }, { listProps: { role: 'group' } });

		await expect.element(page.getByRole('tablist')).toBeInTheDocument();
	});
});

describe('outside Tabs', () => {
	it.each([
		['Tab', Tab],
		['TabList', TabList],
		['TabPanel', TabPanel]
	] as const)('throws when %s has no enclosing Tabs', (name, component) => {
		const target = document.createElement('div');

		expect(() => mount(component, { target, props: { value: 'a' } })).toThrow(
			`${name} must be used inside Tabs`
		);
	});
});

describe('Tabs defaults', () => {
	it('selects the first enabled tab when no value is given', async () => {
		renderTabs({ value: undefined });

		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
		await expect.element(alpha()).toHaveAttribute('tabindex', '0');
		await expect.element(page.getByRole('tabpanel')).toHaveTextContent('Panel A');
	});

	it('falls back to the first enabled tab when value matches nothing', async () => {
		renderTabs({ value: 'missing' });

		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');
	});

	it('skips a disabled tab when picking the fallback', async () => {
		renderTabs({ value: 'a' }, { disableAlpha: true });

		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
		await expect.element(beta()).toHaveAttribute('tabindex', '0');
	});

	it('selects nothing when every tab is disabled', async () => {
		const props = {
			children: snippetOf([
				[TabList, { 'aria-label': 'Letters' }, [tab('a', 'Alpha', { disabled: true })]]
			])
		};
		render(Tabs, props);

		await expect.element(alpha()).toHaveAttribute('aria-selected', 'false');
	});

	it('moves selection when the selected tab is removed', async () => {
		renderTabs({ value: 'a' });
		await expect.element(alpha()).toHaveAttribute('aria-selected', 'true');

		unmount(mounted.get('a')!);

		await expect.element(beta()).toHaveAttribute('aria-selected', 'true');
	});
});

describe.each(THEMES)('tabs in the %s theme', (theme) => {
	it.each(['primary', 'secondary'] as const)('are as tall as a button (%s)', async (variant) => {
		await setTheme(theme);
		render(Button, { children: createRawSnippet(() => ({ render: () => '<span>Go</span>' })) });
		renderTabs({ value: 'a', variant });

		const button = height(page.getByRole('button', { name: 'Go' }).element());

		for (const el of [alpha().element(), beta().element()]) expect(height(el)).toBe(button);
	});

	it('draws a solid border on unselected tabs', async () => {
		await setTheme(theme);
		renderTabs({ value: 'a' });

		expect(getComputedStyle(beta().element()).borderTopStyle).toBe('solid');
	});
});
