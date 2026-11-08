import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import P from './P.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Body copy</span>' }));

describe('P', () => {
	it('renders its content as a <p>', async () => {
		render(P, { children, 'data-testid': 'node' });
		const node = page.getByTestId('node');
		await expect.element(node).toHaveTextContent('Body copy');
		expect(node.element().tagName).toBe('P');
	});
});
