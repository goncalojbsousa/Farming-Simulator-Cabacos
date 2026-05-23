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
        this.add.image(512, 384, 'background');

        this.add.text(512, 170, translate('settingsTitle'), {
            fontFamily: 'Arial Black',
            fontSize: 46,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 275, translate('language'), {
            fontFamily: 'Arial',
            fontSize: 30,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        this.createLanguageButtons();

        createTextButton(this, 512, 590, 260, 56, translate('back'), () => {
            this.scene.start('MainMenu');
        });
    }

    private createLanguageButtons(): void {
        const languages = getAvailableLanguages();
        const currentLanguage = getCurrentLanguage();

        languages.forEach((language, index) => {
            const x = 512;
            const y = 355 + index * 75;
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
