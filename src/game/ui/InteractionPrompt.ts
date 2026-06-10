import { GameObjects, Scene } from 'phaser';

export class InteractionPrompt {
    private container: GameObjects.Container;
    private background: GameObjects.Rectangle;
    private text: GameObjects.Text;

    constructor(scene: Scene, message = '') {
        this.background = scene.add.rectangle(0, 0, 20, 40, 0x1f2d24, 0.9)
            .setStrokeStyle(2, 0xe2a36f);

        this.text = scene.add.text(0, 0, message, {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff'
        }).setOrigin(0.5);

        this.container = scene.add.container(0, 0, [
            this.background,
            this.text
        ]).setDepth(1000).setVisible(false);

        this.setText(message);
    }

    setText(message: string): void {
        this.text.setText(message);
        this.background.setSize(this.text.width + 32, 40);
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
