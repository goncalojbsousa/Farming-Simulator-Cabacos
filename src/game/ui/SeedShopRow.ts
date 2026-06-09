import { GameObjects, Scene } from 'phaser';
import { SeedItem } from '../data/ItemData';
import { translate } from '../services/LanguageService';

export class SeedShopRow {
    readonly container: GameObjects.Container;

    constructor(
        scene: Scene,
        seed: SeedItem,
        rowY: number,
        onBuy: () => void
    ) {
        const seedIcon = scene.add.image(-240, 0, seed.id).setDisplaySize(24, 24);
        const seedName = scene.add.text(-216, 0, translate(seed.nameKey), {
            fontFamily: 'Arial',
            fontSize: 15,
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        const seedPrice = scene.add.text(120, 0, `${seed.buyPrice}$`, {
            fontFamily: 'Arial Black',
            fontSize: 15,
            color: '#ffe7a3'
        }).setOrigin(1, 0.5);

        this.container = scene.add.container(0, rowY, [
            seedIcon,
            seedName,
            seedPrice,
            this.createBuyButton(scene, onBuy)
        ]);
    }

    private createBuyButton(scene: Scene, onBuy: () => void): GameObjects.Container {
        const buttonBackground = scene.add.rectangle(188, 0, 88, 28, 0x2f5d2c)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });
        const buttonLabel = scene.add.text(188, 0, 'Comprar', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#ffffff'
        }).setOrigin(0.5);

        buttonBackground.on('pointerover', () => buttonBackground.setFillStyle(0x3f7a39));
        buttonBackground.on('pointerout', () => buttonBackground.setFillStyle(0x2f5d2c));
        buttonBackground.on('pointerdown', onBuy);

        return scene.add.container(0, 0, [buttonBackground, buttonLabel]);
    }
}
