import { GameObjects, Scene } from 'phaser';
import { GameItem } from '../data/ItemData';
import { translate } from '../services/LanguageService';
import { createPixelNineSlice } from './PixelNineSlice';
import { createTextButton } from './TextButton';

type PurchasableItem = Pick<
    GameItem,
    'nameKey' | 'textureKey' | 'textureFrame'
> & {
    buyPrice: number;
};

const rowWidth = 500;
const rowHeight = 34;
const iconX = -215;
const nameX = -190;
const coinX = 105;
const priceX = 119;
const buyButtonX = 190;

const rowTextStyle = {
    fontFamily: 'Verdana, Arial, sans-serif',
    fontSize: 15,
    fontStyle: 'bold',
    color: '#1f140b'
};

export class ShopRow {
    readonly container: GameObjects.Container;

    constructor(
        scene: Scene,
        item: PurchasableItem,
        rowY: number,
        onBuy: () => void
    ) {
        const rowBackground = createPixelNineSlice(scene, 'menuWhite', rowWidth, rowHeight);
        const iconBackground = scene.add.image(iconX, 0, 'shopIconBackground');
        const icon = scene.add.image(
            iconX,
            0,
            item.textureKey,
            item.textureFrame
        ).setDisplaySize(22, 22);
        const name = scene.add.text(nameX, 0, translate(item.nameKey), rowTextStyle)
            .setOrigin(0, 0.5)
            .setResolution(3);
        const coin = scene.add.image(coinX, 0, 'coin');
        const price = scene.add.text(priceX, 0, `${item.buyPrice}`, rowTextStyle)
            .setOrigin(0, 0.5)
            .setResolution(3);
        const buyButton = createTextButton(
            scene,
            buyButtonX,
            0,
            80,
            26,
            translate('buy'),
            onBuy,
            false,
            false
        );

        this.container = scene.add.container(0, rowY, [
            rowBackground,
            iconBackground,
            icon,
            name,
            coin,
            price,
            buyButton
        ]);
    }
}
