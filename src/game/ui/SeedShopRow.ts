import { GameObjects, Scene } from 'phaser';
import { SeedItem } from '../data/ItemData';
import { translate } from '../services/LanguageService';
import { createTextButton } from './TextButton';

const rowWidth = 500;
const rowHeight = 29;
const rowHighlightWidth = 488;
const seedStripeX = -238;
const seedIconX = -215;
const seedNameX = -193;
const priceBackgroundX = 124;
const coinIconX = 97;
const seedPriceX = 134;
const buyButtonX = 209;

const readableDarkTextStyle = {
    fontFamily: 'Verdana, Arial, sans-serif',
    fontSize: 15,
    fontStyle: 'bold',
    color: '#1f140b'
};

export class SeedShopRow {
    readonly container: GameObjects.Container;

    constructor(
        scene: Scene,
        seed: SeedItem,
        rowY: number,
        onBuy: () => void
    ) {
        const rowShadow = scene.add.rectangle(3, 3, rowWidth, rowHeight, 0x000000, 0.14);
        const rowBackground = scene.add.rectangle(0, 0, rowWidth, rowHeight, 0xfff6db, 0.94)
            .setStrokeStyle(2, 0xd39a3c, 0.75);
        const rowHighlight = scene.add.rectangle(0, -11, rowHighlightWidth, 2, 0xffffff, 0.55);
        const seedStripe = scene.add.rectangle(seedStripeX, 0, 7, 25, 0x5f8e3e, 0.95);

        const iconBackground = scene.add.rectangle(seedIconX, 0, 27, 27, 0xf0bd57, 0.98)
            .setStrokeStyle(2, 0x6b4428);
        const seedIcon = scene.add.image(seedIconX, 0, seed.id).setDisplaySize(22, 22);
        const seedName = scene.add.text(seedNameX, 0, translate(seed.nameKey), readableDarkTextStyle)
            .setOrigin(0, 0.5)
            .setResolution(3);

        const priceBackground = scene.add.rectangle(priceBackgroundX, 0, 72, 23, 0xffdf8a, 0.98)
            .setStrokeStyle(2, 0xb9792f);
        const coinIcon = this.createCoinIcon(scene, coinIconX, 0);
        const seedPrice = scene.add.text(seedPriceX, 0, `${seed.buyPrice}$`, readableDarkTextStyle)
            .setOrigin(0.5)
            .setResolution(3);

        this.container = scene.add.container(0, rowY, [
            rowShadow,
            rowBackground,
            rowHighlight,
            seedStripe,
            iconBackground,
            seedIcon,
            seedName,
            priceBackground,
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

    private createCoinIcon(scene: Scene, x: number, y: number): GameObjects.Container {
        const coin = scene.add.circle(x, y, 8, 0xd6a84f)
            .setStrokeStyle(2, 0x8a5a31);
        const coinInner = scene.add.circle(x, y, 5, 0xffdf8a)
            .setStrokeStyle(1, 0xfff1c9);
        const shine = scene.add.circle(x - 2, y - 3, 1.5, 0xfffbdf);

        return scene.add.container(0, 0, [coin, coinInner, shine]);
    }
}
