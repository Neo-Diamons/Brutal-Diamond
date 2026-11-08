import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import Link from './Link.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Docs</span>' }));

describe('Link', () => {
	it('renders an <a> pointing to href', async () => {
		render(Link, { children, href: '/docs' });
		await expect.element(page.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
	});

	it('defaults to the primary variant', async () => {
		render(Link, { children, href: '/docs' });
		await expect.element(page.getByRole('link')).toHaveClass('primary');
	});

	it('applies the secondary variant as a class', async () => {
		render(Link, { children, href: '/docs', variant: 'secondary' });
		await expect.element(page.getByRole('link')).toHaveClass('secondary');
	});

	it.each([
		['primary', '--link-primary-fg'],
		['secondary', '--link-secondary-fg']
	])('colours the %s variant from %s', async (variant, token) => {
		render(Link, {
			children,
			href: '/docs',
			variant: variant as 'primary' | 'secondary',
			style: `${token}: rgb(1, 2, 3)`
		});
		expect(getComputedStyle(page.getByRole('link').element()).color).toBe('rgb(1, 2, 3)');
	});

	it('is underlined on hover only', async () => {
		render(Link, { children, href: '/docs' });
		const link = page.getByRole('link');
		expect(getComputedStyle(link.element()).textDecorationLine).toBe('none');
		await link.hover();
		expect(getComputedStyle(link.element()).textDecorationLine).toBe('underline');
	});
});
