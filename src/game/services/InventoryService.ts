import { getItemById, ItemId } from '../data/ItemData';

export type InventorySlot = {
    itemId: ItemId | null;
    quantity: number;
};

export class InventoryService {
    private slots: InventorySlot[];
    private selectedSlot = 0;

    constructor(numberOfSlots: number) {
        this.slots = Array.from({ length: numberOfSlots }, () => ({
            itemId: null,
            quantity: 0
        }));
    }

    getSlots(): InventorySlot[] {
        return this.slots;
    }

    getSlot(index: number): InventorySlot {
        return this.slots[index];
    }

    getSelectedSlotIndex(): number {
        return this.selectedSlot;
    }

    selectSlot(index: number): void {
        this.selectedSlot = index;
    }

    addItem(itemId: ItemId, quantity: number): boolean {
        const maxStack = getItemById(itemId).maxStackSize;
        let slot = this.slots.find((slot) =>
            slot.itemId === itemId && slot.quantity + quantity <= maxStack
        );

        slot ??= this.slots.find((slot) => slot.itemId === null);

        if (!slot) {
            return false;
        }

        slot.itemId = itemId;
        slot.quantity += quantity;
        return true;
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
            const savedSlot = { ...from };
            this.slots[fromIndex] = { ...to };
            this.slots[toIndex] = savedSlot;
        }

        this.selectedSlot = toIndex;
    }
}
