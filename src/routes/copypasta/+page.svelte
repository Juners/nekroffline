<script lang="ts">
	import { onMount } from 'svelte';

	function selectText(node: HTMLElement | null) {
		if (!node) return;

		// @ts-ignore
		if (document.selection) {
			// IE
			// @ts-ignore
			const range = document.createTextRange();
			range.moveToElementText(node);
			range.select();
			navigator.clipboard.writeText(range.toString().trim());
		} else if (window.getSelection) {
			// Others
			const selection = window.getSelection();
			if (selection) {
				const range = document.createRange();
				range.selectNodeContents(node);
				selection.removeAllRanges();
				selection.addRange(range);
				navigator.clipboard.writeText(selection.toString().trim());
			}
		} else {
			console.warn('Could not select text in node: Unsupported browser.');
		}
	}

	onMount(() => {
		document.body.querySelectorAll('.lazy-ass-copy').forEach((div) =>
			div.addEventListener('click', (ev) => {
				selectText(div.querySelector('p'));
			})
		);
	});
</script>

<h1>
	<span class="uppercase">M</span>onkey sees, monkey does
	<img
		src="https://cdn.7tv.app/emote/62e94cec80419c32e6821ea1/2x.webp"
		alt="monke emote"
		title="monke"
	/>
</h1>

