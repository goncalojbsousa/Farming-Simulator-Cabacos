import { Scene } from 'phaser';
import { getItemById } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { Hotbar } from './Hotbar';
import { InventoryPanel } from './InventoryPanel';
import { InventoryTooltip } from './InventoryTooltip';

export class InventoryUi {
    private hotbar: Hotbar;
    private inventoryPanel: InventoryPanel;
    private itemTooltip: InventoryTooltip;
    private draggedSlotIndex: number | null = null;
    private draggedItemImage: Phaser.GameObjects.Image;

    constructor(
        private scene: Scene,
        private inventory: InventoryService,
        private isInteractionBlocked: () => boolean
    ) {
        this.itemTooltip = new InventoryTooltip(scene);
        this.hotbar = new Hotbar(scene, inventory);
        this.inventoryPanel = new InventoryPanel(
            inventory,
            scene,
            () => this.hotbar.refresh()
        );
        this.draggedItemImage = scene.add.image(0, 0, 'inventorySlot')
            .setScale(3)
            .setAlpha(0.85)
            .setDepth(2000)
            .setScrollFactor(0)
            .setVisible(false);

        this.setupKeyboard();
        this.setupMouse();
    }

    update(pointer: Phaser.Input.Pointer): void {
        const slotIndex = this.getSlotIndex(pointer.x, pointer.y);
        const itemId = slotIndex === null
            ? null
            : this.inventory.getSlot(slotIndex).itemId;

        if (this.draggedSlotIndex !== null || !itemId) {
            this.itemTooltip.hide();
            return;
        }

        this.itemTooltip.show(translate(getItemById(itemId).nameKey), pointer.x, pointer.y);
    }

    refresh(): void {
        this.hotbar.refresh();
        this.inventoryPanel.refresh();
    }

    layout(): void {
        this.hotbar.layout();
        this.inventoryPanel.layout();
        this.itemTooltip.hide();
    }

    containsInteractiveElement(x: number, y: number): boolean {
        return this.getSlotIndex(x, y) !== null;
    }

    getUiObjects(): Phaser.GameObjects.GameObject[] {
        return [
            ...this.hotbar.getUiObjects(),
            ...this.inventoryPanel.getUiObjects(),
            this.itemTooltip.getGameObject(),
            this.draggedItemImage
        ];
    }

    private setupKeyboard(): void {
        this.scene.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
            const slotNumber = Number(event.key);

            if (slotNumber >= 1 && slotNumber <= 8) {
                this.hotbar.selectSlot(slotNumber - 1);
                this.inventoryPanel.refresh();
            }

            if (event.key.toLowerCase() === 'i') {
                this.inventoryPanel.toggle();
                this.itemTooltip.hide();
            }
        });
    }

    private setupMouse(): void {
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const slotIndex = this.getSlotIndex(pointer.x, pointer.y);
            const itemId = slotIndex === null
                ? null
                : this.inventory.getSlot(slotIndex).itemId;

            if (slotIndex === null || !itemId) {
                return;
            }

            this.draggedSlotIndex = slotIndex;
            this.itemTooltip.hide();
            this.draggedItemImage
                .setTexture(itemId)
                .setPosition(pointer.x, pointer.y)
                .setVisible(true);
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.draggedSlotIndex !== null) {
                this.draggedItemImage.setPosition(pointer.x, pointer.y);
            }
        });

        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.draggedSlotIndex === null) {
                return;
            }

            const targetSlotIndex = this.getSlotIndex(pointer.x, pointer.y);

            if (targetSlotIndex !== null) {
                this.inventory.moveSlot(this.draggedSlotIndex, targetSlotIndex);
                this.refresh();
            }

            this.draggedSlotIndex = null;
            this.draggedItemImage.setVisible(false);
        });
    }

    private getSlotIndex(x: number, y: number): number | null {
        if (this.isInteractionBlocked()) {
            return null;
        }

        return this.inventoryPanel.findSlotAt(x, y)
            ?? this.hotbar.findSlotAt(x, y);
    }
}
