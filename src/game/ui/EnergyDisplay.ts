import { GameObjects, Scene } from 'phaser';
import { EnergyService } from '../services/EnergyService';
import { translate } from '../services/LanguageService';

export class EnergyDisplay {
    private text: GameObjects.Text;

    constructor(scene: Scene, private energy: EnergyService) {
        this.text = scene.add.text(28, 86, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(951);

        this.refresh();
    }

    refresh(): void {
        this.text.setText(`${translate('energy')}: ${this.energy.getEnergy()}`);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.text];
    }
}
