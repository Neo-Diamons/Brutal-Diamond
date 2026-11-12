import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import { isDev } from '../utils/dev';
import Dialog from './Dialog.svelte';

vi.mock('../utils/dev', { spy: true });

const trigger = createRawSnippet<[{ open: () => void }]>((args) => ({
	render: () => '<button type="button">Open</button>',
	setup: (node) => {
		node.addEventListener('click', () => args().open());
	}
}));
const children = createRawSnippet(() => ({ render: () => '<p>Dialog body</p>' }));
const clickAtOrigin = new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 });

async function openDialog() {
	render(Dialog, { trigger, children, label: 'Example dialog' });
	await page.getByRole('button', { name: 'Open' }).click();
}

describe('Dialog', () => {
	it('is closed until the trigger is used', async () => {
		render(Dialog, { trigger, children, label: 'Example dialog' });
		await expect.element(page.getByText('Dialog body')).not.toBeInTheDocument();

		await page.getByRole('button', { name: 'Open' }).click();

		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect.element(page.getByText('Dialog body')).toBeVisible();
	});

	it('closes on Escape', async () => {
		await openDialog();
		await userEvent.keyboard('{Escape}');

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('closes when the backdrop is clicked', async () => {
		await openDialog();

		await page.getByRole('dialog').click({ position: { x: -10, y: -10 }, force: true });

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('stays open for a click inside it that reports coordinates outside the box', async () => {
		render(Dialog, {
			trigger,
			label: 'Example dialog',
			children: createRawSnippet(() => ({
				render: () => '<button type="button">Inside</button>',
				setup: (node) => {
					node.addEventListener('click', () => {});
				}
			}))
		});
		await page.getByRole('button', { name: 'Open' }).click();

		page.getByRole('button', { name: 'Inside' }).element().dispatchEvent(clickAtOrigin);

		await expect.element(page.getByRole('dialog')).toBeVisible();
	});

	describe('in a browser without closedby', () => {
		const prototype = HTMLDialogElement.prototype;
		const closedBy = Object.getOwnPropertyDescriptor(prototype, 'closedBy')!;

		beforeEach(() => {
			Reflect.deleteProperty(prototype, 'closedBy');
		});
		afterEach(() => {
			Object.defineProperty(prototype, 'closedBy', closedBy);
		});

		it('closes when the backdrop is clicked', async () => {
			await openDialog();

			const dialog = page.getByRole('dialog').element();
			dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			dialog.dispatchEvent(clickAtOrigin);

			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		});

		it('stays open when a press starts inside and ends on the backdrop', async () => {
			await openDialog();

			const inside = page.getByText('Dialog body').element();
			inside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			page.getByRole('dialog').element().dispatchEvent(clickAtOrigin);

			await expect.element(page.getByRole('dialog')).toBeVisible();
		});

		it('stays open when the dialog box itself is clicked', async () => {
			await openDialog();

			await page.getByText('Dialog body').click();

			await expect.element(page.getByRole('dialog')).toBeVisible();
		});

		it.each([
			['left of', -1, 0],
			['right of', 1, 0],
			['above', 0, -1],
			['below', 0, 1]
		])('closes when the backdrop is clicked %s the box', async (_side, dx, dy) => {
			await openDialog();
			const dialog = page.getByRole('dialog').element();
			const rect = dialog.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const y = rect.top + rect.height / 2;

			dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			dialog.dispatchEvent(
				new MouseEvent('click', {
					bubbles: true,
					clientX: dx === 0 ? x : dx < 0 ? rect.left - 1 : rect.right + 1,
					clientY: dy === 0 ? y : dy < 0 ? rect.top - 1 : rect.bottom + 1
				})
			);

			await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		});

		it('stays open when the dialog element is clicked inside its box', async () => {
			await openDialog();
			const dialog = page.getByRole('dialog').element();
			const rect = dialog.getBoundingClientRect();

			dialog.dispatchEvent(
				new MouseEvent('click', {
					bubbles: true,
					clientX: rect.left + rect.width / 2,
					clientY: rect.top + rect.height / 2
				})
			);

			await expect.element(page.getByRole('dialog')).toBeVisible();
		});
	});

	it('opens without a trigger when open is set', async () => {
		render(Dialog, { open: true, children, label: 'Example dialog' });

		await expect.element(page.getByRole('dialog', { name: 'Example dialog' })).toBeVisible();
	});

	it('warns in development when it has no accessible name', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		render(Dialog, { trigger, children });

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('label'));
		warn.mockRestore();
	});

	it('stays silent outside development', () => {
		vi.mocked(isDev).mockReturnValue(false);
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		render(Dialog, { trigger, children });

		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
		vi.mocked(isDev).mockRestore();
	});

	it('can be opened again after Escape', async () => {
		await openDialog();
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();

		await page.getByRole('button', { name: 'Open' }).click();

		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect.element(page.getByText('Dialog body')).toBeVisible();
	});

	it('is named by label', async () => {
		render(Dialog, { trigger, children, label: 'Settings' });
		await page.getByRole('button', { name: 'Open' }).click();

		await expect.element(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
	});

	it('is named by the element labelledby points to', async () => {
		render(Dialog, {
			trigger,
			labelledby: 'dlg-title',
			label: 'ignored',
			children: createRawSnippet(() => ({ render: () => '<h2 id="dlg-title">Profile</h2>' }))
		});
		await page.getByRole('button', { name: 'Open' }).click();

		await expect.element(page.getByRole('dialog', { name: 'Profile' })).toBeVisible();
	});

	it('calls onclose when closed', async () => {
		let closed = 0;
		render(Dialog, { trigger, children, label: 'Example dialog', onclose: () => closed++ });
		await page.getByRole('button', { name: 'Open' }).click();
		await userEvent.keyboard('{Escape}');

		await expect.poll(() => closed).toBe(1);
	});
});
