import { getItemById, ItemId } from '../data/ItemData';

export type InventorySlot = {
    itemId: ItemId | null;
    quantity: number;
};

export const hotbarSlotCount = 8;
export const inventorySlotCount = 16;

// Stores the inventory data. The first slots belong to the hotbar and the
// remaining slots belong to the inventory panel.
export class InventoryService {
    readonly slots: InventorySlot[];
    selectedSlotIndex = 0;

    constructor() {
        this.slots = Array.from({
            length: hotbarSlotCount + inventorySlotCount
        }, () => ({
            itemId: null,
            quantity: 0
        }));
    }

    selectSlot(index: number): void {
        this.selectedSlotIndex = index;
    }

    addItem(itemId: ItemId, quantity: number, hotbarFirst = false): boolean {
        const maxStack = getItemById(itemId).maxStackSize;

        // Add to an existing stack before looking for an empty slot.
        let slot = this.slots.find((slot) =>
            slot.itemId === itemId && slot.quantity + quantity <= maxStack
        );

        const preferredSlots = hotbarFirst
            ? this.slots.slice(0, hotbarSlotCount)
            : this.slots.slice(hotbarSlotCount);
        const fallbackSlots = hotbarFirst
            ? this.slots.slice(hotbarSlotCount)
            : this.slots.slice(0, hotbarSlotCount);

        slot ??= preferredSlots.find((slot) => slot.itemId === null);
        slot ??= fallbackSlots.find((slot) => slot.itemId === null);

        if (!slot) {
            return false;
        }

        slot.itemId = itemId;
        slot.quantity += quantity;
        return true;
    }

    hasItem(itemId: ItemId): boolean {
        return this.slots.some((slot) =>
            slot.itemId === itemId && slot.quantity > 0
        );
    }

    removeOneFromSlot(index: number): void {
        const slot = this.slots[index];
        slot.quantity--;

        if (slot.quantity === 0) {
            slot.itemId = null;
        }
    }

    moveSlot(fromIndex: number, toIndex: number): void {
        if (fromIndex === toIndex) {
            return;
        }

        const from = this.slots[fromIndex];
        const to = this.slots[toIndex];

        if (from.itemId === to.itemId && from.itemId !== null) {
            const maxStack = getItemById(from.itemId).maxStackSize;
            const quantityToMove = Math.min(from.quantity, maxStack - to.quantity);

            to.quantity += quantityToMove;
            from.quantity -= quantityToMove;

            if (from.quantity === 0) {
                from.itemId = null;
            }
        } else {
            [this.slots[fromIndex], this.slots[toIndex]] = [to, from];
        }

        // Only hotbar slots can be selected for use in the game world.
        if (toIndex < hotbarSlotCount) {
            this.selectedSlotIndex = toIndex;
        }
    }
}
