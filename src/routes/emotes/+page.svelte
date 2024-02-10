<script lang="ts">
	import { onMount } from 'svelte';

	// import json7tvMock from './json7tvMock.json';
	// import emoteUsageMock from './emoteUsageMock.json';
	import channelEmotes from './channelEmotes.json';

	import type {
		EmoteUsageStats,
		ChannelEmoteData,
		Emote7tvData,
		EmoteUsage,
		FlatEmoteUsage
	} from './types';

	let loading = true;
	let emoteList: { [id: string]: Emote7tvData | ChannelEmoteData } = {};
	let emoteUsage: FlatEmoteUsage[] = [];

	async function retrieveEmotes(): Promise<{ [id: string]: Emote7tvData | ChannelEmoteData }> {
		const call = await fetch('https://7tv.io/v3/emote-sets/62d73f58d8e61c27b053c09a');
		const seventvEmotes = await call.json();
		// const seventvEmotes = json7tvMock;

		const emoteList: { [id: string]: Emote7tvData | ChannelEmoteData } = {};
		channelEmotes.data.forEach((emote) => {
			emoteList[`twitch_${emote.id}`] = emote;
		});
		seventvEmotes.emotes.forEach((emote: Emote7tvData) => {
			emoteList[`7tv_${emote.id}`] = emote;
		});

		return emoteList;
	}

	async function fetchEmoteUsage(): Promise<FlatEmoteUsage[]> {
		const response = await fetch(
			'https://zle5lrm7f7fnrc2di5fw7wnrfe0uwunk.lambda-url.eu-west-2.on.aws'
		);
		const emoteUsage: EmoteUsage = (await response.json()).emoteUsage;
		// const emoteUsage: EmoteUsage = emoteUsageMock;

		const emoteList: { id: string; type: 'twitch' | '7tv'; stats: EmoteUsageStats }[] = [];
		Object.entries(emoteUsage.twitch).forEach(([id, stats]) => {
			emoteList.push({ id, type: 'twitch', stats });
		});
		Object.entries(emoteUsage.seventv).forEach(([id, stats]) => {
			emoteList.push({ id, type: '7tv', stats });
		});

		const sortedUsage = emoteList.sort((a, b) => {
			let sort = b.stats.ammount - a.stats.ammount;
			if (sort === 0) sort = b.stats.realAmmount - a.stats.realAmmount;
			if (sort === 0) sort = b.type.length - a.type.length; // Twitch is longer, so goes first
			return sort;
		});

		return sortedUsage;
	}

	function getImageSource(emote: FlatEmoteUsage) {
		let url = '';
		if (emote.type === 'twitch') {
			url = `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/3.0`;
		} else if (emote.type === '7tv') {
			url = `https://cdn.7tv.app/emote/${emote.id}/3x.webp`;
		}

		return url;
	}

	let lazyLoadTimeout: number | undefined;
	function lazyLoadWithEvents() {
		if (lazyLoadTimeout) {
			clearTimeout(lazyLoadTimeout);
		}

		lazyLoadTimeout = setTimeout(() => {
			let emoteListWrapper = document.getElementById('emote-list');
			let lazyLoadImages: NodeListOf<HTMLImageElement> = document.querySelectorAll('img.lazy');

			if (emoteListWrapper) {
				let scrollTop = emoteListWrapper.scrollTop;
				lazyLoadImages.forEach((image) => {
					if (image.offsetTop < window.innerHeight + scrollTop) {
						image.src = image.dataset.src || '';
						image.classList.remove('lazy');
					}
				});

				if (lazyLoadImages.length == 0) {
					document.getElementById('emote-list')?.removeEventListener('scroll', lazyLoadWithEvents);
					window.removeEventListener('resize', lazyLoadWithEvents);
					window.removeEventListener('orientationChange', lazyLoadWithEvents);
				}
			}
		}, 20);
	}

	function lazyLoadWithObserver() {
		if (lazyLoadTimeout) {
			clearTimeout(lazyLoadTimeout);
		}

		lazyLoadTimeout = setTimeout(() => {
			let lazyLoadImages: NodeListOf<HTMLImageElement> = document.querySelectorAll('img.lazy');

			let imageObserver = new IntersectionObserver(function (entries, _observer) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						let image = entry.target as HTMLImageElement;
						image.src = image.dataset.src || '';
						image.classList.remove('lazy');
						imageObserver.unobserve(image);
					}
				});
			});

			lazyLoadImages.forEach(function (image) {
				imageObserver.observe(image);
			});
		}, 20);
	}

	onMount(() => {
		async function fetchData() {
			emoteList = await retrieveEmotes();
			emoteUsage = await fetchEmoteUsage();

			loading = false;
		}

		fetchData().then(() => {
			if (window.IntersectionObserver) {
				lazyLoadWithObserver();
			} else {
				lazyLoadWithEvents();

				document.getElementById('emote-list')?.addEventListener('scroll', lazyLoadWithEvents);
				window.addEventListener('resize', lazyLoadWithEvents);
				window.addEventListener('orientationChange', lazyLoadWithEvents);
			}
		});
	});
</script>

{#if loading}
	<div id="loading">
		<span class="uppercase">C</span>hecking...
		<img
			class="smaller"
			src="https://cdn.7tv.app/emote/60eefb20119bd109472f7f4b/4x.webp"
			title="modCheck"
			alt="modCheck"
		/>
	</div>
{:else}
	<div id="emote-list">
		{#each emoteUsage as emote}
			<div class={`emote ${emote.type === '7tv' ? 'stv' : emote.type}`}>
				<div class="real-ammount" title="The total ammount sent">({emote.stats.realAmmount})</div>

				<img class="lazy" data-src={getImageSource(emote)} alt="emote" />
				<div>{emote.stats.ammount}</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.smaller {
		font-size: 0.9rem;
	}

	#emote-list {
		display: flex;
		flex-wrap: wrap;
		overflow: scroll;
		margin: 0 15px;
		justify-content: center;
		gap: 10px;
		box-sizing: border-box;
	}

	#emote-list .emote.stv {
		color: #29b6f6;
	}

	#emote-list .emote.stv:hover {
		background-color: rgb(41, 182, 246, 0.3);
	}
	#emote-list .emote.twitch {
		color: #8a47eb;
	}
	#emote-list .emote.twitch:hover {
		background-color: rgb(138, 71, 235, 0.3);
	}

	#emote-list img {
		max-height: 100px;
		max-width: 100%;
	}

	.emote {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		float: left;
		width: 160px;
		height: 160px;
		padding: 5px;
		box-sizing: border-box;
		cursor: default;

		border: 1px solid #db1e83;
	}

	.emote .real-ammount {
		font-size: 0.6em;
	}
</style>
