import { GameObjects, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { translate } from '../services/LanguageService';
import {
    SaveGameData,
    SaveService
} from '../services/SaveService';
import { playSound } from '../services/SoundService';
import { MenuPanel } from '../ui/MenuPanel';
import { LoadGameMenu } from '../ui/LoadGameMenu';
import { createTextButton } from '../ui/TextButton';

type PauseMenuData = {
    pausedSceneKey: string;
};

export function openPauseMenu(scene: Scene): void {
    scene.scene.launch('PauseMenu', {
        pausedSceneKey: scene.scene.key
    });
    scene.scene.bringToTop('PauseMenu');
    scene.scene.pause();
}

export class PauseMenu extends Scene {
    private pausedSceneKey: string;
    private overlay: GameObjects.Rectangle;
    private menu: MenuPanel;
    private loadGameMenu: LoadGameMenu;
    private resumeButton: GameObjects.Container;
    private saveButton: GameObjects.Container;
    private loadButton: GameObjects.Container;
    private mainButtons: GameObjects.Container[] = [];
    private settingsButton: GameObjects.Container;
    private statusText: GameObjects.Text;
    private gameInput: GameInput;

    constructor() {
        super('PauseMenu');
    }

    init(data: PauseMenuData): void {
        this.pausedSceneKey = data.pausedSceneKey;
    }

    create(): void {
        this.scene.bringToTop();

        this.overlay = this.add.rectangle(0, 0, 1, 1, 0x000000, 0.55)
            .setOrigin(0)
            .setInteractive();

        this.menu = new MenuPanel(this, {
            width: 380,
            height: 430,
            title: translate('pauseTitle'),
            depth: 1
        });
        this.loadGameMenu = new LoadGameMenu(this, {
            title: translate('loadGame'),
            slotLabelKey: 'loadGame',
            onSelectSlot: (slotId) => this.loadGame(slotId),
            onBack: () => this.showPauseMenu()
        });
        playSound(this, 'openMenu');

        this.resumeButton = createTextButton(
            this,
            0,
            0,
            280,
            60,
            translate('resume'),
            () => this.resumeGame()
        ).setDepth(2);
        this.saveButton = createTextButton(
            this,
            0,
            0,
            280,
            60,
            translate('saveGame'),
            () => this.saveGame()
        ).setDepth(2);
        this.loadButton = createTextButton(
            this,
            0,
            0,
            280,
            60,
            translate('loadGame'),
            () => this.showLoadMenu()
        ).setDepth(2);
        this.settingsButton = createTextButton(
            this,
            0,
            0,
            280,
            60,
            translate('settings'),
            () => this.openSettings()
        ).setDepth(2);
        this.mainButtons = [
            this.resumeButton,
            this.saveButton,
            this.loadButton,
            this.settingsButton
        ];
        this.statusText = this.add.text(0, 0, '', {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: 300 }
        }).setOrigin(0.5).setResolution(2).setDepth(2);

        this.gameInput = new GameInput(this);

        this.layout();
        this.scale.on('resize', this.layout, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.layout, this);
        });
    }

    update(): void {
        this.gameInput.update();

        if (this.gameInput.escapePressed()) {
            if (this.loadGameMenu.isOpen()) {
                this.showPauseMenu();
                return;
            }

            this.resumeGame();
        }
    }

    private resumeGame(): void {
        this.scene.stop();
        this.scene.resume(this.pausedSceneKey);
    }

    private openSettings(): void {
        this.scene.start('SettingsMenu', {
            returnScene: 'PauseMenu',
            returnData: {
                pausedSceneKey: this.pausedSceneKey
            }
        });
    }

    private saveGame(): void {
        const gameScene = this.scene.get('Game') as {
            createSaveGame?: () => SaveGameData;
        };
        const save = gameScene.createSaveGame?.();

        if (!save) {
            return;
        }

        SaveService.saveCurrentSlot(save);
        this.loadGameMenu.refresh();
        this.statusText.setText(
            `${translate('saveComplete')} (${this.getCurrentSlotLabel()})`
        );
    }

    private loadGame(slotId: string): void {
        const save = SaveService.load(slotId);

        if (!save) {
            this.statusText.setText(translate('noSaves'));
            return;
        }

        if (this.pausedSceneKey !== 'Game') {
            this.scene.stop(this.pausedSceneKey);
        }

        SaveService.setCurrentSlot(slotId);
        this.scene.stop('Game');
        this.scene.start('Game', { save });
    }

    private showLoadMenu(): void {
        this.menu.close();
        this.mainButtons.forEach((button) => button.setVisible(false));
        this.statusText.setVisible(false);
        this.loadGameMenu.open();
    }

    private showPauseMenu(): void {
        this.loadGameMenu.close();
        this.menu.open();
        this.mainButtons.forEach((button) => button.setVisible(true));
        this.statusText.setVisible(true);
    }

    private layout(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.overlay.setSize(this.scale.width, this.scale.height);
        this.menu.center(true);
        this.loadGameMenu.layout();
        this.resumeButton.setPosition(centerX, centerY - 95);
        this.saveButton.setPosition(centerX, centerY - 25);
        this.loadButton.setPosition(centerX, centerY + 45);
        this.settingsButton.setPosition(centerX, centerY + 115);
        this.statusText.setPosition(centerX, centerY + 165);
    }

    private getCurrentSlotLabel(): string {
        return `${translate('slot')} ${SaveService.getCurrentSlot().replace('slot', '')}`;
    }

}
