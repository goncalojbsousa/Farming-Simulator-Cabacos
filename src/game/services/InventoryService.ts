import { getItemById, ItemId } from '../data/ItemData';

export type InventorySlot = {
    itemId: ItemId | null;
    quantity: number;
};

export class InventoryService {
    readonly slots: InventorySlot[];
    selectedSlotIndex = 0;
    private changeCallbacks: (() => void)[] = [];

    constructor(numberOfSlots: number) {
        this.slots = Array.from({ length: numberOfSlots }, () => ({
            itemId: null,
            quantity: 0
        }));
    }

    selectSlot(index: number): void {
        this.selectedSlotIndex = index;
        this.notifyChange();
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
        this.notifyChange();
        return true;
    }

    hasItem(itemId: ItemId): boolean {
        return this.slots.some((slot) =>
            slot.itemId === itemId && slot.quantity > 0
        );
    }

    removeOneItem(itemId: ItemId, preferredSlotIndex?: number): boolean {
        let slot = preferredSlotIndex === undefined
            ? undefined
            : this.slots[preferredSlotIndex];

        if (slot?.itemId !== itemId) {
            slot = this.slots.find((slot) => slot.itemId === itemId);
        }

        if (!slot) {
            return false;
        }

        slot.quantity--;

        if (slot.quantity === 0) {
            slot.itemId = null;
        }

        this.notifyChange();
        return true;
    }

    removeOneFromSlot(index: number): void {
        const slot = this.slots[index];
        slot.quantity--;

        if (slot.quantity === 0) {
            slot.itemId = null;
        }

        this.notifyChange();
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

        this.selectedSlotIndex = toIndex;
        this.notifyChange();
    }

    onChange(callback: () => void): () => void {
        this.changeCallbacks.push(callback);

        return () => {
            this.changeCallbacks = this.changeCallbacks.filter((savedCallback) =>
                savedCallback !== callback
            );
        };
    }

    private notifyChange(): void {
        for (const callback of this.changeCallbacks) {
            callback();
        }
    }
}
