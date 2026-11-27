import { Scene } from 'phaser';
import { translate, TranslationKey } from '../services/LanguageService';
import { getTouchControlsScale, touchButtonBottomClearance } from './TouchSupport';

const joystickRadius = 62;
const joystickKnobRadius = 26;
const joystickDragThreshold = 14;
const joystickEdgePadding = 12;
const interactBaseRadius = 36;
const inventoryBaseRadius = 28;
const pauseBaseRadius = 20;
const buttonEdgeMargin = 30;
const buttonSpacing = 14;
const pauseButtonY = 30;

type TouchButton = {
    circle: Phaser.GameObjects.Arc;
    label: Phaser.GameObjects.Text;
    radius: number;
    fontSize: number;
};

// Renders and handles the on-screen controls for touch devices:
// a floating joystick on the left half of the screen and action
// buttons (use, inventory, menu) stacked on the right side.
export class MobileControls {
    readonly uiObjects: Phaser.GameObjects.GameObject[];

    private scene: Scene;
    private joystickBase: Phaser.GameObjects.Arc;
    private joystickKnob: Phaser.GameObjects.Arc;
    private interactButton: TouchButton;
    private inventoryButton: TouchButton;
    private pauseButton: TouchButton;
    private buttons: TouchButton[];
    private joystickPointerId: number | null = null;
    private joystickOrigin = new Phaser.Math.Vector2();
    private joystickActive = false;
    private moveAxis = new Phaser.Math.Vector2();
    private interactQueued = false;
    private inventoryQueued = false;
    private pauseQueued = false;
    private claimedPointerIds = new Set<number>();
    private radiusScale = 1;

