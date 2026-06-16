import { GameObjects, Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { TimeService } from '../services/TimeService';
import { createPixelNineSlice } from './PixelNineSlice';

const cardX = 122;
const cardY = 142;
const frameWidth = 214;
const frameHeight = 48;
const iconX = -78;
const textX = -51;

export class TimeDisplay {
    readonly container: GameObjects.Container;
    private dayText: GameObjects.Text;
    private clockText: GameObjects.Text;

    constructor(scene: Scene, private time: TimeService) {
        const panel = createPixelNineSlice(scene, 'menuBrownDarker', frameWidth, frameHeight);
        const sun = scene.add.image(iconX, 0, 'sun').setScale(2);

        this.dayText = scene.add.text(textX, -10, '', {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#fff4d7',
            stroke: '#101824',
            strokeThickness: 4
        }).setOrigin(0, 0.5).setResolution(2);

        this.clockText = scene.add.text(textX, 7, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#101824',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);

        this.container = scene.add.container(cardX, cardY, [
            panel,
            sun,
            this.dayText,
            this.clockText
        ])
            .setScrollFactor(0)
            .setDepth(950);

        this.layout();
        this.refresh();
    }

    refresh(): void {
        const hour = String(this.time.hour).padStart(2, '0');
        const minute = String(this.time.minute).padStart(2, '0');

        this.dayText.setText(`${translate('day')} ${this.time.day}`);
        this.clockText.setText(`${hour}:${minute}`);
    }

    layout(): void {
        this.container.setPosition(cardX, cardY);
    }
}
