export type VirtualButton = 'interact' | 'inventory' | 'escape';

// Shared touch input state. The on-screen touch controls write to it and
// GameInput reads it, so the virtual joystick and buttons behave exactly
// like the keyboard and mouse inputs used on desktop.
const virtualState = {
    axisX: 0,
    axisY: 0
};

// Buttons pressed since the last scene update. The boolean tracks whether
// an update has already had the chance to consume the press.
const pendingButtons = new Map<VirtualButton, boolean>();

export function setVirtualAxis(axisX: number, axisY: number): void {
    virtualState.axisX = axisX;
    virtualState.axisY = axisY;
}

export function pressVirtualButton(button: VirtualButton): void {
    pendingButtons.set(button, false);
}

// Returns true only once per press, mirroring the Phaser keyboard JustDown
// behaviour so virtual buttons cannot trigger the same action twice.
export function consumeVirtualButton(button: VirtualButton): boolean {
    if (!pendingButtons.has(button)) {
        return false;
    }

    pendingButtons.delete(button);
    return true;
}

// Called at the start of every scene update. A press that no update consumed
// during the frame it was made is discarded, so a button tap can never fire
// a delayed action later (for example after entering a building).
export function expireVirtualButtons(): void {
    pendingButtons.forEach((offeredToUpdate, button) => {
        if (offeredToUpdate) {
            pendingButtons.delete(button);
        } else {
            pendingButtons.set(button, true);
        }
    });
}

export function getVirtualAxisX(): number {
    return virtualState.axisX;
}

export function getVirtualAxisY(): number {
    return virtualState.axisY;
}

export function resetVirtualInput(): void {
    virtualState.axisX = 0;
    virtualState.axisY = 0;
    pendingButtons.clear();
}

// Detects touch capable devices (phones and tablets), used to decide
// whether the on-screen touch controls should be displayed. The controls
// can also be forced on any device by adding ?touch=1 to the address,
// which is handy to preview them on desktop.
export function isTouchDevice(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const forceTouchControls = window.location.search
        .includes('touch=1');

    return forceTouchControls
        || 'ontouchstart' in window
        || navigator.maxTouchPoints > 0;
}
