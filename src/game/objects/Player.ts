import { Math as PhaserMath, Physics, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { playSound } from '../services/SoundService';

export class Player {
    sprite: Physics.Arcade.Sprite;
    readonly speed = 80;
    private lastStepTime = 0;

    constructor(private scene: Scene, x: number, y: number) {
        this.sprite = scene.physics.add.sprite(x, y, 'idle');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBodySize(8, 1);
        this.sprite.setOffset(44, 38);

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
            this.playFootstep();
        } else {
            this.sprite.play('idle', true);
        }
    }

    private playFootstep(): void {
        if (this.scene.time.now - this.lastStepTime < 300) {
            return;
        }

        const rate = PhaserMath.FloatBetween(0.92, 1.08);

        playSound(this.scene, 'grassyStep', 0.12, rate);
        this.lastStepTime = this.scene.time.now;
    }
}
