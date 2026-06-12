import { GameObjects, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { translate } from '../services/LanguageService';
import { MenuPanel } from '../ui/MenuPanel';
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
    private resumeButton: GameObjects.Container;
    private settingsButton: GameObjects.Container;
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
            height: 320,
            title: translate('pauseTitle'),
            depth: 1
        });

        this.resumeButton = createTextButton(
            this,
            0,
            0,
            280,
            60,
            translate('resume'),
            () => this.resumeGame()
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

    private layout(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.overlay.setSize(this.scale.width, this.scale.height);
        this.menu.center(true);
        this.resumeButton.setPosition(centerX, centerY + 20);
        this.settingsButton.setPosition(centerX, centerY + 100);
    }

}
