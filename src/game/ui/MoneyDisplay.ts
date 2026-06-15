import { GameObjects, Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { createPixelNineSlice } from './PixelNineSlice';

const cardX = 122;
const cardY = 35;
const frameWidth = 214;
const frameHeight = 48;
const iconX = -78;
const textX = -51;

export class MoneyDisplay {
    private container: GameObjects.Container;
    private amountText: GameObjects.Text;

    constructor(scene: Scene, private money: MoneyService) {
        const panel = createPixelNineSlice(scene, 'menuBrownDarker', frameWidth, frameHeight);
        const coin = scene.add.image(iconX, 0, 'coin').setScale(2);

        const labelText = scene.add.text(textX, -10, translate('money'), {
            fontFamily: 'Arial Black',
            fontSize: 11,
            color: '#ffe7a3',
            stroke: '#1a100b',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);

        this.amountText = scene.add.text(textX, 7, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#fff8df',
            stroke: '#1a100b',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);

        this.container = scene.add.container(cardX, cardY, [
            panel,
            coin,
            labelText,
            this.amountText
        ])
            .setScrollFactor(0)
            .setDepth(950);

        this.refresh();
    }

    refresh(): void {
        this.amountText.setText(`${this.money.getBalance()} $`);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.container];
    }
}
