import { GameObjects, Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { TimeService } from '../services/TimeService';

const cardX = 122;
const cardY = 89;
const frameWidth = 214;
const frameHeight = 48;
const panelWidth = 198;
const panelHeight = 36;
const iconX = -78;
const textX = -51;

export class TimeDisplay {
    private container: GameObjects.Container;
    private dayText: GameObjects.Text;
    private clockText: GameObjects.Text;

    constructor(scene: Scene, private time: TimeService) {
        const shadow = scene.add.rectangle(5, 6, frameWidth, frameHeight + 4, 0x000000, 0.25);
        const woodFrame = scene.add.rectangle(0, 0, frameWidth, frameHeight, 0x6b4428)
            .setStrokeStyle(3, 0x332015);
        const panel = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x22354d, 0.98)
            .setStrokeStyle(2, 0xe3a35a);
        const topLight = scene.add.rectangle(0, -17, panelWidth - 12, 3, 0x6f91b0, 0.85);
        const bottomAccent = scene.add.rectangle(0, 17, panelWidth - 12, 3, 0x142133, 0.9);
        const iconBack = scene.add.circle(iconX, 0, 15, 0xffd05a)
            .setStrokeStyle(3, 0x332015);
        const sunCore = scene.add.circle(iconX, 0, 7, 0xffed8a)
            .setStrokeStyle(1, 0xd88b2a);
        const sunRayTop = scene.add.rectangle(iconX, -11, 3, 5, 0xffed8a);
        const sunRayBottom = scene.add.rectangle(iconX, 11, 3, 5, 0xffed8a);
        const sunRayLeft = scene.add.rectangle(iconX - 11, 0, 5, 3, 0xffed8a);
        const sunRayRight = scene.add.rectangle(iconX + 11, 0, 5, 3, 0xffed8a);

        this.dayText = scene.add.text(textX, -10, '', {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#fff4d7',
            stroke: '#101824',
            strokeThickness: 4
        }).setOrigin(0, 0.5).setResolution(2);

        this.clockText = scene.add.text(textX, 10, '', {
            fontFamily: 'Arial Black',
            fontSize: 19,
            color: '#ffffff',
            stroke: '#101824',
            strokeThickness: 4
        }).setOrigin(0, 0.5).setResolution(2);

        this.container = scene.add.container(cardX, cardY, [
            shadow,
            woodFrame,
            panel,
            topLight,
            bottomAccent,
            iconBack,
            sunCore,
            sunRayTop,
            sunRayBottom,
            sunRayLeft,
            sunRayRight,
            this.dayText,
            this.clockText
        ])
            .setScrollFactor(0)
            .setDepth(950);

        this.refresh();
    }

    refresh(): void {
        const hour = String(this.time.hour).padStart(2, '0');
        const minute = String(this.time.minute).padStart(2, '0');

        this.dayText.setText(`${translate('day')} ${this.time.day}`);
        this.clockText.setText(`${hour}:${minute}`);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.container];
    }
}
