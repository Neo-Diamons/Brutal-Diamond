import { page } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import '../../../styles/index.css';
import '../../../styles/theming/themes/outline.css';
import '../../../styles/theming/modes/dark.css';
import { MODES, THEMES, setMode, setTheme } from '../../../styles/theming/theme';
import Input from '../input/Input.svelte';
import Select from '../select/Select.svelte';
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
const longName = `${'very-long-file-name-'.repeat(8)}.txt`;

const zone = () => document.querySelector('.dropzone') as HTMLElement;
const box = (el: Element) => el.getBoundingClientRect();

afterEach(() => {
	delete document.documentElement.dataset.theme;
	delete document.documentElement.dataset.mode;
});

describe.each(THEMES)('InputFile layout in the %s theme', (theme) => {
	describe.each(MODES)('in %s mode', (mode) => {
		const prepare = async () => {
			await setTheme(theme);
			await setMode(mode);
		};

		it('keeps the same height empty or holding any kind of file', async () => {
			await prepare();
			render(InputFile, { label: 'Resume', accept: 'image/*,.txt', maxSize: 1024 });
			const input = page.getByLabelText('Resume');
			const heights = [box(zone()).height];

			await input.upload(text(longName));
			heights.push(box(zone()).height);
			await input.upload(pixel());
			await expect.poll(() => document.querySelector('.file img')).not.toBeNull();
			heights.push(box(zone()).height);

			expect(heights[0]).toBeGreaterThan(0);
			expect(new Set(heights).size).toBe(1);
		});

		it('never overflows its fixed height', async () => {
			await prepare();
			render(InputFile, { label: 'Resume', status: () => ({ progress: 30 }) });

			await page.getByLabelText('Resume').upload(text(longName));
			const area = box(zone());

			for (const child of Array.from(zone().children)) {
				if (child.classList.contains('native')) continue;
				const rect = box(child);
				expect(rect.top).toBeGreaterThanOrEqual(area.top);
				expect(rect.bottom).toBeLessThanOrEqual(area.bottom);
				expect(rect.left).toBeGreaterThanOrEqual(area.left);
				expect(rect.right).toBeLessThanOrEqual(area.right);
			}
		});

		it('keeps its remove button inside the zone', async () => {
			await prepare();
			render(InputFile, { label: 'Resume' });

			await page.getByLabelText('Resume').upload(text(longName));
			const button = box(page.getByRole('button', { name: /Remove/ }).element());
			const area = box(zone());

			expect(button.top).toBeGreaterThanOrEqual(area.top);
			expect(button.right).toBeLessThanOrEqual(area.right);
		});

		it('keeps its width whatever the file name length', async () => {
			await prepare();
			render(InputFile, { label: 'Resume' });
			const host = document.querySelector('.field-group')!.parentElement as HTMLElement;
			host.style.display = 'inline-block';
			const empty = box(host).width;

			await page.getByLabelText('Resume').upload(text(longName));

			expect(box(host).width).toBe(empty);
		});

		it('leaves room under the zone for its focus shadow', async () => {
			await prepare();
			render(InputFile, { label: 'Resume' });

			const offset = parseFloat(getComputedStyle(zone()).marginBottom);
			const shadow = parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue('--shadow-offset')
			);

			expect(offset).toBeGreaterThanOrEqual(shadow);
		});

		it('draws the drop zone and the file rows like an input', async () => {
			await prepare();
			render(Input, { id: 'text', label: 'Text' });
			render(InputFile, { label: 'Docs', multiple: true });
			await page.getByLabelText('Docs').upload([text('a.txt'), text('b.txt')]);
			const input = getComputedStyle(page.getByLabelText('Text').element());

			const rows = Array.from(document.querySelectorAll('.file'));
			expect(rows).toHaveLength(2);
			expect(getComputedStyle(zone()).borderTopWidth).toBe(input.borderTopWidth);
			expect(getComputedStyle(zone()).boxShadow).toBe(input.boxShadow);
			for (const row of rows)
				expect(getComputedStyle(row).borderTopWidth).toBe(input.borderTopWidth);
		});
	});
});

