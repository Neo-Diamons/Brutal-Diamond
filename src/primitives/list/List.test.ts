import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import List from './List.svelte';

const children = createRawSnippet(() => ({ render: () => '<li>First</li>' }));

describe('List', () => {
	it('renders an ordered list with its children', async () => {
		render(List, { children });

		await expect.element(page.getByRole('list')).toBeInTheDocument();
		expect(page.getByRole('listitem').elements()).toHaveLength(1);
	});

	it.each([
		['primary', 'rgb(1, 1, 1)'],
		['secondary', 'rgb(2, 2, 2)']
	] as const)('colours the active item from the %s tier', async (variant, colour) => {
		render(List, {
			children,
			variant,
			style: '--button-primary-bg: rgb(1, 1, 1); --list-secondary-bg: rgb(2, 2, 2)'
		});

		const list = page.getByRole('list').element();
		const probe = document.createElement('i');
		probe.style.background = 'var(--list-current)';
		list.append(probe);
		expect(getComputedStyle(probe).backgroundColor).toBe(colour);
		probe.remove();
	});

	it('defaults to the primary tier', async () => {
		render(List, { children });
		await expect.element(page.getByRole('list')).toHaveClass('primary');
	});

	it('resets the item counter when ordered', async () => {
		render(List, { children, ordered: true });
		expect(getComputedStyle(page.getByRole('list').element()).counterReset).toBe('bd-list-item 0');
	});

	it('starts counting from the start attribute', async () => {
		render(List, { children, ordered: true, start: 5 });

		const list = page.getByRole('list').element();
		expect(list).toHaveAttribute('start', '5');
		expect(getComputedStyle(list).counterReset).toBe('bd-list-item 4');
	});

	it('does not count when unordered', async () => {
		render(List, { children });
		expect(getComputedStyle(page.getByRole('list').element()).counterReset).toBe('none');
	});
});
