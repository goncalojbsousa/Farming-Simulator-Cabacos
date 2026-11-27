// Helpers shared by every scene that renders on-screen touch controls.
// The controls only appear on devices with a touch screen, so desktop
// mouse and keyboard behaviour stays exactly the same.

let touchSupportCache: boolean | null = null;

export function isTouchDevice(): boolean {
    if (touchSupportCache === null) {
        touchSupportCache = typeof window !== 'undefined'
            && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }

    return touchSupportCache;
}

// Distance in pixels from the screen bottom where the touch button row
// sits. Keeps the buttons clear of the hotbar for both hotbar scales.
export const touchButtonBottomClearance = 94;

// Scales the on-screen controls down on small screens so the joystick
// and buttons stay comfortable to use without covering the map.
export function getTouchControlsScale(width: number, height: number): number {
    return Math.min(1, Math.max(0.75, Math.min(width, height) / 480));
}

export function getTouchInteractRadius(width: number, height: number): number {
    return Math.round(36 * getTouchControlsScale(width, height));
}

// Vertical position for interaction prompts so they stay visible above
// the touch controls instead of behind them.
export function getTouchPromptY(width: number, height: number): number {
    const interactRadius = getTouchInteractRadius(width, height);

    return height - touchButtonBottomClearance - interactRadius * 2 - 14;
}