describe.each(THEMES)('InputFile rows in the %s theme', (theme) => {
	it('are as tall with a progress bar, an error or a finished upload as without', async () => {
		await setTheme(theme);
		render(InputFile, {
			label: 'Docs',
			multiple: true,
			status: (file: File) =>
				({
					'a.txt': { progress: 40 },
					'b.txt': { error: 'Upload failed' },
					'c.txt': { progress: 100, done: true }
				})[file.name]
		});

		await page
			.getByLabelText('Docs')
			.upload([text('a.txt'), text('b.txt'), text('c.txt'), text('d.txt')]);
		await expect.poll(() => document.querySelectorAll('.file').length).toBe(4);

		const heights = Array.from(document.querySelectorAll('.file')).map((row) => box(row).height);
		expect(new Set(heights).size).toBe(1);
	});
});

describe.each(THEMES)('InputFile drag of an unacceptable file in the %s theme', (theme) => {
	it.each(['dropzone', 'compact'] as const)(
		'draws the %s shadow and border in the destructive colour',
		async (variant) => {
			await setTheme(theme);
			render(InputFile, { label: 'Photos', variant, accept: 'image/*' });
			const probe = document.createElement('span');
			probe.style.backgroundColor = 'var(--bg-destructive)';
			document.body.append(probe);
			const destructive = getComputedStyle(probe).backgroundColor;
			probe.remove();
			const dragged = new DataTransfer();
			dragged.items.add(new File(['x'], 'a.mp4', { type: 'video/mp4' }));

			page
				.getByLabelText('Photos')
				.element()
				.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dragged, bubbles: true }));

			await expect.poll(() => document.querySelector('.dropzone.invalid')).not.toBeNull();
			await expect.poll(() => getComputedStyle(zone()).boxShadow).toContain(destructive);
			expect(getComputedStyle(zone()).borderTopColor).toBe(destructive);
		}
	);

	it('keeps the accent shadow while acceptable files are dragged over', async () => {
		await setTheme(theme);
		render(InputFile, { label: 'Photos', accept: 'image/*' });
		const dragged = new DataTransfer();
		dragged.items.add(new File(['x'], 'a.png', { type: 'image/png' }));

		page
			.getByLabelText('Photos')
			.element()
			.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dragged, bubbles: true }));

		await expect.poll(() => document.querySelector('.dropzone.dragging')).not.toBeNull();
		expect(document.querySelector('.dropzone.invalid')).toBeNull();
		expect(getComputedStyle(zone()).boxShadow).not.toBe('none');
	});
});

describe.each(THEMES)('InputFile overlay in the %s theme', (theme) => {
	it.each(['dropzone', 'compact'] as const)(
		'covers the whole %s field, border included, and nothing more',
		async (variant) => {
			await setTheme(theme);
			render(InputFile, { label: 'Resume', variant });
			const field = box(zone());
			const overlay = box(document.querySelector('.native')!);

			expect(Math.abs(overlay.width - field.width)).toBeLessThanOrEqual(1);
			expect(Math.abs(overlay.height - field.height)).toBeLessThanOrEqual(1);
			expect(Math.abs(overlay.left - field.left)).toBeLessThanOrEqual(1);
			expect(Math.abs(overlay.top - field.top)).toBeLessThanOrEqual(1);
		}
	);

	it('stays the size of the field even if the field is not positioned', async () => {
		await setTheme(theme);
		render(InputFile, { label: 'Resume', variant: 'compact' });
		zone().style.position = 'static';
		const field = box(zone());
		const overlay = box(document.querySelector('.native')!);

		expect(overlay.width).toBeLessThanOrEqual(field.width + 1);
		expect(overlay.height).toBeLessThanOrEqual(field.height + 1);
	});

	it('receives a click on the field border', async () => {
		await setTheme(theme);
		render(InputFile, { label: 'Resume' });
		const field = box(zone());

		const hit = document.elementFromPoint(field.left + 0.5, field.top + field.height / 2);

		expect(hit).toBe(document.querySelector('.native'));
	});
});

describe('InputFile height token', () => {
	it('follows --input-file-height', async () => {
		render(InputFile, { label: 'Resume', style: '--input-file-height: 200px' });
		const host = document.querySelector('.field-group') as HTMLElement;
		host.style.setProperty('--input-file-height', '200px');

		expect(box(zone()).height).toBe(200);
	});
});

