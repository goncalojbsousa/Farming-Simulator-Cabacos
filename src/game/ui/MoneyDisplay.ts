import { GameObjects, Scene } from 'phaser';
import { MoneyService } from '../services/MoneyService';

export class MoneyDisplay {
    private background: GameObjects.Rectangle;
    private balanceText: GameObjects.Text;

    constructor(scene: Scene, private money: MoneyService) {
        this.background = scene.add.rectangle(16, 16, 158, 36, 0x1f2d24, 0.85)
            .setOrigin(0)
            .setStrokeStyle(2, 0xe2a36f)
            .setScrollFactor(0)
            .setDepth(950);

        this.balanceText = scene.add.text(28, 23, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(951);

        this.refresh();
    }

    refresh(): void {
        this.balanceText.setText(`Dinheiro: ${this.money.getBalance()}`);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.background, this.balanceText];
    }
}
