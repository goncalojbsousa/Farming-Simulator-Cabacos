import { Scene } from 'phaser';
import { translate } from '../services/LanguageService';

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;

    constructor() {
        super('GameOver');
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.add.image(centerX, centerY, 'mainMenuBackground')
            .setDisplaySize(this.scale.width, this.scale.height)
            .setAlpha(0.5);

        this.add.text(centerX, centerY, translate('gameOver'), {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
