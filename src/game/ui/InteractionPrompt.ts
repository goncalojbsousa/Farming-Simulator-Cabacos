import { GameObjects, Scene } from 'phaser';
import { createPixelNineSlice } from './PixelNineSlice';

export class InteractionPrompt {
    readonly container: GameObjects.Container;
    private background: GameObjects.NineSlice;
    private text: GameObjects.Text;

    constructor(scene: Scene, message = '') {
        this.background = createPixelNineSlice(scene, 'menuBrownDarker', 20, 48);

        this.text = scene.add.text(0, 0, message, {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4
        }).setOrigin(0.5).setResolution(2);

        this.container = scene.add.container(0, 0, [
            this.background,
            this.text
        ]).setDepth(1000).setVisible(false);

        this.setText(message);
    }

    setText(message: string): void {
        this.text.setText(message);
        const width = Math.max(260, this.text.width + 44);

        this.background.setSize(width / 3, 16);
    }

    show(message?: string): void {
        if (message) {
            this.setText(message);
        }

        this.container.setVisible(true);
    }

    hide(): void {
        this.container.setVisible(false);
    }
}
