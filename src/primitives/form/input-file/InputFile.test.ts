import { page } from 'vitest/browser';
import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import InputFile from './InputFile.svelte';

const text = (name: string, content = 'hello') => new File([content], name, { type: 'text/plain' });

const pixel = () =>
	new File(
		[
			Uint8Array.from(
				atob(
					'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
				),
				(c) => c.charCodeAt(0)
			)
		],
		'dot.png',
		{ type: 'image/png' }
	);

describe('InputFile', () => {
	it('associates the label with the file input', async () => {
		render(InputFile, { id: 'cv', label: 'Resume' });
		const input = page.getByLabelText('Resume');

		await expect.element(input).toBeInTheDocument();
		expect(input.element().getAttribute('type')).toBe('file');
	});

	it('gives each input its own generated id', async () => {
		render(InputFile, { label: 'First' });
		render(InputFile, { label: 'Second' });
		const first = page.getByLabelText('First').element().id;
		const second = page.getByLabelText('Second').element().id;
		expect(first).not.toBe('');
		expect(first).not.toBe(second);
	});

	it('prompts for one file or several depending on multiple', async () => {
		render(InputFile, { label: 'One' });
		render(InputFile, { label: 'Many', multiple: true });

		await expect.element(page.getByText('Drop a file here or click to browse')).toBeVisible();
		await expect.element(page.getByText('Drop files here or click to browse')).toBeVisible();
	});

	it('lists a chosen file with its name and size', async () => {
		render(InputFile, { label: 'Resume' });

		await page.getByLabelText('Resume').upload(text('cv.txt', 'x'.repeat(2048)));

		await expect.element(page.getByText('cv.txt')).toBeVisible();
		await expect.element(page.getByText('2.0 KB')).toBeVisible();
	});

	it('shows a single file inside the drop zone', async () => {
		render(InputFile, { label: 'Resume' });

		await page.getByLabelText('Resume').upload(text('cv.txt'));

		await expect.element(page.getByText('cv.txt')).toBeVisible();
		expect(document.querySelector('.dropzone .file')).not.toBeNull();
		expect(document.querySelector('.field-group > .files')).toBeNull();
	});

	it('lists several files below the drop zone', async () => {
		render(InputFile, { label: 'Docs', multiple: true });

		await page.getByLabelText('Docs').upload(text('a.txt'));

		expect(document.querySelector('.dropzone .file')).toBeNull();
		expect(document.querySelector('.field-group > .files .file')).not.toBeNull();
	});

	it('replaces the file when multiple is off', async () => {
		render(InputFile, { label: 'Resume' });
		const input = page.getByLabelText('Resume');

		await input.upload(text('a.txt'));
		await input.upload(text('b.txt'));

		await expect.element(page.getByText('b.txt')).toBeVisible();
		expect(page.getByText('a.txt').query()).toBeNull();
	});

	it('keeps adding files when multiple is on', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		const input = page.getByLabelText('Docs');

		await input.upload(text('a.txt'));
		await input.upload(text('b.txt'));

		expect(page.getByRole('listitem').elements()).toHaveLength(2);
		await expect.element(page.getByText('a.txt')).toBeVisible();
		await expect.element(page.getByText('b.txt')).toBeVisible();
	});

	it('removes a file from the list', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		await page.getByLabelText('Docs').upload([text('a.txt'), text('b.txt')]);

		await page.getByRole('button', { name: 'Remove a.txt' }).click();

		expect(page.getByText('a.txt').query()).toBeNull();
		await expect.element(page.getByText('b.txt')).toBeVisible();
	});

	it('previews an image and shows an extension badge for other files', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		await page.getByLabelText('Docs').upload([pixel(), text('notes.txt')]);

		await expect.element(page.getByText('notes.txt')).toBeVisible();
		await expect
			.poll(() => document.querySelector('.file img')?.getAttribute('src'))
			.toMatch(/^blob:/);
		expect(document.querySelector('.file .ext')?.textContent).toBe('txt');
	});

	it('refuses files that do not match accept', async () => {
		render(InputFile, { label: 'Photos', accept: 'image/*' });

		await page.getByLabelText('Photos').upload(text('notes.txt'));

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('notes.txt: file type not accepted.');
		expect(page.getByRole('listitem').query()).toBeNull();
	});

	it('accepts files by extension', async () => {
		render(InputFile, { label: 'Docs', accept: '.txt' });

		await page.getByLabelText('Docs').upload(text('ok.txt'));

		await expect.element(page.getByText('ok.txt')).toBeVisible();
	});

	it('refuses files above maxSize', async () => {
		render(InputFile, { label: 'Docs', maxSize: 1024 });

		await page.getByLabelText('Docs').upload(text('big.txt', 'x'.repeat(2048)));

		await expect.element(page.getByRole('alert')).toHaveTextContent('big.txt: larger than 1.0 KB.');
		expect(page.getByRole('listitem').query()).toBeNull();
	});

	it('refuses files beyond maxFiles', async () => {
		render(InputFile, { label: 'Docs', multiple: true, maxFiles: 1 });

		await page.getByLabelText('Docs').upload([text('a.txt'), text('b.txt')]);

		await expect.element(page.getByRole('alert')).toHaveTextContent('b.txt: no more than 1 files.');
		await expect.element(page.getByText('a.txt')).toBeVisible();
	});

	it('flags the input as invalid while errors are shown', async () => {
		render(InputFile, { label: 'Photos', accept: 'image/*' });
		const input = page.getByLabelText('Photos');

		await input.upload(text('notes.txt'));

		await expect.element(input).toHaveAttribute('aria-invalid', 'true');
	});

	it('is no longer required once a file is chosen', async () => {
		render(InputFile, { label: 'Resume', required: true });
		const input = page.getByLabelText(/Resume/);
		await expect.element(input).toBeRequired();

		await input.upload(text('cv.txt'));

		await expect.element(input).not.toBeRequired();
	});

	it('disables the input and the remove buttons', async () => {
		render(InputFile, { label: 'Resume', disabled: true, files: [text('cv.txt')] });

		await expect.element(page.getByLabelText('Resume')).toBeDisabled();
		await expect.element(page.getByRole('button', { name: 'Remove cv.txt' })).toBeDisabled();
	});

	it('forwards onchange to the consumer', async () => {
		let calls = 0;
		render(InputFile, { label: 'Resume', onchange: () => calls++ });

		await page.getByLabelText('Resume').upload(text('cv.txt'));

		expect(calls).toBe(1);
	});
});

