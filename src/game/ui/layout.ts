// Shared responsive layout helpers for HUD elements. Screens below
// these sizes switch to a compact layout so panels, hotbar and quest
// card stay usable on phones.

export function isCompactLayout(width: number, height: number): boolean {
    return width < 620 || height < 500;
}

// Hotbar slots use a smaller scale on compact screens so all eight
// slots fit across the width.
export function getHotbarSlotScale(width: number, height: number): number {
    return isCompactLayout(width, height) ? 2 : 3;
}
