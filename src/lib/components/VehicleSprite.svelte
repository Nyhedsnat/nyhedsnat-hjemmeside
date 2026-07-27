<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SIZE, type SizeCategory, type EffectName } from '$lib/vehicles';

	// Presentational sprite: given an `effect` string it renders the car image plus
	// that effect's visual (smoke, confetti, meteor, …). No click handling, no
	// state, no motion — the controller (Vehicles/SnowCrash) decides when an egg
	// fires and passes `effect`; `null` shows a plain car. `fire` shows the engine
	// flames (car-5 firestop), gated separately by the controller's choreography.
	// `extra` is an OPEN slot for visuals that must physically belong to the car —
	// it's rendered inside `.car-body`, the element that carries BOTH the base ltr
	// flip and every motion effect's transform (flyout, slingre, wheelie, ...), so
	// whatever the caller passes automatically moves/flies/wobbles along with the
	// car instead of staying behind on the road (e.g. the fleet's underglow, or a
	// snow-pile car's crash-fx). No per-feature prop needed — any future car-
	// attached decoration is just another snippet passed in from the caller.
	// Contrast with the effect overlays below (smoke, dust, splash) which stay
	// siblings of `.car-body` because they represent something happening to the
	// ROAD, not the car, and should stay put if the car flies off.
	let {
		src,
		size,
		direction,
		effect = null,
		fire = false,
		extra
	}: {
		src: string;
		size: SizeCategory;
		direction?: 'ltr' | 'rtl';
		effect?: EffectName | null;
		fire?: boolean;
		extra?: Snippet;
	} = $props();

	const height = $derived(SIZE[size]);
</script>

