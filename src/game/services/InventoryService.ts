import { getItemById, ItemId } from '../data/ItemData';

export type InventorySlot = {
    itemId: ItemId | null;
    quantity: number;
};

export class InventoryService {
    private slots: InventorySlot[];
    private selectedSlotIndex = 0;

    constructor(slotCount: number) {
        this.slots = Array.from({ length: slotCount }, () => ({
            itemId: null,
            quantity: 0
        }));
    }

    getSlots(): InventorySlot[] {
        return this.slots;
    }

    getSlot(index: number): InventorySlot | null {
        return this.slots[index] ?? null;
    }

    getSelectedSlotIndex(): number {
        return this.selectedSlotIndex;
    }

    selectSlot(index: number): void {
        if (this.getSlot(index)) {
            this.selectedSlotIndex = index;
        }
    }

    addItem(itemId: ItemId, quantity: number): number {
        const maxStack = getItemById(itemId).maxStackSize;
        let quantityLeft = quantity;

        for (const slot of this.slots) {
            if (slot.itemId !== itemId || slot.quantity === maxStack) {
                continue;
            }

            const added = Math.min(maxStack - slot.quantity, quantityLeft);
            slot.quantity += added;
            quantityLeft -= added;

            if (quantityLeft === 0) {
                return 0;
            }
        }

        for (const slot of this.slots) {
            if (slot.itemId !== null) {
                continue;
            }

            const added = Math.min(maxStack, quantityLeft);
            slot.itemId = itemId;
            slot.quantity = added;
            quantityLeft -= added;

            if (quantityLeft === 0) {
                return 0;
            }
        }

        return quantityLeft;
    }

    removeFromSlot(index: number, quantity: number): boolean {
        const slot = this.getSlot(index);

        if (!slot?.itemId || slot.quantity < quantity) {
            return false;
        }

        slot.quantity -= quantity;

        if (slot.quantity === 0) {
            this.emptySlot(slot);
        }

        return true;
    }

    moveSlot(sourceIndex: number, targetIndex: number): void {
        const source = this.getSlot(sourceIndex);
        const target = this.getSlot(targetIndex);

        if (!source?.itemId || !target || sourceIndex === targetIndex) {
            return;
        }

        if (target.itemId === null) {
            target.itemId = source.itemId;
            target.quantity = source.quantity;
            this.emptySlot(source);
        } else if (target.itemId === source.itemId) {
            this.mergeSlots(source, target);
        } else {
            this.swapSlots(source, target);
        }

        this.selectSlot(targetIndex);
    }

    private mergeSlots(source: InventorySlot, target: InventorySlot): void {
        const maxStack = getItemById(source.itemId!).maxStackSize;
        const moved = Math.min(maxStack - target.quantity, source.quantity);

        target.quantity += moved;
        source.quantity -= moved;

        if (source.quantity === 0) {
            this.emptySlot(source);
        }
    }

    private swapSlots(first: InventorySlot, second: InventorySlot): void {
        const savedSlot = { ...first };

        first.itemId = second.itemId;
        first.quantity = second.quantity;
        second.itemId = savedSlot.itemId;
        second.quantity = savedSlot.quantity;
    }

    private emptySlot(slot: InventorySlot): void {
        slot.itemId = null;
        slot.quantity = 0;
    }
}
