import { Scene } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;

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
    }
}
