export class Player {
    sprite: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    keys: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    readonly speed = 80;

    constructor(scene: Phaser.Scene, x: number, y: number) {
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

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.keys = scene.input.keyboard!.addKeys('W,A,S,D') as typeof this.keys;
    }

    update(): void {
        const goLeft = this.cursors.left.isDown || this.keys.A.isDown;
        const goRight = this.cursors.right.isDown || this.keys.D.isDown;
        const goUp = this.cursors.up.isDown || this.keys.W.isDown;
        const goDown = this.cursors.down.isDown || this.keys.S.isDown;

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
