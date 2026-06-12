import { GameObjects, Scene } from 'phaser';

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

    private createFrame(): GameObjects.GameObject[] {
        const { width, height } = this.config;
        const titleWidth = Math.min(width - 80, 368);

        const shadow = this.scene.add.rectangle(8, 10, width - 12, height - 12, 0x000000, 0.25);
        const woodFrame = this.scene.add.rectangle(0, 0, width, height, 0x6b4428)
            .setStrokeStyle(4, 0x332015);
        const parchment = this.scene.add.rectangle(0, 18, width - 62, height - 98, 0xffefc5, 0.98)
            .setStrokeStyle(3, 0xd39a3c);
        const topTrim = this.scene.add.rectangle(0, -height / 2 + 58, width - 52, 30, 0x8a5a31)
            .setStrokeStyle(2, 0x4a2e1d);
        const bottomTrim = this.scene.add.rectangle(0, height / 2 - 46, width - 52, 24, 0x8a5a31)
            .setStrokeStyle(2, 0x4a2e1d);
        const titleBoard = this.scene.add.rectangle(0, -height / 2 + 34, titleWidth, 46, 0x5a3822)
            .setStrokeStyle(3, 0xe3a35a);
        const titleHighlight = this.scene.add.rectangle(
            0,
            -height / 2 + 17,
            titleWidth - 24,
            4,
            0xb47a3f,
            0.75
        );
        const shelfLine = this.scene.add.rectangle(0, -height / 2 + 92, width - 100, 3, 0xd49b5c, 0.9);
        const leftPost = this.scene.add.rectangle(-width / 2 + 18, 4, 24, height - 48, 0x7a4a29)
            .setStrokeStyle(2, 0x3d2416);
        const rightPost = this.scene.add.rectangle(width / 2 - 18, 4, 24, height - 48, 0x7a4a29)
            .setStrokeStyle(2, 0x3d2416);

        return [
            shadow,
            woodFrame,
            parchment,
            leftPost,
            rightPost,
            topTrim,
            bottomTrim,
            titleBoard,
            titleHighlight,
            shelfLine
        ];
    }

    private createCloseButton(): GameObjects.Container {
        const x = this.config.width / 2 - 38;
        const y = -this.config.height / 2 + 34;
        const background = this.scene.add.rectangle(x, y, 32, 30, 0x8d3d30)
            .setStrokeStyle(2, 0xffe3a3)
            .setInteractive({ useHandCursor: true });
        const label = this.scene.add.text(x, y - 1, 'X', {
            fontFamily: 'Arial Black',
            fontSize: 17,
            color: '#ffffff',
            stroke: '#1a100b',
            strokeThickness: 2
        }).setOrigin(0.5).setResolution(2);

        background.on('pointerover', () => background.setFillStyle(0xb84d38));
        background.on('pointerout', () => background.setFillStyle(0x8d3d30));
        background.on('pointerdown', () => this.close());

        return this.scene.add.container(0, 0, [background, label]);
    }
}
