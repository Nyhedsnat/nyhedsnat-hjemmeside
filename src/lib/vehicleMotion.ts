// Generic Web Animations API ops on a vehicle element, shared by the traffic
// controller and the snow pile-up controller. No Svelte, no component state.

// Find the running CSS animation that MOVES the element. Svelte scopes keyframe
// names (e.g. "s-abc123-drive-rtl", "s-xyz-snowcar-leave"), so match loosely by
// substring: "drive" (traffic) or "snowcar" (snow arrival/leave).
export function getMotionAnimation(el: HTMLElement): Animation | undefined {
	return el.getAnimations().find((a) => {
		const n = (a as CSSAnimation).animationName ?? '';
		return n.includes('drive') || n.includes('snowcar');
	});
}

// Temporarily speed the animation up, then ease back to normal after `ms`.
export function boost(anim: Animation, rate: number, ms: number): void {
	anim.playbackRate = rate;
	setTimeout(() => {
		try {
			anim.playbackRate = 1;
		} catch {
			/* vehicle gone */
		}
	}, ms);
}

// Simple reverse primitive: flip the animation's playback direction.
export function reverse(anim: Animation, rate = 1.5): void {
	anim.playbackRate = -Math.abs(rate);
}
