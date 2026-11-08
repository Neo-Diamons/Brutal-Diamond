import { defineConfig, type TestProjectConfiguration } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

export default defineConfig({
	logLevel: process.env.VITEST ? 'warn' : 'info',
	plugins: [svelte({ configFile: false })],
	test: {
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{ts,svelte}'],
			exclude: ['src/**/*.{test,stories}.*', 'src/**/index.ts', 'src/index.ts']
		},
		expect: {
			requireAssertions: true
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [
							{
								browser: 'chromium',
								headless: true
							}
						]
					},
					include: ['src/**/*.test.{js,ts}']
				}
			},
			{
				extends: true,
				plugins: [
					storybookTest({
						configDir: path.join(import.meta.dirname, '.storybook')
					})
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: 'chromium'
							}
						]
					}
				}
			},
			...(process.env.VITEST_STORYBOOK
				? []
				: ([
						{
							extends: true,
							define: { 'import.meta.env.VITE_STORYBOOK_THEME': JSON.stringify('outline') },
							plugins: [
								storybookTest({
									configDir: path.join(import.meta.dirname, '.storybook')
								})
							],
							test: {
								name: 'storybook-outline',
								browser: {
									enabled: true,
									headless: true,
									provider: playwright({}),
									instances: [
										{
											browser: 'chromium'
										}
									]
								}
							}
						}
					] satisfies TestProjectConfiguration[]))
		]
	}
});
