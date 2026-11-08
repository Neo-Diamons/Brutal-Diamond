/**
 * Colour modes the library ships, with a display label and a `load` that fetches the mode's CSS.
 */
export const modes = {
	light: { label: 'Light', load: async () => {} },
	dark: { label: 'Dark', load: () => import('./modes/dark.css') }
} satisfies Record<string, { label: string; load: () => Promise<unknown> }>;

/**
 * Themes the library ships, with a display label, the mode they default to and a `load` that
 * fetches the theme's CSS.
 */
export const themes = {
	'neo-brutalism': {
		label: 'Neo-Brutalism',
		mode: 'light',
		load: async () => {}
	},
	outline: {
		label: 'Outline',
		mode: 'dark',
		load: () => import('./themes/outline.css')
	}
} satisfies Record<
	string,
	{ label: string; mode: keyof typeof modes; load: () => Promise<unknown> }
>;
