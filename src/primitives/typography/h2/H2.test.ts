import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import H2 from './H2.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Heading 2</span>' }));

describe('H2', () => {
	it('renders its content as a <h2>', async () => {
		render(H2, { children, 'data-testid': 'node' });
		const node = page.getByTestId('node');
		await expect.element(node).toHaveTextContent('Heading 2');
		expect(node.element().tagName).toBe('H2');
	});
});
