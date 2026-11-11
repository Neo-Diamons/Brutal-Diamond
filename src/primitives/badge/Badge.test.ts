import { page } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import '../../styles/index.css';
import '../../styles/theming/themes/outline.css';
import '../../styles/theming/modes/dark.css';
import { THEMES, setTheme } from '../../styles/theming/theme';
import { contrast } from '../../testing/contrast';
import Badge from './Badge.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>New</span>' }));
const badge = () => page.getByTestId('badge');

describe('Badge', () => {
	it('renders its content', async () => {
		render(Badge, { 'data-testid': 'badge', children });

		await expect.element(badge()).toHaveTextContent('New');
	});

	it('is primary by default', async () => {
		render(Badge, { 'data-testid': 'badge', children });

		await expect.element(badge()).toHaveClass('primary');
	});

	it.each(['primary', 'secondary', 'outline', 'destructive'] as const)(
		'marks the %s variant with a class',
		async (variant) => {
			render(Badge, { 'data-testid': 'badge', variant, children });

			await expect.element(badge()).toHaveClass(variant);
		}
	);

	it('merges a custom class', async () => {
		render(Badge, { 'data-testid': 'badge', class: 'extra', children });

		await expect.element(badge()).toHaveClass('extra', 'badge');
	});

	it('applies a custom fill', async () => {
		render(Badge, { 'data-testid': 'badge', fill: 'rgb(0, 128, 0)', children });

		await expect.element(badge()).toHaveStyle({ backgroundColor: 'rgb(0, 128, 0)' });
	});

	it('keeps a consumer style next to the fill', async () => {
		render(Badge, {
			'data-testid': 'badge',
			fill: 'rgb(0, 128, 0)',
			style: 'opacity: 0.5',
			children
		});

		await expect
			.element(badge())
			.toHaveStyle({ opacity: '0.5', backgroundColor: 'rgb(0, 128, 0)' });
	});
});

const VARIANTS = ['primary', 'secondary', 'outline', 'destructive'] as const;

afterEach(() => {
	delete document.documentElement.dataset.theme;
	delete document.documentElement.dataset.mode;
});

describe.each(THEMES)('badge text alignment in the %s theme', (theme) => {
	const renderBadge = async (props: Record<string, unknown>) => {
		await setTheme(theme);
		const text = createRawSnippet(() => ({ render: () => '<span>BADGE</span>' }));
		render(Badge, { 'data-testid': 'badge', children: text, ...props });
		await document.fonts.ready;
		await expect.element(badge()).toBeVisible();
		const el = badge().element() as HTMLElement;
		const range = document.createRange();
		range.selectNodeContents(el.querySelector('span')!);
		return { el, style: getComputedStyle(el), text: range.getBoundingClientRect() };
	};

	it.each(VARIANTS)('centres the capital letters vertically in the %s variant', async (variant) => {
		const { el, style, text } = await renderBadge({ variant });
		expect(style.fontFamily).toContain('Karla');

		const context = document.createElement('canvas').getContext('2d')!;
		context.font = style.font;
		const metrics = context.measureText('BADGE');
		const baseline =
			text.top +
			(text.height - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 +
			metrics.fontBoundingBoxAscent;

		const box = el.getBoundingClientRect();
		const above =
			baseline - metrics.actualBoundingBoxAscent - box.top - parseFloat(style.borderTopWidth);
		const below = box.bottom - parseFloat(style.borderBottomWidth) - baseline;

		expect(Math.abs(above - below)).toBeLessThanOrEqual(1);
	});

	it('centres the text horizontally', async () => {
		const { el, text } = await renderBadge({ style: 'width: 200px' });
		const box = el.getBoundingClientRect();

		expect(Math.abs(text.left - box.left - (box.right - text.right))).toBeLessThanOrEqual(1);
	});
});

describe.each(THEMES)('badge legibility in the %s theme', (theme) => {
	const styleOf = async (props: Record<string, unknown>) => {
		await setTheme(theme);
		render(Badge, { 'data-testid': 'badge', children, ...props });
		await expect.element(badge()).toBeVisible();
		return getComputedStyle(badge().element());
	};

	it.each(VARIANTS)(
		'is at least 12px with readable contrast in the %s variant',
		async (variant) => {
			const style = await styleOf({ variant });

			expect(parseFloat(style.fontSize)).toBeGreaterThanOrEqual(12);
			expect(contrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
		}
	);

	it.each(['#22c55e', '#1e3a8a', '#ffffff', '#000000', '#facc15'])(
		'keeps the text readable on the custom fill %s',
		async (fill) => {
			const style = await styleOf({ fill });

			expect(contrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
		}
	);
});
