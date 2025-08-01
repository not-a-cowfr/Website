import type { components } from '$lib/api/api';
import type { ProfileDetails } from '$lib/api/elite';
import { PROPER_CROP_NAME, API_CROP_TO_CROP, PROPER_CROP_TO_MINION } from '$lib/constants/crops';
import { CROP_TO_PEST } from '$lib/constants/pests';
import { formatIgn, getRankInformation } from '$lib/format';
import { getCropFromName, Crop } from 'farming-weight';
import { getContext, setContext } from 'svelte';
import { getRatesData } from './ratesData';

export class PlayerStats {
	#account = $state<NonNullable<components['schemas']['MinecraftAccountDto']>>(null!);
	#selectedProfile = $state<components['schemas']['ProfileDetailsDto']>();
	#profiles = $state<ProfileDetails[]>();
	#member = $state<NonNullable<components['schemas']['ProfileMemberDto']>>(null!);
	#ranks = $state<components['schemas']['LeaderboardRanksResponse']>(null!);
	#filteredRanks = $state<components['schemas']['LeaderboardRanksResponse']['ranks']>(null!);
	#collections = $state<Collection[]>([]);
	#fortuneSettings = $derived(
		this.#account.settings?.fortune?.accounts?.[this.uuid]?.[this.selectedProfile?.profileId ?? ''] ?? null
	);
	#style = $state.raw<components['schemas']['WeightStyleWithDataDto'] | undefined>(undefined);

	#tools = $state.raw<components['schemas']['ItemDto'][]>([]);
	#pets = $state.raw<components['schemas']['PetDto'][]>([]);
	#armor = $state.raw<components['schemas']['ItemDto'][]>([]);
	#equipment = $state.raw<components['schemas']['ItemDto'][]>([]);

	#garden = $derived.by(() => this.#member?.garden);
	#rank = $derived.by(() => getRankInformation(this.#account.playerData));
	#ignMeta = $derived.by(() => formatIgn(this.#account?.name, this.#member.meta));

	constructor(data: {
		account: NonNullable<components['schemas']['MinecraftAccountDto']>;
		selectedProfile: components['schemas']['ProfileDetailsDto'];
		profiles: ProfileDetails[];
		member: NonNullable<components['schemas']['ProfileMemberDto']>;
		ranks: components['schemas']['LeaderboardRanksResponse'];
		style?: components['schemas']['WeightStyleWithDataDto'];
	}) {
		this.setValues(data);
	}

	setValues({
		account,
		selectedProfile,
		profiles,
		member,
		ranks,
		style,
	}: ConstructorParameters<typeof PlayerStats>[0]) {
		this.#account = account;
		this.#selectedProfile = selectedProfile;
		this.#profiles = profiles;
		this.#ranks = ranks;
		this.#style = style;
		this.#filteredRanks = Object.fromEntries(Object.entries(ranks.ranks ?? {}).filter((r) => r[1].rank <= 10_000));

		if (this.fortuneSettings) {
			const ratesData = getRatesData();
			ratesData.update((data) => {
				data.communityCenter = this.fortuneSettings?.communityCenter ?? data.communityCenter;
				data.strength = this.fortuneSettings?.strength ?? data.strength;
				data.attributes = this.fortuneSettings?.attributes ?? data.attributes;
				data.exported = (this.fortuneSettings?.exported as Record<Crop, boolean>) ?? data.exported;
				return data;
			});
		}

		this.member = member;
	}

	get account() {
		return this.#account;
	}

	get style() {
		return this.#style;
	}

	get uuid() {
		return this.#account?.id ?? '';
	}

	get ign() {
		return this.#account?.name ?? '';
	}

	get ignMeta() {
		return this.#ignMeta;
	}

	get rank() {
		return this.#rank;
	}

	get fortuneSettings() {
		return this.#fortuneSettings;
	}

	get selectedProfile() {
		return this.#selectedProfile;
	}

	get profiles() {
		return this.#profiles;
	}

	set member(value) {
		this.#member = value;

		this.#collections = PlayerStats.parseCollections(value);

		this.#tools = $state.snapshot(value?.farmingWeight.inventory?.tools ?? []);
		this.#pets = $state.snapshot(value?.pets ?? []);
		this.#armor = $state.snapshot(value?.farmingWeight.inventory?.armor ?? []);
		this.#equipment = $state.snapshot(value?.farmingWeight.inventory?.equipment ?? []);
	}

	get member() {
		return this.#member;
	}

	get garden() {
		return this.#garden;
	}

	get ranks() {
		return this.#filteredRanks ?? {};
	}

	get allRanks() {
		return this.#ranks.ranks ?? {};
	}

	get collections() {
		return this.#collections;
	}

	get tools() {
		return this.#tools ?? [];
	}

	get pets() {
		return this.#pets ?? [];
	}

	get armor() {
		return this.#armor ?? [];
	}

	get equipment() {
		return this.#equipment ?? [];
	}

	static parseCollections(member: NonNullable<components['schemas']['ProfileMemberDto']>) {
		const collections = Object.entries(member.collections ?? {})
			.filter(([key]) => PROPER_CROP_NAME[key])
			.map(([key, value]) => ({
				key: API_CROP_TO_CROP[key as keyof typeof API_CROP_TO_CROP],
				name: PROPER_CROP_NAME[key],
				value: value,
				minionTierField: 0,
				weight: 0,
				pest: '',
				pestKills: 0,
				uncounted: 0,
			})) as Collection[];

		for (const collection of collections) {
			if (!collection.name) continue;

			const minion = PROPER_CROP_TO_MINION[collection.name] ?? 'no';
			const pest = CROP_TO_PEST[getCropFromName(collection.name) ?? Crop.Wheat];

			collection.minionTierField = member.craftedMinions?.[minion] ?? 0;
			collection.weight = member.farmingWeight?.cropWeight?.[collection.name] ?? 0;
			collection.pest = pest;
			collection.pestKills = member.farmingWeight?.pests?.[pest as keyof typeof member.farmingWeight.pests] ?? 0;
			collection.uncounted = member.farmingWeight?.uncountedCrops?.[collection.name] ?? 0;
		}

		return collections;
	}
}

export function initStatsContext(opts: ConstructorParameters<typeof PlayerStats>[0]) {
	const existing = getContext<PlayerStats>('player-stats');
	if (existing) {
		existing.setValues(opts);
		return existing;
	}

	const stats = new PlayerStats(opts);
	setContext('player-stats', stats);
	return stats;
}

export function getStatsContext() {
	const stats = getContext<PlayerStats>('player-stats');
	if (!stats) {
		throw new Error('Stats context not found');
	}
	return stats;
}

interface Collection {
	key: string;
	name: string | undefined;
	value: number;
	minionTierField: number;
	weight: number;
	pest: string;
	pestKills: number;
	uncounted: number;
}
