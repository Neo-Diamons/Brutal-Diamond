<script lang="ts" module>
	import type { HTMLImgAttributes } from 'svelte/elements';

	/**
	 * Props of `CardMedia`, the image of a card. Also accepts any `<img>` attribute. A placeholder
	 * showing `alt` replaces the image when `src` is missing or fails to load.
	 */
	export type CardMediaProps = HTMLImgAttributes;
</script>

<script lang="ts">
	let { class: className, alt = '', onerror, ...rest }: CardMediaProps = $props();

	let failedSrc = $state<string | null | undefined>();
	const failed = $derived(failedSrc === rest.src);
</script>

<div class={['card-media', className]}>
	{#if rest.src && !failed}
		<img
			{alt}
			{...rest}
			onerror={(event) => {
				failedSrc = rest.src;
				onerror?.(event);
			}}
		/>
	{:else}
		<div class="fallback" role="img" aria-label={alt}>{`📷 ${alt}`}</div>
	{/if}
</div>

<style>
	@layer bd.components {
		.card-media {
			width: 100%;
			border-bottom: var(--border-thick);
			background-color: var(--bg-canvas);
		}

		img,
		.fallback {
			display: block;
			width: 100%;
			height: var(--size-media-height);
		}

		img {
			object-fit: cover;
		}

		.fallback {
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--color-muted);
			font: var(--font-field);
		}
	}
</style>