describe.each(THEMES)('InputFile compact variant in the %s theme', (theme) => {
	it('is as tall as an input or a select, empty or holding a file', async () => {
		await setTheme(theme);
		render(Input, { id: 'text', label: 'Text' });
		render(Select, { id: 'choice', label: 'Choice', options: [{ value: 'x', label: 'X' }] });
		render(InputFile, {
			label: 'Resume',
			variant: 'compact',
			status: () => ({ progress: 40 })
		});
		const control = box(page.getByLabelText('Text').element()).height;

		expect(box(page.getByLabelText('Choice').element()).height).toBe(control);
		expect(box(zone()).height).toBe(control);

		await page.getByLabelText('Resume').upload(text(longName));
		await expect.poll(() => document.querySelector('.file')).not.toBeNull();

		expect(box(zone()).height).toBe(control);
		const zoneBox = box(zone());
		const row = box(document.querySelector('.file')!);
		expect(row.top).toBeGreaterThanOrEqual(zoneBox.top);
		expect(row.bottom).toBeLessThanOrEqual(zoneBox.bottom);
	});
});

describe('InputFile compact border', () => {
	it('is a solid line with a shadow like an input, and a dashed one in the drop zone', async () => {
		render(InputFile, { label: 'Tall' });
		render(InputFile, { label: 'Short', variant: 'compact' });
		render(Input, { id: 'text', label: 'Text' });
		const [tall, short] = Array.from(document.querySelectorAll('.dropzone')).map((el) =>
			getComputedStyle(el)
		);
		const input = getComputedStyle(page.getByLabelText('Text').element());

		expect(tall.borderTopStyle).toBe('dashed');
		expect(short.borderTopStyle).toBe('solid');
		expect(short.borderTopWidth).toBe(input.borderTopWidth);
		expect(short.boxShadow).toBe(input.boxShadow);
	});

	it('takes the focus shadow when focused', async () => {
		render(InputFile, { label: 'Short', variant: 'compact' });
		const resting = getComputedStyle(zone()).boxShadow;

		page.getByLabelText('Short').element().focus();

		await expect.poll(() => getComputedStyle(zone()).boxShadow).not.toBe(resting);
	});
});

describe('InputFile compact variant', () => {
	it('is a single row, much shorter than the drop zone', async () => {
		render(InputFile, { label: 'Tall' });
		render(InputFile, { label: 'Short', variant: 'compact' });

		const [tall, short] = Array.from(document.querySelectorAll('.dropzone')).map(
			(el) => box(el).height
		);

		expect(short).toBeLessThan(tall / 2);
	});

	it.each(['Choose a file', 'Choose files'])(
		'keeps the prompt and the hint on a single line',
		async (prompt) => {
			render(InputFile, {
				label: 'Resume',
				variant: 'compact',
				multiple: prompt === 'Choose files',
				accept: 'image/*,.pdf',
				maxSize: 5 * 1024 * 1024
			});

			const promptEl = page.getByText(prompt).element();
			const hintEl = document.querySelector('.compact .hint') as HTMLElement;
			for (const el of [promptEl, hintEl]) {
				expect(box(el).height).toBeLessThan(parseFloat(getComputedStyle(el).fontSize) * 2);
			}
			expect(box(zone()).height).toBeLessThan(box(promptEl).height * 3);
		}
	);

	it('puts the size right after the name instead of at the far end', async () => {
		render(InputFile, { label: 'Resume', variant: 'compact' });

		await page.getByLabelText('Resume').upload(text('notes.txt'));
		await expect.poll(() => document.querySelector('.file .size')).not.toBeNull();

		const name = box(document.querySelector('.file .name')!);
		const size = box(document.querySelector('.file .size')!);
		expect(size.left - name.right).toBeLessThan(40);
	});

	it('shows a chosen file inline with its remove button and no caption', async () => {
		render(InputFile, { label: 'Resume', variant: 'compact' });

		await page.getByLabelText('Resume').upload(text(longName));

		const area = box(zone());
		const button = box(page.getByRole('button', { name: /Remove/ }).element());
		expect(button.right).toBeLessThanOrEqual(area.right);
		expect(button.top).toBeGreaterThanOrEqual(area.top);
		expect(button.bottom).toBeLessThanOrEqual(area.bottom);
		expect(getComputedStyle(document.querySelector('.caption')!).display).toBe('none');
		expect(getComputedStyle(document.querySelector('.ext')!).display).toBe('none');
	});
});
