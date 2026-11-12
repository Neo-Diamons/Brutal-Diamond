import { describe, expect, it } from 'vitest';

import { detectDev } from './dev';

describe('detectDev', () => {
	it('is enabled outside production', () => {
		expect(detectDev(() => 'development')).toBe(true);
		expect(detectDev(() => undefined)).toBe(true);
	});

	it('is disabled in production', () => {
		expect(detectDev(() => 'production')).toBe(false);
	});

	it('is disabled when the environment cannot be read', () => {
		expect(
			detectDev(() => {
				throw new ReferenceError('process is not defined');
			})
		).toBe(false);
	});
});
