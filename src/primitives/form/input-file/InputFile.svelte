<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';

	/** Layout of an `InputFile`: a tall drop zone, or a single compact row. */
	export type InputFileVariant = 'dropzone' | 'compact';

	/** Why a file was refused: its type is not accepted, it is too large, or the list is full. */
	export type FileRejectionReason = 'type' | 'size' | 'count';

	/** A refused file and the reason it was refused. */
	export type FileRejection = {
		/** The refused file. */
		file: File;
		/** Why it was refused. */
		reason: FileRejectionReason;
	};

	/** Upload state of a file, shown in its row. Every field is optional. */
	export type InputFileStatus = {
		/** Upload progress from `0` to `100`. Shown as a progress bar. */
		progress?: number;
		/** Error message shown under the file name. */
		error?: string;
		/** Marks the upload as finished. */
		done?: boolean;
	};

	/** Every text of an `InputFile`, to translate or reword. Missing entries keep their English text. */
	export type InputFileMessages = {
		/** Prompt of the empty drop zone. Defaults to a text that depends on `multiple`. */
		prompt?: string;
		/** Prompt while files are dragged over the zone. */
		dropToAdd: string;
		/** Prompt while dragged files cannot be accepted. */
		dropRejected: string;
		/** Caption of a single chosen file. */
		replace: string;
		/** Suffix of the size of an uploaded file. */
		uploaded: string;
		/** Hint listing the accepted types. */
		accepted: (accept: string) => string;
		/** Hint giving the size limit. */
		maxSize: (size: string) => string;
		/** Error for a file whose type is not accepted. */
		rejectedType: (name: string) => string;
		/** Error for a file above the size limit. */
		rejectedSize: (name: string, max: string) => string;
		/** Error for a file beyond the file limit. */
		rejectedCount: (name: string, max: number) => string;
		/** Accessible name of the button removing a file. */
		remove: (name: string) => string;
		/** Accessible name of the list of chosen files. */
		selected: string;
		/** Announcement after files were added. */
		added: (count: number) => string;
		/** Announcement after a file was removed. */
		removed: (name: string) => string;
	};

	/**
	 * Props of `InputFile`, a labelled drop zone with a previewed list of the chosen files. Also
	 * accepts any `<input>` attribute except `type`, `value` and `files`.
	 */
	export type InputFileProps = Omit<HTMLInputAttributes, 'type' | 'value' | 'files'> & {
		/** Text of the label shown above the drop zone. */
		label?: string;
		/** Chosen files. Bind it to read or reset the selection. Defaults to `[]`. */
		files?: File[];
		/** Layout of the field. Defaults to `'dropzone'`. */
		variant?: InputFileVariant;
		/** Largest accepted file, in bytes. Larger files are refused with an error message. */
		maxSize?: number;
		/** Most files that can be kept at once. Only used with `multiple`. */
		maxFiles?: number;
		/** Called with the files refused by `accept`, `maxSize` or `maxFiles`. */
		onreject?: (rejections: FileRejection[]) => void;
		/** Upload state of a file. Read while rendering, so reading reactive state keeps it live. */
		status?: (file: File) => InputFileStatus | undefined;
		/** Texts of the field, to translate or reword. */
		messages?: Partial<InputFileMessages>;
	};

	const defaultMessages: Required<Omit<InputFileMessages, 'prompt'>> = {
		dropToAdd: 'Drop to add',
		dropRejected: 'This file type is not accepted',
		replace: 'Click or drop to replace',
		uploaded: 'Uploaded',
		accepted: (accept) => `Accepted: ${accept}`,
		maxSize: (size) => `Max ${size}`,
		rejectedType: (name) => `${name}: file type not accepted.`,
		rejectedSize: (name, max) => `${name}: larger than ${max}.`,
		rejectedCount: (name, max) => `${name}: no more than ${max} files.`,
		remove: (name) => `Remove ${name}`,
		selected: 'Selected files',
		added: (count) => (count === 1 ? '1 file added' : `${count} files added`),
		removed: (name) => `${name} removed`
	};
</script>

