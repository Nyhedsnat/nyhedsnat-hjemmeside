<script lang="ts">
	import { onMount } from 'svelte';

	let laserActive = $state(false);
	let moonElement: HTMLButtonElement;
	let tsParticlesLoaded = $state(false);
	let holdTimer: ReturnType<typeof setTimeout> | null = null;
	let chargingTimer: ReturnType<typeof setTimeout> | null = null;
	let holdStartTime = 0;
	let isHolding = false; // Internal tracking (not reactive)
	let showCharging = $state(false); // Visual charging state (reactive)
	let laserTimeout: ReturnType<typeof setTimeout> | null = null;
	let isCheese = $state(false);

	function handleMouseDown(e: MouseEvent | TouchEvent) {
		// Prevent double-firing from touch + mouse events
		if (e.type === 'mousedown' && holdStartTime > 0 && Date.now() - holdStartTime < 100) {
			return;
		}

		// Clear any existing timers first
		if (holdTimer) {
			clearTimeout(holdTimer);
			holdTimer = null;
		}
		if (chargingTimer) {
			clearTimeout(chargingTimer);
			chargingTimer = null;
		}

		holdStartTime = Date.now();
		isHolding = true;
		showCharging = false; // Don't show charging immediately

		// Start showing charging effect after 0.5 seconds
		chargingTimer = setTimeout(() => {
			if (isHolding) {
				showCharging = true;
			}
		}, 500);

		// Start the 10 second timer for green laser (from when hold started)
		holdTimer = setTimeout(() => {
			if (isHolding && !laserActive) {
				fireLaser();
			}
		}, 10000); // 10 seconds
	}

	function handleMouseUp(e: MouseEvent | TouchEvent) {
		// Prevent double-firing from touch + mouse events
		if (e.type === 'mouseup' && !isHolding) {
			return;
		}

		const holdDuration = Date.now() - holdStartTime;

		// Clear charging timer
		if (chargingTimer) {
			clearTimeout(chargingTimer);
			chargingTimer = null;
		}
		showCharging = false;

		// Only clear timer if we HAVEN'T reached 10 seconds yet
		// If we have, the timer already fired and called fireLaser
		if (holdDuration < 10000) {
			isHolding = false;
			if (holdTimer) {
				clearTimeout(holdTimer);
				holdTimer = null;
			}

			// If it was a short click (less than 500ms), try to zap flying objects
			if (holdDuration < 500) {
				zapFlyingObjects();
			}
		} else {
			// Timer should have already fired, but ensure we clean up
			isHolding = false;
		}
	}

	function handleMouseLeave() {
		// Only cancel if we're early in the hold (less than 8 seconds)
		// If we're close to the 10 second mark, let it continue
		const holdDuration = Date.now() - holdStartTime;
		if (isHolding && holdTimer && holdDuration < 8000) {
			isHolding = false;
			showCharging = false;
			if (chargingTimer) {
				clearTimeout(chargingTimer);
				chargingTimer = null;
			}
			clearTimeout(holdTimer);
			holdTimer = null;
		}
	}

	function handleTouchCancel() {
		// Handle touch being cancelled
		isHolding = false;
		showCharging = false;
		if (chargingTimer) {
			clearTimeout(chargingTimer);
			chargingTimer = null;
		}
		if (holdTimer) {
			clearTimeout(holdTimer);
			holdTimer = null;
		}
	}

	function handleMoonDoubleClick(e: MouseEvent) {
		e.preventDefault();
		isCheese = !isCheese;
	}

	// Load tsParticles from CDN
	async function loadTsParticles() {
		if (tsParticlesLoaded || (window as any).tsParticles) {
			tsParticlesLoaded = true;
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.0.3/tsparticles.confetti.bundle.min.js';
		script.async = true;

		return new Promise<void>((resolve) => {
			script.onload = () => {
				tsParticlesLoaded = true;
				resolve();
			};
			document.head.appendChild(script);
		});
	}

	function shootPurpleLaser(x1: number, y1: number, x2: number, y2: number) {
		const laser = document.createElement('div');
		const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
		const length = Math.hypot(x2 - x1, y2 - y1);

		laser.style.cssText = `
			position: fixed;
			left: ${x1}px;
			top: ${y1}px;
			width: ${length}px;
			height: 4px;
			background: linear-gradient(90deg, #9900ff, #cc66ff, #9900ff);
			box-shadow: 0 0 15px #9900ff, 0 0 30px #9900ff, 0 0 45px #cc00ff;
			transform-origin: left center;
			transform: rotate(${angle}deg);
			z-index: 100;
			pointer-events: none;
			animation: laser-flash 0.2s ease-out forwards;
		`;
		document.body.appendChild(laser);

		// Purple impact
		const impact = document.createElement('div');
		impact.style.cssText = `
			position: fixed;
			left: ${x2 - 25}px;
			top: ${y2 - 25}px;
			width: 50px;
			height: 50px;
			background: radial-gradient(circle, #cc66ff 0%, #9900ff 40%, transparent 70%);
			border-radius: 50%;
			z-index: 100;
			pointer-events: none;
			animation: impact-flash 0.3s ease-out forwards;
		`;
		document.body.appendChild(impact);

		setTimeout(() => {
			laser.remove();
			impact.remove();
		}, 300);
	}

	function zapFlyingObject(el: HTMLElement, x: number, y: number) {
		// Immediately hide the element - explosion replaces it
		el.style.transition = 'none';
		el.style.opacity = '0';
		el.style.display = 'none';

		const confetti = (window as any).confetti;

		// Small confetti burst (5 pieces)
		if (tsParticlesLoaded && confetti) {
			confetti({
				particleCount: 5,
				startVelocity: 25,
				spread: 360,
				origin: { x: x / window.innerWidth, y: y / window.innerHeight },
				colors: ['#9900ff', '#cc66ff', '#ff00ff'],
				shapes: ['circle'],
				gravity: 1,
				scalar: 1.5,
				ticks: 80
			});
		}

		// Create smoke and fire particles using DOM elements
		createSmokeAndFire(x, y);
	}

	function createSmokeAndFire(x: number, y: number) {
		// Create multiple fire particles
		for (let i = 0; i < 12; i++) {
			const fire = document.createElement('div');
			const angle = Math.random() * Math.PI * 2;
			const distance = 20 + Math.random() * 40;
			const endX = Math.cos(angle) * distance;
			const endY = Math.sin(angle) * distance - 30; // Rise upward

			fire.style.cssText = `
				position: fixed;
				left: ${x}px;
				top: ${y}px;
				width: ${8 + Math.random() * 12}px;
				height: ${8 + Math.random() * 12}px;
				background: radial-gradient(circle, #ffff00 0%, #ff6600 40%, #ff0000 70%, transparent 100%);
				border-radius: 50%;
				z-index: 150;
				pointer-events: none;
				opacity: 1;
				transform: translate(-50%, -50%);
				animation: fire-particle ${0.4 + Math.random() * 0.3}s ease-out forwards;
				--end-x: ${endX}px;
				--end-y: ${endY}px;
			`;
			document.body.appendChild(fire);
			setTimeout(() => fire.remove(), 800);
		}

		// Create smoke particles
		for (let i = 0; i < 8; i++) {
			const smoke = document.createElement('div');
			const angle = Math.random() * Math.PI * 2;
			const distance = 15 + Math.random() * 30;
			const endX = Math.cos(angle) * distance;
			const endY = -40 - Math.random() * 60; // Rise upward more

			smoke.style.cssText = `
				position: fixed;
				left: ${x}px;
				top: ${y}px;
				width: ${15 + Math.random() * 25}px;
				height: ${15 + Math.random() * 25}px;
				background: radial-gradient(circle, rgba(80, 80, 80, 0.8) 0%, rgba(50, 50, 50, 0.4) 50%, transparent 100%);
				border-radius: 50%;
				z-index: 149;
				pointer-events: none;
				opacity: 0.8;
				transform: translate(-50%, -50%);
				animation: smoke-particle ${0.6 + Math.random() * 0.5}s ease-out forwards;
				--end-x: ${endX}px;
				--end-y: ${endY}px;
			`;
			document.body.appendChild(smoke);
			setTimeout(() => smoke.remove(), 1200);
		}
	}

	function zapFlyingObjects() {
		const moonRect = moonElement.getBoundingClientRect();
		const originX = moonRect.left + moonRect.width / 2;
		const originY = moonRect.top + moonRect.height / 2;

		// Find drones and UFOs - only get ONE visible target
		const flyingObjects = document.querySelectorAll('.drone-container, .ufo-container, [class*="drone"], [class*="ufo"]');

		// Find the first visible flying object
		for (const el of flyingObjects) {
			const htmlEl = el as HTMLElement;
			const rect = htmlEl.getBoundingClientRect();

			// Skip if off-screen or already hidden
			if (rect.width === 0 || rect.height === 0) continue;
			if (htmlEl.style.display === 'none') continue;
			if (htmlEl.style.opacity === '0') continue;

			const targetX = rect.left + rect.width / 2;
			const targetY = rect.top + rect.height / 2;

			// Shoot ONE purple laser at this target and stop
			shootPurpleLaser(originX, originY, targetX, targetY);
			setTimeout(() => zapFlyingObject(htmlEl, targetX, targetY), 100);

			return; // Only shoot one!
		}
	}

	function findNextTarget(): HTMLElement | null {
		// Find destroyable elements - anything inside .page-content or main content areas
		// Try multiple selectors to work on all pages
		let contentContainer = document.querySelector('.page-content') ||
			document.querySelector('main') ||
			document.querySelector('.main-content');

		if (!contentContainer) return null;

		// Elements to NEVER destroy (protected)
		const protectedSelectors = [
			'header', 'nav', 'footer',
			'.houses-container', '.houses-silhouette',
			'.moon-button', '.moon', '.moon-glow',
			'.starfield', '.shooting-star',
			'.drone-container', '.ufo-container',
			'.streamers-container', '.streamer',
			'.vehicles-container', '.bus-container', '.convoy-container'
		];

		// Get all potential targets - prioritize larger/more visible elements
		const selectors = [
			'section',
			'.card-dark',
			'h1', 'h2', 'h3',
			'p',
			'a:not([href="/"])', // Don't destroy home links
			'button',
			'ul', 'ol',
			'div',
			'img:not(.houses-silhouette)',
			'span'
		];

		for (const selector of selectors) {
			const elements = contentContainer.querySelectorAll(selector);
			for (const el of elements) {
				const htmlEl = el as HTMLElement;

				// Skip if already destroyed or being destroyed
				if (htmlEl.dataset.destroyed) continue;
				if (htmlEl.dataset.burning) continue;

				// Skip protected elements
				let isProtected = false;
				for (const protectedSelector of protectedSelectors) {
					if (htmlEl.matches(protectedSelector) || htmlEl.closest(protectedSelector)) {
						isProtected = true;
						break;
					}
				}
				if (isProtected) continue;

				// Skip if hidden
				if (htmlEl.style.display === 'none') continue;
				if (htmlEl.style.visibility === 'hidden') continue;
				const computedStyle = getComputedStyle(htmlEl);
				if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') continue;

				// Skip elements that are too small
				const rect = htmlEl.getBoundingClientRect();
				if (rect.width < 15 || rect.height < 15) continue;

				// Skip off-screen elements (but allow some buffer for scroll)
				if (rect.bottom < -100) continue;
				if (rect.top > window.innerHeight + 500) continue;

				// Skip if a parent is already being destroyed
				let parent = htmlEl.parentElement;
				let skipDueToParent = false;
				while (parent && parent !== contentContainer) {
					if (parent.dataset.destroyed || parent.dataset.burning) {
						skipDueToParent = true;
						break;
					}
					parent = parent.parentElement;
				}
				if (skipDueToParent) continue;

				return htmlEl;
			}
		}

		return null;
	}

	function fireLaser() {
		// Clear any previous laser timeout
		if (laserTimeout) {
			clearTimeout(laserTimeout);
			laserTimeout = null;
		}

		// Force reset if somehow stuck
		laserActive = false;
		laserActive = true;
		isHolding = false;

		// Start the destruction loop
		destroyNextElement();
	}

	function destroyNextElement() {
		const target = findNextTarget();

		if (!target) {
			laserActive = false;
			return;
		}

		// Mark as being burned so we don't target it again
		target.dataset.burning = 'true';

		// Get positions - recalculate each time in case of scroll/layout changes
		const rect = target.getBoundingClientRect();
		const targetX = rect.left + rect.width / 2;
		const targetY = rect.top + rect.height / 2;

		const moonRect = moonElement.getBoundingClientRect();
		const originX = moonRect.left + moonRect.width / 2;
		const originY = moonRect.top + moonRect.height / 2;

		// Shoot laser
		shootLaserAt(originX, originY, targetX, targetY);

		// Ignite after laser hits
		setTimeout(() => {
			igniteElement(target, targetX, targetY);
		}, 100);

		// Look for next target after a short delay (overlap for continuous action)
		// Each element burns for 1.2s then explodes - we start next one early for dramatic effect
		setTimeout(() => {
			destroyNextElement();
		}, 400); // Fire at next target while previous is still burning
	}

	function shootLaserAt(x1: number, y1: number, x2: number, y2: number) {
		const laser = document.createElement('div');
		const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
		const length = Math.hypot(x2 - x1, y2 - y1);

		laser.style.cssText = `
			position: fixed;
			left: ${x1}px;
			top: ${y1}px;
			width: ${length}px;
			height: 6px;
			background: linear-gradient(90deg, #00ff00, #88ff88, #00ff00);
			box-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00;
			transform-origin: left center;
			transform: rotate(${angle}deg);
			z-index: 100;
			pointer-events: none;
			animation: laser-flash 0.3s ease-out forwards;
		`;
		document.body.appendChild(laser);

		// Create impact flash
		const impact = document.createElement('div');
		impact.style.cssText = `
			position: fixed;
			left: ${x2 - 30}px;
			top: ${y2 - 30}px;
			width: 60px;
			height: 60px;
			background: radial-gradient(circle, #00ff00 0%, transparent 70%);
			border-radius: 50%;
			z-index: 100;
			pointer-events: none;
			animation: impact-flash 0.4s ease-out forwards;
		`;
		document.body.appendChild(impact);

		setTimeout(() => {
			laser.remove();
			impact.remove();
		}, 400);
	}

	function spawnFireParticles(x: number, y: number) {
		const confetti = (window as any).confetti;
		if (!confetti) return;

		// Fire burst effect
		const fireColors = ['#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffff00'];

		// Main fire burst
		confetti({
			particleCount: 50,
			startVelocity: 30,
			spread: 360,
			origin: { x: x / window.innerWidth, y: y / window.innerHeight },
			colors: fireColors,
			shapes: ['circle'],
			gravity: 0.5,
			scalar: 1.2,
			drift: 0,
			ticks: 100
		});

		// Ember sparks
		confetti({
			particleCount: 30,
			startVelocity: 45,
			spread: 360,
			origin: { x: x / window.innerWidth, y: y / window.innerHeight },
			colors: ['#ff6600', '#ff9900', '#ffcc00'],
			shapes: ['circle'],
			gravity: 0.8,
			scalar: 0.6,
			drift: 2,
			ticks: 150
		});
	}

	function createCanvasFire(el: HTMLElement) {
		const rect = el.getBoundingClientRect();
		const canvas = document.createElement('canvas');
		canvas.width = rect.width + 100;
		canvas.height = rect.height + 150;
		canvas.style.cssText = `
			position: absolute;
			left: -50px;
			top: -100px;
			pointer-events: none;
			z-index: 100;
		`;

		el.appendChild(canvas);
		const ctx = canvas.getContext('2d')!;

		interface Particle {
			x: number;
			y: number;
			vx: number;
			vy: number;
			life: number;
			maxLife: number;
			size: number;
			type: 'fire' | 'smoke' | 'ember';
		}

		const particles: Particle[] = [];
		let animationId: number;

		function createParticle(): Particle {
			const type = Math.random() < 0.7 ? 'fire' : Math.random() < 0.5 ? 'smoke' : 'ember';
			return {
				x: 50 + Math.random() * rect.width,
				y: canvas.height - 50 + Math.random() * 30,
				vx: (Math.random() - 0.5) * 2,
				vy: -2 - Math.random() * 4,
				life: 1,
				maxLife: type === 'smoke' ? 80 : type === 'ember' ? 60 : 40,
				size: type === 'fire' ? 15 + Math.random() * 25 : type === 'smoke' ? 20 + Math.random() * 30 : 3 + Math.random() * 5,
				type
			};
		}

		function updateParticles() {
			// Add new particles
			for (let i = 0; i < 5; i++) {
				particles.push(createParticle());
			}

			// Update existing
			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				p.x += p.vx + (Math.random() - 0.5) * 2;
				p.vy *= 0.99;
				p.y += p.vy;
				p.life -= 1 / p.maxLife;
				p.vx += (Math.random() - 0.5) * 0.5;

				if (p.life <= 0) {
					particles.splice(i, 1);
				}
			}
		}

		function drawParticles() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (const p of particles) {
				ctx.save();
				ctx.globalAlpha = p.life;

				if (p.type === 'fire') {
					// Fire gradient
					const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
					const intensity = p.life;
					gradient.addColorStop(0, `rgba(255, 255, ${Math.floor(200 * intensity)}, ${intensity})`);
					gradient.addColorStop(0.3, `rgba(255, ${Math.floor(150 * intensity)}, 0, ${intensity * 0.8})`);
					gradient.addColorStop(0.6, `rgba(255, ${Math.floor(80 * intensity)}, 0, ${intensity * 0.5})`);
					gradient.addColorStop(1, 'rgba(180, 0, 0, 0)');
					ctx.fillStyle = gradient;
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
					ctx.fill();
				} else if (p.type === 'smoke') {
					// Smoke
					const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
					gradient.addColorStop(0, `rgba(60, 60, 60, ${p.life * 0.4})`);
					gradient.addColorStop(1, 'rgba(40, 40, 40, 0)');
					ctx.fillStyle = gradient;
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
					ctx.fill();
				} else {
					// Embers
					ctx.fillStyle = `rgba(255, ${Math.floor(150 + Math.random() * 100)}, 0, ${p.life})`;
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
					ctx.fill();
				}

				ctx.restore();
			}
		}

		function animate() {
			updateParticles();
			drawParticles();
			animationId = requestAnimationFrame(animate);
		}

		animate();

		// Return cleanup function
		return () => {
			cancelAnimationFrame(animationId);
			canvas.remove();
		};
	}

	function igniteElement(el: HTMLElement, targetX: number, targetY: number) {
		if (el.dataset.destroyed) return;
		el.dataset.destroyed = 'true';
		delete el.dataset.burning; // Clear burning flag

		const originalPosition = getComputedStyle(el).position;
		if (originalPosition === 'static') {
			el.style.position = 'relative';
		}
		el.style.overflow = 'visible';

		// Spawn particle burst if library loaded
		if (tsParticlesLoaded) {
			spawnFireParticles(targetX, targetY);
		}

		// Create canvas-based fire
		const cleanupFire = createCanvasFire(el);

		// Add ember glow
		el.style.boxShadow = '0 0 30px #ff6600, 0 0 60px #ff3300, inset 0 0 30px rgba(255,100,0,0.3)';
		el.style.transition = 'all 0.3s';

		// Gradual charring over 1.2 seconds
		let charLevel = 0;
		const charInterval = setInterval(() => {
			charLevel += 0.1;
			el.style.filter = `brightness(${1.2 - charLevel * 0.4}) sepia(${charLevel}) saturate(${2 - charLevel}) hue-rotate(-${charLevel * 20}deg)`;
			if (charLevel >= 1) clearInterval(charInterval);
		}, 120); // 12 steps * 120ms = 1.44 seconds total for charring

		// Explode after burning (1.2 seconds)
		setTimeout(() => {
			clearInterval(charInterval);
			cleanupFire();
			explodeElement(el, targetX, targetY);
		}, 1200);
	}

	function explodeElement(el: HTMLElement, x: number, y: number) {
		const rect = el.getBoundingClientRect();

		// Use confetti for explosion if available
		if (tsParticlesLoaded && (window as any).confetti) {
			(window as any).confetti({
				particleCount: 40,
				startVelocity: 50,
				spread: 360,
				origin: { x: x / window.innerWidth, y: y / window.innerHeight },
				colors: ['#333', '#444', '#555', '#ff3300', '#ff6600'],
				shapes: ['square'],
				gravity: 1.5,
				scalar: 1.5,
				ticks: 80
			});
		}

		// Create debris particles
		for (let i = 0; i < 12; i++) {
			const particle = document.createElement('div');
			const angle = (i / 12) * Math.PI * 2;
			const distance = 80 + Math.random() * 120;
			const endX = Math.cos(angle) * distance;
			const endY = Math.sin(angle) * distance + 250;

			particle.style.cssText = `
				position: fixed;
				left: ${rect.left + rect.width / 2}px;
				top: ${rect.top + rect.height / 2}px;
				width: ${10 + Math.random() * 15}px;
				height: ${10 + Math.random() * 15}px;
				background: linear-gradient(135deg, #444, #222);
				border-radius: 2px;
				z-index: 100;
				pointer-events: none;
				animation: particle-explode 1.2s ease-out forwards;
				--end-x: ${endX}px;
				--end-y: ${endY}px;
				--rotation: ${Math.random() * 1080}deg;
			`;
			document.body.appendChild(particle);
			setTimeout(() => particle.remove(), 1200);
		}

		// Element crumbles
		el.style.transition = 'all 1.2s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
		el.style.transform = `rotate(${Math.random() * 40 - 20}deg) translateY(150vh) scale(0.3)`;
		el.style.opacity = '0';
		el.style.filter = 'brightness(0.2) blur(8px)';

		setTimeout(() => {
			el.style.display = 'none';
		}, 1200);
	}

	onMount(() => {
		// Preload tsParticles
		loadTsParticles();

		// Add keyframe animations
		const style = document.createElement('style');
		style.textContent = `
			@keyframes laser-flash {
				0% { opacity: 1; height: 6px; }
				50% { opacity: 1; height: 10px; }
				100% { opacity: 0; height: 2px; }
			}
			@keyframes impact-flash {
				0% { transform: scale(0); opacity: 1; }
				50% { transform: scale(2); opacity: 0.8; }
				100% { transform: scale(3); opacity: 0; }
			}
			@keyframes particle-explode {
				0% {
					transform: translate(0, 0) rotate(0deg) scale(1);
					opacity: 1;
				}
				100% {
					transform: translate(var(--end-x), var(--end-y)) rotate(var(--rotation)) scale(0);
					opacity: 0;
				}
			}
			@keyframes fire-particle {
				0% {
					transform: translate(-50%, -50%) scale(1);
					opacity: 1;
				}
				30% {
					opacity: 1;
				}
				100% {
					transform: translate(calc(-50% + var(--end-x)), calc(-50% + var(--end-y))) scale(0.2);
					opacity: 0;
				}
			}
			@keyframes smoke-particle {
				0% {
					transform: translate(-50%, -50%) scale(0.5);
					opacity: 0.8;
				}
				30% {
					transform: translate(calc(-50% + var(--end-x) * 0.3), calc(-50% + var(--end-y) * 0.3)) scale(1);
					opacity: 0.6;
				}
				100% {
					transform: translate(calc(-50% + var(--end-x)), calc(-50% + var(--end-y))) scale(2);
					opacity: 0;
				}
			}
		`;
		document.head.appendChild(style);

		return () => style.remove();
	});
