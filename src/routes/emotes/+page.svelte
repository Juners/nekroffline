<script lang="ts">
	import { onMount } from 'svelte';

	// import json7tvMock from './json7tvMock.json';
	// import emoteUsageMock from './emoteUsageMock.json';

	import channelEmotes from './channelEmotes.json';

	import type {
		EmoteNode,
		EmoteUsageStats,
		ChannelEmoteData,
		Emote7tvData,
		EmoteUsage
	} from './types';

	onMount(() => {
		let lazyLoadTimeout: number | undefined;
		function lazyLoadWithEvents() {
			if (lazyLoadTimeout) {
				clearTimeout(lazyLoadTimeout);
			}

			lazyLoadTimeout = setTimeout(() => {
				let emoteListWrapper = document.getElementById('emotes');
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
						document.getElementById('emotes')?.removeEventListener('scroll', lazyLoadWithEvents);
						globalThis.window.removeEventListener('resize', lazyLoadWithEvents);
						globalThis.window.removeEventListener('orientationChange', lazyLoadWithEvents);
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

		// function appendResizeObserver() {
		//   const resizeObserver = new ResizeObserver((entries) => {
		//     for (const entry of entries) {
		//       if (entry) {
		//         const { width, height } = entry.contentRect;

		//       }
		//     }
		//   });

		//   const emotesDiv = document.getElementById("emotes");
		//   resizeObserver.observe(emotesDiv);
		// }

		function createEmoteNode(
			type: '7tv' | 'twitch',
			emote: EmoteUsageStats,
			id: string
		): EmoteNode {
			let node = null;
			if (type === '7tv') {
				node = document.createElement('div');
				node.classList.add('emote', 'stv');

				const realAmmountNode = document.createElement('div');
				realAmmountNode.classList.add('smaller');
				realAmmountNode.appendChild(document.createTextNode(`(${emote.realAmmount})`));
				node.appendChild(realAmmountNode);

				const img = document.createElement('img');
				img.dataset.src = `https://cdn.7tv.app/emote/${id}/3x.webp`;
				img.classList.add('lazy');
				node.appendChild(img);

				const ammount = document.createElement('div');
				ammount.appendChild(document.createTextNode(`${emote.ammount}`));
				node.appendChild(ammount);
			} else if (type === 'twitch') {
				node = document.createElement('div');
				node.classList.add('emote', 'twitch');

				const realAmmountNode = document.createElement('div');
				realAmmountNode.classList.add('smaller');
				realAmmountNode.appendChild(document.createTextNode(`(${emote.realAmmount})`));
				node.appendChild(realAmmountNode);

				const img = document.createElement('img');
				img.dataset.src = `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`;
				img.classList.add('lazy');
				node.appendChild(img);

				const ammount = document.createElement('div');
				ammount.appendChild(document.createTextNode(`${emote.ammount}`));
				node.appendChild(ammount);
			}

			return { type, data: emote, node };
		}

		let allEmotes: { chn: ChannelEmoteData[]; stv: Emote7tvData[] };
		async function retrieveEmotes() {
			let seventvEmotes: Emote7tvData[] = [];
			try {
				const call = await fetch('https://7tv.io/v3/emote-sets/62d73f58d8e61c27b053c09a');
				const json = await call.json();
				// const json = json7tvMock;

				seventvEmotes = json.emotes.map((emote: any) => {
					return {
						realAmmount: 0,
						ammount: 0,
						data: {
							id: emote.data.id,
							name: emote.name,
							animated: emote.data.animated,
							listed: emote.data.listed
						}
					};
				});
			} catch (e) {
				return Promise.reject();
			}

			allEmotes = { chn: channelEmotes, stv: seventvEmotes };

			return Promise.resolve();
		}

		async function initialModcheck() {
			// let emoteUsage: EmoteUsage = emoteUsageMock;
			const response = await fetch(
				'https://zle5lrm7f7fnrc2di5fw7wnrfe0uwunk.lambda-url.eu-west-2.on.aws'
			);
			let emoteUsage: EmoteUsage = (await response.json()).emoteUsage;

			if (emoteUsage) {
				const loadingNode = document.body.querySelector('main #loading');

				const emotesHolder = document.body.querySelector('main #emotes');
				if (emotesHolder) {
					if (loadingNode) {
						loadingNode.classList.add('hidden');
					}

					emotesHolder.classList.remove('hidden');

					const emotes: EmoteNode[] = [];
					Object.entries(emoteUsage.twitch).forEach(function ([id, twiEmote]) {
						emotes.push(createEmoteNode('twitch', twiEmote, id));
					});

					Object.entries(emoteUsage.seventv).forEach(function ([id, stvEmote]) {
						emotes.push(createEmoteNode('7tv', stvEmote, id));
					});

					emotes
						.sort((a, b) => {
							let sort = b.data.ammount - a.data.ammount;
							if (sort === 0) sort = b.data.realAmmount - a.data.realAmmount;
							if (sort === 0) sort = b.type.length - a.type.length; // Twitch is longer, so goes first
							return sort;
						})
						.forEach(({ node }) => {
							if (node) emotesHolder.appendChild(node);
						});

					allEmotes.chn.forEach((emote) => {
						if (!emoteUsage.twitch[emote.data.id]) {
							const emoteNode = createEmoteNode('twitch', emote, emote.data.id).node;
							if (emoteNode) {
								emotesHolder.appendChild(emoteNode);
							}
						}
					});

					allEmotes.stv.forEach((emote) => {
						if (!emoteUsage.seventv[emote.data.id]) {
							const emoteNode = createEmoteNode('7tv', emote, emote.data.id).node;
							if (emoteNode) {
								emotesHolder.appendChild(emoteNode);
							}
						}
					});
				}
			}
		}

		retrieveEmotes().then(() => {
			initialModcheck();
		});

		if ('IntersectionObserver' in window) {
			lazyLoadWithObserver();
		} else {
			lazyLoadWithEvents();

			document.getElementById('emotes')?.addEventListener('scroll', lazyLoadWithEvents);
			globalThis.window.addEventListener('resize', lazyLoadWithEvents);
			globalThis.window.addEventListener('orientationChange', lazyLoadWithEvents);
		}
	});
</script>

<div id="loading">
	<span class="uppercase">C</span>hecking...
	<img
		class="smaller"
		src="https://cdn.7tv.app/emote/60eefb20119bd109472f7f4b/4x.webp"
		title="modCheck"
		alt="modCheck"
	/>
</div>

<div id="emotes" class="hidden"></div>

<style>
	.hidden {
		display: none !important;
	}

	.smaller {
		font-size: 0.9rem;
	}

	#emotes {
		display: flex;
		flex-wrap: wrap;
		overflow: scroll;
		margin: 0 15px;
	}

	:global(#emotes .emote.stv) {
		color: #29b6f6;
	}
	:global(#emotes .emote.twitch) {
		color: #8a47eb;
	}

	:global(#emotes img) {
		max-height: 100px;
		max-width: 100%;
	}

	:global(#emotes > div) {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		width: 155px;
		height: 155px;
		padding: 5px 0;

		border: 1px solid #db1e83;
	}
</style>
