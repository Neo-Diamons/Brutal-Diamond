import type { StorybookConfig } from '@storybook/svelte-vite';
import { existsSync } from 'node:fs';
import path from 'node:path';

const coverageDir = path.join(import.meta.dirname, '../coverage');

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|ts|svelte)'],
	addons: [
		'@storybook/addon-svelte-csf',
		'@storybook/addon-vitest',
		'@storybook/addon-a11y',
		'@storybook/addon-docs'
	],
	staticDirs: existsSync(coverageDir) ? [{ from: coverageDir, to: '/coverage' }] : [],
	framework: '@storybook/svelte-vite',
	core: {
		disableWhatsNewNotifications: true,
		disableTelemetry: true
	},
	features: {
		sidebarOnboardingChecklist: false,
		menuOnboardingChecklist: false
	}
};
export default config;
