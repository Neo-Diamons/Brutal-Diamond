import path from 'node:path';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import type { Linter, Rule } from 'eslint';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import storybook from 'eslint-plugin-storybook';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

const DIRECTIVE = /^\s*(eslint|@ts-|svelte-ignore|prettier-ignore)|^\/\s*<reference/;

/** Local rule: only JSDoc blocks and tool directives may be comments */
const jsdocOnly: Rule.RuleModule = {
	meta: {
		type: 'suggestion',
		schema: [],
		messages: {
			plain: 'Only JSDoc comments are allowed; move this into a JSDoc or the commit message.'
		}
	},
	create(context) {
		return {
			Program() {
				for (const comment of context.sourceCode.getAllComments()) {
					const isJsdoc = comment.type === 'Block' && comment.value.startsWith('*');
					if (isJsdoc || DIRECTIVE.test(comment.value) || !comment.loc) continue;
					context.report({ loc: comment.loc, messageId: 'plain' });
				}
			}
		};
	}
};

const storybookRecommended = storybook.configs['flat/recommended'] as unknown as Linter.Config[];

export default defineConfig(
	includeIgnoreFile(path.resolve(import.meta.dirname, '.gitignore')),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	...storybookRecommended,
	{
		languageOptions: { globals: globals.browser },
		rules: { 'no-undef': 'off' }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		files: ['**/*.{ts,svelte}'],
		plugins: { local: { rules: { 'jsdoc-only': jsdocOnly } } },
		rules: { 'local/jsdoc-only': 'error' }
	}
);
