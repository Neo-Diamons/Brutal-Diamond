/// <reference types="vite/client" />
import { page } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from 'vitest-browser-svelte';

import '../styles/index.css';
import '../styles/theming/themes/outline.css';
import '../styles/theming/modes/dark.css';
import { THEMES, setTheme } from '../styles/theming/theme';
import Button from '../primitives/button/Button.svelte';
import Input from '../primitives/form/input/Input.svelte';
import Select from '../primitives/form/select/Select.svelte';
import Textarea from '../primitives/form/textarea/Textarea.svelte';

const height = (el: Element) => el.getBoundingClientRect().height;

const renderControls = () => {
	render(Input, { id: 'a', label: 'Text' });
	render(Select, { id: 'b', label: 'Choice', options: [{ value: 'x', label: 'X' }] });
	render(Textarea, { id: 'c', label: 'Notes', rows: 1 });
	render(Button, { children: createRawSnippet(() => ({ render: () => '<span>Go</span>' })) });
};

afterEach(() => {
	delete document.documentElement.dataset.theme;
	delete document.documentElement.dataset.mode;
});

describe.each(THEMES)('control height in the %s theme', (theme) => {
	it('is the same for buttons, inputs and selects, and the minimum for textareas', async () => {
		await setTheme(theme);
		renderControls();

		const button = height(page.getByRole('button', { name: 'Go' }).element());

		expect(height(page.getByLabelText('Text').element())).toBe(button);
		expect(height(page.getByLabelText('Choice').element())).toBe(button);
		expect(height(page.getByLabelText('Notes').element())).toBe(button);
	});
});

describe('control spacing', () => {
	it('leaves the same room under the field for its shadow', async () => {
		renderControls();

		const below = (el: Element) => getComputedStyle(el).marginBottom;
		const button = below(page.getByRole('button', { name: 'Go' }).element());

		expect(button).not.toBe('0px');
		expect(below(page.getByLabelText('Text').element())).toBe(button);
		expect(below(page.getByLabelText('Choice').element().parentElement!)).toBe(button);
		expect(below(page.getByLabelText('Notes').element())).toBe(button);
	});
});
