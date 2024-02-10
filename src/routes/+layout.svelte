<script lang="ts">
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/stores';

	let currentPage = $page.url.pathname;
	function onRouteChange() {
		const newPath = $navigating?.to?.route.id;
		if (newPath) {
			currentPage = newPath;
		}
	}

	let linaSpawner: number | null = null;
	function spawnNewLina() {
		const main = document.getElementsByTagName('main')[0];

		const base_position = main.getClientRects()[0].top;
		const max_height = base_position + main.getClientRects()[0].height - 56;

		const rand_position = Math.floor(Math.random() * (max_height - base_position)) + base_position;

		// const random = Math.floor(Math.random() * 2) + 1;
		const lina = document.createElement('img');
		// linaSpin.src = `img/linaa${random}.gif`;
		lina.src = `https://juners.github.io/lina_kuru/img/linaa1.gif`;
		lina.height = 56;
		lina.style.position = 'absolute';
		lina.style.right = '0px';
		lina.style.top = rand_position + 'px';
		lina.style.zIndex = '-1';

		document.body.appendChild(lina);

		let pos = 0;
		const limit = window.innerWidth + 100;
		let id = setInterval(() => {
			if (pos >= limit) {
				clearInterval(id);
				lina.remove();
			} else {
				pos += 10;
				lina.style.right = pos + 'px';
			}
		}, 12);
	}

	function despawnLinas() {
		if (linaSpawner) {
			clearInterval(linaSpawner);
		}
	}

	onMount(() => {
		const linaKuru = document.getElementById('lina_kuru');

		if (linaKuru) {
			linaKuru.addEventListener('mouseenter', () => {
				linaSpawner = setInterval(() => {
					spawnNewLina();
				}, 300);
			});
			linaKuru.addEventListener('mouseleave', () => {
				despawnLinas();
			});
		}
	});

	$: if ($navigating) onRouteChange();
</script>

<header>
	<nav>
		<div>
			<a href="/live" class:current={currentPage === '/' || currentPage.startsWith('/live')}
				>Live check</a
			>
			<a href="/copypasta" class:current={currentPage.startsWith('/copypasta')}>Copypastas</a>
			<a href="/emotes" class:current={currentPage.startsWith('/emotes')}>Emotes</a>
		</div>

		<div class="end">
			<a href="/about" class:current={currentPage.startsWith('/about')}>About</a>
			<a
				id="lina_kuru"
				href="https://juners.github.io/lina_kuru/"
				target="_blank"
				title="Opens in a new tab"
			>
				lina_kuru <span class="iconify new_window"></span>
			</a>
		</div>
	</nav>
</header>

<main>
	<slot />
</main>

<footer>
	<div>
		A <u class="dotted" title="You can blame Juners for this">broner</u> fan project. Not affiliated
		with the official
		<a href="https://nekrolina.com" target="_blank">Nekrolina</a> streamer.
	</div>
</footer>
