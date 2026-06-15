import { Scene } from 'phaser';
import { getItemById } from '../data/ItemData';
import { GameInput } from '../input/GameInput';
import { hotbarSlotCount, InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { playSound } from '../services/SoundService';
import { InventorySlotView } from './InventorySlotView';
import { InventoryTooltip } from './InventoryTooltip';
import { MenuPanel } from './MenuPanel';

const slotScale = 3;
const slotSize = 20;
const hotbarGap = 6;
const inventoryColumns = 4;
const inventorySlotSpacing = 68;

// Creates and controls the hotbar and inventory panel.
export class InventoryUi {
    readonly uiObjects: Phaser.GameObjects.GameObject[];

    private slotViews: InventorySlotView[] = [];
    private inventoryMenu: MenuPanel;
    private itemTooltip: InventoryTooltip;

    // Index and image used while an item is being dragged.
    private draggedSlotIndex: number | null = null;
    private draggedItemImage: Phaser.GameObjects.Image;

    constructor(
        private scene: Scene,
        private inventory: InventoryService,
        private isInteractionBlocked: () => boolean
    ) {
        this.itemTooltip = new InventoryTooltip(scene);
        this.inventoryMenu = new MenuPanel(scene, {
            width: 360,
            height: 430,
            title: translate('inventoryTitle'),
            depth: 900
        });

        // Creates one visual slot for every data slot.
        this.inventory.slots.forEach((_, slotIndex) => {
            const slotView = new InventorySlotView(scene, slotScale);
            this.slotViews.push(slotView);

            if (slotIndex < hotbarSlotCount) {
                // Hotbar slots are always visible on the screen.
                slotView.container.setDepth(1000);
            } else {
                // The remaining slots move and hide with the inventory menu.
                this.inventoryMenu.addContent(slotView.container);
            }
        });

        // This image follows the pointer during drag-and-drop.
        this.draggedItemImage = scene.add.image(0, 0, 'inventorySlot')
            .setScale(slotScale)
            .setAlpha(0.85)
            .setDepth(2000)
            .setScrollFactor(0)
            .setVisible(false);

        this.uiObjects = [
            ...this.slotViews
                .slice(0, hotbarSlotCount)
                .map((slot) => slot.container),
            this.inventoryMenu.container,
            this.itemTooltip.container,
            this.draggedItemImage
        ];

        this.layout();
        this.refresh();
        this.inventoryMenu.close();
    }

    update(input: GameInput): void {
        const pointer = input.pointer;
        const hotbarSlot = input.getHotbarSlotPressed();

        // Select a hotbar slot when the player presses keys 1 to 8.
        if (hotbarSlot !== null) {
            this.inventory.selectSlot(hotbarSlot);
            playSound(this.scene, 'toolSwap');
            this.refresh();
        }

        // Open or close the inventory when its keyboard key is pressed.
        if (input.inventoryPressed()) {
            this.inventoryMenu.toggle();
            this.itemTooltip.hide();
        }

        // Pressing the mouse picks up an item from the slot under the pointer.
        if (input.mousePressed) {
            this.startDragging(pointer);
        }

        // Releasing the mouse drops the item into the slot under the pointer.
        if (input.mouseReleased) {
            this.stopDragging(pointer);
        }

        // While dragging, the temporary item image follows the pointer.
        if (this.draggedSlotIndex !== null) {
            this.draggedItemImage.setPosition(pointer.x, pointer.y);
            this.itemTooltip.hide();
            return;
        }

        // Find the slot under the pointer to decide whether to show a tooltip.
        const slotIndex = this.findSlotAt(pointer.x, pointer.y);
        const itemId = slotIndex === null
            ? null
            : this.inventory.slots[slotIndex].itemId;

        // Empty slots and areas outside the inventory have no tooltip.
        if (!itemId) {
            this.itemTooltip.hide();
            return;
        }

        // Translate and display the name of the item under the pointer.
        this.itemTooltip.show(
            translate(getItemById(itemId).nameKey),
            pointer.x,
            pointer.y
        );
    }

    // Synchronizes every slot image with the current inventory data.
    refresh(): void {
        this.slotViews.forEach((slotView, slotIndex) => {
            slotView.refresh(
                this.inventory.slots[slotIndex],
                slotIndex === this.inventory.selectedSlotIndex
            );
        });
    }

    layout(): void {
        // Position the first eight slots in a horizontal hotbar.
        const scaledSlotSize = slotSize * slotScale;
        const hotbarWidth = hotbarSlotCount * scaledSlotSize
            + (hotbarSlotCount - 1) * hotbarGap;
        const hotbarStartX = this.scene.scale.width / 2
            - hotbarWidth / 2
            + scaledSlotSize / 2;
        const hotbarY = this.scene.scale.height - 44;

        this.slotViews.slice(0, hotbarSlotCount).forEach((slotView, slotIndex) => {
            slotView.container.setPosition(
                hotbarStartX + slotIndex * (scaledSlotSize + hotbarGap),
                hotbarY
            );
        });

        // Position the remaining slots inside the inventory menu.
        this.inventoryMenu.center();
        this.slotViews.slice(hotbarSlotCount).forEach((slotView, slotIndex) => {
            const column = slotIndex % inventoryColumns;
            const row = Math.floor(slotIndex / inventoryColumns);

            slotView.container.setPosition(
                (column - 1.5) * inventorySlotSpacing,
                -84 + row * inventorySlotSpacing
            );
        });

        this.itemTooltip.hide();
    }

    // Used by the farming system to avoid planting when clicking a UI slot.
    isPointerOverSlot(x: number, y: number): boolean {
        return this.findSlotAt(x, y) !== null;
    }

    private startDragging(pointer: Phaser.Input.Pointer): void {
        const slotIndex = this.findSlotAt(pointer.x, pointer.y);

        if (slotIndex === null) {
            return;
        }

        // Clicking a hotbar slot also selects it as the active item.
        if (slotIndex < hotbarSlotCount) {
            this.inventory.selectSlot(slotIndex);
            this.refresh();
        }

        const itemId = this.inventory.slots[slotIndex].itemId;

        // Empty slots cannot be dragged.
        if (!itemId) {
            return;
        }

        const item = getItemById(itemId);

        playSound(this.scene, 'toolSwap');
        this.draggedSlotIndex = slotIndex;
        this.draggedItemImage
            .setTexture(item.textureKey, item.textureFrame)
            .setPosition(pointer.x, pointer.y)
            .setVisible(true);
    }

    private stopDragging(pointer: Phaser.Input.Pointer): void {
        if (this.draggedSlotIndex === null) {
            return;
        }

        const targetSlotIndex = this.findSlotAt(pointer.x, pointer.y);

        // Dropping over another slot moves or stacks the item.
        if (targetSlotIndex !== null) {
            this.inventory.moveSlot(this.draggedSlotIndex, targetSlotIndex);
            this.refresh();
        }

        this.draggedSlotIndex = null;
        this.draggedItemImage.setVisible(false);
    }

    private findSlotAt(x: number, y: number): number | null {
        // Shop menus and other overlays can temporarily block inventory input.
        if (this.isInteractionBlocked()) {
            return null;
        }

        // Search all slots when the menu is open, or only the hotbar otherwise.
        const visibleSlotCount = this.inventoryMenu.isOpen()
            ? this.slotViews.length
            : hotbarSlotCount;

        for (let slotIndex = 0; slotIndex < visibleSlotCount; slotIndex++) {
            if (this.slotViews[slotIndex].containsPoint(x, y)) {
                return slotIndex;
            }
        }

        return null;
    }
}
