import { getItemById, ItemId } from '../data/ItemData';

export type InventorySlot = {
    itemId: ItemId | null;
    quantity: number;
};

export type InventorySnapshot = {
    slots: InventorySlot[];
    selectedSlotIndex: number;
};

export const hotbarSlotCount = 8;
export const inventorySlotCount = 16;

// Stores the inventory data. The first slots belong to the hotbar and the
// remaining slots belong to the inventory panel.
export class InventoryService {
    readonly slots: InventorySlot[];
    selectedSlotIndex = 0;
    private changeCallbacks: (() => void)[] = [];

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
        this.notifyChange();
    }

    addItem(itemId: ItemId, quantity: number): boolean {
        const maxStack = getItemById(itemId).maxStackSize;
        const hotbarSlots = this.slots.slice(0, hotbarSlotCount);
        const inventorySlots = this.slots.slice(hotbarSlotCount);

        // Fill existing stacks first, then use empty slots with hotbar priority.
        let slot = hotbarSlots.find((slot) =>
            slot.itemId === itemId && slot.quantity + quantity <= maxStack
        );
        slot ??= inventorySlots.find((slot) =>
            slot.itemId === itemId && slot.quantity + quantity <= maxStack
        );
        slot ??= hotbarSlots.find((slot) => slot.itemId === null);
        slot ??= inventorySlots.find((slot) => slot.itemId === null);

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
            [this.slots[fromIndex], this.slots[toIndex]] = [to, from];
        }

        // Only hotbar slots can be selected for use in the game world.
        if (toIndex < hotbarSlotCount) {
            this.selectedSlotIndex = toIndex;
        }

        this.notifyChange();
    }

    getSnapshot(): InventorySnapshot {
        return {
            slots: this.slots.map((slot) => ({ ...slot })),
            selectedSlotIndex: this.selectedSlotIndex
        };
    }

    loadSnapshot(snapshot: InventorySnapshot): void {
        snapshot.slots.forEach((savedSlot, index) => {
            if (!this.slots[index]) {
                return;
            }

            this.slots[index].itemId = savedSlot.itemId;
            this.slots[index].quantity = savedSlot.quantity;
        });

        this.selectedSlotIndex = snapshot.selectedSlotIndex;
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
