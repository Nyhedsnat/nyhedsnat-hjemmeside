<script lang="ts">
	import { onMount } from 'svelte';
	import { triggerConvoy } from '$lib/stores/convoy';

	// Size categories based on reference heights (car.svg and bus.svg)
	const SIZE = {
		car: 45,      // Standard car height (matches car.svg)
		large: 65,    // Large vehicles like truck (matches bus.svg)
		small: 24     // Small vehicles like moped/e-scooter (roughly half of car)
	} as const;

	type SizeCategory = keyof typeof SIZE;

	interface VehicleType {
		src: string;
		size: SizeCategory;
		minDuration: number;
		maxDuration: number;
		weight: number; // Higher = more common
		direction?: 'ltr' | 'rtl' | 'both'; // Allowed directions (default: both)
	}

	interface ActiveVehicle {
		id: number;
		typeIndex: number;
		direction: 'ltr' | 'rtl';
		duration: number;
	}

	// Vehicle configuration:
	// - size: 'car' (45px), 'large' (65px), 'small' (24px)
	// - minDuration/maxDuration: time in seconds to cross screen (lower = faster)
	// - weight: spawn probability (higher = more common)
	// - direction: 'ltr', 'rtl', or 'both' (default: 'both' if omitted)
	const vehicleTypes: VehicleType[] = [
		{ src: '/svg/eastereggs/vehicles/car-1.svg', size: 'car', minDuration: 8, maxDuration: 14, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/car-2.svg', size: 'car', minDuration: 9, maxDuration: 15, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/car-3.svg', size: 'car', minDuration: 9, maxDuration: 15, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/car-4.svg', size: 'car', minDuration: 9, maxDuration: 15, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/car-5.svg', size: 'car', minDuration: 9, maxDuration: 15, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/4x4.svg', size: 'car', minDuration: 12, maxDuration: 18, weight: 2 },
		{ src: '/svg/eastereggs/vehicles/random-short-car.svg', size: 'car', minDuration: 7, maxDuration: 12, weight: 2 },
		{ src: '/svg/eastereggs/vehicles/truck.svg', size: 'large', minDuration: 18, maxDuration: 28, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/moped.svg', size: 'small', minDuration: 16, maxDuration: 24, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/e-scooter.svg', size: 'small', minDuration: 20, maxDuration: 30, weight: 3 },
		// Rare vehicles
		{ src: '/svg/eastereggs/vehicles/nyhedsnat-car-rtl.svg', size: 'large', minDuration: 9, maxDuration: 14, weight: 4, direction: 'rtl' }, //because this has text it needs to exist in two types one for each direction it can drive 
		{ src: '/svg/eastereggs/vehicles/nyhedsnat-car-ltr.svg', size: 'large', minDuration: 9, maxDuration: 14, weight: 4, direction: 'ltr' },
		{ src: '/svg/eastereggs/vehicles/dino-car.svg', size: 'car', minDuration: 11, maxDuration: 17, weight: 2 },
		{ src: '/svg/eastereggs/vehicles/racer.svg', size: 'car', minDuration: 11, maxDuration: 17, weight: 1 },
		{ src: '/svg/eastereggs/vehicles/limo.svg', size: 'car', minDuration: 11, maxDuration: 17, weight: 1}
	];

	// Total weight for probability calculation
	const totalWeight = vehicleTypes.reduce((sum, v) => sum + v.weight, 0);

	// Spawn interval: 5-15 seconds
	const minSpawnInterval = 5000;
	const maxSpawnInterval = 15000;

	let vehicleIdCounter = 0;
	let activeVehicles = $state<ActiveVehicle[]>([]);

	function getHeight(size: SizeCategory): number {
		return SIZE[size];
	}

	function handleClick() {
		triggerConvoy.set(true);
	}

	function getWeightedRandomVehicle(): number {
		let random = Math.random() * totalWeight;
		for (let i = 0; i < vehicleTypes.length; i++) {
			random -= vehicleTypes[i].weight;
			if (random <= 0) return i;
		}
		return 0; // Fallback
	}

	function getDirection(vehicleType: VehicleType): 'ltr' | 'rtl' {
		const allowed = vehicleType.direction ?? 'both';
		if (allowed === 'both') return Math.random() > 0.5 ? 'rtl' : 'ltr';
		return allowed;
	}

	function spawnVehicle() {
		const typeIndex = getWeightedRandomVehicle();
		const vehicleType = vehicleTypes[typeIndex];
		const direction = getDirection(vehicleType);
		const duration = Math.random() * (vehicleType.maxDuration - vehicleType.minDuration) + vehicleType.minDuration;
		const id = vehicleIdCounter++;

		activeVehicles = [...activeVehicles, { id, typeIndex, direction, duration }];

		// Remove after animation completes
		setTimeout(() => {
			activeVehicles = activeVehicles.filter(v => v.id !== id);
		}, duration * 1000 + 200);
	}

	function scheduleNextSpawn() {
		const interval = Math.random() * (maxSpawnInterval - minSpawnInterval) + minSpawnInterval;
		setTimeout(() => {
			spawnVehicle();
			scheduleNextSpawn();
		}, interval);
	}

	onMount(() => {
		// Spawn first vehicle immediately
		spawnVehicle();
		// Schedule ongoing spawns
		scheduleNextSpawn();
	});
</script>

{#each activeVehicles as vehicle (vehicle.id)}
	{@const vehicleType = vehicleTypes[vehicle.typeIndex]}
	{@const height = getHeight(vehicleType.size)}
	<div
		class="vehicle-container {vehicle.direction}"
		style="--duration: {vehicle.duration}s;"
	>
		<button class="vehicle-button" onclick={handleClick} aria-label="Spawn convoy">
			<img
				src={vehicleType.src}
				alt=""
				class="vehicle"
				style="height: {height}px;"
				draggable="false"
			/>
		</button>
	</div>
{/each}

<style>
	.vehicle-container {
		position: absolute;
		bottom: 10px;
		z-index: 2;
		pointer-events: none;
	}

	.vehicle-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		pointer-events: auto;
	}

	/* Left to right drive */
	.vehicle-container.ltr {
		left: 0;
		animation: drive-ltr var(--duration, 12s) linear forwards;
	}

	/* Right to left drive */
	.vehicle-container.rtl {
		right: 0;
		left: auto;
		animation: drive-rtl var(--duration, 12s) linear forwards;
	}

	.vehicle-container.ltr .vehicle {
		transform: scaleX(-1);
	}

	.vehicle {
		width: auto;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
	}

	/* Use generous offsets to ensure vehicles are fully off-screen */
	@keyframes drive-ltr {
		0% {
			transform: translateX(-250px);
		}
		100% {
			transform: translateX(calc(100vw + 250px));
		}
	}

	@keyframes drive-rtl {
		0% {
			transform: translateX(250px);
		}
		100% {
			transform: translateX(calc(-100vw - 250px));
		}
	}
</style>
