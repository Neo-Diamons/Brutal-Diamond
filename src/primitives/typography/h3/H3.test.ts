import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import H3 from './H3.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Heading 3</span>' }));

describe('H3', () => {
	it('renders its content as a <h3>', async () => {
		render(H3, { children, 'data-testid': 'node' });
		const node = page.getByTestId('node');
		await expect.element(node).toHaveTextContent('Heading 3');
		expect(node.element().tagName).toBe('H3');
	});
});
