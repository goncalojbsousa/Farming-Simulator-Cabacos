import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { getItemById, getStartingItemIds } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { Hotbar } from '../ui/Hotbar';
import { InventoryPanel } from '../ui/InventoryPanel';
import { InventoryTooltip } from '../ui/InventoryTooltip';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    player: Player;
    inventory: InventoryService;
    hotbar: Hotbar;
    inventoryPanel: InventoryPanel;
    inventoryTooltip: InventoryTooltip;
    draggedSlotIndex: number | null = null;
    draggedItemImage: Phaser.GameObjects.Image;

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;

        // Create tilemap and layers loaded in Preloader
        const map = this.make.tilemap({ key: 'tilemap' });
        const tileset = map.addTilesetImage('tiles1', 'tilesetImage');
        if (tileset) {
            map.createLayer('Tile Layer 1', tileset, 0, 0);
            map.createLayer('Tile Layer 2', tileset, 0, 0);
        }

        this.player = new Player(this, 512, 384);
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

        this.setupInventoryKeys();
        this.setupInventoryMouseControls();
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

            this.draggedSlotIndex = slotIndex;
            this.inventoryTooltip.hide();
            this.draggedItemImage.setTexture(item.textureKey);
            this.draggedItemImage.setPosition(pointer.x, pointer.y);
            this.draggedItemImage.setVisible(true);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.draggedSlotIndex === null) {
                this.updateInventoryTooltipAtPointer(pointer);
                return;
            }

            this.draggedItemImage.setPosition(pointer.x, pointer.y);
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.draggedSlotIndex === null) {
                return;
            }

            const targetSlotIndex = this.getInventorySlotIndexAtPointer(pointer);

            if (targetSlotIndex !== null) {
                this.inventory.moveSlot(this.draggedSlotIndex, targetSlotIndex);
                this.refreshInventoryUi();
            }

            this.draggedSlotIndex = null;
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
        if (this.draggedSlotIndex !== null) {
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
        if (this.draggedSlotIndex !== null) {
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