const dragEvent = (type: string, files: File[]) => {
	const dataTransfer = new DataTransfer();
	for (const file of files) dataTransfer.items.add(file);
	return new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true });
};

const pasteEvent = (files: File[]) => {
	const clipboardData = new DataTransfer();
	for (const file of files) clipboardData.items.add(file);
	return new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true });
};

describe('InputFile rejections', () => {
	it('reports each refused file and its reason to onreject', async () => {
		const calls: { name: string; reason: string }[][] = [];
		render(InputFile, {
			label: 'Docs',
			multiple: true,
			accept: '.txt',
			maxSize: 4,
			maxFiles: 1,
			onreject: (rejections: { file: File; reason: string }[]) =>
				calls.push(rejections.map(({ file, reason }) => ({ name: file.name, reason })))
		});

		await page
			.getByLabelText('Docs')
			.upload([
				text('ok.txt', 'ok'),
				text('second.txt', 'ok'),
				text('big.txt', 'too big'),
				new File(['x'], 'pic.png', { type: 'image/png' })
			]);

		expect(calls).toEqual([
			[
				{ name: 'second.txt', reason: 'count' },
				{ name: 'big.txt', reason: 'size' },
				{ name: 'pic.png', reason: 'type' }
			]
		]);
	});

	it('does not call onreject when every file is valid', async () => {
		let calls = 0;
		render(InputFile, { label: 'Docs', onreject: () => calls++ });

		await page.getByLabelText('Docs').upload(text('a.txt'));

		expect(calls).toBe(0);
	});

	it('clears the errors once a valid file is chosen', async () => {
		render(InputFile, { label: 'Photos', accept: 'image/*' });
		const input = page.getByLabelText('Photos');

		await input.upload(text('notes.txt'));
		await expect.element(page.getByRole('alert')).toBeVisible();
		await input.upload(new File(['x'], 'ok.png', { type: 'image/png' }));

		expect(page.getByRole('alert').query()).toBeNull();
	});

	it('links the input to its errors and keeps the consumer description', async () => {
		render(InputFile, {
			label: 'Photos',
			accept: 'image/*',
			'aria-describedby': 'help'
		});
		const input = page.getByLabelText('Photos');
		expect(input.element().getAttribute('aria-describedby')).toBe('help');

		await input.upload(text('notes.txt'));

		const described = input.element().getAttribute('aria-describedby') ?? '';
		expect(described.split(' ')).toContain('help');
		expect(document.getElementById(described.split(' ')[1])?.textContent).toContain('notes.txt');
	});
});

