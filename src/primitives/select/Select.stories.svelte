<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';

	import Select from './Select.svelte';

	const { Story } = defineMeta({
		title: 'Primitives/Select',
		component: Select,
		args: {
			id: 'column',
			label: 'Column',
			options: [
				{ value: 'todo', label: 'To do' },
				{ value: 'doing', label: 'Doing' },
				{ value: 'done', label: 'Done' }
			]
		}
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const select = within(canvasElement).getByLabelText('Column');
		await userEvent.selectOptions(select, 'doing');
		await expect(select).toHaveValue('doing');
	}}
/>

<Story
	name="Without label"
	args={{ label: undefined, 'aria-label': 'Column' }}
	play={async ({ canvasElement }) => {
		const select = within(canvasElement).getByRole('combobox', { name: 'Column' });
		await userEvent.selectOptions(select, 'doing');
		await expect(select).toHaveValue('doing');
	}}
/>

<Story name="Required" args={{ required: true }} />

<Story name="Disabled" args={{ disabled: true, value: 'done' }} />
