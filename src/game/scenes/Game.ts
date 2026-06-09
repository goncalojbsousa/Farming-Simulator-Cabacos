import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { getItemById, getStartingItemIds, getStartingSeedItemIds } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { translate } from '../services/LanguageService';
import { Hotbar } from '../ui/Hotbar';
import { InventoryPanel } from '../ui/InventoryPanel';
import { InventoryTooltip } from '../ui/InventoryTooltip';
import { SeedShopPanel } from '../ui/SeedShopPanel';
import { FarmingSystem } from '../systems/FarmingSystem';

const gameCameraZoom = 2;
const playerDepth = 10;
const startingMoney = 100;

export class Game extends Scene {
    // World
    camera: Phaser.Cameras.Scene2D.Camera;
    player: Player;
    farmLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    farmingSystem: FarmingSystem;
    worldCameraObjects: Phaser.GameObjects.GameObject[] = [];

    // Game data
    inventory: InventoryService;
    money: MoneyService;

    // UI
    uiCamera: Phaser.Cameras.Scene2D.Camera;
    hotbar: Hotbar;
    inventoryPanel: InventoryPanel;
    inventoryTooltip: InventoryTooltip;
    moneyBackground: Phaser.GameObjects.Rectangle;
    moneyText: Phaser.GameObjects.Text;

    // Seed shop
    seedShopPanel: SeedShopPanel;
    seedShopPromptText: Phaser.GameObjects.Text;
    seedShopInteractionZones: Phaser.Geom.Rectangle[] = [];

    // Inventory dragging
    draggedInventorySlotIndex: number | null = null;
    draggedItemImage: Phaser.GameObjects.Image;

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;

        // Create the map and its layers.
        const map = this.make.tilemap({ key: 'tilemap' });
        const tilesets = map.tilesets
            .map((tileset) => map.addTilesetImage(tileset.name, tileset.name))
            .filter((tileset): tileset is Phaser.Tilemaps.Tileset => tileset !== null);

        for (const layerData of map.layers) {
            if (layerData.name === 'Collision') continue;

            const layer = map.createLayer(layerData.name, tilesets, 0, 0);

            if (layer) {
                if (layerData.name === 'farm') {
                    this.farmLayer = layer;
                }
                // This property from Tiled defines the visual order of the layers.
                const depthProperty = Array.isArray((layerData as any).properties)
                    ? (layerData as any).properties.find((property: { name?: string }) => property.name === 'gamemaker_depth')
                    : null;

                if (typeof depthProperty?.value === 'number') {
                    layer.setDepth(-depthProperty.value);
                }

                this.worldCameraObjects.push(layer);
            }
        }

        // Create collisions and the player.
        const collisionLayer = map.createLayer('Collision', tilesets, 0, 0);
        if (collisionLayer) {
            collisionLayer.setCollisionByExclusion([-1]);
            collisionLayer.setAlpha(0);
            this.worldCameraObjects.push(collisionLayer);
        }

        this.player = new Player(this, 672, 496);
        this.player.sprite.setDepth(playerDepth);
        this.worldCameraObjects.push(this.player.sprite);

        if (collisionLayer) {
            this.physics.add.collider(this.player.sprite, collisionLayer);
        }

        this.setupCamera(map);

