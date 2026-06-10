import { GameObjects, Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { TimeService } from '../services/TimeService';

export class TimeDisplay {
    private text: GameObjects.Text;

    constructor(scene: Scene, private time: TimeService) {
        this.text = scene.add.text(28, 62, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(951);

        this.refresh();
    }

    refresh(): void {
        const hour = String(this.time.hour).padStart(2, '0');
        const minute = String(this.time.minute).padStart(2, '0');

        this.text.setText(`${translate('day')} ${this.time.day}  ${hour}:${minute}`);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.text];
    }
}
