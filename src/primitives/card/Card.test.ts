import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import { Card, CardContent, CardFooter, CardHeader, CardMedia } from '.';

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('Card', () => {
	it('renders its slots', async () => {
		render(Card, { 'data-testid': 'card', children: text('card body') });
		await expect.element(page.getByTestId('card')).toHaveTextContent('card body');

		for (const [Part, name] of [
			[CardHeader, 'Header'],
			[CardContent, 'Content'],
			[CardFooter, 'Footer']
		] as const) {
			render(Part, { children: text(name) });
			await expect.element(page.getByText(name)).toBeInTheDocument();
		}
	});

	it('merges a custom class', async () => {
		render(Card, { class: 'custom', 'data-testid': 'card', children: text('x') });
		await expect.element(page.getByTestId('card')).toHaveClass('card', 'custom');
	});
});

describe('CardFooter', () => {
	it('is not split by default', async () => {
		render(CardFooter, { 'data-testid': 'footer', children: text('x') });
		await expect.element(page.getByTestId('footer')).not.toHaveClass('split');
	});

	it('splits the width equally between its buttons', async () => {
		const buttons = createRawSnippet(() => ({
			render: () =>
				'<span><button type="button" class="btn">One</button><button type="button" class="btn">Two</button></span>'
		}));
		render(CardFooter, { split: true, 'data-testid': 'footer', children: buttons });

		await expect.element(page.getByTestId('footer')).toHaveClass('split');
		await expect.element(page.getByTestId('footer')).toHaveStyle({ display: 'grid' });
	});
});

describe('CardMedia', () => {
	it('shows the image when src loads', async () => {
		render(CardMedia, { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', alt: 'Preview' });
		await expect.element(page.getByRole('img', { name: 'Preview' })).toBeInTheDocument();
	});

	it('falls back to a placeholder when there is no src', async () => {
		render(CardMedia, { alt: 'Preview' });
		await expect.element(page.getByText('📷 Preview')).toBeVisible();
	});

	it('falls back to a placeholder when the image fails to load', async () => {
		render(CardMedia, { src: '/definitely-missing.jpg', alt: 'Preview' });
		await expect.element(page.getByText('📷 Preview')).toBeVisible();
	});

	it('updates the placeholder text when alt changes', async () => {
		const { rerender } = await render(CardMedia, { alt: 'Preview' });

		await rerender({ alt: 'Cover' });

		await expect.element(page.getByText('📷 Cover')).toBeVisible();
	});
});
