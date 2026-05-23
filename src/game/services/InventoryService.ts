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

    getSelectedSlot(): InventorySlot {
        return this.slots[this.selectedSlotIndex];
    }

    selectSlot(slotIndex: number): void {
        if (!this.isValidSlotIndex(slotIndex)) {
            return;
        }

        this.selectedSlotIndex = slotIndex;
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
