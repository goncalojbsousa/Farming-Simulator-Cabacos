import { getItemById, ItemId } from '../data/ItemData';

export type InventorySlot = {
    itemId: ItemId | null;
    quantity: number;
};

export class InventoryService {
    private slots: InventorySlot[];
    private selectedSlotIndex = 0;

    constructor(slotCount: number) {
        this.slots = Array.from({ length: slotCount }, () => this.createEmptySlot());
    }

    getSlots(): InventorySlot[] {
        return this.slots;
    }

    getSlot(slotIndex: number): InventorySlot | null {
        if (!this.isValidSlotIndex(slotIndex)) {
            return null;
        }

        return this.slots[slotIndex];
    }

    getSelectedSlotIndex(): number {
        return this.selectedSlotIndex;
    }

    selectSlot(slotIndex: number): void {
        if (!this.isValidSlotIndex(slotIndex)) {
            return;
        }

        this.selectedSlotIndex = slotIndex;
    }

    moveSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        if (!this.isValidSlotIndex(sourceSlotIndex) || !this.isValidSlotIndex(targetSlotIndex)) {
            return false;
        }

        if (sourceSlotIndex === targetSlotIndex) {
            this.selectSlot(targetSlotIndex);
            return false;
        }

        const sourceSlot = this.slots[sourceSlotIndex];
        const targetSlot = this.slots[targetSlotIndex];

        if (sourceSlot.itemId === null) {
            return false;
        }

        if (targetSlot.itemId === null) {
            // Empty target slots receive the source stack directly.
            this.moveItemToEmptySlot(sourceSlot, targetSlot);
            this.selectSlot(targetSlotIndex);
            return true;
        }

        if (sourceSlot.itemId === targetSlot.itemId) {
            // Matching item stacks merge first, then keep any leftover in the source slot.
            const didMerge = this.mergeMatchingSlots(sourceSlot, targetSlot);

            this.selectSlot(targetSlotIndex);
            return didMerge;
        }

        // Different items swap places so the player never loses an item by dragging.
        this.swapSlots(sourceSlot, targetSlot);
        this.selectSlot(targetSlotIndex);
        return true;
    }

    addItem(itemId: ItemId, quantity: number): number {
        let quantityLeft = quantity;

        quantityLeft = this.addToExistingStacks(itemId, quantityLeft);
        quantityLeft = this.addToEmptySlots(itemId, quantityLeft);

        return quantityLeft;
    }

    removeItem(itemId: ItemId, quantity: number): boolean {
        if (this.countItem(itemId) < quantity) {
            return false;
        }

        let quantityLeft = quantity;

        for (const slot of this.slots) {
            if (slot.itemId !== itemId || quantityLeft === 0) {
                continue;
            }

            const removedQuantity = Math.min(slot.quantity, quantityLeft);

            slot.quantity -= removedQuantity;
            quantityLeft -= removedQuantity;

            if (slot.quantity === 0) {
                this.clearSlot(slot);
            }
        }

        return true;
    }

    countItem(itemId: ItemId): number {
        return this.slots.reduce((total, slot) => {
            if (slot.itemId !== itemId) {
                return total;
            }

            return total + slot.quantity;
        }, 0);
    }

    clear(): void {
        for (const slot of this.slots) {
            this.clearSlot(slot);
        }

        this.selectedSlotIndex = 0;
    }

    private addToExistingStacks(itemId: ItemId, quantity: number): number {
        let quantityLeft = quantity;
        const item = getItemById(itemId);

        for (const slot of this.slots) {
            if (slot.itemId !== itemId || quantityLeft === 0) {
                continue;
            }

            const freeSpace = item.maxStackSize - slot.quantity;
            const addedQuantity = Math.min(freeSpace, quantityLeft);

            slot.quantity += addedQuantity;
            quantityLeft -= addedQuantity;
        }

        return quantityLeft;
    }

    private addToEmptySlots(itemId: ItemId, quantity: number): number {
        let quantityLeft = quantity;
        const item = getItemById(itemId);

        for (const slot of this.slots) {
            if (slot.itemId !== null || quantityLeft === 0) {
                continue;
            }

            const addedQuantity = Math.min(item.maxStackSize, quantityLeft);

            slot.itemId = itemId;
            slot.quantity = addedQuantity;
            quantityLeft -= addedQuantity;
        }

        return quantityLeft;
    }

    private clearSlot(slot: InventorySlot): void {
        slot.itemId = null;
        slot.quantity = 0;
    }

    private moveItemToEmptySlot(sourceSlot: InventorySlot, targetSlot: InventorySlot): void {
        targetSlot.itemId = sourceSlot.itemId;
        targetSlot.quantity = sourceSlot.quantity;
        this.clearSlot(sourceSlot);
    }

    private mergeMatchingSlots(sourceSlot: InventorySlot, targetSlot: InventorySlot): boolean {
        if (sourceSlot.itemId === null || targetSlot.itemId === null) {
            return false;
        }

        const item = getItemById(sourceSlot.itemId);
        const freeSpace = item.maxStackSize - targetSlot.quantity;

        if (freeSpace <= 0) {
            return false;
        }

        const movedQuantity = Math.min(freeSpace, sourceSlot.quantity);

        targetSlot.quantity += movedQuantity;
        sourceSlot.quantity -= movedQuantity;

        if (sourceSlot.quantity === 0) {
            this.clearSlot(sourceSlot);
        }

        return movedQuantity > 0;
    }

    private swapSlots(firstSlot: InventorySlot, secondSlot: InventorySlot): void {
        const firstItemId = firstSlot.itemId;
        const firstQuantity = firstSlot.quantity;

        firstSlot.itemId = secondSlot.itemId;
        firstSlot.quantity = secondSlot.quantity;
        secondSlot.itemId = firstItemId;
        secondSlot.quantity = firstQuantity;
    }

    private createEmptySlot(): InventorySlot {
        return {
            itemId: null,
            quantity: 0
        };
    }

    private isValidSlotIndex(slotIndex: number): boolean {
        return slotIndex >= 0 && slotIndex < this.slots.length;
    }
}
