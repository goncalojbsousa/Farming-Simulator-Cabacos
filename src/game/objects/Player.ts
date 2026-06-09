export class Player {

    sprite: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    keyA: Phaser.Input.Keyboard.Key;
    keyD: Phaser.Input.Keyboard.Key;
    keyW: Phaser.Input.Keyboard.Key;
    keyS: Phaser.Input.Keyboard.Key;

    readonly speed: number = 80;

    constructor(scene: Phaser.Scene, x: number, y: number) {

        this.sprite = scene.physics.add.sprite(x, y, 'idle');
        this.sprite.setCollideWorldBounds(true);
        // Ajustar o body ao tamanho real do personagem (sprite é 96x64, personagem ~16x16)
        this.sprite.setBodySize(8, 8);
        this.sprite.setOffset(44, 28);

        if (!scene.anims.exists('idle')) {
            scene.anims.create({
                key: 'idle',
                frames: scene.anims.generateFrameNumbers('idle', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
                frameRate: 9,
                repeat: -1
            });
        }

        if (!scene.anims.exists('walk')) {
            scene.anims.create({
                key: 'walk',
                frames: scene.anims.generateFrameNumbers('walk', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
                frameRate: 8,
                repeat: -1
            });
        }

        this.sprite.play('idle');

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.keyA = scene.input.keyboard!.addKey('A');
        this.keyD = scene.input.keyboard!.addKey('D');
        this.keyW = scene.input.keyboard!.addKey('W');
        this.keyS = scene.input.keyboard!.addKey('S');
    }

    update(_delta: number) {
        const goLeft = this.cursors.left.isDown || this.keyA.isDown;
        const goRight = this.cursors.right.isDown || this.keyD.isDown;
        const goUp = this.cursors.up.isDown || this.keyW.isDown;
        const goDown = this.cursors.down.isDown || this.keyS.isDown;

        this.sprite.setVelocity(0, 0);

        if (goLeft) {
            this.sprite.setVelocityX(-this.speed);
            this.sprite.setFlipX(true);
            this.sprite.play('walk', true);
        } else if (goRight) {
            this.sprite.setVelocityX(this.speed);
            this.sprite.setFlipX(false);
            this.sprite.play('walk', true);
        } else if (goUp) {
            this.sprite.setVelocityY(-this.speed);
            this.sprite.play('walk', true);
        } else if (goDown) {
            this.sprite.setVelocityY(this.speed);
            this.sprite.play('walk', true);
        } else {
            this.sprite.play('idle', true);
        }
    }
}