<div class="comedian-chatter">
	<div class="super-funny-texts">
		<div class="lazy-ass-copy" title="Click to copy">
			<span class="iconify content-copy black"></span>
			<div class="types">
				<div class="no-tts" title="Won't work well with TTS">
					<span class="iconify no-tts black"></span>
				</div>
				<div class="chat" title="Works well with chat">
					<span class="iconify chat black"></span>
				</div>
			</div>

			<h4>Spitties redeem</h4>
			<p>
				<img src="https://cdn.7tv.app/emote/611a521272c501b4a93be74a/1x.webp" alt="ppDodge" /> too
				slow
				<img src="https://cdn.7tv.app/emote/611a521272c501b4a93be74a/1x.webp" alt="ppDodge" /> too
				slow
				<img src="https://cdn.7tv.app/emote/611a521272c501b4a93be74a/1x.webp" alt="ppDodge" /> too
				slow
				<img src="https://cdn.7tv.app/emote/611a521272c501b4a93be74a/1x.webp" alt="ppDodge" /> too
				slow
				<img src="https://cdn.7tv.app/emote/611a521272c501b4a93be74a/1x.webp" alt="ppDodge" />
			</p>
			<!-- CHECK -->
		</div>

		<div class="lazy-ass-copy" title="Click to copy">
			<span class="iconify content-copy black"></span>
			<div class="types">
				<div class="tts" title="Can be used for TTS with bits and subs">
					<span class="iconify tts black"></span>
				</div>
				<div class="no-chat" title="Won't work well with chat">
					<span class="iconify no-chat black"></span>
				</div>
			</div>

			<h4>Fake phone</h4>
			<p>ᴺᴺᴺᴺᴺᴺᴺᴺᴺᴺᴺ! ᴺᴺᴺᴺᴺᴺᴺᴺᴺᴺᴺ! ᴺᴺᴺᴺᴺᴺᴺᴺᴺᴺᴺ!</p>
		</div>

		<div class="lazy-ass-copy" title="Click to copy">
			<span class="iconify content-copy black"></span>
			<div class="types">
				<div class="tts" title="Can be used for TTS with bits and subs">
					<span class="iconify tts black"></span>
				</div>
				<div class="chat" title="Works well with chat">
					<span class="iconify chat black"></span>
				</div>
			</div>
			<h4>Grocery store</h4>
			<p>
				So one time when I went to the grocery store to get some groceries, um, I was walking there.
				So I left my apartment first to go to the grocery store, uh -- because I had to buy more
				groceries. And then when I went- uh, on my way to the grocery store for getting groceries, I
				realized that -- I was walking there. So I left my apartment first to go to the grocery
				store, uh -- because I had to buy more groceries. And then when I went- uh, on my way to the
				grocery store for getting groceries.
			</p>
		</div>

		<div class="lazy-ass-copy" title="Click to copy">
			<span class="iconify content-copy black"></span>
			<div class="types">
				<div class="tts" title="Can be used for TTS with bits and subs">
					<span class="iconify tts black"></span>
				</div>
				<div class="chat" title="Works well with chat">
					<span class="iconify chat black"></span>
				</div>
			</div>

			<h4>By the gods (extra flavour)</h4>
			<p>
				BY THE GODS !!! Another soul has risen from the dead, but they don't seem like a normal
				boner. Ugh, no!!! No, they're not one at all. They have chosen to not just rise from the
				dead, but to also rise from the filth and muck they were once in, in order to reach further
				into the depths of hell, in order to challenge the nekromancer princess. Yes, it's clear to
				me now. They have not become a puny boner, this individual has chosen to lead them as a
				BONER OVERLORD !!! UwU Balls
			</p>
		</div>
	</div>

	<div class="super-funny-texts">
		<div class="lazy-ass-copy" title="Click to copy">
			<span class="iconify content-copy black"></span>
			<div class="types">
				<div class="no-tts" title="Won't work well with TTS">
					<span class="iconify no-tts black"></span>
				</div>
				<div class="chat" title="Works well with chat">
					<span class="iconify chat black"></span>
				</div>
			</div>

			<h4>Wankge</h4>
			<!-- <p>Wankge Thinking yoooo Thinking2</p> -->
			<p>
				<img src="https://cdn.7tv.app/emote/61e5466077175547b425a8a7/1x.webp" alt="Wankge" />
				<img src="https://cdn.7tv.app/emote/603e9f57284626000d068870/1x.webp" alt="Thinking" />
				<img src="https://cdn.7tv.app/emote/6139e92833f0020ec54a8339/1x.webp" alt="yoooo" />
				<img src="https://cdn.7tv.app/emote/603e9f61284626000d068871/1x.webp" alt="Thinking2" />
			</p>
		</div>

		<div class="lazy-ass-copy" title="Click to copy">
			<span class="iconify content-copy black"></span>
			<div class="types">
				<div class="no-tts" title="Won't work well with TTS">
					<span class="iconify no-tts black"></span>
				</div>
				<div class="chat" title="Works well with chat">
					<span class="iconify chat black"></span>
				</div>
			</div>

			<h4>Wankge Lina</h4>
			<p>
				<img src="https://cdn.7tv.app/emote/61e5466077175547b425a8a7/1x.webp" alt="Wankge" />
				<img src="https://cdn.7tv.app/emote/603e9f57284626000d068870/1x.webp" alt="Thinking" />
				<img
					src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_3dd20a512cd0474baa6d54d8b3f2a295/default/dark/1.0"
					alt="nekrolinaLickies"
				/>
				<img src="https://cdn.7tv.app/emote/603e9f61284626000d068871/1x.webp" alt="Thinking2" />
			</p>
		</div>

		<div class="lazy-ass-copy" title="Click to copy">
			<span class="iconify content-copy black"></span>
			<div class="types">
				<div class="tts" title="Can be used for TTS with bits and subs">
					<span class="iconify tts black"></span>
				</div>
				<div class="chat" title="Works well with chat">
					<span class="iconify chat black"></span>
				</div>
			</div>

			<h4>Only viewer</h4>
			<p>
				Hi Lina- It's me, your only Viewer. For Months I have created the illusion that you are
				streaming to a large audience. But here's the truth: all these people in the chat are me.
				And now, for you to be convinced of this, I will send this message from all my accounts.
			</p>
		</div>

		<div class="lazy-ass-copy" title="Click to copy">
			<span class="iconify content-copy black"></span>
			<div class="types">
				<div class="tts" title="Can be used for TTS with bits and subs">
					<span class="iconify tts black"></span>
				</div>
				<div class="chat" title="Works well with chat">
					<span class="iconify chat black"></span>
				</div>
			</div>

			<h4>uwu Song</h4>
			<p>
				x3 nuzzles! pounces on you uwu you so warm (Ooo) Couldn't help but notice your bulge from
				across the floor Nuzzles yo' necky wecky-tilde murr-tilde hehe Unzips yo baggy ass pants,
				oof baby you so musky Take me home, pet me, ’n' make me yours and don't forget to stuff me!
				See me wag my widdle baby tail all for your buldgy-wuldgy! Kissies 'n' lickies yo neck I
				hope daddy likies Nuzzles 'n' wuzzles yo chest (yuh) I be (yeah) gettin' thirsty
			</p>
		</div>
	</div>
</div>
