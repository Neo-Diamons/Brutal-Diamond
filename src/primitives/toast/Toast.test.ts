import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';

import Toast from './Toast.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>Saved</span>' }));

describe('Toast', () => {
	it('renders its content as a status by default', async () => {
		render(Toast, { duration: 0, children });

		await expect.element(page.getByRole('status')).toMatchTextContent('Saved');
	});

	it('is announced as an alert when it is an error', async () => {
		render(Toast, { duration: 0, variant: 'error', children });

		await expect.element(page.getByRole('alert')).toMatchTextContent('Saved');
	});

	it('calls ondismiss after its duration', async () => {
		const ondismiss = vi.fn();
		render(Toast, { duration: 50, ondismiss, children });

		await vi.waitFor(() => expect(ondismiss).toHaveBeenCalledOnce());
	});

	it('never dismisses itself when the duration is 0', async () => {
		const ondismiss = vi.fn();
		render(Toast, { duration: 0, ondismiss, children });
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(ondismiss).not.toHaveBeenCalled();
	});

	it('does not time out while hovered', async () => {
		const ondismiss = vi.fn();
		render(Toast, { duration: 150, ondismiss, children });
		page.getByRole('status').element().dispatchEvent(new MouseEvent('mouseenter'));
		await new Promise((resolve) => setTimeout(resolve, 400));

		expect(ondismiss).not.toHaveBeenCalled();
	});

	it('stays paused while focused after the pointer leaves', async () => {
		const ondismiss = vi.fn();
		render(Toast, { duration: 150, ondismiss, children });
		const toast = page.getByRole('status').element();
		toast.dispatchEvent(new MouseEvent('mouseenter'));
		toast.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		toast.dispatchEvent(new MouseEvent('mouseleave'));
		await new Promise((resolve) => setTimeout(resolve, 400));

		expect(ondismiss).not.toHaveBeenCalled();
	});

	it('calls ondismiss from the dismiss button', async () => {
		const ondismiss = vi.fn();
		render(Toast, { duration: 0, ondismiss, children });

		await page.getByRole('button', { name: 'Dismiss' }).click();

		expect(ondismiss).toHaveBeenCalledOnce();
	});

	it('follows a duration that changes', async () => {
		const { rerender } = await render(Toast, { duration: 0, children });

		await rerender({ duration: 1000 });

		const toast = page.getByRole('status').element();
		await expect.poll(() => toast.style.getPropertyValue('--toast-duration')).toBe('1000ms');
	});

	it('merges a custom class', async () => {
		render(Toast, { duration: 0, class: 'extra', children });

		await expect.element(page.getByRole('status')).toHaveClass('extra');
	});
});
