/// <reference types="vite/client" />
import { page } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from 'vitest-browser-svelte';

import '../styles/theming/font';
import '../styles/index.css';
import '../styles/theming/themes/outline.css';
import '../styles/theming/modes/dark.css';
import { THEMES, setTheme } from '../styles/theming/theme';
import Button from '../primitives/button/Button.svelte';
import Input from '../primitives/form/input/Input.svelte';
import Select from '../primitives/form/select/Select.svelte';
import Textarea from '../primitives/form/textarea/Textarea.svelte';
import InputFile from '../primitives/form/input-file/InputFile.svelte';

const height = (el: Element) => el.getBoundingClientRect().height;

const renderControls = async () => {
	await document.fonts.load('13px "Karla Variable"');
	await document.fonts.load('bold 13px "Karla Variable"');
	render(Input, { id: 'a', label: 'Text' });
	render(Select, { id: 'b', label: 'Choice', options: [{ value: 'x', label: 'X' }] });
	render(Textarea, { id: 'c', label: 'Notes', rows: 1 });
	render(InputFile, { id: 'd', label: 'File', variant: 'compact' });
	render(Button, { children: createRawSnippet(() => ({ render: () => '<span>Go</span>' })) });
};

afterEach(() => {
	delete document.documentElement.dataset.theme;
	delete document.documentElement.dataset.mode;
});

describe.each(THEMES)('control height in the %s theme', (theme) => {
	it('is the same for buttons, inputs and selects, and the minimum for textareas', async () => {
		await setTheme(theme);
		await renderControls();

		const button = height(page.getByRole('button', { name: 'Go' }).element());

		expect(height(page.getByLabelText('Text').element())).toBe(button);
		expect(height(page.getByLabelText('Choice').element())).toBe(button);
		expect(height(page.getByLabelText('Notes').element())).toBe(button);
		expect(height(document.querySelector('.dropzone.compact')!)).toBe(button);
	});
});

describe.each(THEMES)('compact file input in the %s theme', (theme) => {
	it('stays as tall as a button when it holds a file', async () => {
		await setTheme(theme);
		await renderControls();
		const button = height(page.getByRole('button', { name: 'Go' }).element());
		const compact = () => height(document.querySelector('.dropzone.compact')!);
		const upload = (file: File) => page.getByLabelText('File').upload(file);

		expect(compact()).toBe(button);

		await upload(new File(['x'], 'notes.txt', { type: 'text/plain' }));
		await expect.poll(() => document.querySelector('.file')).not.toBeNull();
		expect(compact()).toBe(button);

		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 40;
		canvas.getContext('2d')!.fillRect(0, 0, 40, 40);
		const png = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!)));
		await upload(new File([png], 'dot.png', { type: 'image/png' }));
		await expect.poll(() => document.querySelector('.file img')).not.toBeNull();

		expect(compact()).toBe(button);
		const zone = document.querySelector('.dropzone.compact')!.getBoundingClientRect();
		const thumb = document.querySelector('.file img')!.getBoundingClientRect();
		expect(thumb.top).toBeGreaterThanOrEqual(zone.top);
		expect(thumb.bottom).toBeLessThanOrEqual(zone.bottom);
	});
});

describe.each(THEMES)('button with an icon in the %s theme', (theme) => {
	it('is as tall as a button without one', async () => {
		await setTheme(theme);
		const label = (text: string) =>
			createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
		render(Button, { children: label('Go') });
		render(Button, { children: label('Plain') });

		const withIcon = page.getByRole('button', { name: 'Go' }).element();
		const plain = page.getByRole('button', { name: 'Plain' }).element();
		const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		icon.setAttribute('viewBox', '0 0 32 32');
		icon.setAttribute('width', '64');
		icon.setAttribute('height', '64');
		withIcon.prepend(icon);

		expect(height(withIcon)).toBe(height(plain));
		expect(icon.getBoundingClientRect().height).toBeGreaterThan(
			parseFloat(getComputedStyle(withIcon).fontSize)
		);
	});
});

describe('control spacing', () => {
	it('leaves the same room under the field for its shadow', async () => {
		await renderControls();

		const below = (el: Element) => getComputedStyle(el).marginBottom;
		const button = below(page.getByRole('button', { name: 'Go' }).element());

		expect(button).not.toBe('0px');
		expect(below(page.getByLabelText('Text').element())).toBe(button);
		expect(below(page.getByLabelText('Choice').element().parentElement!)).toBe(button);
		expect(below(page.getByLabelText('Notes').element())).toBe(button);
	});
});