<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	import { Button } from '../../button';
	import { Notice } from '../../notice';
	import { Label } from '../../typography';
	import {
		createThumbnail,
		extensionOf,
		formatSize,
		isAccepted,
		isSameFile,
		mayAcceptType,
		previewKind
	} from './file-utils';

	let {
		label,
		id,
		required,
		disabled,
		multiple = false,
		accept,
		variant = 'dropzone',
		maxSize,
		maxFiles,
		onreject,
		status,
		messages,
		files = $bindable([]),
		onchange,
		class: className,
		'aria-describedby': describedby,
		...rest
	}: InputFileProps = $props();

	type Preview = { url: string; kind: 'image' | 'video' };
	type DragState = 'idle' | 'valid' | 'invalid';

	const generatedId = $props.id();
	const inputId = $derived(id?.trim() || generatedId);
	const errorId = $derived(`${inputId}-errors`);
	const text = $derived({ ...defaultMessages, ...messages });
	const single = $derived(!multiple && files.length > 0);
	const hint = $derived(
		[accept && text.accepted(accept), maxSize !== undefined && text.maxSize(formatSize(maxSize))]
			.filter(Boolean)
			.join(' · ')
	);

	let root = $state<HTMLElement>();
	let input = $state<HTMLInputElement>();
	let errors = $state<string[]>([]);
	let drag = $state<DragState>('idle');
	let announcement = $state('');
	let announcementId = $state(0);

	const previews = new SvelteMap<File, Preview>();
	const loading = new SvelteSet<File>();

	const prompt = $derived.by(() => {
		if (drag === 'valid') return text.dropToAdd;
		if (drag === 'invalid') return text.dropRejected;
		if (messages?.prompt) return messages.prompt;
		if (variant === 'compact') return multiple ? 'Choose files' : 'Choose a file';
		return multiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse';
	});

	/** Puts the chosen files back in the native input, so a plain form submit sends them. */
	function syncInput(): void {
		const transfer = new DataTransfer();
		for (const file of files) transfer.items.add(file);
		(input as HTMLInputElement).files = transfer.files;
	}

	$effect(() => {
		void files;
		syncInput();
	});

	$effect(() => {
		const form = input?.form;
		if (!form) return;
		const reset = () => {
			files = [];
			errors = [];
		};
		form.addEventListener('reset', reset);
		return () => form.removeEventListener('reset', reset);
	});

	/** Makes the preview of a file, unless the file left the list meanwhile. */
	async function loadPreview(file: File, kind: Preview['kind']): Promise<void> {
		const url = kind === 'image' ? await createThumbnail(file) : URL.createObjectURL(file);
		loading.delete(file);
		if (files.includes(file)) previews.set(file, { url, kind });
		else URL.revokeObjectURL(url);
	}

	$effect(() => {
		const current = files;
		untrack(() => {
			for (const file of current) {
				const kind = previewKind(file);
				if ((kind !== 'image' && kind !== 'video') || previews.has(file) || loading.has(file))
					continue;
				loading.add(file);
				void loadPreview(file, kind);
			}
			for (const [file, preview] of previews) {
				if (current.includes(file)) continue;
				URL.revokeObjectURL(preview.url);
				previews.delete(file);
			}
		});
	});

	$effect(() => () => {
		for (const preview of previews.values()) URL.revokeObjectURL(preview.url);
	});

	function announce(message: string): void {
		announcement = message;
		announcementId++;
	}

	/** Why a file cannot join the kept files, or `undefined` when it can. */
	function verdict(file: File, kept: File[]): FileRejectionReason | 'duplicate' | undefined {
		if (!isAccepted(file, accept)) return 'type';
		if (maxSize !== undefined && file.size > maxSize) return 'size';
		if (kept.some((other) => isSameFile(other, file))) return 'duplicate';
		if (maxFiles !== undefined && kept.length >= maxFiles) return 'count';
		return undefined;
	}

	function messageOf({ file, reason }: FileRejection): string {
		if (reason === 'type') return text.rejectedType(file.name);
		if (reason === 'size') return text.rejectedSize(file.name, formatSize(maxSize as number));
		return text.rejectedCount(file.name, maxFiles as number);
	}

	/** Validates files, then replaces or extends the selection with the valid ones. */
	function addFiles(picked: File[]): void {
		const next = multiple ? [...files] : [];
		const rejections: FileRejection[] = [];
		let added = 0;
		for (const file of picked) {
			const reason = verdict(file, next);
			if (reason === undefined) {
				next.push(file);
				added++;
			} else if (reason !== 'duplicate') {
				rejections.push({ file, reason });
			}
		}

		errors = rejections.map(messageOf);
		if (rejections.length) onreject?.(rejections);
		if (added) {
			files = next;
			announce(text.added(added));
		}
	}

	function handleChange(event: Event & { currentTarget: HTMLInputElement }): void {
		addFiles(Array.from(event.currentTarget.files as FileList));
		syncInput();
		onchange?.(event);
	}

	function handlePaste(event: ClipboardEvent): void {
		const pasted = Array.from(event.clipboardData?.files ?? []);
		if (disabled || !pasted.length) return;
		event.preventDefault();
		addFiles(pasted);
		syncInput();
	}

	function handleDragEnter(event: DragEvent): void {
		const dragged = Array.from(event.dataTransfer?.items ?? []).filter(
			(item) => item.kind === 'file'
		);
		if (!dragged.length) return;
		drag = dragged.every((item) => mayAcceptType(item.type, accept)) ? 'valid' : 'invalid';
	}

	async function remove(index: number): Promise<void> {
		const removed = files[index];
		files = files.filter((_, position) => position !== index);
		errors = [];
		announce(text.removed(removed.name));

		await tick();
		const buttons = (root as HTMLElement).querySelectorAll<HTMLButtonElement>('.file button');
		(buttons[Math.min(index, buttons.length - 1)] ?? input)?.focus();
	}
