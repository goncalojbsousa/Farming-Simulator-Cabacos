import { Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { TimeService } from '../services/TimeService';
import { InventoryUi } from './InventoryUi';
import { MoneyDisplay } from './MoneyDisplay';
import { TimeDisplay } from './TimeDisplay';

export class GameHud {
    private inventoryUi: InventoryUi;
    private moneyDisplay: MoneyDisplay;
    private timeDisplay: TimeDisplay;

    constructor(
        scene: Scene,
        inventory: InventoryService,
        money: MoneyService,
        gameTime: TimeService,
        isInteractionBlocked: () => boolean
    ) {
        this.inventoryUi = new InventoryUi(scene, inventory, isInteractionBlocked);
        this.moneyDisplay = new MoneyDisplay(scene, money);
        this.timeDisplay = new TimeDisplay(scene, gameTime);
    }

    update(input: GameInput): void {
        this.inventoryUi.update(input);
        this.timeDisplay.refresh();
    }

    refresh(): void {
        this.inventoryUi.refresh();
        this.moneyDisplay.refresh();
        this.timeDisplay.refresh();
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
            ...this.timeDisplay.getUiObjects()
        ];
    }
}
