import { GameObjects, Scene } from 'phaser';

export class InventoryTooltip {
    private container: GameObjects.Container;
    private background: GameObjects.Rectangle;
    private text: GameObjects.Text;

    constructor(scene: Scene) {
        this.container = scene.add.container(0, 0)
            .setDepth(2100)
            .setScrollFactor(0)
            .setVisible(false);

        this.background = scene.add.rectangle(0, 0, 10, 10, 0x000000, 0.65)
            .setOrigin(0, 0)
            .setStrokeStyle(0, 0x000000, 0);

        this.text = scene.add.text(6, 4, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0);

        this.container.add([this.background, this.text]);
    }

    show(text: string, x: number, y: number): void {
        this.text.setText(text);
        this.background.width = this.text.width + 12;
        this.background.height = this.text.height + 8;
        this.moveTo(x, y);
        this.container.setVisible(true);
    }

    moveTo(x: number, y: number): void {
        const tooltipX = this.clamp(x + 10, 0, 1024 - this.background.width);
        const tooltipY = this.clamp(y - this.background.height - 10, 0, 768 - this.background.height);

        this.container.setPosition(tooltipX, tooltipY);
    }

    hide(): void {
        this.container.setVisible(false);
    }

    private clamp(value: number, minimum: number, maximum: number): number {
        return Math.min(Math.max(value, minimum), maximum);
    }
}
