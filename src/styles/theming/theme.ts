import { modes, themes } from './registry';

/** Name of a colour mode the library ships. */
export type Mode = keyof typeof modes;

/** Name of a theme (a design: borders, shadows, type) the library ships. */
export type Theme = keyof typeof themes;

/** Names of the themes the library ships. The default one (`DEFAULT_THEME`) needs no extra CSS. */
export const THEMES = Object.keys(themes) as Theme[];

/** Names of the colour modes the library ships. The default one (`DEFAULT_MODE`) needs no extra CSS. */
export const MODES = Object.keys(modes) as Mode[];

/** The theme used when none is set. */
export const DEFAULT_THEME: Theme = 'neo-brutalism';

/** The mode used when neither a mode nor a theme is set. */
export const DEFAULT_MODE: Mode = 'light';

/** Every shipped theme with a display label, ready for a picker. */
export const themeOptions: { value: Theme; label: string }[] = THEMES.map((value) => ({
	value,
	label: themes[value].label
}));

/** Every shipped mode with a display label, ready for a picker. */
export const modeOptions: { value: Mode; label: string }[] = MODES.map((value) => ({
	value,
	label: modes[value].label
}));

/**
 * Checks that a value is the name of a shipped theme.
 *
 * @param value - Value to test.
 * @returns Whether `value` is a {@link Theme}.
 */
export const isTheme = (value: unknown): value is Theme =>
	typeof value === 'string' && Object.hasOwn(themes, value);

/**
 * Checks that a value is the name of a shipped mode.
 *
 * @param value - Value to test.
 * @returns Whether `value` is a {@link Mode}.
 */
export const isMode = (value: unknown): value is Mode =>
	typeof value === 'string' && Object.hasOwn(modes, value);

/**
 * Reads the theme currently applied to `root`.
 *
 * @param root - Element to read the theme from.
 * @returns The applied theme, the default one when none is set.
 */
export function getTheme(root: HTMLElement = document.documentElement): Theme {
	const value = root.dataset.theme;
	return isTheme(value) ? value : DEFAULT_THEME;
}

/**
 * Reads the colour mode currently applied to `root`.
 *
 * @param root - Element to read the mode from.
 * @returns The applied mode, the theme's own mode when none is set.
 */
export function getMode(root: HTMLElement = document.documentElement): Mode {
	const value = root.dataset.mode;
	return isMode(value) ? value : themes[getTheme(root)].mode;
}

type Choice = { theme: Theme; mode: Mode | null };

/** Latest choice per root, so a slow load can't overwrite a newer one. */
const latest = new WeakMap<HTMLElement, Choice>();

/** Last choice actually applied to the DOM per root, the fallback when a load fails. */
const applied = new WeakMap<HTMLElement, Choice>();

async function commit(root: HTMLElement, patch: Partial<Choice>): Promise<void> {
	const fromDom: Choice = {
		theme: getTheme(root),
		mode: isMode(root.dataset.mode) ? root.dataset.mode : null
	};
	const choice: Choice = { ...(latest.get(root) ?? fromDom), ...patch };
	latest.set(root, choice);

	const mode = choice.mode ?? themes[choice.theme].mode;
	try {
		await Promise.all([themes[choice.theme].load(), modes[mode].load()]);
	} catch (error) {
		if (latest.get(root) === choice) latest.set(root, applied.get(root) ?? fromDom);
		throw error;
	}

	if (latest.get(root) === choice) {
		root.dataset.theme = choice.theme;
		root.dataset.mode = mode;
		applied.set(root, choice);
	}
}

/**
 * Switches the theme (the design) of `root`, fetching its CSS the first time a non-default theme is
 * used. Unless a mode was chosen with {@link setMode}, the mode follows the theme's own one.
 * When calls overlap, the last call wins, whatever order their CSS finishes loading in.
 *
 * @param theme - Theme to apply.
 * @param root - Element that receives the theme (the whole page by default).
 * @returns Resolves once the CSS is loaded and applied (or superseded by a newer call).
 */
export const setTheme = (theme: Theme, root: HTMLElement = document.documentElement) =>
	commit(root, { theme });

/**
 * Switches the colour mode of `root`, independently of the theme. Set the theme and the mode on the
 * same element.
 *
 * @param mode - Mode to apply, or `null` to follow the theme's own mode again.
 * @param root - Element that receives the mode (the whole page by default).
 * @returns Resolves once the CSS is loaded and applied (or superseded by a newer call).
 */
export const setMode = (mode: Mode | null, root: HTMLElement = document.documentElement) =>
	commit(root, { mode });
