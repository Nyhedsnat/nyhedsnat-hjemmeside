// Fractal lightning via midpoint-displacement: recursively kink the line between two
// points, halving the offset each pass. Shared by the bolt that strikes cars
// (Vehicles) and the bolt drawn under the thunder cloud (ThunderCloud).
export function jaggedPath(ax: number, ay: number, bx: number, by: number, offset: number, gens: number): string {
	let pts = [
		{ x: ax, y: ay },
		{ x: bx, y: by }
	];
	let off = offset;
	for (let g = 0; g < gens; g++) {
		const next: { x: number; y: number }[] = [];
		for (let i = 0; i < pts.length - 1; i++) {
			const a = pts[i];
			const b = pts[i + 1];
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const len = Math.hypot(dx, dy) || 1;
			const d = (Math.random() * 2 - 1) * off; // perpendicular kink
			next.push(a, { x: (a.x + b.x) / 2 + (-dy / len) * d, y: (a.y + b.y) / 2 + (dx / len) * d });
		}
		next.push(pts[pts.length - 1]);
		pts = next;
		off *= 0.5;
	}
	return 'M ' + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ');
}
