/**
 * Whether dev-only warnings are enabled. Bundlers inline `process.env.NODE_ENV` at build time;
 * without a bundler or `process`, this is `false`.
 */
export function detectDev(read: () => string | undefined = () => process.env.NODE_ENV): boolean {
	try {
		return read() !== 'production';
	} catch {
		return false;
	}
}

const DEV = detectDev();

/** Whether dev-only warnings are enabled; a function so tests can mock it per test. */
export function isDev(): boolean {
	return DEV;
}
