/// <reference types="vite/client" />
import { afterEach, describe, expect, it } from 'vitest';

import '../index.css';
import './themes/outline.css';
import './modes/dark.css';
import { getMode, getTheme, setMode, setTheme } from './theme';

afterEach(() => {
	delete document.documentElement.dataset.theme;
	delete document.documentElement.dataset.mode;
});

describe('theme', () => {
	it('defaults to neo-brutalism', () => {
		expect(getTheme()).toBe('neo-brutalism');
	});

	it('switches the page and loads the outline styles on demand', async () => {
		await setTheme('outline');

		expect(getTheme()).toBe('outline');
		expect(document.documentElement.dataset.theme).toBe('outline');
		expect(getComputedStyle(document.documentElement).getPropertyValue('--color-ink').trim()).toBe(
			'#f2f1ee'
		);
	});

	it('can theme a subtree only', async () => {
		const box = document.createElement('div');
		document.body.append(box);
		await setTheme('outline', box);

		expect(getTheme(box)).toBe('outline');
		expect(getTheme()).toBe('neo-brutalism');
		box.remove();
	});

	it('keeps the last requested theme when calls overlap', async () => {
		const slow = setTheme('outline');
		const fast = setTheme('neo-brutalism');
		await Promise.all([slow, fast]);

		expect(getTheme()).toBe('neo-brutalism');
	});

	it('ignores an unknown theme name on the element', () => {
		document.documentElement.dataset.theme = 'nope';
		expect(getTheme()).toBe('neo-brutalism');
	});

	it('returns to neo-brutalism', async () => {
		await setTheme('outline');
		await setTheme('neo-brutalism');
		expect(getTheme()).toBe('neo-brutalism');
	});

	it('follows the theme mode until one is chosen', async () => {
		await setTheme('outline');
		expect(getMode()).toBe('dark');

		await setMode('light');
		expect(getTheme()).toBe('outline');
		expect(getMode()).toBe('light');

		await setTheme('neo-brutalism');
		expect(getMode()).toBe('light');
		await setTheme('outline');
		expect(getMode()).toBe('light');

		await setMode(null);
		expect(getMode()).toBe('dark');
	});

	it('keeps a mode already set on the element when switching theme', async () => {
		const root = document.createElement('div');
		root.dataset.mode = 'dark';

		await setTheme('neo-brutalism', root);

		expect(getMode(root)).toBe('dark');
	});

	it('keeps the last requested mode when calls overlap', async () => {
		const slow = setMode('dark');
		const fast = setMode('light');
		await Promise.all([slow, fast]);

		expect(getMode()).toBe('light');
	});

	it('themes and modes a subtree only', async () => {
		const box = document.createElement('div');
		document.body.append(box);
		await setMode('dark', box);

		expect(getMode(box)).toBe('dark');
		expect(getMode()).toBe('light');
		box.remove();
	});
});
