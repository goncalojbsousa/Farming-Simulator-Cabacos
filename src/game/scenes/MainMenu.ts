import { GameObjects, Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { SaveService } from '../services/SaveService';
import { LoadGameMenu } from '../ui/LoadGameMenu';
import { createTextButton } from '../ui/TextButton';

export class MainMenu extends Scene {
    private background: GameObjects.Image;
    private logo: GameObjects.Image;
    private startButton: GameObjects.Container;
    private slotOverlay: GameObjects.Rectangle;
    private loadGameMenu: LoadGameMenu;
    private settingsButton: GameObjects.Container;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(0, 0, 'mainMenuBackground').setOrigin(0.5);
        this.logo = this.add.image(0, 0, 'mainMenuLogo').setOrigin(0.5);

        this.startButton = createTextButton(this, 0, 0, 280, 60, translate('startGame'), () => {
            this.showSlots();
        }).setName('startButton');

        // transparent black bg
        this.slotOverlay = this.add.rectangle(0, 0, 1, 1, 0x000000, 0.55)
            .setOrigin(0)
            .setInteractive()
            .setDepth(10)
            .setVisible(false);

        this.loadGameMenu = new LoadGameMenu(this, {
            title: translate('selectSlot'),
            slotLabelKey: 'slot',
            onSelectSlot: (slotId) => this.openSlot(slotId),
            onBack: () => this.hideSlots(),
            depth: 20
        });

        this.settingsButton = createTextButton(this, 0, 0, 280, 60, translate('settings'), () => {
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

        this.startButton.setPosition(centerX, centerY + 80);
        this.settingsButton.setPosition(centerX, centerY + 160);

        this.slotOverlay.setSize(this.scale.width, this.scale.height);
        this.loadGameMenu.layout();
    }

    private showSlots(): void {
        this.slotOverlay.setVisible(true);
        this.loadGameMenu.open();
    }

    private hideSlots(): void {
        this.slotOverlay.setVisible(false);
        this.loadGameMenu.close();
    }

    private openSlot(slotId: string): void {
        const save = SaveService.load(slotId);

        SaveService.setCurrentSlot(slotId);
        this.scene.start('Game', save ? { save } : undefined);
    }

    private coverImage(image: GameObjects.Image): void {
        const scale = Math.max(
            this.scale.width / image.width,
            this.scale.height / image.height
        );

        image.setScale(scale);
    }
}
