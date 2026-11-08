import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import '../../../styles/index.css';
import Input from '../input/Input.svelte';
import Textarea from './Textarea.svelte';

describe('Textarea', () => {
	it('reflects typed text in its value', async () => {
		render(Textarea, { placeholder: 'urls' });
		const area = page.getByPlaceholder('urls');

		await area.fill('a\nb');

		await expect.element(area).toHaveValue('a\nb');
	});

	it('associates the label with the textarea through id', async () => {
		render(Textarea, { id: 'bulk', label: 'URLs' });
		await expect.element(page.getByLabelText(/URLs/)).toBeInTheDocument();
	});

	it('labels the textarea without an id', async () => {
		render(Textarea, { label: 'Notes' });
		await expect.element(page.getByLabelText('Notes')).toBeInTheDocument();
	});

	it('marks a required textarea and its label', async () => {
		render(Textarea, { id: 'urls', label: 'URLs', required: true });

		await expect.element(page.getByLabelText(/URLs/)).toBeRequired();
		expect(document.querySelector('label[for="urls"] .required')).not.toBeNull();
	});

	it('is never shorter than an input', async () => {
		render(Input, { label: 'Text' });
		render(Textarea, { label: 'Notes', rows: 1 });

		const height = (el: Element) => el.getBoundingClientRect().height;
		const input = page.getByLabelText('Text').element();
		const area = page.getByLabelText('Notes').element();

		expect(height(area)).toBeGreaterThanOrEqual(height(input));
	});
});
