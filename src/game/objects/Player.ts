export class Player {

    sprite: Phaser.GameObjects.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    keyA: Phaser.Input.Keyboard.Key;
    keyD: Phaser.Input.Keyboard.Key;

    readonly speed: number = 160;

    constructor(scene: Phaser.Scene, x: number, y: number) {

        this.sprite = scene.add.sprite(x, y, 'idle');

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('idle', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
            frameRate: 9,
            repeat: -1
        });

        scene.anims.create({
            key: 'walk',
            frames: scene.anims.generateFrameNumbers('walk', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 8,
            repeat: -1
        });

        this.sprite.play('idle');

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.keyA = scene.input.keyboard!.addKey('A');
        this.keyD = scene.input.keyboard!.addKey('D');
    }

    update(delta: number) {
        const goLeft  = this.cursors.left.isDown  || this.keyA.isDown;
        const goRight = this.cursors.right.isDown || this.keyD.isDown;
        const distance = this.speed * (delta / 1000);

        if (goLeft) {
            this.sprite.x -= distance;
            this.sprite.setFlipX(true);
            this.sprite.play('walk', true);
        } else if (goRight) {
            this.sprite.x += distance;
            this.sprite.setFlipX(false);
            this.sprite.play('walk', true);
        } else {
            this.sprite.play('idle', true);
        }
    }
}
