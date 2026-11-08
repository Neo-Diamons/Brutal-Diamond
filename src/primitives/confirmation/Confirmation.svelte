<script lang="ts" module>
	/** Props of `Confirmation`, a delete button that asks for confirmation in a dialog. */
	export type ConfirmationProps = {
		/** Name of the item to delete, used in the default dialog title. */
		itemName: string;
		/** Text of the button that opens the dialog. Defaults to `'Delete'`. */
		triggerLabel?: string;
		/** Title of the dialog. Defaults to `'Delete {itemName}?'` (English; set it when localising). */
		title?: string;
		/** Body text of the dialog. Defaults to a warning that the action cannot be undone. */
		description?: string;
		/** Text of the button that confirms. Defaults to `'Confirm'`. */
		confirmLabel?: string;
		/** Text of the button that cancels. Defaults to `'Cancel'`. */
		cancelLabel?: string;
		/** Gives both dialog buttons an equal share of the row. Defaults to `false`. */
		split?: boolean;
		/** Called when the user confirms; the dialog then closes. */
		onconfirm: () => void;
	};
</script>

<script lang="ts">
	import Button from '../button/Button.svelte';
	import { Card, CardContent, CardFooter, CardHeader } from '../card';
	import Dialog from '../dialog/Dialog.svelte';
	import { H3, P } from '../typography';

	let {
		itemName,
		triggerLabel = 'Delete',
		title,
		description = 'Are you absolutely sure? This action cannot be undone.',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		split = false,
		onconfirm
	}: ConfirmationProps = $props();

	let open = $state(false);
	const titleId = $props.id();
</script>

<Dialog bind:open labelledby={titleId}>
	{#snippet trigger({ open: show })}
		<Button variant="destructive" onclick={show}>{triggerLabel}</Button>
	{/snippet}
	<div class="confirmation">
		<Card>
			<CardHeader><H3 id={titleId}>{title ?? `Delete ${itemName}?`}</H3></CardHeader>
			<CardContent><P>{description}</P></CardContent>
			<CardFooter {split}>
				<Button variant="outline" onclick={() => (open = false)}>{cancelLabel}</Button>
				<Button
					variant="destructive"
					onclick={() => {
						open = false;
						onconfirm();
					}}
				>
					{confirmLabel}
				</Button>
			</CardFooter>
		</Card>
	</div>
</Dialog>

<style>
	@layer bd.components {
		.confirmation {
			width: var(--width-dialog);
		}
	}
</style>
