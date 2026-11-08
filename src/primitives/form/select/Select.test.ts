import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Select from './Select.svelte';

const options = [
	{ value: 'todo', label: 'To do' },
	{ value: 'doing', label: 'Doing' },
	{ value: 'off', label: 'Off', disabled: true }
];

describe('Select', () => {
	it('labels the select without an id', async () => {
		render(Select, { label: 'Column', options });
		await expect.element(page.getByLabelText(/Column/)).toBeInTheDocument();
	});

	it('lists every option and starts on the first', async () => {
		render(Select, { id: 'col', label: 'Column', options });

		const select = page.getByLabelText(/Column/);
		await expect.element(select).toHaveValue('todo');
		await expect.element(select.getByRole('option')).toHaveLength(3);
	});

	it('changes value when another option is picked', async () => {
		render(Select, { id: 'col', label: 'Column', options });
		const select = page.getByLabelText(/Column/);

		await select.selectOptions('doing');

		await expect.element(select).toHaveValue('doing');
	});

	it('follows options that change', async () => {
		const { rerender } = await render(Select, { id: 'col', label: 'Column', options });

		await rerender({ options: [{ value: 'todo', label: 'Backlog', disabled: true }] });

		const option = page.getByRole('option', { name: 'Backlog' });
		await expect.element(option).toHaveValue('todo');
		await expect.element(option).toBeDisabled();
	});

	it('renders an option without a value as empty', async () => {
		await render(Select, {
			label: 'Column',
			options: [{ value: null as unknown as string, label: 'None' }]
		});

		await expect.element(page.getByRole('option', { name: 'None' })).toHaveValue('');
	});

	it('honours an initial value', async () => {
		render(Select, { id: 'col', label: 'Column', options, value: 'doing' });

		await expect.element(page.getByLabelText(/Column/)).toHaveValue('doing');
	});

	it('marks a required select and its label', async () => {
		render(Select, { id: 'col', label: 'Column', options, required: true });

		await expect.element(page.getByLabelText(/Column/)).toBeRequired();
		expect(document.querySelector('label[for="col"] .required')).not.toBeNull();
	});

	it('can be disabled', async () => {
		render(Select, { id: 'col', label: 'Column', options, disabled: true });

		await expect.element(page.getByLabelText(/Column/)).toBeDisabled();
	});
});
