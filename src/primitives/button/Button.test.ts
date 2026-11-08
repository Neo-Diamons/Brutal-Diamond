import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import Button from './Button.svelte';

const label = (text: string) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('Button', () => {
	it('renders a button that calls onclick', async () => {
		const onclick = vi.fn();
		render(Button, { children: label('Save'), onclick });

		await page.getByRole('button', { name: 'Save' }).click();

		expect(onclick).toHaveBeenCalledOnce();
	});

	it('defaults to type="button" so it never submits forms by accident', async () => {
		render(Button, { children: label('Save') });
		await expect.element(page.getByRole('button')).toHaveAttribute('type', 'button');
	});

	it('applies the variant as a class', async () => {
		render(Button, { children: label('Delete'), variant: 'destructive' });
		await expect.element(page.getByRole('button')).toHaveClass('destructive');
	});

	it('renders a link when href is given', async () => {
		render(Button, { children: label('Home'), href: '/home' });
		await expect.element(page.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');
	});

	it('does not fire when disabled', async () => {
		const onclick = vi.fn();
		render(Button, { children: label('Save'), onclick, disabled: true });

		await expect.element(page.getByRole('button')).toBeDisabled();
		expect(onclick).not.toHaveBeenCalled();
	});

	it('marks a disabled link and takes it out of the tab order', async () => {
		render(Button, { children: label('Home'), href: '/home', disabled: true });

		const link = page.getByRole('link', { name: 'Home' });
		await expect.element(link).toHaveAttribute('aria-disabled', 'true');
		await expect.element(link).toHaveAttribute('tabindex', '-1');
	});

	it('does not fire onclick or navigate when a link is disabled', async () => {
		const onclick = vi.fn();
		render(Button, { children: label('Home'), href: '#nowhere', disabled: true, onclick });

		await page.getByRole('link', { name: 'Home' }).click({ force: true });

		expect(onclick).not.toHaveBeenCalled();
		expect(location.hash).not.toBe('#nowhere');
	});

	it('still fires onclick on an enabled link', async () => {
		const onclick = vi.fn((event: MouseEvent) => event.preventDefault());
		render(Button, { children: label('Home'), href: '#ok', onclick });

		await page.getByRole('link', { name: 'Home' }).click();

		expect(onclick).toHaveBeenCalledOnce();
	});
});

describe('Button theming', () => {
	it('lets unlayered CSS override component styles without !important', async () => {
		const override = document.createElement('style');
		override.textContent = '.override-me { background-color: rgb(1, 2, 3); }';
		document.head.append(override);

		try {
			render(Button, { children: label('Save'), class: 'override-me' });

			const button = page.getByRole('button').element();
			expect(getComputedStyle(button).backgroundColor).toBe('rgb(1, 2, 3)');
		} finally {
			override.remove();
		}
	});

	it('reads its shadow from the --shadow-flat token', async () => {
		render(Button, { children: label('Save'), style: '--shadow-flat: 7px 7px 0px rgb(255, 0, 0)' });

		const button = page.getByRole('button').element();
		expect(getComputedStyle(button).boxShadow).toBe('rgb(255, 0, 0) 7px 7px 0px 0px');
	});

	it('renders an icon-only button as a square named by its aria-label', async () => {
		const icon = createRawSnippet(() => ({
			render: () => '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"></svg>'
		}));
		render(Button, { icon: true, children: icon, 'aria-label': 'Menu' });

		const button = page.getByRole('button', { name: 'Menu' }).element();
		const { width, height } = button.getBoundingClientRect();
		expect(width).toBe(height);
	});

	it.each([
		['primary', '--button-primary-bg'],
		['secondary', '--button-secondary-bg'],
		['outline', '--bg-main']
	])('paints the %s variant from %s', async (variant, token) => {
		render(Button, {
			children: label('Go'),
			variant: variant as 'primary' | 'secondary' | 'outline',
			style:
				'--button-primary-bg: rgb(1, 1, 1); --button-secondary-bg: rgb(2, 2, 2); --bg-main: rgb(3, 3, 3)'
		});

		const expected = {
			'--button-primary-bg': 'rgb(1, 1, 1)',
			'--button-secondary-bg': 'rgb(2, 2, 2)',
			'--bg-main': 'rgb(3, 3, 3)'
		}[token];
		expect(getComputedStyle(page.getByRole('button').element()).backgroundColor).toBe(expected);
	});

	it('keeps the variant colour on an icon button', async () => {
		render(Button, {
			icon: true,
			variant: 'secondary',
			children: label('+'),
			style: '--button-secondary-bg: rgb(2, 2, 2)'
		});

		const button = page.getByRole('button').element();
		expect(button).toHaveClass('icon');
		expect(getComputedStyle(button).backgroundColor).toBe('rgb(2, 2, 2)');
	});

	it('greys its border and takes the shadow away when disabled', async () => {
		render(Button, {
			children: label('Save'),
			disabled: true,
			style:
				'--color-muted: rgb(1, 2, 3); --shadow-flat: 4px 4px 0 rgb(9, 9, 9); --shadow-none: 0 0 0 rgb(7, 7, 7)'
		});

		const style = getComputedStyle(page.getByRole('button').element());
		expect(style.borderTopColor).toBe('rgb(1, 2, 3)');
		expect(style.boxShadow).toBe('rgb(7, 7, 7) 0px 0px 0px 0px');
		expect(style.cursor).toBe('not-allowed');
	});

	describe('stays pressed', () => {
		const pressed = 'matrix(1, 0, 0, 1, 4, 4)';
		const transform = (name: string) =>
			getComputedStyle(page.getByRole(name === 'Page' ? 'link' : 'button', { name }).element())
				.transform;

		it('while aria-pressed is true, even when hovered', async () => {
			render(Button, {
				children: label('Toggle'),
				'aria-pressed': true,
				style: '--offset-press: 4px'
			});

			expect(transform('Toggle')).toBe(pressed);
			await page.getByRole('button', { name: 'Toggle' }).hover();
			expect(transform('Toggle')).toBe(pressed);
		});

		it('while it marks the current page', async () => {
			render(Button, {
				children: label('Page'),
				href: '#',
				'aria-current': 'page',
				style: '--offset-press: 4px'
			});

			expect(transform('Page')).toBe(pressed);
		});

		it('not otherwise', async () => {
			render(Button, { children: label('Plain') });

			expect(transform('Plain')).toBe('none');
		});
	});
});
