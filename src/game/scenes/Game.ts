import { Scene } from 'phaser';
import { startingSeedIds, startingToolIds } from '../data/ItemData';
import { GameInput } from '../input/GameInput';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { TimeService } from '../services/TimeService';
import { BuildingEntranceSystem } from '../systems/BuildingEntranceSystem';
import { FarmingSystem } from '../systems/FarmingSystem';
import { InventoryUi } from '../ui/InventoryUi';
import { MoneyDisplay } from '../ui/MoneyDisplay';
import { TimeDisplay } from '../ui/TimeDisplay';
import { GameWorld } from '../world/GameWorld';

export class Game extends Scene {
    private gameWorld: GameWorld;
    private gameInput: GameInput;
    private inventory: InventoryService;
    private money: MoneyService;
    private gameTime: TimeService;
    private inventoryUi: InventoryUi;
    private moneyDisplay: MoneyDisplay;
    private timeDisplay: TimeDisplay;
    private farmingSystem: FarmingSystem;
    private buildingEntrances: BuildingEntranceSystem;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;

    constructor() {
        super('Game');
    }

    create(): void {
        this.gameWorld = new GameWorld(this);
        this.gameInput = new GameInput(this);
        this.inventory = new InventoryService(16);
        this.money = new MoneyService(100);
        this.gameTime = new TimeService();
        this.addStartingItems();

        this.inventoryUi = new InventoryUi(this, this.inventory, () => false);
        this.moneyDisplay = new MoneyDisplay(this, this.money);
        this.timeDisplay = new TimeDisplay(this, this.gameTime);
        this.buildingEntrances = new BuildingEntranceSystem(
            this,
            this.gameWorld.map,
            this.gameWorld.player,
            this.inventory,
            this.money
        );

        this.createUiCamera();
        this.farmingSystem = new FarmingSystem({
            scene: this,
            worldCamera: this.gameWorld.camera,
            uiCamera: this.uiCamera,
            player: this.gameWorld.player,
            inventory: this.inventory,
            farmLayer: this.gameWorld.farmLayer,
            worldObjects: this.gameWorld.worldObjects,
            isPointerOverUi: (pointer) =>
                this.inventoryUi.containsInteractiveElement(pointer.x, pointer.y),
            refreshInventory: () => this.inventoryUi.refresh()
        });

        this.scale.on('resize', this.resizeGame, this);
        this.events.on('wake', this.refreshUi, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resizeGame, this);
            this.events.off('wake', this.refreshUi, this);
        });
    }

    update(time: number): void {
        this.gameInput.update();

        if (this.gameInput.nextDayPressed()) {
            this.gameTime.advanceDay();
        }

        this.gameTime.update(time);
        this.timeDisplay.refresh();
        this.gameWorld.player.update(this.gameInput);
        this.farmingSystem.update(this.gameInput, this.gameTime.day);
        this.inventoryUi.update(this.gameInput);
        this.buildingEntrances.update(this.gameInput);
    }

    private createUiCamera(): void {
        const uiObjects = [
            ...this.inventoryUi.getUiObjects(),
            ...this.moneyDisplay.getUiObjects(),
            ...this.timeDisplay.getUiObjects(),
            ...this.buildingEntrances.getUiObjects()
        ];

        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.ignore(this.gameWorld.worldObjects);
        this.gameWorld.camera.ignore(uiObjects);
    }

    private addStartingItems(): void {
        for (const toolId of startingToolIds) {
            this.inventory.addItem(toolId, 1);
        }

        for (const seedId of startingSeedIds) {
            this.inventory.addItem(seedId, 5);
        }
    }

    private resizeGame(): void {
        this.gameWorld.resize();
        this.uiCamera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.inventoryUi.layout();
        this.buildingEntrances.layout();
    }

    private refreshUi(): void {
        this.inventoryUi.refresh();
        this.moneyDisplay.refresh();
    }
}
