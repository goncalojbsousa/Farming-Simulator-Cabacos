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

        // Create tilemap and layers loaded in Preloader
        const map = this.make.tilemap({ key: 'tilemap' });
        const tileset = map.addTilesetImage('tiles1', 'tilesetImage');
        if (tileset) {
            map.createLayer('Tile Layer 1', tileset, 0, 0);
            map.createLayer('Tile Layer 2', tileset, 0, 0);
        }

        this.player = new Player(this, 512, 384);
    }
    update(_time: number, delta: number) {
        this.player.update(delta);
    }
}
