import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import Label from './Label.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Label</span>' }));

describe('Label', () => {
	it('renders its content as a <label>', async () => {
		render(Label, { children, 'data-testid': 'node' });
		const node = page.getByTestId('node');
		await expect.element(node).toHaveTextContent('Label');
		expect(node.element().tagName).toBe('LABEL');
	});

	it('shows a decorative asterisk before the text when required', async () => {
		render(Label, { children, required: true, 'data-testid': 'node' });

		const node = page.getByTestId('node').element();
		const star = node.querySelector('.required');
		expect(star?.textContent).toBe('*');
		expect(star?.getAttribute('aria-hidden')).toBe('true');
		expect(node.firstElementChild).toBe(star);
	});

	it('shows no asterisk by default', async () => {
		render(Label, { children, 'data-testid': 'node' });
		expect(page.getByTestId('node').element().querySelector('.required')).toBeNull();
	});
});
