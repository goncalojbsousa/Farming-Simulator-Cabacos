import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { getItemById, getStartingItemIds } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { Hotbar } from '../ui/Hotbar';
import { InventoryPanel } from '../ui/InventoryPanel';
import { InventoryTooltip } from '../ui/InventoryTooltip';

const gameCameraZoom = 2;

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    uiCamera: Phaser.Cameras.Scene2D.Camera;
    player: Player;
    inventory: InventoryService;
    hotbar: Hotbar;
    inventoryPanel: InventoryPanel;
    inventoryTooltip: InventoryTooltip;
    draggedInventorySlotIndex: number | null = null;
    draggedItemImage: Phaser.GameObjects.Image;
    worldCameraObjects: Phaser.GameObjects.GameObject[] = [];

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;

        const map = this.make.tilemap({ key: 'tilemap' });
        const tilesets = map.tilesets
            .map((tileset) => map.addTilesetImage(tileset.name, tileset.name))
            .filter((tileset): tileset is Phaser.Tilemaps.Tileset => tileset !== null);

        for (const layerData of map.layers) {
            const layer = map.createLayer(layerData.name, tilesets, 0, 0);

            if (layer) {
                const depth = Array.isArray((layerData as any).properties)
                    ? (layerData as any).properties.find((property: { name?: string }) => property.name === 'gamemaker_depth')
                    : null;

                if (typeof depth?.value === 'number') {
                    layer.setDepth(-depth.value);
                }

                this.worldCameraObjects.push(layer);
            }
        }

        this.player = new Player(this, 512, 384);
        this.worldCameraObjects.push(this.player.sprite);
        this.setupCamera(map);
        this.inventory = new InventoryService(16);
        this.addStartingItems();
        this.inventoryTooltip = new InventoryTooltip(this);
        this.hotbar = new Hotbar(
            this,
            this.inventory,
            (slotIndex, pointer) => this.showInventoryTooltip(slotIndex, pointer),
            () => this.inventoryTooltip.hide()
        );
        this.inventoryPanel = new InventoryPanel(
            this,
            this.inventory,
            () => this.hotbar.refresh(),
            (slotIndex, pointer) => this.showInventoryTooltip(slotIndex, pointer),
            () => this.inventoryTooltip.hide()
        );
        this.draggedItemImage = this.add.image(0, 0, 'inventorySlot', 0)
            .setScale(3)
            .setAlpha(0.85)
            .setDepth(2000)
            .setScrollFactor(0)
            .setVisible(false);

        this.setupUiCamera();
        this.setupInventoryKeys();
        this.setupInventoryMouseControls();
        this.scale.on('resize', this.handleResize, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });
    }
    update(_time: number, delta: number) {
        this.player.update(delta);
        this.updateInventoryTooltipAtPointer(this.input.activePointer);
    }

    private addStartingItems(): void {
        for (const itemId of getStartingItemIds()) {
            this.inventory.addItem(itemId, 1);
        }
    }

    private setupCamera(map: Phaser.Tilemaps.Tilemap): void {
        this.camera.setZoom(gameCameraZoom);
        this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    }

    private setupUiCamera(): void {
        const uiObjects = [
            ...this.hotbar.getGameObjects(),
            ...this.inventoryPanel.getGameObjects(),
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
        this.inventoryTooltip.hide();
    }

    private setupInventoryKeys(): void {
        this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
            const slotNumber = Number(event.key);

            if (slotNumber >= 1 && slotNumber <= 8) {
                this.hotbar.selectSlot(slotNumber - 1);
                this.inventoryPanel.refresh();
                return;
            }

            if (event.key.toLowerCase() === 'i') {
                this.inventoryPanel.toggle();
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
            this.draggedItemImage.setTexture(item.textureKey);
            this.draggedItemImage.setPosition(pointer.x, pointer.y);
            this.draggedItemImage.setVisible(true);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.draggedInventorySlotIndex === null) {
                this.updateInventoryTooltipAtPointer(pointer);
                return;
            }

            this.draggedItemImage.setPosition(pointer.x, pointer.y);
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
        const panelSlotIndex = this.inventoryPanel.getSlotIndexAtPosition(pointer.x, pointer.y);

        if (panelSlotIndex !== null) {
            return panelSlotIndex;
        }

        return this.hotbar.getSlotIndexAtPosition(pointer.x, pointer.y);
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
