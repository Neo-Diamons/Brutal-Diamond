import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import H1 from './H1.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Heading 1</span>' }));

describe('H1', () => {
	it('renders its content as a <h1>', async () => {
		render(H1, { children, 'data-testid': 'node' });
		const node = page.getByTestId('node');
		await expect.element(node).toHaveTextContent('Heading 1');
		expect(node.element().tagName).toBe('H1');
	});
});
