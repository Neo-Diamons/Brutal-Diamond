/** Kind of media a file can be previewed as. */
export type PreviewKind = 'image' | 'video' | 'audio';

/**
 * Formats a byte count as `12 B`, `3.4 KB`, `1.2 MB` or `7.6 GB`.
 *
 * @param bytes - Size to format.
 */
export function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
	return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

/**
 * Splits an `accept` attribute into lowercase rules (extensions, MIME types and `type/*`).
 *
 * @param accept - Value of the `accept` attribute.
 */
export function parseAccept(accept: string | null | undefined): string[] {
	return (accept ?? '')
		.split(',')
		.map((rule) => rule.trim().toLowerCase())
		.filter(Boolean);
}

/**
 * Tells whether a file matches one `accept` rule.
 *
 * @param file - File to test.
 * @param rule - Lowercase extension (`.pdf`), MIME type (`image/png`) or wildcard (`image/*`).
 */
export function matchesRule(file: File, rule: string): boolean {
	if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
	const type = file.type.toLowerCase();
	if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
	return type === rule;
}

/**
 * Tells whether a file matches an `accept` list. Everything matches when the list is empty.
 *
 * @param file - File to test.
 * @param accept - Value of the `accept` attribute.
 */
export function isAccepted(file: File, accept: string | null | undefined): boolean {
	const rules = parseAccept(accept);
	return rules.length === 0 || rules.some((rule) => matchesRule(file, rule));
}

/**
 * Tells whether a dragged MIME type may be accepted. A dragged file exposes its type but not its
 * name, so extension rules and unknown types always pass and are checked again on drop.
 *
 * @param type - MIME type of the dragged file, empty when unknown.
 * @param accept - Value of the `accept` attribute.
 */
export function mayAcceptType(type: string, accept: string | null | undefined): boolean {
	const rules = parseAccept(accept);
	if (rules.length === 0 || type === '') return true;
	const mime = type.toLowerCase();
	return rules.some(
		(rule) =>
			rule.startsWith('.') ||
			(rule.endsWith('/*') ? mime.startsWith(rule.slice(0, -1)) : mime === rule)
	);
}

/**
 * Tells whether two files are the same one: same name, size and last modification time.
 *
 * @param a - First file.
 * @param b - Second file.
 */
export function isSameFile(a: File, b: File): boolean {
	return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

/**
 * Extension of a file shown in its badge, at most four characters, or `file` without one.
 *
 * @param file - File to describe.
 */
export function extensionOf(file: File): string {
	const dot = file.name.lastIndexOf('.');
	return dot > 0 ? file.name.slice(dot + 1, dot + 5) : 'file';
}

/**
 * Kind of media a file can be previewed as, from its MIME type.
 *
 * @param file - File to describe.
 * @returns `undefined` when the file has no visual or audio preview.
 */
export function previewKind(file: File): PreviewKind | undefined {
	if (file.type.startsWith('image/')) return 'image';
	if (file.type.startsWith('video/')) return 'video';
	if (file.type.startsWith('audio/')) return 'audio';
	return undefined;
}

/**
 * Makes a small preview URL of an image, so a long list of large photos does not keep every
 * full-size picture decoded. Falls back to the file itself when it cannot be resized (SVG).
 * The caller revokes the returned URL.
 *
 * @param file - Image to preview.
 * @param height - Height of the thumbnail in pixels. Defaults to `96`.
 */
export async function createThumbnail(file: File, height = 96): Promise<string> {
	const bitmap = await createImageBitmap(file, { resizeHeight: height }).catch(() => undefined);
	if (!bitmap) return URL.createObjectURL(file);

	const canvas = document.createElement('canvas');
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;
	canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
	bitmap.close();

	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
	return URL.createObjectURL(blob ?? file);
}
