import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Confirmation from './Confirmation.svelte';

describe('Confirmation', () => {
	it('stays closed until the trigger is used', async () => {
		render(Confirmation, { itemName: 'Item', onconfirm: () => {} });

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Delete' })).toBeVisible();
	});

	it('names the item in the title', async () => {
		render(Confirmation, { itemName: 'Item', onconfirm: () => {} });
		await page.getByRole('button', { name: 'Delete' }).click();

		await expect.element(page.getByRole('heading', { name: 'Delete Item?' })).toBeVisible();
	});

	it('calls onconfirm and closes when confirmed', async () => {
		let confirmed = 0;
		render(Confirmation, { itemName: 'Item', onconfirm: () => confirmed++ });
		await page.getByRole('button', { name: 'Delete' }).click();
		await page.getByRole('button', { name: 'Confirm' }).click();

		expect(confirmed).toBe(1);
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('does not call onconfirm when cancelled', async () => {
		let confirmed = 0;
		render(Confirmation, { itemName: 'Item', onconfirm: () => confirmed++ });
		await page.getByRole('button', { name: 'Delete' }).click();
		await page.getByRole('button', { name: 'Cancel' }).click();

		expect(confirmed).toBe(0);
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('supports a custom trigger label', async () => {
		render(Confirmation, { itemName: 'Site', triggerLabel: 'Remove', onconfirm: () => {} });

		await expect.element(page.getByRole('button', { name: 'Remove' })).toBeVisible();
	});

	it('supports custom texts', async () => {
		render(Confirmation, {
			itemName: 'Site',
			title: 'Supprimer ?',
			description: 'Irréversible.',
			confirmLabel: 'Oui',
			cancelLabel: 'Non',
			onconfirm: () => {}
		});
		await page.getByRole('button', { name: 'Delete' }).click();

		await expect.element(page.getByRole('heading', { name: 'Supprimer ?' })).toBeVisible();
		await expect.element(page.getByText('Irréversible.')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Oui' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Non' })).toBeVisible();
	});

	describe('split', () => {
		const footer = () => document.querySelector('dialog .card-footer');

		it('right-aligns the buttons by default', async () => {
			render(Confirmation, { itemName: 'Item', onconfirm: () => {} });
			await page.getByRole('button', { name: 'Delete' }).click();

			expect(footer()).not.toHaveClass('split');
		});

		it('shares the width between the buttons when split', async () => {
			render(Confirmation, { itemName: 'Item', split: true, onconfirm: () => {} });
			await page.getByRole('button', { name: 'Delete' }).click();

			expect(footer()).toHaveClass('split');
		});
	});
});
