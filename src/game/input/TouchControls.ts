import { GameObjects, Scene } from 'phaser';
import {
    isTouchDevice,
    pressVirtualButton,
    resetVirtualInput,
    setVirtualAxis,
    VirtualButton
} from './VirtualInput';

// Radii and margins of the on-screen controls, in screen pixels.
const joystickBaseRadius = 52;
const joystickThumbRadius = 24;
const joystickMaxOffset = 44;
const joystickZoneRadius = 62;
const interactButtonRadius = 56;
const inventoryButtonRadius = 42;
const pauseButtonRadius = 36;
const buttonZoneExtraRadius = 8;
const hoverMargin = 6;

// Layout offsets of the control cluster.
const portraitControlMargin = 150;
const landscapeControlMargin = 84;
const smallButtonRowOffset = 118;
const clusterEdgeMargin = 86;
const pauseButtonSideOffset = 112;

type TouchButton = {
    name: VirtualButton;
    zoneRadius: number;
    zone: GameObjects.Zone;
    visual: GameObjects.Container;
    background: GameObjects.Arc;
    position: Phaser.Math.Vector2;
};

type VisibleGameObject = Phaser.GameObjects.GameObject & {
    setVisible(visible: boolean): unknown;
};

// Draws a virtual joystick and action buttons on touch devices and feeds
// their state into VirtualInput. Keyboard and mouse input keep working
// exactly as before; these controls only exist on touch capable devices.
export class TouchControls {
    readonly uiObjects: Phaser.GameObjects.GameObject[];
    readonly enabled: boolean;

    private joystickBase: GameObjects.Arc;
    private joystickThumb: GameObjects.Arc;
    private joystickZone: GameObjects.Zone;
    private joystickCenter = new Phaser.Math.Vector2();
    private joystickPointerId = -1;
    private buttons: TouchButton[] = [];

