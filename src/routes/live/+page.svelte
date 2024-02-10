<script lang="ts">
	import { onMount } from 'svelte';
	import Online from './online.svelte';
	import Offline from './offline.svelte';

	let lastTime = false;

	onMount(() => {
		async function modcheck() {
			const response = await fetch(
				'https://jkkpdgzibxxq5gcuc3c7mqbtui0ibwyq.lambda-url.eu-west-2.on.aws'
			);

			const json = await response.json();
			lastTime = json.lastTime;

			if (lastTime) {
				const icon: HTMLLinkElement | null = document.head.querySelector('#icon');
				if (icon) {
					icon.href = 'https://cdn.7tv.app/emote/6324a0b1e062d588b69fa0bc/1x.webp';
				}
			} else {
				const icon: HTMLLinkElement | null = document.head.querySelector('#icon');
				if (icon) {
					icon.href = 'https://cdn.7tv.app/emote/63236d1020f2964c27fdb2c0/1x.webp';
				}
			}
		}

		modcheck();
	});
</script>

<svelte:head>
	<title>Let me check real quick... | Is Nekrolina live?</title>
</svelte:head>

{#if lastTime}
	<Online />
{:else}
	<Offline />
{/if}
