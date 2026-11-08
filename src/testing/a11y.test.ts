import { page } from 'vitest/browser';
import axe from 'axe-core';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import '../styles/index.css';
import {
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	Confirmation,
	Dialog,
	Input,
	Link,
	List,
	Notice,
	Select,
	Textarea,
	Toast,
	Toaster,
	toaster
} from '../primitives';

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

/** Runs axe on the rendered page and returns a readable list of violations. */
async function violations(): Promise<string[]> {
	const results = await axe.run(document.body, { rules: { region: { enabled: false } } });
	return results.violations.map(
		(violation) =>
			`${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`
	);
}

afterEach(() => toaster.clear());

describe('accessibility', () => {
	it('has no violations for buttons and links, enabled or disabled', async () => {
		render(Button, { children: text('Save') });
		render(Button, { children: text('Delete'), variant: 'destructive' });
		render(Button, { children: text('Home'), href: '/home' });
		render(Button, { children: text('Gone'), href: '/gone', disabled: true });

		expect(await violations()).toEqual([]);
	});

	it('has no violations for labelled fields', async () => {
		render(Input, { label: 'Name', required: true });
		render(Textarea, { label: 'Notes' });
		render(Select, { label: 'Column', options: [{ value: 'a', label: 'A' }] });

		expect(await violations()).toEqual([]);
	});

	it('has no violations for a card with all its parts', async () => {
		render(Card, {
			children: createRawSnippet(() => ({
				render: () => '<div><p>Header</p><p>Content</p><p>Footer</p></div>'
			}))
		});
		render(CardHeader, { children: text('Header') });
		render(CardContent, { children: text('Content') });
		render(CardFooter, { children: text('Footer') });

		expect(await violations()).toEqual([]);
	});

	it('has no violations for a link', async () => {
		render(Link, { href: '/docs', children: text('Docs') });

		expect(await violations()).toEqual([]);
	});

	it('has no violations for a list', async () => {
		render(List, {
			children: createRawSnippet(() => ({
				render: () => '<li><a href="/one" aria-current="page">One</a></li><li>Two</li>'
			}))
		});

		expect(await violations()).toEqual([]);
	});

	it.each(['info', 'error'] as const)('has no violations for a %s notice', async (variant) => {
		render(Notice, { variant, children: text('Something happened') });

		expect(await violations()).toEqual([]);
	});

	it('has no violations for a named, open dialog', async () => {
		render(Dialog, { open: true, label: 'Settings', children: text('Body') });
		await expect.element(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();

		expect(await violations()).toEqual([]);
	});

	it('has no violations for an open confirmation', async () => {
		render(Confirmation, { itemName: 'Item', onconfirm: () => {} });
		await page.getByRole('button', { name: 'Delete' }).click();
		await expect.element(page.getByRole('dialog')).toBeVisible();

		expect(await violations()).toEqual([]);
	});

	it('has no violations for a toast', async () => {
		render(Toast, { children: text('Saved') });

		expect(await violations()).toEqual([]);
	});

	it('has no violations for the toaster with a pending toast', async () => {
		render(Toaster);
		toaster.push('Saved', { duration: 0, variant: 'error' });
		await expect.element(page.getByRole('alert')).toBeVisible();

		expect(await violations()).toEqual([]);
	});
});
