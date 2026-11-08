import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Input from './Input.svelte';

describe('Input', () => {
	it('associates the label with the input through id', async () => {
		render(Input, { id: 'url', label: 'Target URL' });
		await expect.element(page.getByLabelText(/Target URL/)).toBeInTheDocument();
	});

	it('labels the input without an id', async () => {
		render(Input, { label: 'Name' });
		await expect.element(page.getByLabelText('Name')).toBeInTheDocument();
	});

	it('replaces a blank id with a generated one', async () => {
		render(Input, { id: '  ', label: 'Name' });
		await expect.element(page.getByLabelText('Name')).toBeInTheDocument();
	});

	it('gives each unlabelled-id input its own id', async () => {
		render(Input, { label: 'First' });
		render(Input, { label: 'Second' });
		const first = page.getByLabelText('First').element().id;
		const second = page.getByLabelText('Second').element().id;
		expect(first).not.toBe('');
		expect(first).not.toBe(second);
	});

	it('reflects typed text in its value', async () => {
		render(Input, { placeholder: 'name' });
		const input = page.getByPlaceholder('name');

		await input.fill('diamond');

		await expect.element(input).toHaveValue('diamond');
	});

	it('marks a required input and its label', async () => {
		render(Input, { id: 'url', label: 'Target URL', required: true });

		await expect.element(page.getByLabelText(/Target URL/)).toBeRequired();
		expect(document.querySelector('label[for="url"] .required')).not.toBeNull();
	});

	it('does not mark an optional input', async () => {
		render(Input, { id: 'note', label: 'Note' });

		await expect.element(page.getByLabelText('Note')).not.toBeRequired();
		expect(document.querySelector('label[for="note"] .required')).toBeNull();
	});

	it('greys its border and drops its shadow when disabled, like a disabled button', async () => {
		render(Input, {
			placeholder: 'x',
			disabled: true,
			style: '--color-muted: rgb(1, 2, 3); --shadow-none: 0 0 0 rgb(7, 7, 7)'
		});

		const style = getComputedStyle(page.getByPlaceholder('x').element());
		expect(style.borderTopColor).toBe('rgb(1, 2, 3)');
		expect(style.boxShadow).toBe('rgb(7, 7, 7) 0px 0px 0px 0px');
	});
});
