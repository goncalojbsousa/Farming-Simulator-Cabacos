import { GameObjects, Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { createTextButton } from '../ui/TextButton';

export class MainMenu extends Scene {
    private background: GameObjects.Image;
    private logo: GameObjects.Image;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(0, 0, 'mainMenuBackground').setOrigin(0.5);
        this.logo = this.add.image(0, 0, 'mainMenuLogo').setOrigin(0.5);

        createTextButton(this, 0, 0, 280, 60, translate('startGame'), () => {
            this.scene.start('Game');
        }).setName('startButton');

        createTextButton(this, 0, 0, 280, 60, translate('settings'), () => {
            this.scene.start('SettingsMenu');
        }).setName('settingsButton');

        this.layout();
        this.scale.on('resize', this.layout, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.layout, this);
        });
    }

    private layout(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.background.setPosition(centerX, centerY);
        this.coverImage(this.background);

        const logoScale = Math.min(this.scale.width * 0.42 / this.logo.width, 0.45);
        this.logo
            .setScale(logoScale)
            .setPosition(centerX, centerY - 145);

        this.children.getByName('startButton')?.setPosition(centerX, centerY + 100);
        this.children.getByName('settingsButton')?.setPosition(centerX, centerY + 180);
    }

    private coverImage(image: GameObjects.Image): void {
        const scale = Math.max(
            this.scale.width / image.width,
            this.scale.height / image.height
        );

        image.setScale(scale);
    }
}
