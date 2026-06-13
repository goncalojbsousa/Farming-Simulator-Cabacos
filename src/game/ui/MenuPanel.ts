import { GameObjects, Scene } from 'phaser';
import { playSound } from '../services/SoundService';
import { createPixelNineSlice } from './PixelNineSlice';

type MenuPanelConfig = {
    width: number;
    height: number;
    title?: string;
    depth: number;
    closeButton?: boolean;
};

export class MenuPanel {
    readonly container: GameObjects.Container;

    constructor(
        private scene: Scene,
        private config: MenuPanelConfig
    ) {
        const menuObjects: GameObjects.GameObject[] = this.createFrame();

        if (config.title) {
            const title = scene.add.text(0, -config.height / 2 + 34, config.title, {
                fontFamily: 'Arial Black',
                fontSize: 26,
                color: '#fff4d7',
                stroke: '#1a100b',
                strokeThickness: 5
            }).setOrigin(0.5).setResolution(2);

            menuObjects.push(title);
        }

        if (config.closeButton) {
            menuObjects.push(this.createCloseButton());
        }

        this.container = scene.add.container(0, 0, menuObjects)
            .setScrollFactor(0)
            .setDepth(config.depth);
    }

    addContent(gameObject: GameObjects.GameObject): void {
        this.container.add(gameObject);
    }

    open(): void {
        if (!this.container.visible) {
            playSound(this.scene, 'openMenu');
        }

        this.container.setVisible(true);
    }

    close(): void {
        this.container.setVisible(false);
    }

    toggle(): void {
        if (!this.container.visible) {
            playSound(this.scene, 'openMenu');
        }

        this.container.setVisible(!this.container.visible);
    }

    isOpen(): boolean {
        return this.container.visible;
    }

    containsPoint(x: number, y: number): boolean {
        return this.container.visible && this.container.getBounds().contains(x, y);
    }

    center(scaleToFit = false, offsetY = 0): void {
        const { width, height } = this.scene.scale;
        const scale = scaleToFit
            ? Math.min(1, (width - 24) / this.config.width, (height - 24) / this.config.height)
            : 1;

        this.container.setPosition(width / 2, height / 2 + offsetY).setScale(scale);
    }

    private createFrame(): GameObjects.GameObject[] {
        const { width, height } = this.config;
        const titleWidth = Math.min(width - 80, 368);

        const content = createPixelNineSlice(
            this.scene,
            'menuBrownDarker',
            width,
            height - 70
        ).setY(18);
        const titleBoard = createPixelNineSlice(
            this.scene,
            'menuBrownDarker',
            titleWidth,
            46
        ).setY(-height / 2 + 34);

        return [
            content,
            titleBoard
        ];
    }

    private createCloseButton(): GameObjects.Container {
        const x = this.config.width / 2 - 38;
        const y = -this.config.height / 2 + 34;
        const background = createPixelNineSlice(
            this.scene,
            'button',
            32,
            30,
            3,
            2,
            'trimmed'
        )
            .setPosition(x, y)
            .setInteractive({ useHandCursor: true });
        const label = this.scene.add.text(x, y - 1, 'X', {
            fontFamily: 'Arial Black',
            fontSize: 17,
            color: '#ffffff',
            stroke: '#1a100b',
            strokeThickness: 2
        }).setOrigin(0.5).setResolution(2);

        background.on('pointerover', () => background.setTint(0xffd09a));
        background.on('pointerout', () => background.clearTint());
        background.on('pointerdown', () => {
            playSound(this.scene, 'select');
            this.close();
        });

        return this.scene.add.container(0, 0, [background, label]);
    }
}
