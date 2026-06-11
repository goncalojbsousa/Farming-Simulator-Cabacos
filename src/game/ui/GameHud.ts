import { Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { EnergyService } from '../services/EnergyService';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { TimeService } from '../services/TimeService';
import { EnergyDisplay } from './EnergyDisplay';
import { InventoryUi } from './InventoryUi';
import { MoneyDisplay } from './MoneyDisplay';
import { TimeDisplay } from './TimeDisplay';

export class GameHud {
    private inventoryUi: InventoryUi;
    private moneyDisplay: MoneyDisplay;
    private timeDisplay: TimeDisplay;
    private energyDisplay: EnergyDisplay;

    constructor(
        scene: Scene,
        inventory: InventoryService,
        money: MoneyService,
        gameTime: TimeService,
        energy: EnergyService,
        isInteractionBlocked: () => boolean
    ) {
        this.inventoryUi = new InventoryUi(scene, inventory, isInteractionBlocked);
        this.moneyDisplay = new MoneyDisplay(scene, money);
        this.timeDisplay = new TimeDisplay(scene, gameTime);
        this.energyDisplay = new EnergyDisplay(scene, energy);
    }

    update(input: GameInput): void {
        this.inventoryUi.update(input);
        this.timeDisplay.refresh();
    }

    refresh(): void {
        this.inventoryUi.refresh();
        this.moneyDisplay.refresh();
        this.timeDisplay.refresh();
        this.energyDisplay.refresh();
    }

    layout(): void {
        this.inventoryUi.layout();
    }

    containsInteractiveElement(x: number, y: number): boolean {
        return this.inventoryUi.containsInteractiveElement(x, y);
    }

    getUiObjects(): Phaser.GameObjects.GameObject[] {
        return [
            ...this.inventoryUi.getUiObjects(),
            ...this.moneyDisplay.getUiObjects(),
            ...this.timeDisplay.getUiObjects(),
            ...this.energyDisplay.getUiObjects()
        ];
    }
}
