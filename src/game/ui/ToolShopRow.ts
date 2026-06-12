import { GameObjects, Scene } from 'phaser';
import { ToolItem } from '../data/ItemData';
import { translate } from '../services/LanguageService';
import { createTextButton } from './TextButton';

const rowWidth = 500;
const rowHeight = 34;
const iconX = -215;
const nameX = -190;
const priceX = 132;
const buyButtonX = 210;

export class ToolShopRow {
    readonly container: GameObjects.Container;

    constructor(
        scene: Scene,
        tool: ToolItem,
        rowY: number,
        onBuy: () => void
    ) {
        const rowBackground = scene.add.rectangle(0, 0, rowWidth, rowHeight, 0xfff6db, 0.96)
            .setStrokeStyle(2, 0xd39a3c);
        const iconBackground = scene.add.rectangle(iconX, 0, 28, 28, 0xf0bd57, 0.98)
            .setStrokeStyle(2, 0x6b4428);
        const icon = scene.add.image(iconX, 0, tool.id).setDisplaySize(22, 22);
        const name = scene.add.text(nameX, 0, translate(tool.nameKey), {
            fontFamily: 'Verdana, Arial, sans-serif',
            fontSize: 15,
            fontStyle: 'bold',
            color: '#1f140b'
        }).setOrigin(0, 0.5).setResolution(3);
        const price = scene.add.text(priceX, 0, `${tool.buyPrice}$`, {
            fontFamily: 'Verdana, Arial, sans-serif',
            fontSize: 15,
            fontStyle: 'bold',
            color: '#1f140b'
        }).setOrigin(0.5).setResolution(3);

        this.container = scene.add.container(0, rowY, [
            rowBackground,
            iconBackground,
            icon,
            name,
            price,
            this.createBuyButton(scene, onBuy)
        ]);
    }

    private createBuyButton(scene: Scene, onBuy: () => void): GameObjects.Container {
        return createTextButton(
            scene,
            buyButtonX,
            0,
            80,
            26,
            translate('buy'),
            onBuy
        );
    }
}
