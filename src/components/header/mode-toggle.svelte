<script lang="ts">
	import { browser } from '$app/environment';
	import { getThemeContext, themes } from '$lib/stores/themes.svelte';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import Check from '@lucide/svelte/icons/check';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';

	let isDark = $state(false);
	const currentTheme = getThemeContext();

	if (browser) {
		const currentClass = document.documentElement.className;
		isDark = themes.find((t) => t.class === currentClass)?.isDark ?? false;

		new MutationObserver(() => {
			const currentClass = document.documentElement.className;
			isDark = themes.find((t) => t.class === currentClass)?.isDark ?? false;
		}).observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			buttonVariants({
				variant: 'ghost',
				class: 'px-1 py-0 text-base focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
			})
		)}
	>
		{#if !isDark}
			<Sun class="mx-2 block" />
		{:else}
			<Moon class="mx-2 block" />
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => (currentTheme.theme = 'light')} class="cursor-pointer">
			<span class="capitalize">Light</span>
			{#if currentTheme.theme === 'light'}
				<Check class="ml-2 h-4 w-4" />
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => (currentTheme.theme = 'dark')} class="cursor-pointer">
			<span class="capitalize">Dark</span>
			{#if currentTheme.theme === 'dark'}
				<Check class="ml-2 h-4 w-4" />
			{/if}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => currentTheme.useSystem()} class="cursor-pointer">
			<span class="text-destructive">Use System Theme</span>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.LinkItem href="/profile/settings#themes" class="cursor-pointer">
			<span class="text-muted-foreground flex w-full"> See More Themes </span>
		</DropdownMenu.LinkItem>
	</DropdownMenu.Content>
</DropdownMenu.Root>