</script>

{#snippet tile(file: File)}
	{@const preview = previews.get(file)}
	{#if preview?.kind === 'image'}
		<img class="thumb" src={preview.url} alt="" />
	{:else if preview?.kind === 'video'}
		<video
			class="thumb"
			src={`${preview.url}#t=0.1`}
			muted
			preload="metadata"
			aria-hidden="true"
			tabindex="-1"
		></video>
	{:else if previewKind(file) === 'audio'}
		<span class="thumb ext" aria-hidden="true">
			<svg class="note" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path
					d="M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3Zm11-2a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z"
					stroke-width="2.5"
					stroke-linecap="square"
				/>
			</svg>
		</span>
	{:else}
		<span class="thumb ext" aria-hidden="true">{previewKind(file) ? '' : extensionOf(file)}</span>
	{/if}
{/snippet}

{#snippet fileRow(file: File, index: number)}
	{@const state = status?.(file)}
	<li class={['file', { failed: !!state?.error }]}>
		{@render tile(file)}
		<span class="meta">
			<span class="name">{file.name}</span>
			{#if state?.error}
				<span class="error">
					<svg
						class="alert"
						viewBox="0 0 24 24"
						aria-hidden="true"
						fill="none"
						stroke="currentColor"
					>
						<path
							d="M12 3 2 21h20L12 3Zm0 7v5m0 3v.01"
							stroke-width="2.5"
							stroke-linecap="square"
						/>
					</svg>
					{state.error}
				</span>
			{:else}
				<span class="size">
					{formatSize(file.size)}{#if state?.done}&nbsp;· {text.uploaded}{/if}
				</span>
			{/if}
			{#if !state?.error && state?.progress !== undefined && !state.done}
				<progress class="progress" max="100" value={state.progress} aria-label={file.name}>
				</progress>
			{/if}
		</span>
		<Button
			variant="outline"
			icon
			{disabled}
			aria-label={text.remove(file.name)}
			onclick={() => remove(index)}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
				<path d="M6 6l12 12M18 6 6 18" stroke-width="3" stroke-linecap="square" />
			</svg>
		</Button>
	</li>
{/snippet}

<div bind:this={root} class={['field-group', className]}>
	{#if label}
		<Label for={inputId} required={!!required}>{label}</Label>
	{/if}

	<div
		class={[
			'dropzone',
			{
				compact: variant === 'compact',
				dragging: drag !== 'idle',
				invalid: drag === 'invalid',
				disabled,
				filled: single
			}
		]}
	>
		<input
			{...rest}
			bind:this={input}
			id={inputId}
			type="file"
			class="native"
			required={required && files.length === 0}
			{multiple}
			{accept}
			{disabled}
			aria-invalid={errors.length ? 'true' : undefined}
			aria-describedby={[describedby, errors.length ? errorId : undefined]
				.filter(Boolean)
				.join(' ') || undefined}
			onchange={handleChange}
			onpaste={handlePaste}
			ondragenter={handleDragEnter}
			ondragleave={() => (drag = 'idle')}
			ondrop={() => (drag = 'idle')}
		/>
		{#if single}
			<ul class="files single" aria-label={text.selected}>
				{@render fileRow(files[0], 0)}
			</ul>
			<span class="hint caption">{text.replace}</span>
		{:else}
			<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
				<path
					d="M12 16V4m0 0L7 9m5-5 5 5M4 16v4h16v-4"
					stroke-width="2.5"
					stroke-linecap="square"
				/>
			</svg>
			<span class="prompt">{prompt}</span>
			{#if hint}
				<span class="hint">{hint}</span>
			{/if}
		{/if}
	</div>

	{#if errors.length}
		<Notice variant="error" id={errorId}>
			{#each errors as message (message)}
				<div>{message}</div>
			{/each}
		</Notice>
	{/if}

	{#if multiple && files.length}
		<ul class="files" aria-label={text.selected}>
			{#each files as file, index (file)}
				{@render fileRow(file, index)}
			{/each}
		</ul>
	{/if}

	<span class="sr-only" role="status" aria-live="polite">
		{#key announcementId}{announcement}{/key}
	</span>
</div>

<style>
	@layer bd.components {
		.field-group {
			display: flex;
			flex-direction: column;
			width: 100%;
			min-width: min(20em, 100vw);
			contain: inline-size;
			gap: var(--gap-xs);
			margin-bottom: var(--margin-field);
		}

		.dropzone {
			position: relative;
			contain: layout;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--gap-xs);
			width: 100%;
			height: var(--input-file-height);
			margin-bottom: calc(var(--shadow-offset) * 1.5);
			padding: var(--gap-lg) var(--gap-md);
			text-align: center;

			font: var(--font-field);
			color: var(--color-ink);
			background-color: var(--bg-main);
			--color-ink: var(--color-on-surface);
			--color-ink-inverse: var(--color-on-surface-inverse);
			--color-muted: var(--color-on-surface-muted);

			border: var(--border-width-thin) dashed var(--color-line);
			border-radius: var(--radius-sharp);
			box-shadow: var(--shadow-flat);
			transition:
				transform var(--duration-press) ease,
				box-shadow var(--duration-press) ease,
				background-color var(--duration-press) ease;
		}

		.dropzone:not(.disabled):hover,
		.dropzone.dragging {
			background-color: var(--bg-surface-muted);
		}

		.dropzone.dragging,
		.dropzone:focus-within {
			transform: translate(var(--offset-hover), var(--offset-hover));
			box-shadow: var(--shadow-focus);
		}

		.dropzone.invalid {
			border-color: var(--bg-destructive);
			box-shadow: var(--shadow-focus-destructive);
		}

		.dropzone.disabled,
		.dropzone.disabled:focus-within {
			background-color: var(--bg-disabled);
			border-color: var(--color-muted);
			box-shadow: var(--shadow-none);
			cursor: not-allowed;
		}

		.native {
			position: absolute;
			inset: calc(-1 * var(--border-width-thin));
			width: auto;
			height: auto;
			opacity: 0;
			cursor: pointer;
		}

		.native:disabled {
			cursor: not-allowed;
		}

		.icon {
			flex-shrink: 0;
			width: var(--size-action-icon);
			height: var(--size-action-icon);
		}

		.prompt {
			font: var(--font-action);
		}

		.hint {
			color: var(--color-muted);
		}

		.caption {
			position: absolute;
			right: 0;
			bottom: var(--gap-xs);
			left: 0;
			font-size: var(--font-size-xs);
			text-align: center;
		}

		.disabled :is(.hint, .size) {
			color: inherit;
		}

		.files {
			display: flex;
			flex-direction: column;
			gap: var(--gap-sm);
			margin: 0;
			padding: 0;
			list-style: none;
		}

		.file {
			display: flex;
			align-items: center;
			gap: var(--gap-sm);
			padding: var(--gap-xs) var(--gap-sm);

			font: var(--font-field);
			color: var(--color-ink);
			background-color: var(--bg-main);
			--color-ink: var(--color-on-surface);
			--color-ink-inverse: var(--color-on-surface-inverse);
			--color-muted: var(--color-on-surface-muted);

			--border-thin: var(--border-sm);
			--border-outline: var(--border-sm);
			--shadow-flat: var(--shadow-none);
			--shadow-hover: var(--shadow-none);
			--shadow-pressed: var(--shadow-none);
			--offset-hover: 0px;
			--offset-press: 0px;

			border: var(--border-width-thin) solid var(--color-line);
			border-radius: var(--radius-sharp);
			box-shadow: var(--shadow-sm);
		}

		.file.failed {
			border-color: var(--bg-destructive);
		}

		.file :global(.btn) {
			z-index: 1;
			flex-shrink: 0;
			width: fit-content;
			margin-bottom: 0;
		}

		.file :global(.btn svg) {
			width: 1em;
			height: 1em;
		}

		.thumb {
			flex-shrink: 0;
			width: 3em;
			height: 3em;
			object-fit: contain;
			background-color: var(--bg-surface-muted);
			border: var(--border-sm);
		}

		.ext {
			display: flex;
			align-items: center;
			justify-content: center;
			font: var(--font-caption);
			text-transform: uppercase;
		}

		.note {
			width: 60%;
			height: 60%;
		}

		.meta {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
			text-align: start;
		}

		.name {
			display: block;
			width: 0;
			min-width: 100%;
			overflow: hidden;
			font-weight: var(--font-weight-bold);
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.size {
			color: var(--color-muted);
		}

		.error {
			display: flex;
			align-items: center;
			gap: var(--gap-xs);
		}

		.alert {
			flex-shrink: 0;
			width: 1em;
			height: 1em;
			color: var(--bg-destructive);
		}

		.files:not(.single) .file {
			position: relative;
		}

		.files:not(.single) .progress {
			position: absolute;
			right: 0;
			bottom: 0;
			left: 0;
			width: auto;
			height: var(--space-2);
			border-width: var(--border-width-sm) 0 0;
		}

		.progress {
			appearance: none;
			width: 100%;
			height: var(--gap-xs);
			border: var(--border-sm);
			background-color: var(--bg-surface-muted);
		}

		.progress::-webkit-progress-bar {
			background-color: var(--bg-surface-muted);
		}

		.progress::-webkit-progress-value {
			background-color: var(--button-primary-bg);
		}

		.progress::-moz-progress-bar {
			background-color: var(--button-primary-bg);
		}

		.dropzone.filled {
			align-items: stretch;
			padding: var(--gap-sm);
		}

		.single {
			display: flex;
			flex: 1;
			min-width: 0;
			min-height: 0;
		}

		.filled .file {
			flex: 1;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: var(--gap-sm);
			min-height: 0;
			padding: 0;
			border: none;
			box-shadow: var(--shadow-none);
			background-color: transparent;
		}

		.filled .meta {
			flex: 0 1 auto;
		}

		.filled .name {
			width: auto;
			max-width: 100%;
			min-width: 0;
		}

		.filled .file :global(.btn) {
			position: absolute;
			top: var(--gap-xs);
			right: var(--gap-xs);
		}

		.dropzone.compact {
			flex-direction: row;
			justify-content: flex-start;
			gap: var(--gap-sm);
			height: auto;
			padding: var(--padding-control);
			text-align: start;
			border: var(--border-thin);
			box-shadow: var(--shadow-flat);
		}

		.dropzone.compact:is(.dragging, :focus-within) {
			box-shadow: var(--shadow-focus);
		}

		.dropzone.compact.invalid {
			border-color: var(--bg-destructive);
			box-shadow: var(--shadow-focus-destructive);
		}

		.dropzone.compact.disabled,
		.dropzone.compact.disabled:focus-within {
			border-color: var(--color-muted);
			box-shadow: var(--shadow-none);
		}

		.compact .icon {
			width: 1em;
			height: 1em;
		}

		.compact :is(.prompt, .hint) {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.compact .prompt {
			flex: 0 0 auto;
			font: var(--font-field);
			font-weight: var(--font-weight-bold);
		}

		.compact .hint {
			flex: 0 1 auto;
			min-width: 0;
			margin-inline-start: auto;
		}

		.compact .caption {
			display: none;
		}

		.compact.filled .file {
			justify-content: flex-start;
		}

		.compact.filled .thumb {
			align-self: center;
			width: 2.2em;
			height: 2.2em;
			margin-block: -1em;
		}

		.compact.filled .meta {
			flex: 1;
			flex-direction: row;
			align-items: center;
			gap: var(--gap-xs);
		}

		.compact.filled .ext {
			display: none;
		}

		.compact.filled .name {
			flex: 0 1 auto;
			width: auto;
			min-width: 0;
		}

		.compact.filled :is(.size, .error) {
			flex: 0 1 auto;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.compact.filled .progress {
			flex: 0 0 6em;
			width: 6em;
		}

		.compact.filled .file :global(.btn) {
			position: static;
			align-self: center;
			margin-block: -2em;
		}

		.sr-only {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
	}
</style>
