import { Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { createTextButton } from '../ui/TextButton';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.image(centerX, centerY, 'background').setDisplaySize(this.scale.width, this.scale.height);

        this.add.image(centerX, centerY - 140, 'logo');

        this.add.text(centerX, centerY - 5, translate('gameTitle'), {
            fontFamily: 'Arial Black',
            fontSize: 44,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        createTextButton(this, centerX, centerY + 115, 280, 60, translate('startGame'), () => {
            this.scene.start('Game');
        });

        createTextButton(this, centerX, centerY + 195, 280, 60, translate('settings'), () => {
            this.scene.start('SettingsMenu');
        });
    }
}