</script>

<button
	bind:this={moonElement}
	class="moon-button"
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
	ondblclick={handleMoonDoubleClick}
	ontouchstart={(e) => { e.preventDefault(); handleMouseDown(e); }}
	ontouchend={(e) => { e.preventDefault(); handleMouseUp(e); }}
	ontouchcancel={handleTouchCancel}
	aria-label="Moon (click to zap, hold 10s for destruction)"
>
	<div class="moon-glow" class:laser-charging={laserActive} class:holding={showCharging}></div>
	<img
		src={isCheese ? '/svg/background/cheese.svg' : '/svg/background/moon.svg'}
		alt=""
		class="moon"
		class:laser-active={laserActive}
		class:holding={showCharging}
		draggable="false"
	/>
</button>

<style>
	.moon-button {
		position: absolute;
		top: 110px;
		right: 25px;
		z-index: 40;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
	}

	.moon {
		width: 60px;
		height: auto;
		position: relative;
		z-index: 1;
		transition: filter 0.3s;
		user-select: none;
		-webkit-user-drag: none;
		-webkit-user-select: none;
		pointer-events: none;
	}

	.moon.laser-active {
		filter: brightness(1.5) hue-rotate(80deg) drop-shadow(0 0 20px #00ff00);
	}

	.moon.holding {
		animation: moon-charge 9.5s linear forwards;
	}

	@keyframes moon-charge {
		0% {
			filter: brightness(1) contrast(1) saturate(1) drop-shadow(0 0 5px #00ff00);
		}
		30% {
			filter: brightness(1.3) contrast(1.1) saturate(0.8) drop-shadow(0 0 15px #00ff00);
		}
		50% {
			filter: brightness(1.6) contrast(1.2) saturate(0.5) drop-shadow(0 0 25px #00ff00);
		}
		70% {
			filter: brightness(2) contrast(1.3) saturate(0.3) drop-shadow(0 0 35px #00ff00) hue-rotate(20deg);
		}
		85% {
			filter: brightness(2.5) contrast(1.4) saturate(0.1) drop-shadow(0 0 50px #00ff00) hue-rotate(40deg);
		}
		95% {
			filter: brightness(3) contrast(1.5) saturate(0) drop-shadow(0 0 70px #ffffff) hue-rotate(60deg);
		}
		100% {
			filter: brightness(3.5) contrast(1.6) saturate(0) drop-shadow(0 0 80px #ffffff) drop-shadow(0 0 40px #00ff00) hue-rotate(80deg);
		}
	}

	.moon-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(255, 255, 235, 0.45) 0%,
			rgba(255, 255, 215, 0.28) 22%,
			rgba(255, 255, 190, 0.14) 45%,
			rgba(255, 255, 160, 0.05) 70%,
			transparent 100%
		);
		filter: blur(30px);
		animation: moon-pulse 8s ease-in-out infinite;
		transition: all 0.3s;
	}

	.moon-glow.laser-charging {
		background: radial-gradient(
			circle,
			rgba(0, 255, 0, 0.6) 0%,
			rgba(0, 255, 0, 0.3) 40%,
			transparent 70%
		);
		width: 150px;
		height: 150px;
	}

	.moon-glow.holding {
		animation: glow-charge 9.5s linear forwards;
	}

	@keyframes glow-charge {
		0% {
			background: radial-gradient(circle, rgba(0, 255, 0, 0.1) 0%, transparent 70%);
			width: 100px;
			height: 100px;
		}
		40% {
			background: radial-gradient(circle, rgba(0, 255, 0, 0.4) 0%, rgba(0, 255, 0, 0.2) 40%, transparent 70%);
			width: 130px;
			height: 130px;
		}
		70% {
			background: radial-gradient(circle, rgba(100, 255, 100, 0.6) 0%, rgba(0, 255, 0, 0.3) 40%, transparent 70%);
			width: 160px;
			height: 160px;
		}
		90% {
			background: radial-gradient(circle, rgba(200, 255, 200, 0.8) 0%, rgba(100, 255, 100, 0.4) 30%, rgba(0, 255, 0, 0.2) 50%, transparent 70%);
			width: 190px;
			height: 190px;
		}
		100% {
			background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(200, 255, 200, 0.7) 25%, rgba(0, 255, 0, 0.4) 50%, transparent 70%);
			width: 220px;
			height: 220px;
		}
	}

	@media (max-width: 767px) and (min-resolution: 3dppx) {
		.moon-button {
			top: 140px;
		}
	}

	@media (min-width: 768px) {
		.moon-button {
			top: 200px;
			right: 50px;
		}

		.moon {
			width: 120px;
		}

		.moon-glow {
			width: 200px;
			height: 200px;
		}

		.moon-glow.laser-charging {
			width: 250px;
			height: 250px;
		}
	}

	@keyframes moon-pulse {
		0%,
		100% {
			opacity: 0.8;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.1);
		}
	}
</style>
