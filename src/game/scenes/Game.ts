import { Scene } from 'phaser';
import { Player } from '../objects/Player';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    player: Player;

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.player = new Player(this, 512, 384);
    }

    update(_time: number, delta: number) {
        this.player.update(delta);
    }
}
