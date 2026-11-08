import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import Caption from './Caption.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Caption</span>' }));

describe('Caption', () => {
	it('renders its content as a <span>', async () => {
		render(Caption, { children, 'data-testid': 'node' });
		const node = page.getByTestId('node');
		await expect.element(node).toHaveTextContent('Caption');
		expect(node.element().tagName).toBe('SPAN');
	});
});
