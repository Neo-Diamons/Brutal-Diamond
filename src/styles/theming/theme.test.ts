/// <reference types="vite/client" />
import { afterEach, describe, expect, it, vi } from 'vitest';

import '../index.css';
import './themes/outline.css';
import './modes/dark.css';
import './font';
import { themes } from './registry';
import { MODES, getMode, getTheme, setMode, setTheme } from './theme';

afterEach(() => {
	vi.restoreAllMocks();
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

	it.each(MODES)('sets color-scheme to the %s mode', async (mode) => {
		await setMode(mode);

		expect(getComputedStyle(document.documentElement).colorScheme).toBe(mode);
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

	it('rejects and keeps the applied theme when its CSS fails to load', async () => {
		vi.spyOn(themes.outline, 'load').mockRejectedValue(new Error('offline'));

		const root = document.createElement('div');

		await expect(setTheme('outline', root)).rejects.toThrow('offline');

		expect(getTheme(root)).toBe('neo-brutalism');
		expect(root.dataset.theme).toBeUndefined();
	});

	it('falls back to the last applied choice after a failed load', async () => {
		const root = document.createElement('div');
		await setTheme('neo-brutalism', root);
		vi.spyOn(themes.outline, 'load').mockRejectedValueOnce(new Error('offline'));

		await expect(setTheme('outline', root)).rejects.toThrow('offline');
		await setMode('dark', root);

		expect(getTheme(root)).toBe('neo-brutalism');
		expect(getMode(root)).toBe('dark');
	});

	it('does not clobber a newer choice when an older load fails', async () => {
		vi.spyOn(themes.outline, 'load').mockRejectedValueOnce(new Error('offline'));

		const failing = setTheme('outline');
		const newer = setTheme('neo-brutalism');

		await expect(failing).rejects.toThrow('offline');
		await newer;
		expect(getTheme()).toBe('neo-brutalism');
	});
});

const files = (glob: Record<string, string>) =>
	Object.entries(glob).map(([path, css]) => [path.split('/').pop()!, css] as const);

const themeFiles = files(
	import.meta.glob('./themes/*.css', { query: '?raw', import: 'default', eager: true })
);
const modeFiles = files(
	import.meta.glob('./modes/*.css', { query: '?raw', import: 'default', eager: true })
);

const themeTokens = [
	'--color-on-accent',
	'--bg-primary',
	'--bg-secondary',
	'--bg-destructive',
	'--shadow-offset',
	'--font-weight-regular',
	'--font-weight-medium',
	'--font-weight-bold',
	'--font-weight-black',
	'--tracking-wide'
];

const modeTokens = [
	'color-scheme',
	'--color-ink',
	'--color-ink-inverse',
	'--color-muted',
	'--color-required',
	'--bg-main',
	'--bg-canvas',
	'--bg-surface-muted',
	'--bg-disabled',
	'--bg-notice',
	'--bg-notice-error',
	'--bg-overlay'
];

const missing = (css: string, names: string[]) =>
	names.filter((name) => !new RegExp(`(^|[\\s{;])${name}\\s*:`).test(css));

describe('theme contract', () => {
	it.each(themeFiles)('%s defines every required theme token', (_file, css) => {
		expect(missing(css, themeTokens)).toEqual([]);
	});

	it.each(modeFiles)('%s defines every required mode token', (_file, css) => {
		expect(missing(css, modeTokens)).toEqual([]);
	});
});
