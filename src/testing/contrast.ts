/** An 8-bit sRGB colour as `[red, green, blue, alpha]`, each from 0 to 255. */
type Rgba = [number, number, number, number];

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 1;
const context = canvas.getContext('2d', { willReadFrequently: true })!;

/**
 * Resolves any CSS colour (including `color-mix()`) to 8-bit sRGB by painting one pixel.
 * Throws when `value` is not a colour the browser understands.
 */
function resolve(value: string): Rgba {
	context.clearRect(0, 0, 1, 1);
	context.fillStyle = '#010203';
	context.fillStyle = value;

	if (context.fillStyle === '#010203' && !/^#0*10203$/i.test(value.trim())) {
		throw new Error(`Not a CSS colour: "${value}"`);
	}

	context.fillRect(0, 0, 1, 1);
	return [...context.getImageData(0, 0, 1, 1).data] as Rgba;
}

/** WCAG relative luminance of an sRGB colour, from 0 (black) to 1 (white). */
const luminance = ([r, g, b]: Rgba) => {
	const [lr, lg, lb] = [r, g, b].map((channel) => {
		const c = channel / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

/** WCAG contrast ratio of `foreground` painted over the opaque `background`. */
export function contrast(foreground: string, background: string): number {
	const back = resolve(background);
	const front = resolve(foreground);
	const alpha = front[3] / 255;

	const blended = front.map((c, i) => (i < 3 ? c * alpha + back[i] * (1 - alpha) : c)) as Rgba;
	const [light, dark] = [luminance(blended), luminance(back)].sort((a, b) => b - a);

	return (light + 0.05) / (dark + 0.05);
}

/** Reads a token as a resolved colour, through a real element so `var()` and `color-mix()` apply. */
export function token(name: string): string {
	const probe = document.createElement('i');
	probe.style.color = `var(${name})`;
	document.body.append(probe);

	const value = getComputedStyle(probe).color;
	probe.remove();

	return value;
}
