<script lang="ts" module>
	import TreePalm from '@lucide/svelte/icons/tree-palm';
	import Recycle from '@lucide/svelte/icons/recycle';
	import Dices from '@lucide/svelte/icons/dices';
	import MapPin from '@lucide/svelte/icons/map-pin';
</script>

<script lang="ts">
	import type { ProfileGameMode } from '$lib/api/elite';
	import * as Popover from '$ui/popover';
	import type { Component } from 'svelte';

	const icons: Record<ProfileGameMode | string, unknown | undefined> = {
		island: TreePalm,
		ironman: Recycle,
		bingo: Dices,
		classic: undefined,
	};

	const gameModeRename: Partial<Record<ProfileGameMode | string, string>> = {
		island: 'stranded',
	};

	interface Props {
		class?: string;
		gameMode?: ProfileGameMode | string | null;
		popover?: boolean;
		map?: boolean;
	}

	let { class: classes = '', gameMode = 'classic', popover = true, map = false }: Props = $props();

	let mode = $derived(gameMode ?? 'classic');
</script>

{#if popover && mode !== 'classic'}
	<Popover.Mobile hasContent={popover} {trigger}>
		{#if popover}
			<div>
				<h5 class="font-semibold">Profile Game Mode</h5>

				<p class="text-center first-letter:capitalize">{gameModeRename[mode] ?? mode}</p>
			</div>
		{/if}
	</Popover.Mobile>
{:else}
	{@render trigger()}
{/if}

{#snippet trigger()}
	{#if icons[mode]}
		{@const Icon = icons[mode] as Component}
		<Icon class={classes} />
	{:else if map}
		<MapPin class={classes} />
	{/if}
{/snippet}