    constructor(private scene: Scene) {
        this.enabled = isTouchDevice();
        this.uiObjects = [];

        if (!this.enabled) {
            return;
        }

        // Make sure several simultaneous touches can be tracked (joystick,
        // action buttons and inventory taps at the same time).
        scene.input.addPointer(3);
        scene.input.on('pointermove', this.handlePointerMove, this);
        scene.input.on('pointerup', this.handlePointerUp, this);
        scene.input.on('pointerupoutside', this.handlePointerUp, this);

        this.joystickBase = scene.add.circle(
            0,
            0,
            joystickBaseRadius,
            0x000000,
            0.35
        )
            .setStrokeStyle(2, 0xffffff, 0.45)
            .setScrollFactor(0)
            .setDepth(850);
        this.joystickThumb = scene.add.circle(
            0,
            0,
            joystickThumbRadius,
            0xffffff,
            0.45
        )
            .setStrokeStyle(2, 0xffffff, 0.8)
            .setScrollFactor(0)
            .setDepth(851);
        this.joystickZone = scene.add.zone(
            0,
            0,
            joystickZoneRadius * 2,
            joystickZoneRadius * 2
        )
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(400);
        this.joystickZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.joystickPointerId = pointer.id;
            this.updateJoystick(pointer);
        });

        this.buttons = [
            this.createButton('interact', interactButtonRadius, (buttonScene) => {
                // The letter matches the keyboard prompts shown in game.
                const label = buttonScene.add.text(0, 0, 'E', {
                    fontFamily: 'Arial Black',
                    fontSize: 34,
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(0.5).setResolution(2);

                return [label];
            }),
            this.createButton('inventory', inventoryButtonRadius, (buttonScene) => {
                // Simple 2x2 grid that reads as an inventory icon.
                const icon = buttonScene.add.graphics();

                icon.fillStyle(0xffffff, 0.9);
                icon.fillRect(-11, -11, 9, 9);
                icon.fillRect(2, -11, 9, 9);
                icon.fillRect(-11, 2, 9, 9);
                icon.fillRect(2, 2, 9, 9);

                return [icon];
            }),
            this.createButton('escape', pauseButtonRadius, (buttonScene) => {
                // Pause icon made of two vertical bars.
                const icon = buttonScene.add.graphics();

                icon.fillStyle(0xffffff, 0.9);
                icon.fillRect(-8, -11, 6, 22);
                icon.fillRect(2, -11, 6, 22);

                return [icon];
            })
        ];

        this.uiObjects = [
            this.joystickBase,
            this.joystickThumb,
            this.joystickZone,
            ...this.buttons.flatMap((button) => [button.zone, button.visual])
        ];

        this.layout();

        // Hide the controls while the scene is paused or asleep (pause menu,
        // building interiors) and bring them back when it becomes active.
        scene.events.on('pause', this.handleSceneInactive, this);
        scene.events.on('sleep', this.handleSceneInactive, this);
        scene.events.on('resume', this.handleSceneActive, this);
        scene.events.on('wake', this.handleSceneActive, this);
        scene.scale.on('resize', this.layout, this);
        scene.events.once('shutdown', this.destroy, this);
    }

    // Used by gameplay systems to avoid using tools when touching the
    // on-screen controls instead of the world.
    isPointerOverControls(x: number, y: number): boolean {
        if (!this.enabled) {
            return false;
        }

        const isInsideCircle = (
            centerX: number,
            centerY: number,
            radius: number
        ) => {
            const deltaX = x - centerX;
            const deltaY = y - centerY;
            const totalRadius = radius + hoverMargin;

            return deltaX * deltaX + deltaY * deltaY
                <= totalRadius * totalRadius;
        };

        if (isInsideCircle(
            this.joystickCenter.x,
            this.joystickCenter.y,
            joystickZoneRadius
        )) {
            return true;
        }

        return this.buttons.some((button) =>
            isInsideCircle(
                button.position.x,
                button.position.y,
                button.zoneRadius
            )
        );
    }

    setVisible(visible: boolean): void {
        if (!this.enabled) {
            return;
        }

        this.uiObjects.forEach((object) =>
            (object as VisibleGameObject).setVisible(visible)
        );

        if (!visible) {
            this.releaseJoystick();
        }
    }

    layout(): void {
        if (!this.enabled) {
            return;
        }

        const { width, height } = this.scene.scale;
        const isPortrait = height > width;
        const mainRowY = height - (isPortrait
            ? portraitControlMargin
            : landscapeControlMargin);
        const smallRowY = mainRowY - smallButtonRowOffset;

        this.joystickCenter.set(clusterEdgeMargin, mainRowY);
        this.joystickBase
            .setPosition(this.joystickCenter.x, this.joystickCenter.y);
        this.joystickThumb
            .setPosition(this.joystickCenter.x, this.joystickCenter.y);
        this.joystickZone
            .setPosition(this.joystickCenter.x, this.joystickCenter.y);

        const buttonPositions: Record<VirtualButton, Phaser.Math.Vector2> = {
            interact: new Phaser.Math.Vector2(width - clusterEdgeMargin, mainRowY),
            inventory: new Phaser.Math.Vector2(width - clusterEdgeMargin, smallRowY),
            escape: new Phaser.Math.Vector2(
                width - clusterEdgeMargin - interactButtonRadius
                - pauseButtonRadius - pauseButtonSideOffset,
                smallRowY
            )
        };

        this.buttons.forEach((button) => {
            const position = buttonPositions[button.name];

            button.position.copy(position);
            button.zone.setPosition(position.x, position.y);
            button.visual.setPosition(position.x, position.y);
        });
    }

    private createButton(
        name: VirtualButton,
        radius: number,
        createIcon: (scene: Scene) => Phaser.GameObjects.GameObject[]
    ): TouchButton {
        const zoneRadius = radius + buttonZoneExtraRadius;
        const zone = this.scene.add.zone(
            0,
            0,
            zoneRadius * 2,
            zoneRadius * 2
        )
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(400);
        const background = this.scene.add.circle(0, 0, radius, 0x000000, 0.4)
            .setStrokeStyle(2, 0xffffff, 0.55);
        const visual = this.scene.add.container(0, 0, [
            background,
            ...createIcon(this.scene)
        ])
            .setScrollFactor(0)
            .setDepth(850);

        const pressButton = () => {
            pressVirtualButton(name);
            visual.setScale(0.92);
            background.setFillStyle(0x000000, 0.6);
        };
        const releaseButton = () => {
            visual.setScale(1);
            background.setFillStyle(0x000000, 0.4);
        };

        zone.on('pointerdown', pressButton);
        zone.on('pointerup', releaseButton);
        zone.on('pointerout', releaseButton);

        return {
            name,
            zoneRadius,
            zone,
            visual,
            background,
            position: new Phaser.Math.Vector2()
        };
    }

    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        if (pointer.id === this.joystickPointerId) {
            this.updateJoystick(pointer);
        }
    }

    private handlePointerUp(pointer: Phaser.Input.Pointer): void {
        if (pointer.id === this.joystickPointerId) {
            this.releaseJoystick();
        }
    }

    private updateJoystick(pointer: Phaser.Input.Pointer): void {
        const deltaX = pointer.x - this.joystickCenter.x;
        const deltaY = pointer.y - this.joystickCenter.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const clampedScale = distance > 0
            ? Math.min(distance, joystickMaxOffset) / distance
            : 0;
        const thumbX = deltaX * clampedScale;
        const thumbY = deltaY * clampedScale;

        this.joystickThumb.setPosition(
            this.joystickCenter.x + thumbX,
            this.joystickCenter.y + thumbY
        );
        setVirtualAxis(
            thumbX / joystickMaxOffset,
            thumbY / joystickMaxOffset
        );
    }

    private releaseJoystick(): void {
        this.joystickPointerId = -1;
        this.joystickThumb
            .setPosition(this.joystickCenter.x, this.joystickCenter.y);
        setVirtualAxis(0, 0);
    }

    private handleSceneInactive(): void {
        this.setVisible(false);
        resetVirtualInput();
    }

    private handleSceneActive(): void {
        this.setVisible(true);
    }

    private destroy(): void {
        this.scene.scale.off('resize', this.layout, this);
        this.scene.input.off('pointermove', this.handlePointerMove, this);
        this.scene.input.off('pointerup', this.handlePointerUp, this);
        this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
        this.scene.events.off('pause', this.handleSceneInactive, this);
        this.scene.events.off('sleep', this.handleSceneInactive, this);
        this.scene.events.off('resume', this.handleSceneActive, this);
        this.scene.events.off('wake', this.handleSceneActive, this);
        resetVirtualInput();
    }
}
