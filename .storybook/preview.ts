/// <reference types="vite/client" />
import '../src/styles/theming/font';
import '../src/styles/index.css';
import '../src/styles/theming/themes/outline.css';
import '../src/styles/theming/modes/dark.css';
import './preview.css';
import {
	setMode,
	setTheme,
	themeOptions,
	modeOptions,
	isMode,
	isTheme
} from '../src/styles/theming/theme';
import type { Preview } from '@storybook/svelte-vite';

const preview: Preview = {
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		options: {
			storySort: { method: 'alphabetical', order: ['Overview'] }
		},
		a11y: {
			test: 'error'
		}
	},
	globalTypes: {
		theme: {
			description: 'Theme',
			toolbar: {
				title: 'Theme',
				icon: 'paintbrush',
				items: themeOptions.map(({ value, label }) => ({ value, title: label })),
				dynamicTitle: true
			}
		},
		mode: {
			description: 'Colour mode',
			toolbar: {
				title: 'Mode',
				icon: 'contrast',
				items: [
					{ value: 'auto', title: 'Theme default' },
					...modeOptions.map(({ value, label }) => ({ value, title: label }))
				],
				dynamicTitle: true
			}
		}
	},
	initialGlobals: {
		theme: import.meta.env.VITE_STORYBOOK_THEME ?? 'neo-brutalism',
		mode: import.meta.env.VITE_STORYBOOK_MODE ?? 'auto'
	},
	decorators: [
		(story, { globals }) => {
			if (isTheme(globals.theme)) setTheme(globals.theme).catch(console.error);
			setMode(isMode(globals.mode) ? globals.mode : null).catch(console.error);
			return story();
		}
	]
};

export default preview;
