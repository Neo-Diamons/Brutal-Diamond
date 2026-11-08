import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import Notice from './Notice.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Nothing here yet</span>' }));

describe('Notice', () => {
	it('renders its content as a status by default', async () => {
		render(Notice, { children });

		await expect.element(page.getByRole('status')).toHaveTextContent('Nothing here yet');
	});

	it('is announced as an alert when it is an error', async () => {
		render(Notice, { variant: 'error', children });

		await expect.element(page.getByRole('alert')).toHaveTextContent('Nothing here yet');
		await expect.element(page.getByRole('status')).not.toBeInTheDocument();
	});

	it('marks the variant with a class', async () => {
		render(Notice, { variant: 'error', children });

		await expect.element(page.getByRole('alert')).toHaveClass('error');
	});

	it('merges a custom class', async () => {
		render(Notice, { class: 'extra', children });

		await expect.element(page.getByRole('status')).toHaveClass('extra');
	});
});
