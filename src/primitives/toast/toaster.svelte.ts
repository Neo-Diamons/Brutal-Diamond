import type { ToastVariant } from './Toast.svelte';

/** Options of a toast pushed to the `toaster`. */
export type ToastOptions = {
	/** `'error'` is announced as an alert, `'info'` as a status. Defaults to `'info'`. */
	variant?: ToastVariant;
	/** Milliseconds before the toast closes itself; `0` keeps it open. Defaults to `4000`. */
	duration?: number;
};

/** A toast currently held by the `toaster`. */
export type ToastItem = Required<ToastOptions> & {
	/** Unique identifier, usable with `toaster.dismiss`. */
	id: number;
	/** Text shown in the toast. */
	message: string;
};

/** Most toasts kept on screen; the oldest ones are dropped beyond it. */
const MAX_TOASTS = 5;

class Toaster {
	/** Toasts currently on screen, oldest first. */
	items = $state<ToastItem[]>([]);
	#nextId = 0;

	/**
	 * Shows a toast below the ones already visible and returns its id.
	 * Beyond the cap the oldest toasts are dropped silently, without any dismiss callback.
	 */
	push(message: string, options: ToastOptions = {}): number {
		const id = this.#nextId++;
		this.items.push({
			id,
			message,
			variant: options.variant ?? 'info',
			duration: options.duration ?? 4000
		});
		if (this.items.length > MAX_TOASTS) this.items.splice(0, this.items.length - MAX_TOASTS);
		return id;
	}

	/** Closes the toast with this id; does nothing if it is already gone. */
	dismiss(id: number): void {
		this.items = this.items.filter((item) => item.id !== id);
	}

	/** Closes every toast. */
	clear(): void {
		this.items = [];
	}
}

/**
 * Shared toast queue; render a `Toaster` once to display it.
 * Only push from the browser, since the queue is shared between server requests.
 */
export const toaster = new Toaster();
