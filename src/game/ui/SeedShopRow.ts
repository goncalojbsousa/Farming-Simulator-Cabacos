import { GameObjects, Scene } from 'phaser';
import { SeedItem } from '../data/ItemData';
import { translate } from '../services/LanguageService';
import { createPixelNineSlice } from './PixelNineSlice';
import { createTextButton } from './TextButton';

const rowWidth = 500;
const rowHeight = 29;
const seedIconX = -215;
const seedNameX = -193;
const coinIconX = 97;
const seedPriceX = 134;
const buyButtonX = 209;

const rowTextStyle = {
    fontFamily: 'Verdana, Arial, sans-serif',
    fontSize: 15,
    fontStyle: 'bold',
    color: '#fff4d7',
    stroke: '#1a100b',
    strokeThickness: 3
};

export class SeedShopRow {
    readonly container: GameObjects.Container;

    constructor(
        scene: Scene,
        seed: SeedItem,
        rowY: number,
        onBuy: () => void
    ) {
        const rowBackground = createPixelNineSlice(scene, 'menuBrownDarker', rowWidth, rowHeight);
        const seedIcon = scene.add.image(
            seedIconX,
            0,
            seed.textureKey,
            seed.textureFrame
        ).setDisplaySize(22, 22);
        const seedName = scene.add.text(seedNameX, 0, translate(seed.nameKey), rowTextStyle)
            .setOrigin(0, 0.5)
            .setResolution(3);

        const coinIcon = this.createCoinIcon(scene, coinIconX, 0);
        const seedPrice = scene.add.text(seedPriceX, 0, `${seed.buyPrice}$`, rowTextStyle)
            .setOrigin(0.5)
            .setResolution(3);

        this.container = scene.add.container(0, rowY, [
            rowBackground,
            seedIcon,
            seedName,
            coinIcon,
            seedPrice,
            this.createBuyButton(scene, onBuy)
        ]);
    }

    private createBuyButton(scene: Scene, onBuy: () => void): GameObjects.Container {
        return createTextButton(
            scene,
            buyButtonX,
            0,
            80,
            25,
            translate('buy'),
            onBuy,
            false,
            false
        );
    }

    private createCoinIcon(scene: Scene, x: number, y: number): GameObjects.Image {
        return scene.add.image(x, y, 'coin');
    }
}
