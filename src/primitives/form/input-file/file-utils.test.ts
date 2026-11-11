import { describe, expect, it, vi } from 'vitest';

import {
	createThumbnail,
	extensionOf,
	formatSize,
	isAccepted,
	isSameFile,
	matchesRule,
	mayAcceptType,
	parseAccept,
	previewKind
} from './file-utils';

const file = (name: string, type = '', options: FilePropertyBag = {}) =>
	new File(['x'], name, { type, ...options });

describe('formatSize', () => {
	it.each([
		[12, '12 B'],
		[2048, '2.0 KB'],
		[3.5 * 1024 ** 2, '3.5 MB'],
		[7.6 * 1024 ** 3, '7.6 GB']
	])('formats %d bytes as %s', (bytes, expected) => {
		expect(formatSize(bytes)).toBe(expected);
	});
});

describe('parseAccept', () => {
	it('lowercases, trims and drops empty rules', () => {
		expect(parseAccept(' .PDF, image/* ,, ')).toEqual(['.pdf', 'image/*']);
	});

	it('returns no rule without a list', () => {
		expect(parseAccept(undefined)).toEqual([]);
	});
});

describe('matchesRule', () => {
	it('matches an extension whatever its case', () => {
		expect(matchesRule(file('CV.PDF'), '.pdf')).toBe(true);
		expect(matchesRule(file('cv.txt'), '.pdf')).toBe(false);
	});

	it('matches a MIME type exactly', () => {
		expect(matchesRule(file('a.png', 'image/png'), 'image/png')).toBe(true);
		expect(matchesRule(file('a.jpg', 'image/jpeg'), 'image/png')).toBe(false);
	});

	it('matches a wildcard MIME type', () => {
		expect(matchesRule(file('a.png', 'image/png'), 'image/*')).toBe(true);
		expect(matchesRule(file('a.mp4', 'video/mp4'), 'image/*')).toBe(false);
	});
});

describe('isAccepted', () => {
	it('accepts everything without rules', () => {
		expect(isAccepted(file('a.bin'), undefined)).toBe(true);
	});

	it('accepts a file matching any rule', () => {
		expect(isAccepted(file('a.txt', 'text/plain'), '.pdf, text/*')).toBe(true);
		expect(isAccepted(file('a.bin'), '.pdf, text/*')).toBe(false);
	});
});

describe('mayAcceptType', () => {
	it('lets unknown types and extension rules through until the drop', () => {
		expect(mayAcceptType('', 'image/*')).toBe(true);
		expect(mayAcceptType('video/mp4', '.png')).toBe(true);
	});

	it('refuses a known type that no MIME rule matches', () => {
		expect(mayAcceptType('video/mp4', 'image/*')).toBe(false);
		expect(mayAcceptType('image/png', 'image/png')).toBe(true);
		expect(mayAcceptType('image/png', 'image/*')).toBe(true);
	});

	it('accepts everything without rules', () => {
		expect(mayAcceptType('video/mp4', undefined)).toBe(true);
	});
});

describe('isSameFile', () => {
	it('compares name, size and modification time', () => {
		const base = file('a.txt', 'text/plain', { lastModified: 1 });
		expect(isSameFile(base, file('a.txt', 'text/plain', { lastModified: 1 }))).toBe(true);
		expect(isSameFile(base, file('a.txt', 'text/plain', { lastModified: 2 }))).toBe(false);
		expect(isSameFile(base, file('b.txt', 'text/plain', { lastModified: 1 }))).toBe(false);
		expect(isSameFile(base, new File(['xx'], 'a.txt', { lastModified: 1 }))).toBe(false);
	});
});

describe('extensionOf', () => {
	it('returns at most four characters of the extension', () => {
		expect(extensionOf(file('notes.txt'))).toBe('txt');
		expect(extensionOf(file('archive.torrent'))).toBe('torr');
	});

	it('falls back to "file" without an extension', () => {
		expect(extensionOf(file('README'))).toBe('file');
		expect(extensionOf(file('.env'))).toBe('file');
	});
});

describe('previewKind', () => {
	it('tells media from other files', () => {
		expect(previewKind(file('a.png', 'image/png'))).toBe('image');
		expect(previewKind(file('a.mp4', 'video/mp4'))).toBe('video');
		expect(previewKind(file('a.mp3', 'audio/mpeg'))).toBe('audio');
		expect(previewKind(file('a.txt', 'text/plain'))).toBeUndefined();
	});
});

describe('createThumbnail', () => {
	const png = () =>
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

	it('makes a blob URL of a resized image', async () => {
		const url = await createThumbnail(png(), 8);
		expect(url).toMatch(/^blob:/);
		URL.revokeObjectURL(url);
	});

	it('falls back to the file itself when it cannot be decoded', async () => {
		const url = await createThumbnail(
			new File(['not an image'], 'a.svg', { type: 'image/svg+xml' })
		);
		expect(url).toMatch(/^blob:/);
		URL.revokeObjectURL(url);
	});

	it('falls back to the file itself when the canvas cannot encode the thumbnail', async () => {
		const encode = vi
			.spyOn(HTMLCanvasElement.prototype, 'toBlob')
			.mockImplementation((callback) => callback(null));
		const create = vi.spyOn(URL, 'createObjectURL');
		const source = png();

		const url = await createThumbnail(source, 8);

		expect(create).toHaveBeenCalledWith(source);
		expect(url).toMatch(/^blob:/);
		URL.revokeObjectURL(url);
		encode.mockRestore();
		create.mockRestore();
	});
});