describe('InputFile messages', () => {
	it('rewords the prompt, the hints and the errors', async () => {
		render(InputFile, {
			label: 'Photos',
			accept: 'image/*',
			maxSize: 1024,
			messages: {
				prompt: 'Déposez vos photos',
				accepted: (accept: string) => `Types : ${accept}`,
				maxSize: (size: string) => `Maximum ${size}`,
				rejectedType: (name: string) => `${name} : type refusé`
			}
		});

		await expect.element(page.getByText('Déposez vos photos')).toBeVisible();
		await expect.element(page.getByText('Types : image/* · Maximum 1.0 KB')).toBeVisible();

		await page.getByLabelText('Photos').upload(text('notes.txt'));

		await expect.element(page.getByRole('alert')).toHaveTextContent('notes.txt : type refusé');
	});

	it('rewords the size, count, remove and replace texts', async () => {
		render(InputFile, {
			label: 'Docs',
			multiple: true,
			maxSize: 2,
			maxFiles: 1,
			messages: {
				rejectedSize: (name: string, max: string) => `${name} > ${max}`,
				rejectedCount: (name: string, max: number) => `${name} / ${max}`,
				remove: (name: string) => `Supprimer ${name}`
			}
		});
		const input = page.getByLabelText('Docs');

		await input.upload([text('a.txt', 'ok'), text('b.txt', 'ok'), text('c.txt', 'too big')]);

		await expect.element(page.getByText('b.txt / 1')).toBeVisible();
		await expect.element(page.getByText('c.txt > 2 B')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Supprimer a.txt' })).toBeVisible();
	});

	it('rewords the replace caption of a single file', async () => {
		render(InputFile, { label: 'Resume', messages: { replace: 'Remplacer' } });

		await page.getByLabelText('Resume').upload(text('cv.txt'));

		await expect.element(page.getByText('Remplacer')).toBeVisible();
	});
});

describe('InputFile drag and drop', () => {
	it('invites to drop while accepted files are dragged over', async () => {
		render(InputFile, { label: 'Photos', accept: 'image/*' });
		const input = page.getByLabelText('Photos').element();

		input.dispatchEvent(dragEvent('dragenter', [new File(['x'], 'a.png', { type: 'image/png' })]));

		await expect.element(page.getByText('Drop to add')).toBeVisible();
		input.dispatchEvent(dragEvent('dragleave', []));
		await expect.element(page.getByText('Drop a file here or click to browse')).toBeVisible();
	});

	it('warns while files that cannot be accepted are dragged over', async () => {
		render(InputFile, { label: 'Photos', accept: 'image/*' });
		const input = page.getByLabelText('Photos').element();

		input.dispatchEvent(dragEvent('dragenter', [new File(['x'], 'a.mp4', { type: 'video/mp4' })]));

		await expect.element(page.getByText('This file type is not accepted')).toBeVisible();
		expect(document.querySelector('.dropzone.invalid')).not.toBeNull();
		input.dispatchEvent(dragEvent('drop', []));
		await expect.poll(() => document.querySelector('.dropzone.invalid')).toBeNull();
	});

	it('ignores a drag event that carries no data transfer', async () => {
		render(InputFile, { label: 'Photos' });

		page.getByLabelText('Photos').element().dispatchEvent(new Event('dragenter'));

		expect(document.querySelector('.dropzone.dragging')).toBeNull();
	});

	it('ignores drags that carry no file', async () => {
		render(InputFile, { label: 'Photos' });
		const input = page.getByLabelText('Photos').element();

		input.dispatchEvent(dragEvent('dragenter', []));

		expect(document.querySelector('.dropzone.dragging')).toBeNull();
	});
});

describe('InputFile paste', () => {
	it('adds the files pasted from the clipboard', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		const input = page.getByLabelText('Docs').element();
		const event = pasteEvent([text('pasted.txt')]);

		input.dispatchEvent(event);

		await expect.element(page.getByText('pasted.txt')).toBeVisible();
		expect(event.defaultPrevented).toBe(true);
	});

	it('ignores a paste without files so text can still be pasted', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		const event = pasteEvent([]);

		page.getByLabelText('Docs').element().dispatchEvent(event);

		expect(event.defaultPrevented).toBe(false);
		expect(page.getByRole('listitem').query()).toBeNull();
	});

	it('ignores a paste while disabled', async () => {
		render(InputFile, { label: 'Docs', disabled: true });

		page
			.getByLabelText('Docs')
			.element()
			.dispatchEvent(pasteEvent([text('pasted.txt')]));

		expect(page.getByRole('listitem').query()).toBeNull();
	});

	it('ignores a paste event that carries no clipboard data', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		const event = new Event('paste', { bubbles: true, cancelable: true });

		page.getByLabelText('Docs').element().dispatchEvent(event);

		expect(event.defaultPrevented).toBe(false);
		expect(page.getByRole('listitem').query()).toBeNull();
	});

	it('skips a file that is pasted twice', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		const input = page.getByLabelText('Docs').element();
		const file = text('same.txt');

		input.dispatchEvent(pasteEvent([file]));
		input.dispatchEvent(pasteEvent([file]));

		await expect.element(page.getByText('same.txt')).toBeVisible();
		expect(page.getByRole('listitem').elements()).toHaveLength(1);
	});
});

