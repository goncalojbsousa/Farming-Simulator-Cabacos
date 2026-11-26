import { Input, Scene, Types } from 'phaser';
import {
    consumeVirtualButton,
    expireVirtualButtons,
    getVirtualAxisX,
    getVirtualAxisY
} from './VirtualInput';

// Minimum joystick deflection needed to count as a movement direction.
const joystickDeadzone = 0.25;

export class GameInput {
    readonly pointer: Input.Pointer;

    private readonly arrows: Types.Input.Keyboard.CursorKeys;
    private readonly movementKeys: Record<'W' | 'A' | 'S' | 'D', Input.Keyboard.Key>;
    private readonly actionKeys: Record<'inventory' | 'interact' | 'escape' | 'nextDay' | 'addMoney', Input.Keyboard.Key>;
    private readonly hotbarKeys: Input.Keyboard.Key[];
    private mouseWasDown = false;

    mousePressed = false;
    mouseReleased = false;

    constructor(scene: Scene) {
        const keyboard = scene.input.keyboard!;

        this.pointer = scene.input.activePointer;
        this.arrows = keyboard.createCursorKeys();
        this.movementKeys = {
            W: keyboard.addKey('W'),
            A: keyboard.addKey('A'),
            S: keyboard.addKey('S'),
            D: keyboard.addKey('D')
        };
        this.actionKeys = {
            inventory: keyboard.addKey('I'),
            interact: keyboard.addKey('E'),
            escape: keyboard.addKey('ESC'),
            nextDay: keyboard.addKey('N'),
            addMoney: keyboard.addKey('M')
        };
        this.hotbarKeys = [
            keyboard.addKey('ONE'),
            keyboard.addKey('TWO'),
            keyboard.addKey('THREE'),
            keyboard.addKey('FOUR'),
            keyboard.addKey('FIVE'),
            keyboard.addKey('SIX'),
            keyboard.addKey('SEVEN'),
            keyboard.addKey('EIGHT')
        ];
    }

    update(): void {
        // Discard virtual button presses that no system consumed on the
        // frame they were made, matching keyboard JustDown semantics.
        expireVirtualButtons();

        this.mousePressed = this.pointer.primaryDown && !this.mouseWasDown;
        this.mouseReleased = !this.pointer.primaryDown && this.mouseWasDown;
        this.mouseWasDown = this.pointer.primaryDown;
    }

    isLeftDown(): boolean {
        return this.arrows.left.isDown || this.movementKeys.A.isDown
            || getVirtualAxisX() < -joystickDeadzone;
    }

    isRightDown(): boolean {
        return this.arrows.right.isDown || this.movementKeys.D.isDown
            || getVirtualAxisX() > joystickDeadzone;
    }

    isUpDown(): boolean {
        return this.arrows.up.isDown || this.movementKeys.W.isDown
            || getVirtualAxisY() < -joystickDeadzone;
    }

    isDownDown(): boolean {
        return this.arrows.down.isDown || this.movementKeys.S.isDown
            || getVirtualAxisY() > joystickDeadzone;
    }

    inventoryPressed(): boolean {
        return Input.Keyboard.JustDown(this.actionKeys.inventory)
            || consumeVirtualButton('inventory');
    }

    interactPressed(): boolean {
        return Input.Keyboard.JustDown(this.actionKeys.interact)
            || consumeVirtualButton('interact');
    }

    escapePressed(): boolean {
        return Input.Keyboard.JustDown(this.actionKeys.escape)
            || consumeVirtualButton('escape');
    }

    nextDayPressed(): boolean {
        return Input.Keyboard.JustDown(this.actionKeys.nextDay);
    }

    addMoneyPressed(): boolean {
        return Input.Keyboard.JustDown(this.actionKeys.addMoney);
    }

    getHotbarSlotPressed(): number | null {
        const slot = this.hotbarKeys.findIndex((key) =>
            Input.Keyboard.JustDown(key)
        );

        return slot === -1 ? null : slot;
    }
}
