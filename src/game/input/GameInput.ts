export class GameInput {
    readonly pointer: Phaser.Input.Pointer;

    private arrows: Phaser.Types.Input.Keyboard.CursorKeys;
    private movementKeys: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    private inventoryKey: Phaser.Input.Keyboard.Key;
    private interactKey: Phaser.Input.Keyboard.Key;
    private escapeKey: Phaser.Input.Keyboard.Key;
    private nextDayKey: Phaser.Input.Keyboard.Key;
    private hotbarKeys: Phaser.Input.Keyboard.Key[];
    private mouseWasDown = false;

    mousePressed = false;
    mouseReleased = false;

    constructor(scene: Phaser.Scene) {
        const keyboard = scene.input.keyboard!;

        this.pointer = scene.input.activePointer;
        this.arrows = keyboard.createCursorKeys();
        this.movementKeys = keyboard.addKeys('W,A,S,D') as typeof this.movementKeys;
        this.inventoryKey = keyboard.addKey('I');
        this.interactKey = keyboard.addKey('E');
        this.escapeKey = keyboard.addKey('ESC');
        this.nextDayKey = keyboard.addKey('N');
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
        return Phaser.Input.Keyboard.JustDown(this.inventoryKey);
    }

    interactPressed(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.interactKey);
    }

    escapePressed(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.escapeKey);
    }

    nextDayPressed(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.nextDayKey);
    }

    getHotbarSlotPressed(): number | null {
        const slot = this.hotbarKeys.findIndex((key) =>
            Phaser.Input.Keyboard.JustDown(key)
        );

        return slot === -1 ? null : slot;
    }
}