describe('InputFile in a form', () => {
	let form: HTMLFormElement;
	let field: ReturnType<typeof mount> | undefined;

	const mountInForm = async (props: Record<string, unknown>) => {
		form = document.createElement('form');
		document.body.append(form);
		field = mount(InputFile, { target: form, props });
		await tick();
	};

	afterEach(() => {
		if (field) void unmount(field);
		field = undefined;
		form?.remove();
	});

	it('submits the chosen files under the input name', async () => {
		await mountInForm({ label: 'Docs', name: 'docs', multiple: true });
		const input = page.getByLabelText('Docs');

		await input.upload([text('a.txt'), text('b.txt')]);
		await input.upload(text('c.txt'));
		await tick();

		const names = new FormData(form).getAll('docs').map((file) => (file as File).name);
		expect(names).toEqual(['a.txt', 'b.txt', 'c.txt']);
	});

	it('does not submit a removed or refused file', async () => {
		await mountInForm({ label: 'Docs', name: 'docs', multiple: true, accept: '.txt' });
		const input = page.getByLabelText('Docs');
		await input.upload([text('a.txt'), new File(['x'], 'b.png', { type: 'image/png' })]);

		await page.getByRole('button', { name: 'Remove a.txt' }).click();
		await tick();

		const names = new FormData(form).getAll('docs').map((file) => (file as File).name);
		expect(names.filter(Boolean)).toEqual([]);
	});

	it('lets a removed file be chosen again', async () => {
		await mountInForm({ label: 'Docs', multiple: true });
		const input = page.getByLabelText('Docs');
		const file = text('a.txt');

		await input.upload(file);
		await page.getByRole('button', { name: 'Remove a.txt' }).click();
		await input.upload(file);

		await expect.element(page.getByText('a.txt')).toBeVisible();
	});

	it('empties the list when the form is reset', async () => {
		await mountInForm({ label: 'Docs', multiple: true });
		await page.getByLabelText('Docs').upload(text('a.txt'));
		await expect.element(page.getByText('a.txt')).toBeVisible();

		form.reset();

		await expect.poll(() => page.getByRole('listitem').query()).toBeNull();
	});
});

describe('InputFile upload status', () => {
	it('shows the progress of an upload', async () => {
		render(InputFile, {
			label: 'Docs',
			multiple: true,
			status: () => ({ progress: 40 })
		});

		await page.getByLabelText('Docs').upload(text('a.txt'));

		const bar = page.getByRole('progressbar', { name: 'a.txt' });
		await expect.element(bar).toHaveAttribute('value', '40');
	});

	it('shows an error instead of the progress', async () => {
		render(InputFile, {
			label: 'Docs',
			multiple: true,
			status: () => ({ progress: 40, error: 'Upload failed' })
		});

		await page.getByLabelText('Docs').upload(text('a.txt'));

		await expect.element(page.getByText('Upload failed')).toBeVisible();
		expect(page.getByRole('progressbar').query()).toBeNull();
		expect(document.querySelector('.file.failed')).not.toBeNull();
	});

	it('marks a finished upload', async () => {
		render(InputFile, {
			label: 'Docs',
			multiple: true,
			status: () => ({ progress: 100, done: true })
		});

		await page.getByLabelText('Docs').upload(text('a.txt'));

		await expect.element(page.getByText(/Uploaded/)).toBeVisible();
		expect(page.getByRole('progressbar').query()).toBeNull();
	});

	it('shows nothing extra without a status', async () => {
		render(InputFile, { label: 'Docs', multiple: true, status: () => undefined });

		await page.getByLabelText('Docs').upload(text('a.txt'));

		await expect.element(page.getByText('a.txt')).toBeVisible();
		expect(page.getByRole('progressbar').query()).toBeNull();
	});
});