    constructor(scene: Scene) {
        this.scene = scene;

        const { width, height } = scene.scale;
        this.radiusScale = getTouchControlsScale(width, height);

        this.joystickBase = scene.add.circle(
            0,
            0,
            joystickRadius * this.radiusScale,
            0x000000,
            0.3
        )
            .setStrokeStyle(3, 0xffffff, 0.55)
            .setScrollFactor(0)
            .setDepth(1600)
            .setVisible(false);
        this.joystickKnob = scene.add.circle(
            0,
            0,
            joystickKnobRadius * this.radiusScale,
            0xffffff,
            0.45
        )
            .setStrokeStyle(2, 0x1a100b, 0.8)
            .setScrollFactor(0)
            .setDepth(1601)
            .setVisible(false);

        this.interactButton = this.createButton(
            interactBaseRadius,
            13,
            'mobileInteract',
            () => this.interactQueued = true
        );
        this.inventoryButton = this.createButton(
            inventoryBaseRadius,
            10,
            'mobileInventory',
            () => this.inventoryQueued = true
        );
        this.pauseButton = this.createButton(
            pauseBaseRadius,
            10,
            'mobilePause',
            () => this.pauseQueued = true
        );
        this.buttons = [
            this.interactButton,
            this.inventoryButton,
            this.pauseButton
        ];

        this.uiObjects = [
            this.joystickBase,
            this.joystickKnob,
            ...this.buttons.flatMap((button) => [button.circle, button.label])
        ];

        this.layout();

        scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.handlePointerMove, this);
        scene.input.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);
        scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.handlePointerUp, this);

        scene.events.on(Phaser.Scenes.Events.PAUSE, this.resetInput, this);
        scene.events.on(Phaser.Scenes.Events.SLEEP, this.resetInput, this);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    }

    // Returns the analog joystick axis while it is active, otherwise
    // undefined so callers fall back to keyboard input.
    getMoveAxis(): { x: number; y: number } | undefined {
        return this.joystickActive
            ? { x: this.moveAxis.x, y: this.moveAxis.y }
            : undefined;
    }

    consumeInteractPress(): boolean {
        if (!this.interactQueued) {
            return false;
        }

        this.interactQueued = false;
        return true;
    }

    consumeInventoryPress(): boolean {
        if (!this.inventoryQueued) {
            return false;
        }

        this.inventoryQueued = false;
        return true;
    }

    consumePausePress(): boolean {
        if (!this.pauseQueued) {
            return false;
        }

        this.pauseQueued = false;
        return true;
    }

    isPointerClaimed(pointerId: number): boolean {
        return this.claimedPointerIds.has(pointerId);
    }

    layout(): void {
        const { width, height } = this.scene.scale;
        this.radiusScale = getTouchControlsScale(width, height);
        const interactRadius = interactBaseRadius * this.radiusScale;
        const rowY = height - touchButtonBottomClearance - interactRadius;

        this.positionButton(
            this.interactButton,
            width - buttonEdgeMargin - interactRadius,
            rowY
        );
        this.positionButton(
            this.inventoryButton,
            this.interactButton.circle.x
                - this.interactButton.radius * this.radiusScale
                - this.inventoryButton.radius * this.radiusScale
                - buttonSpacing,
            rowY
        );
        this.positionButton(this.pauseButton, width - buttonEdgeMargin, pauseButtonY);

        // Keep the joystick inside the screen when the size changes.
        if (this.joystickPointerId !== null) {
            this.joystickOrigin.set(
                this.clampJoystickCenterX(this.joystickOrigin.x),
                this.clampJoystickCenterY(this.joystickOrigin.y)
            );
            this.updateJoystickVisuals();
        }
    }

    destroy(): void {
        this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
        this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.handlePointerMove, this);
        this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);
        this.scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.handlePointerUp, this);
        this.scene.events.off(Phaser.Scenes.Events.PAUSE, this.resetInput, this);
        this.scene.events.off(Phaser.Scenes.Events.SLEEP, this.resetInput, this);
    }

    private createButton(
        radius: number,
        fontSize: number,
        labelKey: TranslationKey,
        onPress: () => void
    ): TouchButton {
        const circle = this.scene.add.circle(0, 0, radius, 0x000000, 0.4)
            .setStrokeStyle(3, 0xffffff, 0.7)
            .setScrollFactor(0)
            .setDepth(1600)
            .setInteractive();
        const label = this.scene.add.text(0, 0, translate(labelKey), {
            fontFamily: 'Arial Black',
            fontSize: Math.round(fontSize * this.radiusScale),
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setResolution(2).setScrollFactor(0).setDepth(1601);

        circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            this.claimedPointerIds.add(pointer.id);
            circle.setScale(this.radiusScale * 0.9);
            onPress();
        });

        return { circle, label, radius, fontSize };
    }

    private positionButton(button: TouchButton, x: number, y: number): void {
        button.circle.setPosition(x, y).setScale(this.radiusScale);
        button.label.setPosition(x, y - 1);
        button.label.setFontSize(Math.round(button.fontSize * this.radiusScale));
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer): void {
        if (this.joystickPointerId !== null) {
            return;
        }

        if (!this.isInJoystickZone(pointer.x, pointer.y)) {
            return;
        }

        // Taps on interactive UI (hotbar, panels, buttons) never start
        // the joystick.
        if (this.scene.input.hitTestPointer(pointer).length > 0) {
            return;
        }

        this.joystickPointerId = pointer.id;
        this.joystickOrigin.set(
            this.clampJoystickCenterX(pointer.x),
            this.clampJoystickCenterY(pointer.y)
        );
        // The joystick only takes over once the finger moves, so quick
        // taps still reach the farming system.
    }

    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        if (pointer.id !== this.joystickPointerId) {
            return;
        }

        if (!this.joystickActive) {
            const distance = Phaser.Math.Distance.Between(
                this.joystickOrigin.x,
                this.joystickOrigin.y,
                pointer.x,
                pointer.y
            );

            if (distance < joystickDragThreshold) {
                return;
            }

            this.joystickActive = true;
            this.claimedPointerIds.add(pointer.id);
            this.joystickBase.setVisible(true);
            this.joystickKnob.setVisible(true);
        }

        this.updateJoystickVisuals(pointer.x, pointer.y);
    }

    private handlePointerUp(pointer: Phaser.Input.Pointer): void {
        this.claimedPointerIds.delete(pointer.id);
        this.buttons.forEach((button) => button.circle.setScale(this.radiusScale));

        if (pointer.id === this.joystickPointerId) {
            this.resetJoystick();
        }
    }

    private resetInput(): void {
        this.resetJoystick();
        this.interactQueued = false;
        this.inventoryQueued = false;
        this.pauseQueued = false;
        this.claimedPointerIds.clear();
    }

    private resetJoystick(): void {
        this.joystickPointerId = null;
        this.joystickActive = false;
        this.moveAxis.set(0, 0);
        this.joystickBase.setVisible(false);
        this.joystickKnob.setVisible(false);
    }

    private updateJoystickVisuals(pointerX?: number, pointerY?: number): void {
        const maxDistance = joystickRadius * this.radiusScale;
        let offsetX = 0;
        let offsetY = 0;

        if (pointerX !== undefined && pointerY !== undefined) {
            offsetX = pointerX - this.joystickOrigin.x;
            offsetY = pointerY - this.joystickOrigin.y;

            const distance = Math.hypot(offsetX, offsetY);

            if (distance > maxDistance) {
                offsetX = offsetX / distance * maxDistance;
                offsetY = offsetY / distance * maxDistance;
            }

            this.moveAxis.set(offsetX / maxDistance, offsetY / maxDistance);
        }

        this.joystickBase.setPosition(this.joystickOrigin.x, this.joystickOrigin.y);
        this.joystickKnob.setPosition(
            this.joystickOrigin.x + offsetX,
            this.joystickOrigin.y + offsetY
        );
    }

    private isInJoystickZone(x: number, y: number): boolean {
        const { width, height } = this.scene.scale;

        return x < width * 0.55 && y > height * 0.3;
    }

    private clampJoystickCenterX(x: number): number {
        const radius = joystickRadius * this.radiusScale + joystickEdgePadding;

        return Phaser.Math.Clamp(x, radius, this.scene.scale.width - radius);
    }

    private clampJoystickCenterY(y: number): number {
        const radius = joystickRadius * this.radiusScale + joystickEdgePadding;

        return Phaser.Math.Clamp(y, radius, this.scene.scale.height - radius);
    }
}
