import { GameObjects, Scene } from 'phaser';
import {
    GameLanguage,
    getAvailableLanguages,
    getCurrentLanguage,
    getLanguageLabel,
    setCurrentLanguage,
    translate
} from '../services/LanguageService';
import { MenuPanel } from '../ui/MenuPanel';
import { createTextButton } from '../ui/TextButton';

type SettingsMenuData = {
    returnScene?: string;
    returnData?: object;
};

export class SettingsMenu extends Scene {
    private returnScene = 'MainMenu';
    private returnData?: object;
    private background?: GameObjects.Image;
    private overlay: GameObjects.Rectangle;
    private menu: MenuPanel;
    private languageLabel: GameObjects.Text;
    private languageButtons: GameObjects.Container[] = [];
    private backButton: GameObjects.Container;

    constructor() {
        super('SettingsMenu');
    }

    init(data: SettingsMenuData): void {
        this.returnScene = data.returnScene ?? 'MainMenu';
        this.returnData = data.returnData;
    }

    create() {
        this.scene.bringToTop();
        this.background = undefined;
        this.languageButtons = [];

        if (this.returnScene === 'MainMenu') {
            this.background = this.add.image(0, 0, 'mainMenuBackground');
        }

        this.overlay = this.add.rectangle(0, 0, 1, 1, 0x000000, 0.55)
            .setOrigin(0)
            .setInteractive();

        this.menu = new MenuPanel(this, {
            width: 420,
            height: 450,
            title: translate('settingsTitle'),
            depth: 1
        });

        this.languageLabel = this.add.text(0, 0, translate('language'), {
            fontFamily: 'Arial Black',
            fontSize: 22,
            color: '#5a3822',
            align: 'center'
        }).setOrigin(0.5).setResolution(2).setDepth(2);

        this.createLanguageButtons();

        this.backButton = createTextButton(this, 0, 0, 280, 56, translate('back'), () => {
            this.scene.start(this.returnScene, this.returnData);
        }).setDepth(2);

        this.layout();
        this.scale.on('resize', this.layout, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.layout, this);
        });
    }

    private createLanguageButtons(): void {
        const languages = getAvailableLanguages();
        const currentLanguage = getCurrentLanguage();

        languages.forEach((language) => {
            const isSelected = language === currentLanguage;

            const button = createTextButton(
                this,
                0,
                0,
                300,
                56,
                getLanguageLabel(language),
                () => this.changeLanguage(language),
                isSelected
            ).setDepth(2);

            this.languageButtons.push(button);
        });
    }

    private layout(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        if (this.background) {
            const scale = Math.max(
                this.scale.width / this.background.width,
                this.scale.height / this.background.height
            );

            this.background.setPosition(centerX, centerY).setScale(scale);
        }

        this.overlay.setSize(this.scale.width, this.scale.height);
        this.menu.center(true);
        this.languageLabel.setPosition(centerX, centerY - 100);
        this.languageButtons.forEach((button, index) => {
            button.setPosition(centerX, centerY - 35 + index * 72);
        });
        this.backButton.setPosition(centerX, centerY + 115);
    }

    private changeLanguage(language: GameLanguage): void {
        setCurrentLanguage(language);
        this.scene.restart({
            returnScene: this.returnScene,
            returnData: this.returnData
        });
    }
}
