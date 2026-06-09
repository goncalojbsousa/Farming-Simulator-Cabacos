import { GameObjects, Scene } from 'phaser';

type MenuPanelConfig = {
    width: number;
    height: number;
    title: string;
    depth: number;
};

export class MenuPanel {
    readonly container: GameObjects.Container;

    constructor(
        private scene: Scene,
        private config: MenuPanelConfig
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

    addContent(gameObject: GameObjects.GameObject): void {
        this.container.add(gameObject);
    }

    open(): void {
        this.container.setVisible(true);
    }

    close(): void {
        this.container.setVisible(false);
    }

    toggle(): void {
        this.container.setVisible(!this.container.visible);
    }

    isOpen(): boolean {
        return this.container.visible;
    }

    containsPoint(x: number, y: number): boolean {
        return this.container.visible && this.container.getBounds().contains(x, y);
    }

    center(scaleToFit = false): void {
        const { width, height } = this.scene.scale;
        const scale = scaleToFit
            ? Math.min(1, (width - 24) / this.config.width, (height - 24) / this.config.height)
            : 1;

        this.container.setPosition(width / 2, height / 2).setScale(scale);
    }
}
