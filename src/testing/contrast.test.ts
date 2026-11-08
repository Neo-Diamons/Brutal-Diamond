import { afterEach, describe, expect, it } from 'vitest';

import { contrast, token } from './contrast';

describe('contrast', () => {
	it('is 21 for black on white and 1 for identical colours', () => {
		expect(contrast('#000', '#fff')).toBeCloseTo(21);
		expect(contrast('#fff', '#000')).toBeCloseTo(21);
		expect(contrast('#777', '#777')).toBe(1);
	});

	it('resolves modern colour syntax', () => {
		expect(contrast('color-mix(in srgb, #000 100%, #fff)', '#fff')).toBeCloseTo(21);
	});

	it('accepts the sentinel colour #010203', () => {
		expect(contrast('#010203', '#fff')).toBeGreaterThan(15);
	});

	it('blends a translucent foreground over the background', () => {
		const half = contrast('rgb(0 0 0 / 0.5)', '#fff');

		expect(half).toBeGreaterThan(1);
		expect(half).toBeLessThan(21);
	});

	it('throws on a value that is not a colour', () => {
		expect(() => contrast('not-a-colour', '#fff')).toThrow('Not a CSS colour: "not-a-colour"');
		expect(() => contrast('#000', 'nope')).toThrow('Not a CSS colour: "nope"');
	});
});

describe('token', () => {
	afterEach(() => {
		document.documentElement.style.removeProperty('--test-colour');
	});

	it('resolves a custom property to a computed colour', () => {
		document.documentElement.style.setProperty('--test-colour', '#ff0000');

		expect(token('--test-colour')).toBe('rgb(255, 0, 0)');
	});

	it('leaves no probe element behind', () => {
		const before = document.body.children.length;
		token('--test-colour');

		expect(document.body.children.length).toBe(before);
	});
});
