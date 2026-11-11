import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Toaster from './Toaster.svelte';
import { toaster } from './toaster.svelte';

afterEach(async () => {
	await userEvent.unhover(document.body);
	toaster.clear();
	vi.restoreAllMocks();
});

describe('Toaster', () => {
	it('shows several toasts at the same time', async () => {
		render(Toaster);

		toaster.push('First', { duration: 0 });
		toaster.push('Second', { duration: 0, variant: 'error' });

		await expect.element(page.getByText('First')).toBeVisible();
		await expect.element(page.getByText('Second')).toBeVisible();
		await expect.element(page.getByRole('alert')).toMatchTextContent('Second');
	});

	it('shows a new toast above a modal dialog opened before it', async () => {
		render(Toaster);
		const dialog = document.createElement('dialog');
		document.body.append(dialog);
		dialog.showModal();

		toaster.push('Above', { duration: 0 });

		await expect.element(page.getByText('Above')).toBeVisible();
		const toast = document.querySelector('.toast')!.getBoundingClientRect();
		const topmost = document.elementsFromPoint(toast.left + 4, toast.top + 4);
		const toastLayer = topmost.findIndex((el) => el.closest('.toaster'));
		const dialogLayer = topmost.findIndex((el) => el === dialog);
		expect(dialogLayer === -1 || toastLayer < dialogLayer).toBe(true);
		dialog.remove();
	});

	it('removes a toast when it is dismissed', async () => {
		render(Toaster);
		toaster.push('First', { duration: 0 });
		toaster.push('Second', { duration: 0 });

		await page.getByRole('button', { name: 'Dismiss' }).first().click();

		await expect.element(page.getByText('First')).not.toBeInTheDocument();
		await expect.element(page.getByText('Second')).toBeVisible();
	});

	it('removes a toast once its duration is over', async () => {
		render(Toaster);

		toaster.push('Short', { duration: 50 });

		await expect.element(page.getByText('Short')).not.toBeInTheDocument();
	});

	it('closes its popover shortly after the last toast is gone', async () => {
		render(Toaster);
		toaster.push('Brief', { duration: 0 });
		const region = page.getByRole('region', { name: 'Notifications' });
		await expect.element(region).toBeVisible();

		toaster.clear();

		await vi.waitFor(() => expect(document.querySelector('.toaster:popover-open')).toBeNull());
	});

	it('stays closed when there is no toast to show', async () => {
		render(Toaster);

		await new Promise((resolve) => setTimeout(resolve, 250));

		expect(document.querySelector('.toaster:popover-open')).toBeNull();
	});

	it('keeps only the five most recent toasts', async () => {
		render(Toaster);

		for (let i = 1; i <= 7; i++) toaster.push(`Toast ${i}`, { duration: 0 });

		await expect.element(page.getByText('Toast 7')).toBeVisible();
		await expect.element(page.getByText('Toast 2', { exact: true })).not.toBeInTheDocument();
		await expect.element(page.getByText('Toast 3')).toBeVisible();
	});

	it('skips its animations when the user prefers reduced motion', async () => {
		vi.spyOn(window, 'matchMedia').mockImplementation(
			(query) => ({ matches: true, media: query }) as MediaQueryList
		);
		render(Toaster);

		toaster.push('Calm', { duration: 0 });
		await expect.element(page.getByText('Calm')).toBeVisible();
		await page.getByRole('button', { name: 'Dismiss' }).click();

		await expect.element(page.getByText('Calm')).not.toBeInTheDocument();
	});
});
