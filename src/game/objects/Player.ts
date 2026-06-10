import { Math as PhaserMath, Physics, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';

export class Player {
    sprite: Physics.Arcade.Sprite;
    readonly speed = 80;

    constructor(scene: Scene, x: number, y: number) {
        this.sprite = scene.physics.add.sprite(x, y, 'idle');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBodySize(8, 8);
        this.sprite.setOffset(44, 28);

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('idle', { start: 0, end: 8 }),
            frameRate: 9,
            repeat: -1
        });

        scene.anims.create({
            key: 'walk',
            frames: scene.anims.generateFrameNumbers('walk', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.sprite.play('idle');

    }

    update(input: GameInput): void {
        const horizontalMovement =
            Number(input.isRightDown()) - Number(input.isLeftDown());
        const verticalMovement =
            Number(input.isDownDown()) - Number(input.isUpDown());
        const movement = new PhaserMath.Vector2(
            horizontalMovement,
            verticalMovement
        ).normalize().scale(this.speed);

        this.sprite.setVelocity(movement.x, movement.y);

        if (horizontalMovement < 0) {
            this.sprite.setFlipX(true);
        } else if (horizontalMovement > 0) {
            this.sprite.setFlipX(false);
        }

        if (horizontalMovement !== 0 || verticalMovement !== 0) {
            this.sprite.play('walk', true);
        } else {
            this.sprite.play('idle', true);
        }
    }
}
