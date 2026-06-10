import { Input, Scene, Types } from 'phaser';

export class GameInput {
    readonly pointer: Input.Pointer;

    private arrows: Types.Input.Keyboard.CursorKeys;
    private movementKeys: Record<'W' | 'A' | 'S' | 'D', Input.Keyboard.Key>;
    private inventoryKey: Input.Keyboard.Key;
    private interactKey: Input.Keyboard.Key;
    private escapeKey: Input.Keyboard.Key;
    private hotbarKeys: Input.Keyboard.Key[];
    private mouseWasDown = false;

    mousePressed = false;
    mouseReleased = false;

    constructor(scene: Scene) {
        const keyboard = scene.input.keyboard!;

        this.pointer = scene.input.activePointer;
        this.arrows = keyboard.createCursorKeys();
        this.movementKeys = keyboard.addKeys('W,A,S,D') as typeof this.movementKeys;
        this.inventoryKey = keyboard.addKey('I');
        this.interactKey = keyboard.addKey('E');
        this.escapeKey = keyboard.addKey('ESC');
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
        this.mousePressed = this.pointer.primaryDown && !this.mouseWasDown;
        this.mouseReleased = !this.pointer.primaryDown && this.mouseWasDown;
        this.mouseWasDown = this.pointer.primaryDown;
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
        return Input.Keyboard.JustDown(this.inventoryKey);
    }

    interactPressed(): boolean {
        return Input.Keyboard.JustDown(this.interactKey);
    }

    escapePressed(): boolean {
        return Input.Keyboard.JustDown(this.escapeKey);
    }

    getHotbarSlotPressed(): number | null {
        const slot = this.hotbarKeys.findIndex((key) =>
            Input.Keyboard.JustDown(key)
        );

        return slot === -1 ? null : slot;
    }
}
