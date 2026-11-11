<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';

	import { Button } from '../../button';
	import Input from '../input/Input.svelte';
	import Select from '../select/Select.svelte';
	import InputFile from './InputFile.svelte';

	const { Story } = defineMeta({
		title: 'Primitives/Form/InputFile',
		component: InputFile,
		args: { id: 'resume', label: 'Resume' },
		argTypes: {
			variant: { control: 'inline-radio', options: ['dropzone', 'compact'] },
			multiple: { control: 'boolean' },
			maxSize: { control: 'number' },
			maxFiles: { control: 'number' },
			disabled: { control: 'boolean' }
		}
	});

	const sameHeight = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		await document.fonts.ready;
		const height = (el: Element) => el.getBoundingClientRect().height;
		const canvas = within(canvasElement);
		const button = height(canvas.getByRole('button', { name: 'Go' }));
		const compact = height(canvasElement.querySelector('.dropzone.compact')!);

		await expect(height(canvas.getByLabelText('Text')), 'input').toBe(button);
		await expect(height(canvas.getByLabelText('Choice')), 'select').toBe(button);
		await expect(compact, `compact ${compact} vs button ${button}`).toBe(button);
	};

	const sample = [new File(['hello'], 'notes.txt', { type: 'text/plain' })];
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const input = within(canvasElement).getByLabelText('Resume');
		await expect(input).toHaveAttribute('type', 'file');
		await expect(input).toBeEnabled();
	}}
/>

<Story name="Multiple" args={{ label: 'Attachments', multiple: true, maxFiles: 5 }} />

<Story
	name="Images only"
	args={{
		label: 'Photos',
		accept: 'image/*',
		multiple: true,
		maxSize: 5 * 1024 * 1024,
		messages: { prompt: 'Drop photos here or click to browse' }
	}}
/>

<Story name="Single file" args={{ label: 'Resume', files: sample }} />

<Story name="With files" args={{ multiple: true, files: sample }} />

<Story name="Compact" args={{ variant: 'compact', accept: 'image/*' }} />

<Story name="Compact with file" args={{ variant: 'compact', files: sample }} />

<Story
	name="Upload status"
	args={{
		multiple: true,
		label: 'Attachments',
		files: [
			new File(['hello'], 'uploading.txt', { type: 'text/plain' }),
			new File(['hello'], 'done.txt', { type: 'text/plain' }),
			new File(['hello'], 'failed.txt', { type: 'text/plain' })
		],
		status: (file: File) =>
			file.name === 'uploading.txt'
				? { progress: 60 }
				: file.name === 'done.txt'
					? { progress: 100, done: true }
					: { error: 'Upload failed' }
	}}
/>

<Story
	name="Translated"
	args={{
		label: 'Photos',
		accept: 'image/*',
		maxSize: 5 * 1024 * 1024,
		messages: {
			prompt: 'Déposez vos photos ici',
			accepted: (accept: string) => `Types acceptés : ${accept}`,
			maxSize: (size: string) => `Maximum ${size}`,
			rejectedType: (name: string) => `${name} : type de fichier refusé.`
		}
	}}
/>

<Story name="Same height as other controls" play={sameHeight}>
	{#snippet template()}
		<Button>Go</Button>
		<Input id="same-text" label="Text" />
		<Select id="same-choice" label="Choice" options={[{ value: 'x', label: 'X' }]} />
		<InputFile id="same-file" label="File" variant="compact" />
	{/snippet}
</Story>

<Story name="Required" args={{ required: true }} />

<Story name="Disabled" args={{ disabled: true, files: sample }} />
