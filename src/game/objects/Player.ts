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
        const axis = input.getMovementAxis();
        const movement = new PhaserMath.Vector2(axis.x, axis.y);

        // The touch joystick sends analog values; keyboard input is
        // already digital, so only full-length vectors are normalized.
        if (movement.length() > 1) {
            movement.normalize();
        }

        movement.scale(this.speed);
        this.sprite.setVelocity(movement.x, movement.y);

        if (axis.x < 0) {
            this.sprite.setFlipX(true);
        } else if (axis.x > 0) {
            this.sprite.setFlipX(false);
        }

        if (axis.x !== 0 || axis.y !== 0) {
            this.sprite.play('walk', true);

            if (this.scene.time.now - this.lastStepTime >= 300) {
                const rate = PhaserMath.FloatBetween(0.92, 1.08);

                playSound(this.scene, 'grassyStep', 0.12, rate);
                this.lastStepTime = this.scene.time.now;
            }
        } else {
            this.sprite.play('idle', true);
        }
    }
}
