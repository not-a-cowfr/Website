<script lang="ts">
	import { page } from '$app/state';
	import Head from '$comp/head.svelte';
	import Cropselector from '$comp/stats/contests/crop-selector.svelte';
	import { getTimeStamp } from '$lib/format';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import { Button } from '$ui/button';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let year = $derived(+page.params.year);

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Contests',
			href: '/contests',
		},
		{
			name: 'Year ' + year,
			href: '/contests/' + year,
		},
		{
			name: 'Records',
		},
	]);

	const breadcrumb = getBreadcrumb();
	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});
</script>

<Head title="Record Contest Scores | Year {year}" description="View the top scores of the Skyblock year!" />

<div class="flex flex-col items-center justify-center">
	<div class="mt-16 mb-4 flex flex-col items-center gap-4 text-center font-semibold">
		<h1 class="text-4xl">Contest Records - Year {year}</h1>
		<p>
			{new Date(getTimeStamp(+year - 1, 0, 0) * 1000).toLocaleDateString() +
				' - ' +
				new Date(getTimeStamp(+year, 0, 0) * 1000).toLocaleDateString()}
		</p>
		<Cropselector />
		<div class="mb-2 flex w-full flex-col justify-center gap-2 md:flex-row md:gap-4">
			<Button class="flex-1 rounded-lg" variant="secondary" href="/contests/{year - 1}/records">Previous</Button>
			<Button class="flex-1 rounded-lg" variant="secondary" href="/contests/{year}">View&nbsp;Year</Button>
			<Button class="flex-1 rounded-lg" variant="secondary" href="/contests/{year + 1}/records">Next</Button>
		</div>
	</div>

	<div class="mx-8 mt-4 mb-16 flex w-full flex-wrap justify-center gap-4 md:w-[90%] md:flex-row">
		{@render children?.()}
	</div>

	<div class="mb-8 flex max-w-xl flex-col gap-4 text-center text-sm">
		<p>Each player can only hold one position per profile, per crop.</p>
		<p><strong>???</strong> - The player hasn't claimed this contest yet, their true position is unknown.</p>
		<p>
			<strong>Disclaimer:</strong> These contest participations are collected when a players profile is loaded on the
			website, they aren't automatically scraped. Crops may be missing if no one known to the website has participated
			in the contest, or their profile hasn't been loaded since.
		</p>
	</div>
</div>