describe('InputFile previews', () => {
	it('previews a video with a muted poster frame', async () => {
		render(InputFile, { label: 'Clips', multiple: true });

		await page.getByLabelText('Clips').upload(new File(['x'], 'clip.mp4', { type: 'video/mp4' }));

		await expect
			.poll(() => document.querySelector('.file video')?.getAttribute('src'))
			.toMatch(/^blob:.*#t=0\.1$/);
		expect(document.querySelector('.file video')?.getAttribute('aria-hidden')).toBe('true');
	});

	it('shows a note icon for audio', async () => {
		render(InputFile, { label: 'Sounds', multiple: true });

		await page.getByLabelText('Sounds').upload(new File(['x'], 'song.mp3', { type: 'audio/mpeg' }));

		await expect.element(page.getByText('song.mp3')).toBeVisible();
		expect(document.querySelector('.file .ext svg')).not.toBeNull();
	});

	it('keeps an empty tile while an image preview loads, then shows it', async () => {
		render(InputFile, { label: 'Photos', multiple: true });

		await page.getByLabelText('Photos').upload(pixel());

		await expect.poll(() => document.querySelector('.file img')).not.toBeNull();
		expect(document.querySelector('.file .ext')).toBeNull();
	});

	it('discards a preview that finishes loading after its file was removed', async () => {
		let finish: (reason?: unknown) => void = () => {};
		const slow = new Promise<ImageBitmap>((_, reject) => (finish = reject));
		const resize = vi.spyOn(window, 'createImageBitmap').mockReturnValue(slow);
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		render(InputFile, { label: 'Photos', multiple: true });
		await page.getByLabelText('Photos').upload(pixel());
		await expect.poll(() => resize.mock.calls.length).toBe(1);

		await page.getByRole('button', { name: 'Remove dot.png' }).click();
		finish(new Error('too late'));

		await expect.poll(() => revoke.mock.calls.length).toBe(1);
		expect(document.querySelector('.file img')).toBeNull();
		resize.mockRestore();
		revoke.mockRestore();
	});

	it('releases the preview when the file is removed', async () => {
		render(InputFile, { label: 'Photos', multiple: true });
		await page.getByLabelText('Photos').upload(pixel());
		await expect.poll(() => document.querySelector('.file img')).not.toBeNull();

		await page.getByRole('button', { name: 'Remove dot.png' }).click();

		expect(document.querySelector('.file img')).toBeNull();
	});
});

describe('InputFile accessibility', () => {
	it('announces added and removed files', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		const status = page.getByRole('status');

		await page.getByLabelText('Docs').upload([text('a.txt'), text('b.txt')]);
		await expect.element(status).toHaveTextContent('2 files added');

		await page.getByRole('button', { name: 'Remove a.txt' }).click();
		await expect.element(status).toHaveTextContent('a.txt removed');
	});

	it('says "1 file added" for one file', async () => {
		render(InputFile, { label: 'Docs' });

		await page.getByLabelText('Docs').upload(text('a.txt'));

		await expect.element(page.getByRole('status')).toHaveTextContent('1 file added');
	});

	it('moves the focus to the next remove button after removing a file', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		await page.getByLabelText('Docs').upload([text('a.txt'), text('b.txt'), text('c.txt')]);

		await page.getByRole('button', { name: 'Remove a.txt' }).click();

		await expect.element(page.getByRole('button', { name: 'Remove b.txt' })).toHaveFocus();
	});

	it('moves the focus to the previous one after removing the last file of the list', async () => {
		render(InputFile, { label: 'Docs', multiple: true });
		await page.getByLabelText('Docs').upload([text('a.txt'), text('b.txt')]);

		await page.getByRole('button', { name: 'Remove b.txt' }).click();

		await expect.element(page.getByRole('button', { name: 'Remove a.txt' })).toHaveFocus();
	});

	it('moves the focus back to the input after removing the only file', async () => {
		render(InputFile, { label: 'Docs' });
		await page.getByLabelText('Docs').upload(text('a.txt'));

		await page.getByRole('button', { name: 'Remove a.txt' }).click();

		await expect.element(page.getByLabelText('Docs')).toHaveFocus();
	});
});
