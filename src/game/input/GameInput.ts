import { Input, Scene, Types } from 'phaser';
import { MobileControls } from './MobileControls';

export class GameInput {
    readonly pointer: Input.Pointer;

    private readonly arrows: Types.Input.Keyboard.CursorKeys;
    private readonly movementKeys: Record<'W' | 'A' | 'S' | 'D', Input.Keyboard.Key>;
    private readonly actionKeys: Record<'inventory' | 'interact' | 'escape' | 'nextDay' | 'addMoney', Input.Keyboard.Key>;
    private readonly hotbarKeys: Input.Keyboard.Key[];
    private readonly mobileControls?: MobileControls;
    private mouseWasDown = false;

    mousePressed = false;
    mouseReleased = false;

    constructor(scene: Scene, mobileControls?: MobileControls) {
        const keyboard = scene.input.keyboard!;

        this.mobileControls = mobileControls;
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
        // Touches on the on-screen controls never reach the world, so
        // pressing a touch button cannot trigger farming actions.
        const pointerClaimed = this.mobileControls?.isPointerClaimed(this.pointer.id)
            ?? false;

        this.mousePressed = this.pointer.primaryDown
            && !this.mouseWasDown
            && !pointerClaimed;
        this.mouseReleased = !this.pointer.primaryDown
            && this.mouseWasDown
            && !pointerClaimed;
        this.mouseWasDown = this.pointer.primaryDown;
    }

    // Analog joystick axis while the touch joystick is active,
    // otherwise the digital keyboard direction.
    getMovementAxis(): { x: number; y: number } {
        const joystickAxis = this.mobileControls?.getMoveAxis();

        if (joystickAxis) {
            return joystickAxis;
        }

        return {
            x: Number(this.isRightDown()) - Number(this.isLeftDown()),
            y: Number(this.isDownDown()) - Number(this.isUpDown())
        };
    }

    isLeftDown(): boolean {
        return this.arrows.left.isDown || this.movementKeys.A.isDown;
    }

    isRightDown(): boolean {
        return this.arrows.right.isDown || this.movementKeys.D.isDown;
    }

    isUpDown(): boolean {
        return this.arrows.up.isDown || this.movementKeys.W.isDown;
    }

    isDownDown(): boolean {
        return this.arrows.down.isDown || this.movementKeys.S.isDown;
    }

    inventoryPressed(): boolean {
        return Input.Keyboard.JustDown(this.actionKeys.inventory)
            || this.mobileControls?.consumeInventoryPress() === true;
    }

    interactPressed(): boolean {
        return Input.Keyboard.JustDown(this.actionKeys.interact)
            || this.mobileControls?.consumeInteractPress() === true;
    }

    escapePressed(): boolean {
        return Input.Keyboard.JustDown(this.actionKeys.escape)
            || this.mobileControls?.consumePausePress() === true;
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
