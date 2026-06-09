import { Scene } from 'phaser';
import { startingSeedIds, startingToolIds } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { FarmingSystem } from '../systems/FarmingSystem';
import { SeedShopSystem } from '../systems/SeedShopSystem';
import { InventoryUi } from '../ui/InventoryUi';
import { MoneyDisplay } from '../ui/MoneyDisplay';
import { GameWorld } from '../world/GameWorld';

export class Game extends Scene {
    private gameWorld: GameWorld;
    private inventory: InventoryService;
    private money: MoneyService;
    private inventoryUi: InventoryUi;
    private moneyDisplay: MoneyDisplay;
    private farmingSystem: FarmingSystem;
    private seedShopSystem: SeedShopSystem;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;

    constructor() {
        super('Game');
    }

    create(): void {
        this.gameWorld = new GameWorld(this);
        this.inventory = new InventoryService(16);
        this.money = new MoneyService(100);
        this.addStartingItems();

        this.moneyDisplay = new MoneyDisplay(this, this.money);
        this.seedShopSystem = new SeedShopSystem(
            this,
            this.gameWorld.map,
            this.gameWorld.player,
            this.inventory,
            this.money,
            () => {
                this.inventoryUi.refresh();
                this.moneyDisplay.refresh();
            }
        );
        this.inventoryUi = new InventoryUi(
            this,
            this.inventory,
            () => this.seedShopSystem.isOpen()
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
                this.inventoryUi.containsInteractiveElement(pointer.x, pointer.y)
                || this.seedShopSystem.containsScreenPoint(pointer.x, pointer.y),
            refreshInventory: () => this.inventoryUi.refresh()
        });

        this.scale.on('resize', this.resizeGame, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resizeGame, this);
        });
    }

    update(): void {
        this.gameWorld.player.update();
        this.farmingSystem.update(this.input.activePointer);
        this.inventoryUi.update(this.input.activePointer);
        this.seedShopSystem.update();
    }

    private createUiCamera(): void {
        const uiObjects = [
            ...this.inventoryUi.getUiObjects(),
            ...this.seedShopSystem.getUiObjects(),
            ...this.moneyDisplay.getUiObjects()
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
        this.seedShopSystem.layout();
    }
}
