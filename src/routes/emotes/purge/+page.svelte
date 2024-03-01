<script lang="ts">
	import { onMount } from 'svelte';
	import { ONE_DAY_IN_MS, getLastMonthDate, paddingLeft } from '$lib';

	// import json7tvMock from './json7tvMock.json';
	// import emoteUsageMock from './emoteUsageMock.json';

	import type { Emote7tvData, EmoteUsage, FlatEmoteUsage } from './types';

	let loading = true;
	let emoteList: { [id: string]: Emote7tvData } = {};
	let emoteUsage: FlatEmoteUsage[] = [];
	let emoteUsageFiltered: FlatEmoteUsage[] = [];
	let showUniqueAmmount = false;
	let emoteSize = 2;
	let leastUsedAmmount = 10;
	let olderThan = 10;

	async function retrieveEmotes(): Promise<{ [id: string]: Emote7tvData }> {
		const call = await fetch('https://7tv.io/v3/emote-sets/62d73f58d8e61c27b053c09a');
		const seventvEmotes = await call.json();
		// const seventvEmotes = json7tvMock;

		const emoteList: { [id: string]: Emote7tvData } = {};
		seventvEmotes.emotes.forEach((emote: Emote7tvData) => {
			emoteList[`7tv_${emote.id}`] = emote;
		});

		return emoteList;
	}

	async function fetchEmoteUsage(): Promise<{ [id: string]: FlatEmoteUsage }> {
		const response = await fetch('/emote-data/2024/02/data.json');
		const emoteUsage: EmoteUsage = await response.json();
		// const emoteUsage: EmoteUsage = emoteUsageMock;

		const emoteList: { [id: string]: FlatEmoteUsage } = {};
		Object.entries(emoteUsage.seventv).forEach(([id, stats]) => {
			emoteList[`7tv_${id}`] = { id, type: '7tv', stats };
		});

		return emoteList;
	}

	function sortEmoteList(emoteObject: { [id: string]: FlatEmoteUsage }) {
		const emoteList = Object.values(emoteObject);

		emoteList.sort((a, b) => {
			let sort = b.stats.ammount - a.stats.ammount;
			if (sort === 0) sort = b.stats.realAmmount - a.stats.realAmmount;
			return sort * -1;
		});

		return emoteList;
	}

	function getImageSource(emote: FlatEmoteUsage) {
		let url = '';
		if (emote.type === '7tv') {
			url = `https://cdn.7tv.app/emote/${emote.id}/3x.webp`;
		}

		return url;
	}

	function getEmote7tvPage(emote: FlatEmoteUsage) {
		return `https://7tv.app/emotes/${emote.id}`;
	}

	function getEmoteName(emote: FlatEmoteUsage) {
		return emoteList[`${emote.type}_${emote.id}`]?.name || '';
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

	function dateToString(date: Date) {
		const defaultLanguage = navigator.language || 'en-US';
		if ('Intl' in window && 'DateTimeFormat' in window.Intl) {
			const formattedDate = new Intl.DateTimeFormat(defaultLanguage, {
				month: 'long',
				year: 'numeric'
			}).format(date);
			return formattedDate;
		} else {
			const month = date.getMonth() + 1;
			return `${paddingLeft(`${month}`, 2, '0')}/${date.getFullYear()}`;
		}
	}

	function changeEmoteSize(_ev: MouseEvent, value: number) {
		if (value < 1) value = 1;
		if (value > 3) value = 3;

		emoteSize = value;
	}

	function changeEmoteSizeButton(ev: KeyboardEvent, value: number) {
		if (ev.key === 'Enter' || ev.key === ' ') {
			if (value < 1) value = 1;
			if (value > 3) value = 3;

			emoteSize = value;
		}
	}

	function lazyLoadStart() {
		if (!globalThis.window) return; // this is a fix for vite development server, since node.js doesn't have window property

		if (window.IntersectionObserver) {
			lazyLoadWithObserver();
		} else {
			lazyLoadWithEvents();

			document.getElementById('emote-list')?.addEventListener('scroll', lazyLoadWithEvents);
			globalThis.window.addEventListener('resize', lazyLoadWithEvents);
			globalThis.window.addEventListener('orientationChange', lazyLoadWithEvents);
		}
	}

	onMount(() => {
		async function fetchData() {
			emoteList = await retrieveEmotes();
			const emoteStats = await fetchEmoteUsage();

			Object.entries(emoteList).forEach(([k, emote]) => {
				if (!emoteStats[k]) {
					let type = k.split('_')[0] as '7tv';
					emoteStats[emote.id] = { id: emote.id, type, stats: { ammount: 0, realAmmount: 0 } };
				}
			});

			emoteUsage = sortEmoteList(emoteStats);

			leastUsedAmmount = Math.floor(Object.keys(emoteList).length / 10);
			if (leastUsedAmmount < 10) {
				leastUsedAmmount = 10;
			}

			loading = false;
		}

		fetchData().then(lazyLoadStart);
	});

	function ByOlderThan(emote: FlatEmoteUsage) {
		const stvEmote = emoteList[`7tv_${emote.id}`];
		if (!stvEmote) return; // The emote no longer exists in 7tv

		const now = Date.now();
		const olderThanMs = olderThan * ONE_DAY_IN_MS;

		return now - stvEmote.timestamp > olderThanMs;
	}

	function filterEmoteUsage() {
		emoteUsageFiltered = emoteUsage.filter(ByOlderThan).slice(0, leastUsedAmmount);
		lazyLoadStart();
	}

	$: olderThan, emoteUsage, leastUsedAmmount, filterEmoteUsage();
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
	<div class="options">
		<div class="sizes">
			<div
				class="size"
				class:current={emoteSize === 1}
				on:click={(ev) => changeEmoteSize(ev, 1)}
				on:keyup={(ev) => changeEmoteSizeButton(ev, 1)}
				role="button"
				tabindex="0"
			>
				x1
			</div>
			<div
				class="size"
				class:current={emoteSize === 2}
				on:click={(ev) => changeEmoteSize(ev, 2)}
				on:keyup={(ev) => changeEmoteSizeButton(ev, 2)}
				role="button"
				tabindex="0"
			>
				x2
			</div>
			<div
				class="size"
				class:current={emoteSize === 3}
				on:click={(ev) => changeEmoteSize(ev, 3)}
				on:keyup={(ev) => changeEmoteSizeButton(ev, 3)}
				role="button"
				tabindex="0"
			>
				x3
			</div>
		</div>
	</div>
	<div>
		<div class="info">
			<span>Using last month usage data <b>({dateToString(getLastMonthDate())})</b></span>
			<br />
			<span>Current 7tv size: {Object.keys(emoteList).length} emotes</span>
		</div>
		<div class="filters">
			<br />
			<div
				class="filter"
				on:click={() => (showUniqueAmmount = !showUniqueAmmount)}
				on:keyup={(ev) => {
					if (ev.key === 'Enter' || ev.key === ' ') {
						showUniqueAmmount = !showUniqueAmmount;
					}
				}}
				role="button"
				tabindex="0"
			>
				<div class="unique-ammount" class:checked={showUniqueAmmount}></div>
				<span
					title="Each chatter message use will count as one, independently of the ammount sent in the same message"
					>Show the unique times used*</span
				>
			</div>
			<span
				>Show the
				<input
					type="number"
					placeholder="Ammount here please :)"
					value={leastUsedAmmount}
					step="10"
					max={Object.keys(emoteList).length}
					min="5"
					on:change={(ev) => {
						let ammount = +ev.currentTarget.value;
						if (ammount > Object.keys(emoteList).length) ammount = Object.keys(emoteList).length;
						if (ammount < 5) ammount = 5;

						leastUsedAmmount = ammount;
						lazyLoadStart();
					}}
				/> least used</span
			>
			<span title="The ammount of time elapsed since the emote was added"
				>At least older than
				<input
					type="number"
					placeholder="Ammount here please :)"
					value={olderThan}
					step="1"
					min="10"
					on:change={(ev) => {
						let ammount = +ev.currentTarget.value;
						if (ammount < 10) ammount = 10;

						olderThan = ammount;
					}}
				/> days*</span
			>
		</div>
	</div>
	<div id="emote-list">
		{#each emoteUsageFiltered as emote}
			<div class={`emote ${emote.type === '7tv' ? 'stv' : emote.type} x${emoteSize}`}>
				<div class="stv">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 109.6 80.9"
						width="1em"
						data-v-bf7c68c0=""
						><g
							><path
								d="M84.1,22.2l5-8.7,2.7-4.6L86.8.2V0H60.1l5,8.7,5,8.7,2.8,4.8H84.1"
								fill="currentColor"
							></path><path
								d="M29,80.6l5-8.7,5-8.7,5-8.7,5-8.7,5-8.7,5-8.7L62.7,22l-5-8.7-5-8.7L49.9.1H7.7l-5,8.7L0,13.4l5,8.7v.2h32l-5,8.7-5,8.7-5,8.7-5,8.7-5,8.7L8.5,72l5,8.7v.2H29"
								fill="currentColor"
							></path><path
								d="M70.8,80.6H86.1l5-8.7,5-8.7,5-8.7,5-8.7,3.5-6-5-8.7v-.2H89.2l-5,8.7-5,8.7-.7,1.3-5-8.7-5-8.7-.7-1.3-5,8.7-5,8.7L55,53.1l5,8.7,5,8.7,5,8.7.8,1.4"
								fill="currentColor"
							></path></g
						></svg
					>
				</div>
				<div
					class="open-in"
					on:click={() => window.open(getEmote7tvPage(emote))}
					on:keyup={(ev) => {
						if (ev.key === 'Enter' || ev.key === ' ') {
							window.open(getEmote7tvPage(emote));
						}
					}}
					role="button"
					tabindex="0"
					title="Open 7tv page for this emote"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width=".75em" height=".75em" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"
						/></svg
					>
				</div>
				<img
					class="lazy"
					data-src={getImageSource(emote)}
					title={getEmoteName(emote)}
					alt="emote"
				/>
				<div class="name" title={getEmoteName(emote)}>{getEmoteName(emote)}</div>
				<div class="stats">{showUniqueAmmount ? emote.stats.ammount : emote.stats.realAmmount}</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.options {
		position: absolute;
		top: 10px;
		left: 10px;
		letter-spacing: normal;
		text-transform: none;
	}

	.options .sizes {
		display: flex;
		gap: 5px;
	}

	.options .size {
		cursor: pointer;
		border: 1px solid;
		padding: 0 2px;
	}

	.options .size:hover {
		background-color: #531034;
	}
	.options .size.current {
		background-color: #470f2e;
	}

	.info,
	.filters {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 2px;
		margin-bottom: 5px;
	}
	.info {
		border-bottom: 1px solid;
	}

	.filter {
		display: flex;
		justify-content: center;
		align-items: center;
	}

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
		max-width: 100%;
	}

	.emote {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		float: left;
		box-sizing: border-box;
		cursor: default;

		border: 1px solid #db1e83;
	}
	.emote.x1 {
		width: 100px;
		height: 125px;
		padding: 1px;
	}
	.emote.x1 img {
		max-height: 30px;
	}
	.emote.x2 {
		width: 120px;
		height: 150px;
		padding: 3px;
	}
	.emote.x2 img {
		max-height: 50px;
	}
	.emote.x3 {
		width: 150px;
		height: 200px;
		padding: 5px;
	}
	.emote.x3 img {
		max-height: 100px;
	}

	.emote .stv {
		position: absolute;
		top: 0;
	}

	.emote .open-in {
		cursor: pointer;
		position: absolute;
		top: 0;
		right: 0;
	}

	.emote .name {
		text-transform: none;
		letter-spacing: normal;
		text-overflow: ellipsis;
		overflow: hidden;
		width: 100%;
		padding-top: 5px;
		border-bottom: 1px solid #db1e83;
	}

	.emote .stats {
		text-transform: none;
		letter-spacing: normal;
	}

	.unique-ammount {
		cursor: pointer;
		box-sizing: border-box;
		height: 20px;
		width: 20px;
		border: 2px solid;
		margin-right: 10px;
	}
	.unique-ammount.checked {
		background-color: #db1e83;
		border-color: #680c3d;
	}
</style>
