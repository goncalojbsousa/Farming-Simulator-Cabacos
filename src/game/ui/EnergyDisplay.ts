import { GameObjects, Scene } from 'phaser';
import { EnergyService } from '../services/EnergyService';
import { translate } from '../services/LanguageService';
import { createPixelNineSlice } from './PixelNineSlice';

const barWidth = 360;
const cardX = 204;
const cardY = 35;

export class EnergyDisplay {
    readonly container: GameObjects.Container;
    private bar: GameObjects.NineSlice;
    private labelText: GameObjects.Text;
    private amountText: GameObjects.Text;

    constructor(scene: Scene, private energy: EnergyService) {
        const panel = createPixelNineSlice(scene, 'menuBrownDarker', barWidth + 18, 42);
        this.bar = createPixelNineSlice(scene, 'energyBar', barWidth, 24, 3, 2, 6);
        const light = scene.add.image(-barWidth / 2 + 24, 0, 'light').setScale(2);

        this.labelText = scene.add.text(-barWidth / 2 + 42, 0, translate('energy'), {
            fontFamily: 'Arial Black',
            fontSize: 12,
            color: '#fff8df',
            stroke: '#101f12',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);

        this.amountText = scene.add.text(barWidth / 2 - 12, 0, '', {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#ffffff',
            stroke: '#101f12',
            strokeThickness: 3
        }).setOrigin(1, 0.5).setResolution(2);

        this.container = scene.add.container(0, 0, [
            panel,
            this.bar,
            light,
            this.labelText,
            this.amountText
        ])
            .setScrollFactor(0)
            .setDepth(950);

        this.layout();
        this.refresh();
    }

    refresh(): void {
        const energyValue = this.energy.getEnergy();
        const energyRate = energyValue / this.energy.getMaxEnergy();
        this.bar.setFrame(Math.round(energyRate * 6));
        this.labelText.setText(translate('energy'));
        this.amountText.setText(`${energyValue}/${this.energy.getMaxEnergy()}`);
    }

    layout(): void {
        this.container.setPosition(cardX, cardY);
    }
}