        // Create game data and UI.
        this.inventory = new InventoryService(16);
        this.money = new MoneyService(startingMoney);
        this.createMoneyUi();
        this.loadSeedShopInteractionZones(map);
        this.addStartingItems();
        this.inventoryTooltip = new InventoryTooltip(this);
        this.hotbar = new Hotbar(this, this.inventory);
        this.inventoryPanel = new InventoryPanel(
            this,
            this.inventory,
            () => this.hotbar.refresh()
        );
        this.seedShopPanel = new SeedShopPanel({
            scene: this,
            inventory: this.inventory,
            money: this.money,
            onInventoryChanged: () => this.refreshInventoryUi(),
            onMoneyChanged: () => this.refreshMoneyUi()
        });
        this.seedShopPromptText = this.add.text(0, 0, 'E - Comprar sementes', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(960).setVisible(false);
        this.layoutSeedShopPrompt();
        this.draggedItemImage = this.add.image(0, 0, 'inventorySlot', 0)
            .setScale(3)
            .setAlpha(0.85)
            .setDepth(2000)
            .setScrollFactor(0)
            .setVisible(false);

        // Keep the UI fixed while the world camera follows the player.
        this.setupUiCamera();

        // Create gameplay systems and controls.
        this.farmingSystem = new FarmingSystem({
            scene: this,
            worldCamera: this.camera,
            uiCamera: this.uiCamera,
            player: this.player,
            inventory: this.inventory,
            farmLayer: this.farmLayer,
            worldCameraObjects: this.worldCameraObjects,
            isPointerOverUi: (pointer) => this.isPointerOverUi(pointer),
            onInventoryChanged: () => this.refreshInventoryUi()
        });
        this.setupInventoryKeys();
        this.setupInventoryMouseControls();
        this.scale.on('resize', this.handleResize, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });
    }

    update(_time: number, delta: number) {
        this.player.update(delta);
        this.farmingSystem.update(this.input.activePointer);
        this.updateSeedShopPrompt();
        this.updateInventoryTooltipAtPointer(this.input.activePointer);
    }

    // World and cameras

    private setupCamera(map: Phaser.Tilemaps.Tilemap): void {
        this.camera.setZoom(gameCameraZoom);
        this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    }

    // UI

    private setupUiCamera(): void {
        const uiObjects = [
            ...this.hotbar.getGameObjects(),
            ...this.inventoryPanel.getGameObjects(),
            this.moneyBackground,
            this.moneyText,
            ...this.seedShopPanel.getGameObjects(),
            this.seedShopPromptText,
            this.inventoryTooltip.getGameObject(),
            this.draggedItemImage
        ];

        // The world camera can zoom and follow the player without scaling the UI.
        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.ignore(this.worldCameraObjects);
        this.camera.ignore(uiObjects);
    }

    private handleResize(): void {
        this.camera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.hotbar.layout();
        this.inventoryPanel.layout();
        this.seedShopPanel.layout();
        this.layoutSeedShopPrompt();
        this.inventoryTooltip.hide();
    }

    private createMoneyUi(): void {
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

        this.refreshMoneyUi();
    }

    refreshMoneyUi(): void {
        this.moneyText.setText(`Dinheiro: ${this.money.getBalance()}`);
    }

    // Seed shop

    private loadSeedShopInteractionZones(map: Phaser.Tilemaps.Tilemap): void {
        const interactionLayer = map.getObjectLayer('Interactions') ?? map.getObjectLayer('interactions');

        for (const tiledObject of interactionLayer?.objects ?? []) {
            if (
                tiledObject.type !== 'shop'
                || !this.hasTiledProperty(tiledObject, 'action', 'open_shop')
            ) {
                continue;
            }

            if (!this.hasTiledProperty(tiledObject, 'shopType', 'seeds')) {
                continue;
            }

            this.seedShopInteractionZones.push(new Phaser.Geom.Rectangle(
                tiledObject.x,
                tiledObject.y,
                tiledObject.width ?? 0,
                tiledObject.height ?? 0
            ));
        }
    }

    private updateSeedShopPrompt(): void {
        const isInSeedShopZone = this.isPlayerInSeedShopZone();

        this.seedShopPromptText.setVisible(
            isInSeedShopZone && !this.seedShopPanel.isOpen()
        );

        if (!isInSeedShopZone && this.seedShopPanel.isOpen()) {
            this.seedShopPanel.close();
        }
    }

    private layoutSeedShopPrompt(): void {
        this.seedShopPromptText.setPosition(this.scale.width / 2, this.scale.height - 104);
    }

    private isPlayerInSeedShopZone(): boolean {
        const playerBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;

        // The Tiled rectangle is exact, the full sprite bounds would make the interaction area too large.
        return this.seedShopInteractionZones.some((zone) =>
            zone.contains(playerBody.center.x, playerBody.center.y)
        );
    }

    // Checks whether a Tiled object has a property with the expected name and value.
    private hasTiledProperty(
        tiledObject: Phaser.Types.Tilemaps.TiledObject,
        propertyName: string,
        expectedValue: string
    ): boolean {
        return tiledObject.properties?.some(
            (property: { name?: string; value?: unknown }) =>
                property.name === propertyName && property.value === expectedValue
        ) ?? false;
    }

    // Inventory

    private addStartingItems(): void {
        for (const itemId of getStartingItemIds()) {
            this.inventory.addItem(itemId, 1);
        }

        for (const seedItemId of getStartingSeedItemIds()) {
            this.inventory.addItem(seedItemId, 5);
        }
    }

    private setupInventoryKeys(): void {
        this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
            const slotNumber = Number(event.key);
            const pressedKey = event.key.toLowerCase();

            if (slotNumber >= 1 && slotNumber <= 8) {
                this.hotbar.selectSlot(slotNumber - 1);
                this.inventoryPanel.refresh();
                return;
            }

            if (pressedKey === 'i') {
                this.inventoryPanel.toggle();
                this.inventoryTooltip.hide();
                return;
            }

            if (pressedKey === 'e' && this.isPlayerInSeedShopZone()) {
                this.seedShopPanel.toggle();
                this.inventoryTooltip.hide();
            }
        });
    }

    private setupInventoryMouseControls(): void {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const slotIndex = this.getInventorySlotIndexAtPointer(pointer);

            if (slotIndex === null) {
                return;
            }

            const slot = this.inventory.getSlot(slotIndex);

            if (slot === null || slot.itemId === null) {
                return;
            }

            const item = getItemById(slot.itemId);

            this.draggedInventorySlotIndex = slotIndex;
            this.inventoryTooltip.hide();
            this.draggedItemImage.setTexture(item.id);
            this.draggedItemImage.setPosition(pointer.x, pointer.y);
            this.draggedItemImage.setVisible(true);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.draggedInventorySlotIndex !== null) {
                this.draggedItemImage.setPosition(pointer.x, pointer.y);
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.draggedInventorySlotIndex === null) {
                return;
            }

            const targetSlotIndex = this.getInventorySlotIndexAtPointer(pointer);

            if (targetSlotIndex !== null) {
                this.inventory.moveSlot(this.draggedInventorySlotIndex, targetSlotIndex);
                this.refreshInventoryUi();
            }

            this.draggedInventorySlotIndex = null;
            this.draggedItemImage.setVisible(false);
        });
    }

    private getInventorySlotIndexAtPointer(pointer: Phaser.Input.Pointer): number | null {
        if (this.seedShopPanel.isOpen()) {
            return null;
        }

        const panelSlotIndex = this.inventoryPanel.getSlotIndexAtPosition(pointer.x, pointer.y);

        return panelSlotIndex ?? this.hotbar.getSlotIndexAtPosition(pointer.x, pointer.y);
    }

    private isPointerOverUi(pointer: Phaser.Input.Pointer): boolean {
        return this.getInventorySlotIndexAtPointer(pointer) !== null
            || this.seedShopPanel.containsScreenPoint(pointer.x, pointer.y);
    }

    private refreshInventoryUi(): void {
        this.hotbar.refresh();
        this.inventoryPanel.refresh();
    }

    private updateInventoryTooltipAtPointer(pointer: Phaser.Input.Pointer): void {
        if (this.draggedInventorySlotIndex !== null) {
            return;
        }

        const slotIndex = this.getInventorySlotIndexAtPointer(pointer);

        if (slotIndex === null) {
            this.inventoryTooltip.hide();
            return;
        }

        this.showInventoryTooltip(slotIndex, pointer);
    }

    private showInventoryTooltip(slotIndex: number, pointer: Phaser.Input.Pointer): void {
        if (this.draggedInventorySlotIndex !== null) {
            return;
        }

        const slot = this.inventory.getSlot(slotIndex);

        if (slot === null || slot.itemId === null) {
            this.inventoryTooltip.hide();
            return;
        }

        const item = getItemById(slot.itemId);

        this.inventoryTooltip.show(translate(item.nameKey), pointer.x, pointer.y);
    }
}
