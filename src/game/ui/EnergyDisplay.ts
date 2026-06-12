import { GameObjects, Scene } from 'phaser';
import { EnergyService } from '../services/EnergyService';
import { translate } from '../services/LanguageService';

const barWidth = 360;
const barHeight = 16;
const barBottomOffset = 116;
const fillPadding = 1;

export class EnergyDisplay {
    private container: GameObjects.Container;
    private fill: GameObjects.Rectangle;
    private amountText: GameObjects.Text;

    constructor(private scene: Scene, private energy: EnergyService) {
        const frameWidth = barWidth + 18;
        const frameHeight = barHeight + 14;
        const maxFillWidth = barWidth - fillPadding * 2;

        const shadow = scene.add.rectangle(4, 5, frameWidth, frameHeight, 0x000000, 0.28);
        const frame = scene.add.rectangle(0, 0, frameWidth, frameHeight, 0x6b4428)
            .setStrokeStyle(3, 0x332015);
        const background = scene.add.rectangle(0, 0, barWidth, barHeight + 2, 0x17261d)
            .setStrokeStyle(2, 0xe3a35a);

        this.fill = scene.add.rectangle(
            -maxFillWidth / 2,
            0,
            maxFillWidth,
            barHeight,
            0x4fb95c
        ).setOrigin(0, 0.5);

        const bolt = scene.add.polygon(-barWidth / 2 + 24, 0, [
            -3, -10,
            9, -1,
            3, -1,
            7, 11,
            -9, 1,
            -2, 1
        ], 0xffe36a)
            .setStrokeStyle(2, 0x5a3510);

        const labelText = scene.add.text(-barWidth / 2 + 42, 0, translate('energy'), {
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
            shadow,
            frame,
            background,
            this.fill,
            bolt,
            labelText,
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
        const maxFillWidth = barWidth - fillPadding * 2;

        this.fill.width = Math.max(0, maxFillWidth * energyRate);
        this.fill.setFillStyle(this.getEnergyColor(energyRate));
        this.amountText.setText(`${energyValue}/${this.energy.getMaxEnergy()}`);
    }

    layout(): void {
        this.container.setPosition(
            this.scene.scale.width / 2,
            this.scene.scale.height - barBottomOffset
        );
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.container];
    }

    private getEnergyColor(energyRate: number): number {
        if (energyRate > 0.6) {
            return 0x4fb95c;
        }

        if (energyRate > 0.3) {
            return 0xe0b84c;
        }

        return 0xd65745;
    }
}
