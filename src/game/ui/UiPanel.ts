import { GameObjects, Scene } from 'phaser';

type UiPanelConfig = {
    width: number;
    height: number;
    title: string;
    depth: number;
};

export class UiPanel {
    readonly container: GameObjects.Container;

    constructor(
        private scene: Scene,
        private config: UiPanelConfig
    ) {
        const background = scene.add.rectangle(
            0,
            0,
            config.width,
            config.height,
            0x1f2d24,
            0.96
        ).setStrokeStyle(4, 0xe2a36f);

        const title = scene.add.text(0, -config.height / 2 + 35, config.title, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.container = scene.add.container(0, 0, [background, title])
            .setScrollFactor(0)
            .setDepth(config.depth);
    }

    add(gameObject: GameObjects.GameObject): void {
        this.container.add(gameObject);
    }

    show(): void {
        this.container.setVisible(true);
    }

    hide(): void {
        this.container.setVisible(false);
    }

    containsPoint(x: number, y: number): boolean {
        return this.container.visible && this.container.getBounds().contains(x, y);
    }

    centerOnScreen(scaleToFit = false): void {
        const { width, height } = this.scene.scale;
        const scale = scaleToFit
            ? Math.min(1, (width - 24) / this.config.width, (height - 24) / this.config.height)
            : 1;

        this.container.setPosition(width / 2, height / 2).setScale(scale);
    }
}
