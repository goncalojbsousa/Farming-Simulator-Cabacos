export class Player {

    idle: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number) {

        this.idle = scene.add.sprite(x, y, 'idle');

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('idle', {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8]}),
            frameRate: 9,
            repeat: -1
        });

        this.idle.play('idle');
    }
}
