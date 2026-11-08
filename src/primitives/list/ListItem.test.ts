import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import { LIST } from './context';
import ListItem from './ListItem.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Inbox</span>' }));

describe('ListItem', () => {
	it('shows the badge and content', async () => {
		render(ListItem, { badge: '3', children });

		await expect.element(page.getByText('3')).toBeInTheDocument();
		await expect.element(page.getByText('Inbox')).toBeInTheDocument();
	});

	it('exposes the active state to assistive tech', async () => {
		render(ListItem, { active: true, children });
		await expect.element(page.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
	});

	it('shows a second line under the content', async () => {
		render(ListItem, { description: 'Three unread', children });

		await expect.element(page.getByText('Three unread')).toBeVisible();
	});

	it('is a real link when given an href', async () => {
		render(ListItem, {
			props: { href: '/docs', target: '_blank', rel: 'noreferrer noopener', children }
		});

		const link = page.getByRole('link', { name: 'Inbox' });
		await expect.element(link).toHaveAttribute('href', '/docs');
		await expect.element(link).toHaveAttribute('target', '_blank');
		await expect.element(link).toHaveAttribute('rel', 'noreferrer noopener');
		await expect.element(page.getByRole('button')).not.toBeInTheDocument();
	});

	it('marks an active link as the current page', async () => {
		render(ListItem, { href: '/docs', active: true, children });

		const link = page.getByRole('link', { name: 'Inbox' });
		await expect.element(link).toHaveAttribute('aria-current', 'page');
		await expect.element(link).not.toHaveAttribute('aria-pressed');
	});

	it('shows a badge and a description on a link as on a button', async () => {
		render(ListItem, { href: '/docs', badge: '3', description: 'Three unread', children });

		const link = page.getByRole('link');
		await expect.element(link.getByText('3')).toBeVisible();
		await expect.element(link.getByText('Three unread')).toBeVisible();
	});

	it('calls onclick', async () => {
		const onclick = vi.fn();
		render(ListItem, { onclick, children });

		await page.getByRole('button').click();

		expect(onclick).toHaveBeenCalledOnce();
	});

	it('calls onclick on a link', async () => {
		const onclick = vi.fn((event: MouseEvent) => event.preventDefault());
		render(ListItem, { href: '/docs', onclick, children });

		await page.getByRole('link').click();

		expect(onclick).toHaveBeenCalledOnce();
	});

	describe('inside an ordered list', () => {
		const context = new Map([[LIST, { ordered: true }]]);
		const row = () => page.getByRole('listitem').element();

		it('shows its number when it has no badge', async () => {
			render(ListItem, { props: { children }, context });

			const number = row().querySelector('.badge.number')!;
			expect(getComputedStyle(number, '::before').content).toBe('counter(bd-list-item)');
		});

		it('keeps its own badge instead of a number, but still counts', async () => {
			render(ListItem, { props: { badge: '★', children }, context });

			expect(row().querySelector('.number')).toBeNull();
			expect(getComputedStyle(row()).counterIncrement).toBe('bd-list-item 1');
		});

		it('numbers links the same way as buttons', async () => {
			render(ListItem, { props: { href: '/docs', children }, context });
			expect(row().querySelector('a .badge.number')).not.toBeNull();
		});
	});

	it('adds no number outside an ordered list', async () => {
		render(ListItem, { children });
		expect(page.getByRole('listitem').element().querySelector('.badge')).toBeNull();
	});
});
