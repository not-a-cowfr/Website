<script lang="ts" module>
	import Search from '@lucide/svelte/icons/search';
</script>

<script lang="ts">
	import { Button } from '$ui/button';
	import SearchMenu from '$comp/header/search-menu.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	let open = $state(false);
</script>

<Button
	onclick={() => (open = true)}
	class={cn('bg-card flex flex-row gap-2 rounded-lg border-[3px] p-4', className)}
	variant="outline"
	size="lg"
>
	<Search class="-ml-0.5" />
	<span class="text-muted-foreground flex-1">Search For Player...</span>
</Button>
<SearchMenu bind:open useButton={false} />
