import { GameObjects, Scene } from 'phaser';

type MenuPanelConfig = {
    width: number;
    height: number;
    title?: string;
    depth: number;
    backgroundColor?: number;
    backgroundAlpha?: number;
    borderColor?: number;
    borderWidth?: number;
    titleColor?: string;
    titleStrokeColor?: string;
    titleStrokeThickness?: number;
    titleFontSize?: number;
};

export class MenuPanel {
    readonly container: GameObjects.Container;

    constructor(
        private scene: Scene,
        private config: MenuPanelConfig
    ) {
        const backgroundColor = config.backgroundColor ?? 0x1f2d24;
        const backgroundAlpha = config.backgroundAlpha ?? 0.96;
        const borderColor = config.borderColor ?? 0xe2a36f;
        const borderWidth = config.borderWidth ?? 4;

        const background = scene.add.rectangle(
            0,
            0,
            config.width,
            config.height,
            backgroundColor,
            backgroundAlpha
        ).setStrokeStyle(borderWidth, borderColor);

        const menuObjects: GameObjects.GameObject[] = [background];

        if (config.title) {
            const title = scene.add.text(0, -config.height / 2 + 35, config.title, {
                fontFamily: 'Arial Black',
                fontSize: config.titleFontSize ?? 24,
                color: config.titleColor ?? '#ffffff',
                stroke: config.titleStrokeColor ?? '#000000',
                strokeThickness: config.titleStrokeThickness ?? 4
            }).setOrigin(0.5).setResolution(2);

            menuObjects.push(title);
        }

        this.container = scene.add.container(0, 0, menuObjects)
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

    center(scaleToFit = false, offsetY = 0): void {
        const { width, height } = this.scene.scale;
        const scale = scaleToFit
            ? Math.min(1, (width - 24) / this.config.width, (height - 24) / this.config.height)
            : 1;

        this.container.setPosition(width / 2, height / 2 + offsetY).setScale(scale);
    }
}
