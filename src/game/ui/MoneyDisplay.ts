import { GameObjects, Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';

const cardX = 122;
const cardY = 35;
const frameWidth = 214;
const frameHeight = 48;
const panelWidth = 198;
const panelHeight = 36;
const iconX = -78;
const textX = -51;

export class MoneyDisplay {
    private container: GameObjects.Container;
    private amountText: GameObjects.Text;

    constructor(scene: Scene, private money: MoneyService) {
        const shadow = scene.add.rectangle(5, 6, frameWidth, frameHeight + 4, 0x000000, 0.28);
        const woodFrame = scene.add.rectangle(0, 0, frameWidth, frameHeight, 0x6b4428)
            .setStrokeStyle(3, 0x332015);
        const panel = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x263f30, 0.98)
            .setStrokeStyle(2, 0xe3a35a);
        const topLight = scene.add.rectangle(0, -17, panelWidth - 12, 3, 0x9b6939, 0.85);
        const bottomAccent = scene.add.rectangle(0, 17, panelWidth - 12, 3, 0x152219, 0.9);

        const iconBack = scene.add.circle(iconX, 0, 15, 0xf5c04a)
            .setStrokeStyle(3, 0x332015);
        const coinBack = scene.add.circle(iconX - 5, 3, 7, 0xc9892f)
            .setStrokeStyle(1, 0xfff2b6);
        const coinFront = scene.add.circle(iconX + 4, 3, 7, 0xf6d164)
            .setStrokeStyle(1, 0xfff2b6);
        const coinSpark = scene.add.circle(iconX + 2, -4, 2, 0xfffbdf);

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
            shadow,
            woodFrame,
            panel,
            topLight,
            bottomAccent,
            iconBack,
            coinBack,
            coinFront,
            coinSpark,
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
