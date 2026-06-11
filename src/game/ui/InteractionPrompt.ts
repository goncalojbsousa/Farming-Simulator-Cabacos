import { GameObjects, Scene } from 'phaser';

export class InteractionPrompt {
    private container: GameObjects.Container;
    private shadow: GameObjects.Rectangle;
    private woodFrame: GameObjects.Rectangle;
    private background: GameObjects.Rectangle;
    private text: GameObjects.Text;

    constructor(scene: Scene, message = '') {
        this.shadow = scene.add.rectangle(5, 6, 20, 48, 0x000000, 0.28);
        this.woodFrame = scene.add.rectangle(0, 0, 20, 48, 0x6b4428)
            .setStrokeStyle(3, 0x332015);
        this.background = scene.add.rectangle(0, 0, 20, 34, 0x1f3328, 0.95)
            .setStrokeStyle(2, 0xe3a35a);

        this.text = scene.add.text(0, 0, message, {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4
        }).setOrigin(0.5).setResolution(2);

        this.container = scene.add.container(0, 0, [
            this.shadow,
            this.woodFrame,
            this.background,
            this.text
        ]).setDepth(1000).setVisible(false);

        this.setText(message);
    }

    setText(message: string): void {
        this.text.setText(message);
        const width = Math.max(260, this.text.width + 44);

        this.shadow.setSize(width, 48);
        this.woodFrame.setSize(width, 48);
        this.background.setSize(width - 14, 34);
    }

    setPosition(x: number, y: number): void {
        this.container.setPosition(x, y);
    }

    setScrollFactor(value: number): void {
        this.container.setScrollFactor(value);
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

    getGameObject(): GameObjects.GameObject {
        return this.container;
    }
}