<div class="sprite {direction ?? ''}">
	{#if effect === 'drift' || effect === 'firestop' || effect === 'smokewheelie' || effect === 'nitro'}<div class="smoke" class:smoke-wild={effect === 'firestop'}></div>{/if}
	{#if effect === 'smokewheelie'}<div class="land-dust" aria-hidden="true"><span></span><span></span><span></span><span></span></div>{/if}
	{#if effect === 'busjump'}<div class="bus-dust" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>{/if}
	{#if effect === 'firestop'}<div class="smoke smoke-wild smoke-second"></div>{/if}
	{#if fire}<div class="engine-fire" aria-hidden="true"><span class="fire-tongue"></span><span class="fire-tongue"></span><span class="fire-tongue"></span><span class="fire-core"></span></div>{/if}
	{#if effect === 'turbo'}<div class="flame turbo-flame"></div>{/if}
	{#if effect === 'nitro'}<div class="exhaust-fire"></div>{/if}
	{#if effect === 'press'}<div class="breaking">BREAKING</div>{/if}
	{#if effect === 'disco'}<div class="disco-glow disco-car" aria-hidden="true"></div><div class="disco-glow disco-trailer" aria-hidden="true"></div>{/if}
	{#if effect === 'splash'}
		<div class="water-splash" aria-hidden="true">
			<div class="puddle"></div>
			<div class="splash-sheet"></div>
			<span class="drop"></span><span class="drop"></span><span class="drop"></span>
			<span class="drop"></span><span class="drop"></span><span class="drop"></span>
			<span class="drop"></span><span class="drop"></span><span class="drop"></span>
		</div>
	{/if}
	{#if effect === 'poof'}
		<div class="poof-fx" aria-hidden="true">
			<span></span><span></span><span></span><span></span><span></span><span></span>
			<span></span><span></span><span></span><span></span><span></span><span></span>
		</div>
	{/if}
	{#if effect === 'meteorpanic'}
		<div class="meteor">
			<div class="meteor-trail" aria-hidden="true">
				<span></span><span></span><span></span><span></span><span></span><span></span>
			</div>
			<img src="/svg/eastereggs/vehicles/meteor.svg" alt="" draggable="false" />
		</div>
		<div class="meteor-flash"></div>
		<div class="meteor-shockwave"></div>
		<div class="meteor-fire"></div>
		<div class="meteor-smoke"></div>
	{/if}
	<div class="car-body {effect ?? ''}">
		<img {src} alt="" class="car" style="height: {height}px;" draggable="false" />
		{@render extra?.()}
	</div>
</div>

<style>
	.sprite {
		position: relative;
		display: inline-block;
		vertical-align: bottom;
	}

	.car {
		display: block;
		width: auto;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
	}

	/* .car-body carries the base ltr flip AND every motion effect's transform, so
	   anything rendered inside it (the image, plus any `decorations`) moves, flies
	   or wobbles together as one unit — see the `decorations` prop doc above. */
	.car-body {
		position: relative;
		z-index: 2;
		display: inline-block; /* shrink-wrap to the image, not stretch to .sprite's width */
	}

	.sprite.ltr .car-body {
		transform: scaleX(-1);
	}

	.sprite.ltr .car-body.slingre { animation: slingre-ltr 3.6s ease-in-out; }
	.sprite.rtl .car-body.slingre { animation: slingre-rtl 3.6s ease-in-out; }
	.sprite.ltr .car-body.flyout { animation: flyout-ltr 8s ease-in-out forwards; }
	.sprite.rtl .car-body.flyout { animation: flyout-rtl 8s ease-in-out forwards; }
	.car-body.drift { animation: drift 1.8s ease-out; }
	.sprite.ltr .car-body.firestop { animation: fireShake-ltr 1.2s linear 2; }
	.sprite.rtl .car-body.firestop { animation: fireShake-rtl 1.2s linear 2; }
	.sprite.ltr .car-body.splash { animation: splash-bob-ltr 1.2s ease-out; }
	.sprite.rtl .car-body.splash { animation: splash-bob-rtl 1.2s ease-out; }
	/* press/nitro are filter-only (no motion) — stay targeted at the image itself */
	.car-body.press .car { animation: flash 0.2s steps(2, end) 10; }
	/* turbo/nitro motion is driven by the container's drive-animation playbackRate
	   (see boostDrive) — the image only carries the visual treatment. */
	.sprite.ltr .car-body.wheelie {
		transform-origin: 50% 100%;
		animation: wheelie-ltr 2.5s ease-out;
	}
	.sprite.rtl .car-body.wheelie {
		transform-origin: 50% 100%;
		animation: wheelie-rtl 2.5s ease-out;
	}
	.sprite.ltr .car-body.smokewheelie {
		transform-origin: 50% 100%;
		animation: smokewheelie-ltr 3s ease-in-out;
	}
	.sprite.rtl .car-body.smokewheelie {
		transform-origin: 50% 100%;
		animation: smokewheelie-rtl 3s ease-in-out;
	}
	.sprite.ltr .car-body.meteorpanic { animation: panic-ltr 3.5s ease-out; }
	.sprite.rtl .car-body.meteorpanic { animation: panic-rtl 3.5s ease-out; }
	.car-body.nitro .car { filter: blur(0.8px) saturate(1.4); }
	/* Stretch limo: comically elongates with an elastic boing, then springs back.
	   transform-origin at the road keeps the wheels grounded while it jiggles. */
	.car-body.stretch { transform-origin: 50% 100%; }
	.sprite.ltr .car-body.stretch { animation: stretch-ltr 2s ease-in-out; }
	.sprite.rtl .car-body.stretch { animation: stretch-rtl 2s ease-in-out; }
	.sprite.ltr .car-body.uturn { animation: uturn-ltr 2.1s linear forwards; }
	.sprite.rtl .car-body.uturn { animation: uturn-rtl 2.1s linear forwards; }
	/* convoy dance: rocks side to side to the beat with a bob (matches the RGB underglow) */
	.car-body.dance { transform-origin: 50% 100%; }
	.sprite.ltr .car-body.dance { animation: dance-ltr 0.9s ease-in-out; }
	.sprite.rtl .car-body.dance { animation: dance-rtl 0.9s ease-in-out; }
	.sprite.ltr .car-body.poof { animation: poof-ltr 0.4s ease-in forwards; }
	.sprite.rtl .car-body.poof { animation: poof-rtl 0.4s ease-in forwards; }
	/* Bus click: the big heavy bus crouches and pulls off a surprise jump (keeps rolling). */
	.car-body.busjump { transform-origin: 50% 100%; }
	.sprite.ltr .car-body.busjump { animation: bus-jump-ltr 1.4s linear; }
	.sprite.rtl .car-body.busjump { animation: bus-jump-rtl 1.4s linear; }


	/* Magic vanish confetti — bursts from the car's spot just as it disappears. */
	/* Centred on the car body, not the image centre — car-2's SVG includes a long
	   headlight beam, so the wheel-centre is ~26% for the flipped ltr car and ~74%
	   for the rtl car. The 0.34s delay makes the burst land the instant the car
	   has finished vanishing (the poof animation is 0.4s). */
	.poof-fx {
		position: absolute;
		left: 26%;
		top: 45%;
		width: 0;
		height: 0;
		z-index: 5;
		pointer-events: none;
	}
	.sprite.rtl .poof-fx {
		left: 74%;
	}
	/* Round glowing embers/dust, not confetti squares — car-2's own warm gold/amber
	   palette (matches its body paint, not a rainbow) so it reads as "turned to dust",
	   not "exploded into a party favor". */
	.poof-fx span {
		position: absolute;
		left: 0;
		top: 0;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		opacity: 0;
		box-shadow: 0 0 4px currentColor;
		animation: confetti-burst 0.8s ease-out 0.34s forwards;
	}
	.poof-fx span:nth-child(1)  { background: #ffd86a; color: #ffd86a; --dx: 46px;  --dy: -34px; }
	.poof-fx span:nth-child(2)  { background: #ffb347; color: #ffb347; --dx: -42px; --dy: -30px; }
	.poof-fx span:nth-child(3)  { background: #fff2b3; color: #fff2b3; --dx: 30px;  --dy: -52px; }
	.poof-fx span:nth-child(4)  { background: #ffe88a; color: #ffe88a; --dx: -28px; --dy: -50px; }
	.poof-fx span:nth-child(5)  { background: #ff3b3b; color: #ff3b3b; --dx: 54px;  --dy: -8px;  }
	.poof-fx span:nth-child(6)  { background: #ffd86a; color: #ffd86a; --dx: -54px; --dy: -6px;  }
	.poof-fx span:nth-child(7)  { background: #ffb347; color: #ffb347; --dx: 14px;  --dy: -58px; }
	.poof-fx span:nth-child(8)  { background: #fff2b3; color: #fff2b3; --dx: -16px; --dy: -44px; }
	.poof-fx span:nth-child(9)  { background: #ffe88a; color: #ffe88a; --dx: 38px;  --dy: -22px; }
	.poof-fx span:nth-child(10) { background: #ffd86a; color: #ffd86a; --dx: -38px; --dy: -18px; }
	.poof-fx span:nth-child(11) { background: #ffb347; color: #ffb347; --dx: 8px;   --dy: -40px; }
	.poof-fx span:nth-child(12) { background: #ff3b3b; color: #ff3b3b; --dx: -8px;  --dy: -36px; }

	.smoke {
		position: absolute;
		left: 20%;
		top: -20px;
		width: 40px;
		height: 40px;
		background: radial-gradient(circle, rgba(120,120,120,.7), transparent 70%);
		animation: smoke 1.2s ease-out infinite;
		pointer-events: none;
	}
	.sprite.rtl .smoke {
		left: auto;
		right: 15%;
	}
	/* firestop: bigger, darker, faster "wild" smoke + a second offset puff */
	.smoke.smoke-wild {
		width: 60px;
		height: 60px;
		top: -34px;
		background: radial-gradient(circle, rgba(70,70,75,.9), transparent 70%);
		animation-duration: 0.8s;
	}
	.smoke.smoke-second {
		left: 42%;
		top: -22px;
		width: 46px;
		height: 46px;
		animation-duration: 0.95s;
		animation-delay: -0.4s;
	}
	.sprite.rtl .smoke.smoke-second {
		left: auto;
		right: 38%;
	}
	/* firestop: engine fire — several flame tongues of different heights with a
	   bright core, each licking on its own timing so it reads as a real fire. */
	.engine-fire {
		position: absolute;
		left: 26%;
		bottom: 6px;
		width: 34px;
		height: 46px;
		z-index: 3;
		pointer-events: none;
		transform-origin: bottom center;
		opacity: 0;
		animation: engine-fire-burst 3.9s ease-out forwards;
	}
	/* shared flame-tongue shape: rounded base, tapered point at the top */
	.fire-tongue,
	.fire-core {
		position: absolute;
		bottom: 0;
		transform-origin: bottom center;
		clip-path: polygon(50% 0%, 67% 28%, 82% 56%, 71% 84%, 50% 100%, 29% 84%, 18% 56%, 33% 28%);
	}
	.fire-tongue {
		background: linear-gradient(to top, #ffcf4d 0%, #ff8a1f 28%, #ff3d05 58%, rgba(206, 32, 0, 0.55) 84%, transparent 100%);
		filter: blur(1.5px);
	}
	.fire-tongue:nth-child(1) { left: 0;    bottom: 1px; width: 17px; height: 30px; animation: flame-lick 0.4s  ease-in-out infinite; }
	.fire-tongue:nth-child(2) { left: 8px;  bottom: 0;   width: 20px; height: 46px; animation: flame-lick 0.32s ease-in-out infinite reverse; }
	.fire-tongue:nth-child(3) { left: 19px; bottom: 1px; width: 15px; height: 27px; animation: flame-lick 0.46s ease-in-out infinite; animation-delay: -0.13s; }
	.fire-core {
		left: 9px;
		width: 16px;
		height: 30px;
		background: linear-gradient(to top, #ffffff 0%, #fff2ac 32%, #ffbb3a 66%, rgba(255, 140, 0, 0.4) 90%, transparent 100%);
		filter: blur(0.9px);
		animation: flame-lick 0.28s ease-in-out infinite;
	}
	.sprite.rtl .engine-fire {
		left: auto;
		right: 26%;
	}
	/* nyhedsnat rig gets a rainbow RGB underglow on click, matching the convoy —
	   one glow under the car, one under the trailer. The SVG has a long headlight
	   beam, so positions are taken from the wheel cx values (car ~41% natural,
	   trailer ~84%/82%), mirrored to rendered % for the flipped ltr car. */
	.disco-glow {
		position: absolute;
		bottom: 3px;
		transform: translateX(-50%);
		width: 70px;
		height: 9px;
		border-radius: 999px;
		background: linear-gradient(90deg, #ff2a6d, #ff8a00, #ffe600, #00f5a0, #00d4ff, #7b61ff, #ff2ad4);
		background-size: 250% 100%;
		filter: blur(4px);
		opacity: 0.85;
		z-index: 1;
		pointer-events: none;
		animation: disco-shift 1.1s linear infinite, disco-flicker 0.35s steps(2, end) infinite;
	}
	.disco-car {
		left: 58%;
	}
	.disco-trailer {
		left: 16%;
		width: 60px;
		animation-delay: -0.18s, -0.12s; /* shimmer slightly out of phase with the car */
	}
	.sprite.rtl .disco-car {
		left: 41%;
	}
	.sprite.rtl .disco-trailer {
		left: 82%;
	}
	/* Dust kicked up as the wheelie's front wheel lands (~2.2s into smokewheelie). */
	.land-dust {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		z-index: 1;
		pointer-events: none;
	}
	.land-dust span {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(170, 158, 138, 0.7), transparent 70%);
		filter: blur(1px);
		opacity: 0;
		animation: land-dust-puff 0.55s ease-out 2.45s forwards;
	}
	.land-dust span:nth-child(1) { --dx: -34px; }
	.land-dust span:nth-child(2) { --dx: -12px; }
	.land-dust span:nth-child(3) { --dx: 12px; }
	.land-dust span:nth-child(4) { --dx: 34px; }

	/* Dust kicked up when the jumping bus lands (~1s into bus-jump). */
	.bus-dust {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		z-index: 3; /* in FRONT of the bus body (z2) so the cloud rolls up and over it */
		pointer-events: none;
	}
	.bus-dust span {
		position: absolute;
		bottom: -2px; /* born at the road */
		left: 0;
		border-radius: 50%;
		/* soft, light dusty puffs — many overlap into one dense, cloudy mass */
		background: radial-gradient(circle at 50% 60%, rgba(214, 203, 182, var(--op, 0.8)), rgba(198, 186, 164, 0) 72%);
		filter: blur(2.6px);
		opacity: 0;
		animation: bus-dust-puff 2.4s ease-out calc(0.96s + var(--pd, 0s)) forwards;
	}
	/* low ground wave: wide, short puffs that hug the road and roll outward */
	.bus-dust span:nth-child(1) { --dx: -100px; --dy: -3px; --op: 0.8;  --pd: 0s;    width: 30px; height: 17px; }
	.bus-dust span:nth-child(2) { --dx: -72px;  --dy: -6px; --op: 0.88; --pd: 0.05s; width: 44px; height: 24px; }
	.bus-dust span:nth-child(3) { --dx: -44px;  --dy: -4px; --op: 0.9;  --pd: 0.02s; width: 50px; height: 26px; }
	.bus-dust span:nth-child(4) { --dx: -20px;  --dy: -7px; --op: 0.88; --pd: 0.07s; width: 46px; height: 24px; }
	.bus-dust span:nth-child(5) { --dx: 0px;    --dy: -5px; --op: 0.95; --pd: 0s;    width: 54px; height: 28px; }
	.bus-dust span:nth-child(6) { --dx: 20px;   --dy: -7px; --op: 0.88; --pd: 0.07s; width: 46px; height: 24px; }
	.bus-dust span:nth-child(7) { --dx: 44px;   --dy: -4px; --op: 0.9;  --pd: 0.02s; width: 50px; height: 26px; }
	.bus-dust span:nth-child(8) { --dx: 72px;   --dy: -6px; --op: 0.88; --pd: 0.05s; width: 44px; height: 24px; }
	.bus-dust span:nth-child(9) { --dx: 100px;  --dy: -3px; --op: 0.8;  --pd: 0s;    width: 30px; height: 17px; }
	/* cover layer: taller, rounder puffs that billow up and OVER the bus body,
	   densest low and thinning toward the top so the roof still peeks through */
	.bus-dust span:nth-child(10) { --dx: -60px; --dy: -26px; --op: 0.68; --pd: 0.10s; width: 40px; height: 34px; }
	.bus-dust span:nth-child(11) { --dx: -34px; --dy: -40px; --op: 0.72; --pd: 0.14s; width: 44px; height: 40px; }
	.bus-dust span:nth-child(12) { --dx: -12px; --dy: -50px; --op: 0.75; --pd: 0.17s; width: 42px; height: 38px; }
	.bus-dust span:nth-child(13) { --dx: 12px;  --dy: -48px; --op: 0.75; --pd: 0.16s; width: 42px; height: 38px; }
	.bus-dust span:nth-child(14) { --dx: 34px;  --dy: -40px; --op: 0.72; --pd: 0.14s; width: 44px; height: 40px; }
	.bus-dust span:nth-child(15) { --dx: 60px;  --dy: -26px; --op: 0.68; --pd: 0.10s; width: 40px; height: 34px; }
	.bus-dust span:nth-child(16) { --dx: -22px; --dy: -58px; --op: 0.6;  --pd: 0.20s; width: 36px; height: 34px; }
	.bus-dust span:nth-child(17) { --dx: 22px;  --dy: -56px; --op: 0.6;  --pd: 0.20s; width: 36px; height: 34px; }
	.bus-dust span:nth-child(18) { --dx: 0px;   --dy: -64px; --op: 0.5;  --pd: 0.24s; width: 32px; height: 30px; }

	/* 4x4 plows through a puddle: a water splash centred between the wheels.
	   The SVG also contains a long headlight beam, so the wheel-centre is NOT the
	   image centre — wheels sit at ~70% of the SVG (cx 342 & 466 of a 580 box),
	   which mirrors to ~30% when the car is flipped for ltr.
	   (Named .water-splash so it never collides with the img's .splash effect class.) */
	.water-splash {
		position: absolute;
		bottom: 0;
		left: 30%;
		width: 0;
		height: 0;
		z-index: 4; /* in front of the car body so the centred spray stays visible */
		pointer-events: none;
	}
	.sprite.rtl .water-splash {
		left: 70%;
	}
	.water-splash .puddle {
		position: absolute;
		bottom: 1px;
		left: 50%;
		width: 96px;
		height: 12px;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(150, 200, 235, 0.5), rgba(150, 200, 235, 0) 70%);
		opacity: 0;
		transform: translateX(-50%) scaleX(0.2);
		animation: puddle-ripple 1.5s ease-out forwards;
	}
	.splash-sheet {
		position: absolute;
		bottom: 2px;
		left: 50%;
		width: 40px;
		height: 32px;
		border-radius: 50% 50% 42% 42%;
		background: radial-gradient(ellipse at bottom, rgba(205, 230, 250, 0.9), rgba(150, 200, 235, 0.35) 55%, transparent 78%);
		filter: blur(0.5px);
		opacity: 0;
		transform-origin: bottom center;
		transform: translateX(-50%);
		animation: splash-sheet 0.7s ease-out forwards;
	}
	.water-splash .drop {
		position: absolute;
		bottom: 6px;
		left: 0;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(205, 232, 250, 0.95);
		box-shadow: 0 0 3px rgba(150, 200, 235, 0.7);
		opacity: 0;
		animation: splash-drop 0.75s ease-out forwards;
	}
	.water-splash .drop:nth-child(3)  { --dx: -38px; --dy: -30px; animation-delay: 0s; }
	.water-splash .drop:nth-child(4)  { --dx: -22px; --dy: -44px; animation-delay: 0.03s; }
	.water-splash .drop:nth-child(5)  { --dx: -8px;  --dy: -50px; animation-delay: 0.01s; }
	.water-splash .drop:nth-child(6)  { --dx: 8px;   --dy: -48px; animation-delay: 0.04s; }
	.water-splash .drop:nth-child(7)  { --dx: 24px;  --dy: -42px; animation-delay: 0.02s; }
	.water-splash .drop:nth-child(8)  { --dx: 40px;  --dy: -28px; animation-delay: 0.05s; }
	.water-splash .drop:nth-child(9)  { --dx: 56px;  --dy: -14px; animation-delay: 0s; }
	.water-splash .drop:nth-child(10) { --dx: -54px; --dy: -16px; animation-delay: 0.06s; }
	.water-splash .drop:nth-child(11) { --dx: 16px;  --dy: -54px; animation-delay: 0.03s; }
	.flame {
		position: absolute;
		top: 35%;
		left: -16px;
		width: 16px;
		height: 10px;
		background: linear-gradient(90deg, #30cfff, #7ee7ff, transparent);
		filter: blur(1px);
		animation: flame 0.16s steps(2, end) infinite;
	}

	.turbo-flame {
		z-index: 1;
		top: 26%;
		left: -104px;
		width: 104px;
		height: 26px;
		background: linear-gradient(90deg, #ffffff 0%, #ade6ff 22%, #38baff 52%, rgba(0, 140, 255, 0.55) 78%, transparent 100%);
		filter: blur(1.5px);
		border-radius: 999px;
		animation: turbo-flicker 0.16s steps(2, end) infinite;
	}

	.sprite.ltr .turbo-flame {
		transform: rotate(180deg);
	}

	.sprite.rtl .flame {
		left: auto;
		right: -16px;
	}

	.sprite.rtl .turbo-flame {
		left: auto;
		right: -104px;
	}

	/* Horizontal nitro jet blasting out of the rear (bumper height), not a
	   vertical flame rising from the road. ltr: car faces right, rear is on
	   the left, so the jet sits on the left with its hot white end at the car. */
	.exhaust-fire {
		position: absolute;
		bottom: 13px;
		left: -66px;
		width: 70px;
		height: 18px;
		pointer-events: none;
		z-index: 1;
		transform-origin: right center;
	}
	.exhaust-fire::before {
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg,
			transparent 0%,
			rgba(200,30,0,0.5) 20%,
			rgba(255,100,10,0.9) 48%,
			rgba(255,220,60,1) 82%,
			rgba(255,255,255,1) 100%
		);
		filter: blur(2px);
		border-radius: 60% 50% 50% 60% / 50%;
		animation: exhaust-flicker 0.1s steps(2, end) infinite;
		transform-origin: right center;
	}
	.exhaust-fire::after {
		content: '';
		position: absolute;
		top: 18%;
		right: 0;
		width: 68%;
		height: 64%;
		background: linear-gradient(90deg, transparent 0%, rgba(255,240,120,0.85) 55%, rgba(255,255,255,1) 100%);
		filter: blur(1px);
		border-radius: 60% 50% 50% 60% / 50%;
		animation: exhaust-inner 0.08s steps(2, end) infinite;
		transform-origin: right center;
	}
	.sprite.ltr .exhaust-fire {
		animation: nitro-follow-ltr 2.5s ease-out forwards;
	}
	/* rtl: car faces left, rear is on the right → jet on the right, hot end on the left */
	.sprite.rtl .exhaust-fire {
		left: auto;
		right: -66px;
		transform-origin: left center;
		animation: nitro-follow-rtl 2.5s ease-out forwards;
	}
	.sprite.rtl .exhaust-fire::before {
		background: linear-gradient(90deg,
			rgba(255,255,255,1) 0%,
			rgba(255,220,60,1) 18%,
			rgba(255,100,10,0.9) 52%,
			rgba(200,30,0,0.5) 80%,
			transparent 100%
		);
		border-radius: 50% 60% 60% 50% / 50%;
		transform-origin: left center;
	}
	.sprite.rtl .exhaust-fire::after {
		right: auto;
		left: 0;
		background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,240,120,0.85) 45%, transparent 100%);
		border-radius: 50% 60% 60% 50% / 50%;
		transform-origin: left center;
	}
	.breaking {
		position: absolute;
		top: -18px;
		left: 50%;
		transform: translateX(-50%);
		background: #c00;
		color: white;
		font-size: 9px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 4px;
		animation: fade 2s linear forwards;
	}
	.meteor {
		position: absolute;
		left: -150px;
		top: -420px;
		animation: meteorDrop 1.8s ease-in forwards;
		pointer-events: none;
	}
	.meteor img {
		position: relative;
		z-index: 2;
		width: 64px;
		height: auto;
		filter: drop-shadow(0 0 12px rgba(255, 100, 0, 1)) drop-shadow(0 0 4px #fff);
	}
	.meteor-fire {
		position: absolute;
		left: -110px;
		bottom: -4px;
		width: 55px;
		height: 65px;
		pointer-events: none;
		z-index: 3;
		background: radial-gradient(ellipse at bottom, rgba(255,255,255,0.95) 0%, rgba(255,150,0,0.85) 28%, rgba(255,50,0,0.6) 58%, transparent 100%);
		filter: blur(3px);
		border-radius: 50% 50% 0 0;
		opacity: 0;
		animation: meteor-fire-burst 2.2s ease-out 1.55s forwards;
	}
	.sprite.rtl .meteor-fire {
		left: auto;
		right: -110px;
	}
	.meteor-flash {
		position: absolute;
		left: -120px;
		bottom: -6px;
		width: 110px;
		height: 110px;
		border-radius: 50%;
		background: radial-gradient(circle, #fff 0%, rgba(255,230,80,0.95) 22%, rgba(255,100,10,0.6) 55%, transparent 100%);
		filter: blur(3px);
		transform: scale(0);
		opacity: 0;
		pointer-events: none;
		z-index: 5;
		animation: meteor-flash 0.55s ease-out 1.52s forwards;
	}
	.sprite.rtl .meteor-flash {
		left: auto;
		right: -120px;
	}
	.meteor-shockwave {
		position: absolute;
		left: -148px;
		bottom: -2px;
		width: 96px;
		height: 20px;
		border: 3px solid rgba(255, 200, 60, 0.95);
		border-radius: 50%;
		transform: scale(0.08);
		opacity: 0;
		pointer-events: none;
		z-index: 4;
		animation: meteor-shockwave 0.9s ease-out 1.54s forwards;
	}
	.sprite.rtl .meteor-shockwave {
		left: auto;
		right: -148px;
	}
	.meteor-smoke {
		position: absolute;
		left: -140px;
		bottom: 2px;
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(90,70,50,0.9) 0%, rgba(60,45,30,0.65) 50%, transparent 100%);
		filter: blur(8px);
		transform: scale(0) translateY(0);
		opacity: 0;
		pointer-events: none;
		z-index: 2;
		animation: meteor-smoke-rise 3s ease-out 1.58s forwards;
	}
	.sprite.rtl .meteor-smoke {
		left: auto;
		right: -140px;
	}
	.meteor-trail {
		position: absolute;
		left: 36px;
		top: 22px;
		width: 70px;
		height: 40px;
		z-index: 1;
		pointer-events: none;
	}
	.meteor-trail span {
		position: absolute;
		right: 0;
		top: 50%;
		width: 30px;
		height: 8px;
		transform: translateY(-50%);
		border-radius: 999px;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.85), rgba(255, 180, 60, 0.8), rgba(255, 80, 0, 0));
		filter: blur(1px);
		animation: meteorTrail 0.35s ease-out infinite;
	}
	.meteor-trail span:nth-child(2) { top: 35%; width: 22px; animation-delay: -0.08s; }
	.meteor-trail span:nth-child(3) { top: 62%; width: 26px; animation-delay: -0.15s; }
	.meteor-trail span:nth-child(4) { top: 18%; width: 18px; animation-delay: -0.05s; }
	.meteor-trail span:nth-child(5) { top: 78%; width: 20px; animation-delay: -0.19s; }
	.meteor-trail span:nth-child(6) { top: 50%; width: 35px; animation-delay: -0.24s; opacity: 0.7; }
	.sprite.rtl .meteor {
		left: auto;
		right: -150px;
		animation-name: meteorDropRtl;
	}
	.sprite.rtl .meteor-trail {
		left: auto;
		right: 36px;
		transform: scaleX(-1);
	}

	@keyframes slingre-ltr { 0%,100%{ transform: translateY(0) scaleX(-1);} 25%{ transform: translateY(-15px) scaleX(-1);} 50%{ transform: translateY(10.5px) scaleX(-1);} 75%{ transform: translateY(-9px) scaleX(-1);} }
	@keyframes slingre-rtl { 0%,100%{ transform: translateY(0);} 25%{ transform: translateY(-15px);} 50%{ transform: translateY(10.5px);} 75%{ transform: translateY(-9px);} }
	/* Climb to a capped height (~30% lower than before, so it clears the UI
	   above), then level off and fly straight out the side. */
	@keyframes flyout-ltr {
		0%   { transform: translateY(0)      translateX(0)    scaleX(-1); }
		20%  { transform: translateY(-84px)  translateX(28px)  scaleX(-1); }
		40%  { transform: translateY(-174px) translateX(64px)  scaleX(-1); }
		55%  { transform: translateY(-220px) translateX(105px) scaleX(-1); }
		100% { transform: translateY(-220px) translateX(440px) scaleX(-1); }
	}
	@keyframes flyout-rtl {
		0%   { transform: translateY(0)      translateX(0)     scaleX(1); }
		20%  { transform: translateY(-84px)  translateX(-28px)  scaleX(1); }
		40%  { transform: translateY(-174px) translateX(-64px)  scaleX(1); }
		55%  { transform: translateY(-220px) translateX(-105px) scaleX(1); }
		100% { transform: translateY(-220px) translateX(-440px) scaleX(1); }
	}
	@keyframes drift { 0%{ transform: scaleX(-1);} 35%{ transform: translateX(30px) rotate(-12deg) scaleX(-1);} 100%{ transform: scaleX(-1);} }
	@keyframes dance-ltr {
		0%   { transform: scaleX(-1) rotate(0deg)   translateY(0); }
		14%  { transform: scaleX(-1) rotate(-10deg) translateY(-3px); }
		32%  { transform: scaleX(-1) rotate(9deg)   translateY(-1px); }
		50%  { transform: scaleX(-1) rotate(-8deg)  translateY(-3px); }
		68%  { transform: scaleX(-1) rotate(6deg)   translateY(-1px); }
		84%  { transform: scaleX(-1) rotate(-3deg)  translateY(0); }
		100% { transform: scaleX(-1) rotate(0deg)   translateY(0); }
	}
	@keyframes dance-rtl {
		0%   { transform: rotate(0deg)   translateY(0); }
		14%  { transform: rotate(-10deg) translateY(-3px); }
		32%  { transform: rotate(9deg)   translateY(-1px); }
		50%  { transform: rotate(-8deg)  translateY(-3px); }
		68%  { transform: rotate(6deg)   translateY(-1px); }
		84%  { transform: rotate(-3deg)  translateY(0); }
		100% { transform: rotate(0deg)   translateY(0); }
	}
	@keyframes fireShake-ltr { 0%,100%{ transform: translateX(0) scaleX(-1);} 25%{ transform: translateX(-4px) scaleX(-1);} 75%{ transform: translateX(4px) scaleX(-1);} }
	@keyframes fireShake-rtl { 0%,100%{ transform: translateX(0);} 25%{ transform: translateX(-4px);} 75%{ transform: translateX(4px);} }
	/* 4x4 dips into the puddle on impact, rebounds on its suspension, settles. */
	@keyframes splash-bob-ltr {
		0%   { transform: scaleX(-1) translateY(0)    rotate(0); }
		16%  { transform: scaleX(-1) translateY(3px)  rotate(2deg); }
		42%  { transform: scaleX(-1) translateY(-2px) rotate(-1deg); }
		70%  { transform: scaleX(-1) translateY(1px)  rotate(0.5deg); }
		100% { transform: scaleX(-1) translateY(0)    rotate(0); }
	}
	@keyframes splash-bob-rtl {
		0%   { transform: translateY(0)    rotate(0); }
		16%  { transform: translateY(3px)  rotate(-2deg); }
		42%  { transform: translateY(-2px) rotate(1deg); }
		70%  { transform: translateY(1px)  rotate(-0.5deg); }
		100% { transform: translateY(0)    rotate(0); }
	}
	@keyframes splash-drop {
		0%   { opacity: 0; transform: translate(0, 0) scale(0.4); }
		12%  { opacity: 1; }
		55%  { opacity: 1; transform: translate(calc(var(--dx) * 0.62), var(--dy)) scale(1); }
		100% { opacity: 0; transform: translate(var(--dx), -3px) scale(0.6); }
	}
	@keyframes splash-sheet {
		0%   { opacity: 0;   transform: translateX(-50%) scaleY(0.2) scaleX(0.7); }
		22%  { opacity: 0.9; transform: translateX(-50%) scaleY(1.15) scaleX(1); }
		100% { opacity: 0;   transform: translateX(-50%) scaleY(0.5) scaleX(1.4); }
	}
	@keyframes puddle-ripple {
		0%   { opacity: 0;   transform: translateX(-50%) scaleX(0.2); }
		20%  { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
		100% { opacity: 0;   transform: translateX(-50%) scaleX(1.7); }
	}
	@keyframes turbo-flicker {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}
	/* Pivot at rear wheel (~80% from physical left in original SVG).
	   LTR uses scaleX(-1) last so rotation runs in the original coordinate space. */
	/* Double-lift wheelie, pivoting at the rear wheel. No net translate — the
	   forward surge comes from the container drive (boostDrive), so it never snaps. */
	@keyframes wheelie-ltr {
		0%   { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); }
		15%  { transform: scaleX(-1) translateX(30%) rotate(32deg) translateX(-30%); }
		35%  { transform: scaleX(-1) translateX(30%) rotate(10deg) translateX(-30%); }
		55%  { transform: scaleX(-1) translateX(30%) rotate(30deg) translateX(-30%); }
		80%  { transform: scaleX(-1) translateX(30%) rotate(12deg) translateX(-30%); }
		100% { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); }
	}
	@keyframes wheelie-rtl {
		0%   { transform: translateX(30%) rotate(0)     translateX(-30%); }
		15%  { transform: translateX(30%) rotate(32deg) translateX(-30%); }
		35%  { transform: translateX(30%) rotate(10deg) translateX(-30%); }
		55%  { transform: translateX(30%) rotate(30deg) translateX(-30%); }
		80%  { transform: translateX(30%) rotate(12deg) translateX(-30%); }
		100% { transform: translateX(30%) rotate(0)     translateX(-30%); }
	}
	/* Scared trembling + a startled hop, all returning to neutral. The "speeds
	   away" comes from the container drive (boostDrive), so nothing snaps back. */
	@keyframes panic-ltr {
		0%   { transform: translateX(0)    translateY(0)     scaleX(-1); }
		7%   { transform: translateX(10px) translateY(0)     scaleX(-1); }
		14%  { transform: translateX(-8px) translateY(0)     scaleX(-1); }
		21%  { transform: translateX(12px) translateY(0)     scaleX(-1); }
		28%  { transform: translateX(-6px) translateY(0)     scaleX(-1); }
		35%  { transform: translateX(8px)  translateY(0)     scaleX(-1); }
		42%  { transform: translateX(0)    translateY(-16px) scaleX(-1); }
		52%  { transform: translateX(0)    translateY(0)     scaleX(-1); }
		100% { transform: translateX(0)    translateY(0)     scaleX(-1); }
	}
	@keyframes panic-rtl {
		0%   { transform: translateX(0)     translateY(0)     scaleX(1); }
		7%   { transform: translateX(-10px) translateY(0)     scaleX(1); }
		14%  { transform: translateX(8px)   translateY(0)     scaleX(1); }
		21%  { transform: translateX(-12px) translateY(0)     scaleX(1); }
		28%  { transform: translateX(6px)   translateY(0)     scaleX(1); }
		35%  { transform: translateX(-8px)  translateY(0)     scaleX(1); }
		42%  { transform: translateX(0)     translateY(-16px) scaleX(1); }
		52%  { transform: translateX(0)     translateY(0)     scaleX(1); }
		100% { transform: translateX(0)     translateY(0)     scaleX(1); }
	}
	/* scaleX magnitude grows (longer); scaleY counter-squashes for jello weight.
	   The limo keeps its facing because the sign of scaleX is preserved. */
	@keyframes stretch-ltr {
		0%   { transform: scaleX(-1)    scaleY(1); }
		18%  { transform: scaleX(-1.75) scaleY(0.88); }
		34%  { transform: scaleX(-1.5)  scaleY(0.95); }
		52%  { transform: scaleX(-1.62) scaleY(0.9); }
		70%  { transform: scaleX(-0.86) scaleY(1.08); }
		84%  { transform: scaleX(-1.08) scaleY(0.97); }
		93%  { transform: scaleX(-0.97) scaleY(1.02); }
		100% { transform: scaleX(-1)    scaleY(1); }
	}
	@keyframes stretch-rtl {
		0%   { transform: scaleX(1)    scaleY(1); }
		18%  { transform: scaleX(1.75) scaleY(0.88); }
		34%  { transform: scaleX(1.5)  scaleY(0.95); }
		52%  { transform: scaleX(1.62) scaleY(0.9); }
		70%  { transform: scaleX(0.86) scaleY(1.08); }
		84%  { transform: scaleX(1.08) scaleY(0.97); }
		93%  { transform: scaleX(0.97) scaleY(1.02); }
		100% { transform: scaleX(1)    scaleY(1); }
	}
	@keyframes smoke { from { transform: scale(.6); opacity:.8;} to{ transform: translateY(-35px) scale(1.2); opacity:0;} }
	@keyframes flame { 0%,100%{ opacity:.5; width:12px;} 50%{ opacity:1; width:20px;} }
	@keyframes meteorDrop {
		0%   { transform: translate(0, 0) rotate(-42deg); opacity: 1; filter: brightness(1.3); }
		80%  { transform: translate(40px, 400px) rotate(-24deg); opacity: 1; filter: brightness(1.8); }
		90%  { transform: translate(46px, 462px) rotate(-14deg); opacity: 1; filter: brightness(3); }
		93%  { transform: translate(46px, 468px) rotate(-10deg); opacity: 1; filter: brightness(10) drop-shadow(0 0 28px #fff) drop-shadow(0 0 14px #ff8800); }
		96%  { transform: translate(46px, 470px) rotate(-8deg);  opacity: 0; filter: brightness(1); }
		100% { transform: translate(46px, 470px) rotate(-8deg);  opacity: 0; }
	}
	@keyframes meteorDropRtl {
		0%   { transform: translate(0, 0) rotate(42deg); opacity: 1; filter: brightness(1.3); }
		80%  { transform: translate(-40px, 400px) rotate(24deg); opacity: 1; filter: brightness(1.8); }
		90%  { transform: translate(-46px, 462px) rotate(14deg); opacity: 1; filter: brightness(3); }
		93%  { transform: translate(-46px, 468px) rotate(10deg); opacity: 1; filter: brightness(10) drop-shadow(0 0 28px #fff) drop-shadow(0 0 14px #ff8800); }
		96%  { transform: translate(-46px, 470px) rotate(8deg);  opacity: 0; filter: brightness(1); }
		100% { transform: translate(-46px, 470px) rotate(8deg);  opacity: 0; }
	}
	@keyframes meteorTrail {
		0% { opacity: 0.9; transform: translateY(-50%) scaleX(0.5); }
		100% { opacity: 0; transform: translateY(-50%) translateX(-26px) scaleX(1.1); }
	}
	@keyframes flash { 50%{ filter: brightness(2);} }
	@keyframes fade { to { opacity: 0; } }
	@keyframes engine-fire-burst {
		0%   { opacity: 0;   transform: scaleY(0.3) scaleX(0.8); }
		5%   { opacity: 1;   transform: scaleY(1.15) scaleX(1.05); }
		86%  { opacity: 1;   transform: scaleY(1) scaleX(0.97); }
		100% { opacity: 0;   transform: scaleY(0.4) scaleX(0.72); }
	}
	/* organic flame licking — tongue stretches/shrinks and sways side to side */
	@keyframes flame-lick {
		0%   { transform: scaleY(1)    scaleX(1)    skewX(0deg); }
		25%  { transform: scaleY(1.16) scaleX(0.9)  skewX(-5deg); }
		50%  { transform: scaleY(0.93) scaleX(1.06) skewX(4deg); }
		75%  { transform: scaleY(1.12) scaleX(0.94) skewX(-3deg); }
		100% { transform: scaleY(1)    scaleX(1)    skewX(2deg); }
	}
	@keyframes disco-shift {
		0%   { background-position: 0% 50%; }
		100% { background-position: 250% 50%; }
	}
	@keyframes disco-flicker {
		0%, 100% { opacity: 0.6; }
		50%      { opacity: 1; }
	}
	@keyframes land-dust-puff {
		0%   { opacity: 0;   transform: translate(0, 0) scale(0.3); }
		25%  { opacity: 0.8; }
		100% { opacity: 0;   transform: translate(var(--dx), -8px) scale(1.4); }
	}
	@keyframes exhaust-flicker {
		0%, 100% { transform: scaleX(0.88) scaleY(0.82); opacity: 0.85; }
		50%       { transform: scaleX(1.12) scaleY(1.18); opacity: 1; }
	}
	@keyframes exhaust-inner {
		0%, 100% { transform: scaleY(0.72); opacity: 0.8; }
		50%       { transform: scaleY(1.05); opacity: 1; }
	}
	/* Follow the car's launch and let the jet stretch out backwards (scaleX
	   grows away from the car, since transform-origin sits at the car end). */
	/* The jet stretches backwards then settles (transform-origin sits at the car
	   end); the car's forward motion now comes from the container speed-up. */
	@keyframes nitro-follow-ltr {
		0%   { transform: scaleX(0.55); opacity: 0.7; }
		14%  { transform: scaleX(1.35); opacity: 1; }
		45%  { transform: scaleX(1.1);  opacity: 1; }
		100% { transform: scaleX(0.85); opacity: 0.85; }
	}
	@keyframes nitro-follow-rtl {
		0%   { transform: scaleX(0.55); opacity: 0.7; }
		14%  { transform: scaleX(1.35); opacity: 1; }
		45%  { transform: scaleX(1.1);  opacity: 1; }
		100% { transform: scaleX(0.85); opacity: 0.85; }
	}
	@keyframes meteor-fire-burst {
		0%   { transform: scale(0)   translateY(0);     opacity: 1;   filter: blur(2px) brightness(4); }
		18%  { transform: scale(1.8) translateY(-18px); opacity: 1;   filter: blur(3px) brightness(2.5); }
		45%  { transform: scale(2.6) translateY(-38px); opacity: 0.8; filter: blur(4px) brightness(1.5); }
		75%  { transform: scale(3.2) translateY(-60px); opacity: 0.4; filter: blur(5px); }
		100% { transform: scale(3.8) translateY(-85px); opacity: 0;   filter: blur(6px); }
	}
	@keyframes meteor-flash {
		0%   { transform: scale(0.1); opacity: 1;   filter: blur(1px) brightness(8); }
		18%  { transform: scale(1.3); opacity: 1;   filter: blur(3px) brightness(5); }
		50%  { transform: scale(2.2); opacity: 0.6; filter: blur(5px) brightness(2); }
		100% { transform: scale(3.5); opacity: 0;   filter: blur(8px) brightness(1); }
	}
	@keyframes meteor-shockwave {
		0%   { transform: scale(0.08); opacity: 1;   border-color: rgba(255,255,200,0.98); }
		25%  { transform: scale(1.4);  opacity: 0.9; border-color: rgba(255,180,40,0.85); }
		60%  { transform: scale(3.5);  opacity: 0.45; border-color: rgba(255,100,20,0.4); }
		100% { transform: scale(7);    opacity: 0;   border-color: rgba(255,60,0,0); }
	}
	@keyframes meteor-smoke-rise {
		0%   { transform: scale(0.2) translateY(0);      opacity: 0.9; }
		20%  { transform: scale(1.1) translateY(-18px);  opacity: 0.85; }
		55%  { transform: scale(2.4) translateY(-65px);  opacity: 0.55; }
		100% { transform: scale(4)   translateY(-140px); opacity: 0; }
	}
	/* smokewheelie = rotation only (car-4), wheelie = rotation + surge (moped) */
	/* Snappy lift onto the rear wheels, a brief hold, then the front drops under
	   gravity (accelerating) and the front wheels hit with a little bounce before
	   settling — about twice as fast as a slow eased descent. */
	@keyframes smokewheelie-ltr {
		0%   { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		12%  { transform: scaleX(-1) translateX(30%) rotate(34deg) translateX(-30%); animation-timing-function: ease-in-out; }
		56%  { transform: scaleX(-1) translateX(30%) rotate(32deg) translateX(-30%); animation-timing-function: ease-in; }
		84%  { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		90%  { transform: scaleX(-1) translateX(30%) rotate(6deg)  translateX(-30%); animation-timing-function: ease-in; }
		96%  { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		98%  { transform: scaleX(-1) translateX(30%) rotate(2deg)  translateX(-30%); animation-timing-function: ease-in; }
		100% { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); }
	}
	@keyframes smokewheelie-rtl {
		0%   { transform: translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		12%  { transform: translateX(30%) rotate(34deg) translateX(-30%); animation-timing-function: ease-in-out; }
		56%  { transform: translateX(30%) rotate(32deg) translateX(-30%); animation-timing-function: ease-in; }
		84%  { transform: translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		90%  { transform: translateX(30%) rotate(6deg)  translateX(-30%); animation-timing-function: ease-in; }
		96%  { transform: translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		98%  { transform: translateX(30%) rotate(2deg)  translateX(-30%); animation-timing-function: ease-in; }
		100% { transform: translateX(30%) rotate(0)     translateX(-30%); }
	}
	/* Pivot in place to face the other way; the reverse drive (reverseDrive)
	   then carries the car back out the side it came in. Held via `forwards`. */
	@keyframes uturn-ltr {
		0%   { transform: scaleX(-1); }
		16%  { transform: scaleX(0);  }
		32%  { transform: scaleX(1);  }
		100% { transform: scaleX(1);  }
	}
	/* Spin faster and shrink to nothing (scaleX keeps the facing). */
	@keyframes poof-ltr {
		0%   { transform: scaleX(-1) rotate(0) scale(1);      opacity: 1; }
		60%  { transform: scaleX(-1) rotate(320deg) scale(0.5); opacity: 0.9; }
		100% { transform: scaleX(-1) rotate(540deg) scale(0);  opacity: 0; }
	}
	@keyframes poof-rtl {
		0%   { transform: scaleX(1) rotate(0) scale(1);       opacity: 1; }
		60%  { transform: scaleX(1) rotate(-320deg) scale(0.5); opacity: 0.9; }
		100% { transform: scaleX(1) rotate(-540deg) scale(0);  opacity: 0; }
	}
	@keyframes confetti-burst {
		0%   { opacity: 0; transform: translate(0, 0) scale(0.4) rotate(0); }
		7%   { opacity: 1; }
		100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1) rotate(220deg); }
	}
	@keyframes uturn-rtl {
		0%   { transform: scaleX(1);  }
		16%  { transform: scaleX(0);  }
		32%  { transform: scaleX(-1); }
		100% { transform: scaleX(-1); }
	}

	/* Crouch → launch (decelerate to apex) → fall (accelerate) → land squash → settle.
	   scaleX keeps the bus facing its travel direction throughout (like the u-turn). */
	@keyframes bus-jump-rtl {
		0%   { transform: translateY(0)      scaleY(1)    scaleX(1);    animation-timing-function: ease-in; }
		9%   { transform: translateY(0)      scaleY(0.80) scaleX(1.12); animation-timing-function: ease-out; }
		46%  { transform: translateY(-125px) scaleY(1.05) scaleX(0.96); animation-timing-function: ease-in; }
		74%  { transform: translateY(0)      scaleY(1)    scaleX(1);    animation-timing-function: ease-out; }
		82%  { transform: translateY(0)      scaleY(0.82) scaleX(1.12); animation-timing-function: ease-in-out; }
		100% { transform: translateY(0)      scaleY(1)    scaleX(1); }
	}
	@keyframes bus-jump-ltr {
		0%   { transform: translateY(0)      scaleY(1)    scaleX(-1);    animation-timing-function: ease-in; }
		9%   { transform: translateY(0)      scaleY(0.80) scaleX(-1.12); animation-timing-function: ease-out; }
		46%  { transform: translateY(-125px) scaleY(1.05) scaleX(-0.96); animation-timing-function: ease-in; }
		74%  { transform: translateY(0)      scaleY(1)    scaleX(-1);    animation-timing-function: ease-out; }
		82%  { transform: translateY(0)      scaleY(0.82) scaleX(-1.12); animation-timing-function: ease-in-out; }
		100% { transform: translateY(0)      scaleY(1)    scaleX(-1); }
	}
	/* billow up fast (0→16%), reach full spread (40%), then SETTLE SLOWLY over the
	   long tail — sink back down a touch (--dy eases off), barely grow, and fade
	   gently, instead of ballooning outward and popping. */
	@keyframes bus-dust-puff {
		0%   { opacity: 0;                           transform: translate(0, 0) scale(0.35); }
		16%  { opacity: calc(var(--op, 0.8) * 0.62); transform: translate(calc(var(--dx) * 0.4), calc(var(--dy, -4px) * 0.55)) scale(0.85); }
		40%  { opacity: calc(var(--op, 0.8) * 0.62); transform: translate(var(--dx), var(--dy, -4px)) scale(1); }
		100% { opacity: 0;                           transform: translate(calc(var(--dx) * 1.04), calc(var(--dy, -4px) * 0.72)) scale(1.12); }
	}
</style>
