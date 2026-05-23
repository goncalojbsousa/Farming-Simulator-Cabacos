import { Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { createTextButton } from '../ui/TextButton';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.add.image(512, 384, 'background');

        this.add.image(512, 245, 'logo');

        this.add.text(512, 380, translate('gameTitle'), {
            fontFamily: 'Arial Black',
            fontSize: 44,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        createTextButton(this, 512, 500, 280, 60, translate('startGame'), () => {
            this.scene.start('Game');
        });

        createTextButton(this, 512, 580, 280, 60, translate('settings'), () => {
            this.scene.start('SettingsMenu');
        });
    }
}
