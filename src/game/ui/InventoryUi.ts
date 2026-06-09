import { Scene } from 'phaser';
import { getItemById } from '../data/ItemData';
import { GameInput } from '../input/GameInput';
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
        scene: Scene,
        private inventory: InventoryService,
        private isInteractionBlocked: () => boolean
    ) {
        this.itemTooltip = new InventoryTooltip(scene);
        this.hotbar = new Hotbar(scene, inventory);
        this.inventoryPanel = new InventoryPanel(inventory, scene);
        this.draggedItemImage = scene.add.image(0, 0, 'inventorySlot')
            .setScale(3)
            .setAlpha(0.85)
            .setDepth(2000)
            .setScrollFactor(0)
            .setVisible(false);

    }

    update(input: GameInput): void {
        const pointer = input.pointer;
        const hotbarSlot = input.getHotbarSlotPressed();

        if (hotbarSlot !== null) {
            this.inventory.selectSlot(hotbarSlot);
            this.refresh();
        }

        if (input.inventoryPressed()) {
            this.inventoryPanel.toggle();
            this.itemTooltip.hide();
        }

        if (input.mousePressed) {
            this.startDragging(pointer);
        }

        if (input.mouseReleased) {
            this.stopDragging(pointer);
        }

        if (this.draggedSlotIndex !== null) {
            this.draggedItemImage.setPosition(pointer.x, pointer.y);
            this.itemTooltip.hide();
            return;
        }

        const slotIndex = this.getSlotIndex(pointer.x, pointer.y);
        const itemId = slotIndex === null
            ? null
            : this.inventory.slots[slotIndex].itemId;

        if (!itemId) {
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
            this.itemTooltip.container,
            this.draggedItemImage
        ];
    }

    private startDragging(pointer: Phaser.Input.Pointer): void {
        const slotIndex = this.getSlotIndex(pointer.x, pointer.y);

        if (slotIndex === null) {
            return;
        }

        this.inventory.selectSlot(slotIndex);
        this.refresh();

        const itemId = this.inventory.slots[slotIndex].itemId;

        if (itemId) {
            this.draggedSlotIndex = slotIndex;
            this.draggedItemImage
                .setTexture(itemId)
                .setPosition(pointer.x, pointer.y)
                .setVisible(true);
        }
    }

    private stopDragging(pointer: Phaser.Input.Pointer): void {
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
    }

    private getSlotIndex(x: number, y: number): number | null {
        if (this.isInteractionBlocked()) {
            return null;
        }

        return this.inventoryPanel.findSlotAt(x, y)
            ?? this.hotbar.findSlotAt(x, y);
    }
}
