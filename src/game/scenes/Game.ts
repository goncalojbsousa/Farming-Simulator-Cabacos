import { Scene } from 'phaser';
import { getStartingItemIds, getStartingSeedItemIds } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { FarmingSystem } from '../systems/FarmingSystem';
import { InventoryUi } from '../ui/InventoryUi';
import { SeedShopPanel } from '../ui/SeedShopPanel';
import { GameWorld } from '../world/GameWorld';

const startingMoney = 100;

export class Game extends Scene {
    private world: GameWorld;
    private inventory: InventoryService;
    private money: MoneyService;
    private inventoryUi: InventoryUi;
    private farming: FarmingSystem;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;

    private shopPanel: SeedShopPanel;
    private shopPrompt: Phaser.GameObjects.Text;
    private shopZones: Phaser.Geom.Rectangle[] = [];
    private moneyBackground: Phaser.GameObjects.Rectangle;
    private moneyText: Phaser.GameObjects.Text;

    constructor() {
        super('Game');
    }

    create(): void {
        this.world = new GameWorld(this);
        this.inventory = new InventoryService(16);
        this.money = new MoneyService(startingMoney);
        this.addStartingItems();

        this.createMoneyDisplay();
        this.createShop();
        this.inventoryUi = new InventoryUi(
            this,
            this.inventory,
            () => this.shopPanel.isOpen()
        );

        this.createUiCamera();
        this.farming = new FarmingSystem({
            scene: this,
            worldCamera: this.world.camera,
            uiCamera: this.uiCamera,
            player: this.world.player,
            inventory: this.inventory,
            farmLayer: this.world.farmLayer,
            worldCameraObjects: this.world.objects,
            isPointerOverUi: (pointer) =>
                this.inventoryUi.containsPoint(pointer.x, pointer.y)
                || this.shopPanel.containsScreenPoint(pointer.x, pointer.y),
            onInventoryChanged: () => this.inventoryUi.refresh()
        });

        this.input.keyboard!.on('keydown-E', () => {
            if (this.isPlayerInShopZone()) {
                this.shopPanel.toggle();
                this.shopPrompt.setVisible(false);
            }
        });

        this.scale.on('resize', this.resize, this);
        this.events.once('shutdown', () => this.scale.off('resize', this.resize, this));
    }

    update(): void {
        this.world.player.update();
        this.farming.update(this.input.activePointer);
        this.inventoryUi.update(this.input.activePointer);
        this.updateShop();
    }

    private createUiCamera(): void {
        const uiObjects = [
            ...this.inventoryUi.getGameObjects(),
            ...this.shopPanel.getGameObjects(),
            this.shopPrompt,
            this.moneyBackground,
            this.moneyText
        ];

        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.ignore(this.world.objects);
        this.world.camera.ignore(uiObjects);
    }

    private addStartingItems(): void {
        for (const itemId of getStartingItemIds()) {
            this.inventory.addItem(itemId, 1);
        }

        for (const itemId of getStartingSeedItemIds()) {
            this.inventory.addItem(itemId, 5);
        }
    }

    private createMoneyDisplay(): void {
        this.moneyBackground = this.add.rectangle(16, 16, 158, 36, 0x1f2d24, 0.85)
            .setOrigin(0)
            .setStrokeStyle(2, 0xe2a36f)
            .setScrollFactor(0)
            .setDepth(950);

        this.moneyText = this.add.text(28, 23, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(951);

        this.refreshMoney();
    }

    private createShop(): void {
        this.shopPanel = new SeedShopPanel({
            scene: this,
            inventory: this.inventory,
            money: this.money,
            onInventoryChanged: () => this.inventoryUi.refresh(),
            onMoneyChanged: () => this.refreshMoney()
        });

        this.shopPrompt = this.add.text(0, 0, 'E - Comprar sementes', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(960).setVisible(false);

        this.loadShopZones();
        this.layoutShopPrompt();
    }

    private loadShopZones(): void {
        const layer = this.world.map.getObjectLayer('Interactions')
            ?? this.world.map.getObjectLayer('interactions');

        for (const object of layer?.objects ?? []) {
            const properties = object.properties as { name?: string; value?: unknown }[] | undefined;
            const isSeedShop = object.type === 'shop'
                && properties?.some((property) =>
                    property.name === 'action' && property.value === 'open_shop'
                )
                && properties.some((property) =>
                    property.name === 'shopType' && property.value === 'seeds'
                );

            if (isSeedShop) {
                this.shopZones.push(new Phaser.Geom.Rectangle(
                    object.x,
                    object.y,
                    object.width ?? 0,
                    object.height ?? 0
                ));
            }
        }
    }

    private updateShop(): void {
        const playerIsNear = this.isPlayerInShopZone();

        this.shopPrompt.setVisible(playerIsNear && !this.shopPanel.isOpen());

        if (!playerIsNear && this.shopPanel.isOpen()) {
            this.shopPanel.close();
        }
    }

    private isPlayerInShopZone(): boolean {
        const body = this.world.player.sprite.body as Phaser.Physics.Arcade.Body;

        return this.shopZones.some((zone) => zone.contains(body.center.x, body.center.y));
    }

    private refreshMoney(): void {
        this.moneyText.setText(`Dinheiro: ${this.money.getBalance()}`);
    }

    private resize(): void {
        this.world.resize();
        this.uiCamera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.inventoryUi.layout();
        this.shopPanel.layout();
        this.layoutShopPrompt();
    }

    private layoutShopPrompt(): void {
        this.shopPrompt.setPosition(this.scale.width / 2, this.scale.height - 104);
    }
}
