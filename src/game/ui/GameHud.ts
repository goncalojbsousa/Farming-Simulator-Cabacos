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
    readonly uiObjects: Phaser.GameObjects.GameObject[];

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

        const stopInventoryRefresh = inventory.onChange(() => this.inventoryUi.refresh());
        const stopMoneyRefresh = money.onChange(() => this.moneyDisplay.refresh());

        scene.events.once('shutdown', () => {
            stopInventoryRefresh();
            stopMoneyRefresh();
        });

        this.uiObjects = [
            ...this.inventoryUi.uiObjects,
            ...this.moneyDisplay.getUiObjects(),
            ...this.timeDisplay.getUiObjects(),
            ...this.energyDisplay.getUiObjects()
        ];
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
        this.energyDisplay.layout();
    }

    isPointerOverInventory(x: number, y: number): boolean {
        return this.inventoryUi.isPointerOverSlot(x, y);
    }
}
