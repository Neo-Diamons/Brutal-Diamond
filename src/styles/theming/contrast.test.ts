import { afterEach, describe, expect, it } from 'vitest';

import { contrast, token } from '../../testing/contrast';
import '../index.css';
import './themes/outline.css';
import './modes/dark.css';
import { MODES, THEMES, setMode, setTheme } from './theme';

describe('colour contrast', () => {
	afterEach(() => {
		delete document.documentElement.dataset.theme;
		delete document.documentElement.dataset.mode;
	});

	const text: [string, string][] = [
		['--color-ink', '--bg-canvas'],
		['--color-muted', '--bg-canvas'],
		['--color-required', '--bg-canvas'],
		['--color-on-surface', '--bg-main'],
		['--color-on-surface', '--bg-surface-muted'],
		['--color-on-surface', '--bg-notice'],
		['--color-on-surface', '--bg-notice-error'],
		['--color-on-surface-muted', '--bg-main'],
		['--color-on-accent', '--bg-primary'],
		['--color-on-accent', '--bg-secondary'],
		['--color-on-accent', '--bg-destructive'],
		['--color-ink-inverse', '--color-ink'],
		['--color-on-surface-inverse', '--color-on-surface'],
		['--button-primary-fg', '--button-primary-bg'],
		['--button-secondary-fg', '--button-secondary-bg'],
		['--list-secondary-fg', '--list-secondary-bg'],
		['--link-primary-fg', '--bg-canvas']
	];
	const graphics: [string, string][] = [['--color-line', '--bg-main']];

	describe.each(THEMES.flatMap((theme) => MODES.map((mode) => [theme, mode] as const)))(
		'%s in %s mode',
		(theme, mode) => {
			it('keeps text readable (4.5:1)', async () => {
				await setTheme(theme);
				await setMode(mode);
				const low = text
					.map(([fg, bg]) => [`${fg} on ${bg}`, contrast(token(fg), token(bg))] as const)
					.filter(([, ratio]) => ratio < 4.5)
					.map(([pair, ratio]) => `${pair} ${ratio.toFixed(2)}`);
				expect(low).toEqual([]);
			});

			it('keeps outlines visible (3:1)', async () => {
				await setTheme(theme);
				await setMode(mode);
				const low = graphics
					.map(([fg, bg]) => [`${fg} on ${bg}`, contrast(token(fg), token(bg))] as const)
					.filter(([, ratio]) => ratio < 3)
					.map(([pair, ratio]) => `${pair} ${ratio.toFixed(2)}`);
				expect(low).toEqual([]);
			});
		}
	);
});
