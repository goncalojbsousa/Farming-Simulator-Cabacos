import { Scene } from 'phaser';
import {
    GameLanguage,
    getAvailableLanguages,
    getCurrentLanguage,
    getLanguageLabel,
    setCurrentLanguage,
    translate
} from '../services/LanguageService';
import { createTextButton } from '../ui/TextButton';

export class SettingsMenu extends Scene {
    constructor() {
        super('SettingsMenu');
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.image(centerX, centerY, 'background').setDisplaySize(this.scale.width, this.scale.height);

        this.add.text(centerX, centerY - 215, translate('settingsTitle'), {
            fontFamily: 'Arial Black',
            fontSize: 46,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 110, translate('language'), {
            fontFamily: 'Arial',
            fontSize: 30,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        this.createLanguageButtons();

        createTextButton(this, centerX, centerY + 205, 260, 56, translate('back'), () => {
            this.scene.start('MainMenu');
        });
    }

    private createLanguageButtons(): void {
        const languages = getAvailableLanguages();
        const currentLanguage = getCurrentLanguage();
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        languages.forEach((language, index) => {
            const x = centerX;
            const y = centerY - 30 + index * 75;
            const isSelected = language === currentLanguage;

            createTextButton(
                this,
                x,
                y,
                300,
                56,
                getLanguageLabel(language),
                () => this.changeLanguage(language),
                isSelected
            );
        });
    }

    private changeLanguage(language: GameLanguage): void {
        setCurrentLanguage(language);
        this.scene.restart();
    }
}
