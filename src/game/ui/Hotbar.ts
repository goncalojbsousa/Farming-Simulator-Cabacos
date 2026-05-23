import { Scene } from 'phaser';
import { InventoryService } from '../services/InventoryService';
import { InventorySlotView } from './InventorySlotView';

const visibleSlotCount = 8;
const slotSize = 20;
const slotScale = 3;
const slotGap = 6;

export class Hotbar {
    private inventory: InventoryService;
    private slotViews: InventorySlotView[] = [];
    private onSlotHovered: (slotIndex: number, pointer: Phaser.Input.Pointer) => void;
    private onSlotLeft: () => void;

    constructor(
        scene: Scene,
        inventory: InventoryService,
        onSlotHovered: (slotIndex: number, pointer: Phaser.Input.Pointer) => void,
        onSlotLeft: () => void
    ) {
        this.inventory = inventory;
        this.onSlotHovered = onSlotHovered;
        this.onSlotLeft = onSlotLeft;
        this.createSlots(scene);
        this.refresh();
    }

    refresh(): void {
        const slots = this.inventory.getSlots();
        const selectedSlotIndex = this.inventory.getSelectedSlotIndex();

        this.slotViews.forEach((slotView, slotIndex) => {
            slotView.refresh(slots[slotIndex], slotIndex === selectedSlotIndex);
        });
    }

    selectSlot(slotIndex: number): void {
        this.inventory.selectSlot(slotIndex);
        this.refresh();
    }

    getSlotIndexAtPosition(x: number, y: number): number | null {
        const slotIndex = this.slotViews.findIndex((slotView) => slotView.containsPoint(x, y));

        if (slotIndex === -1) {
            return null;
        }

        return slotIndex;
    }

    private createSlots(scene: Scene): void {
        const scaledSlotSize = slotSize * slotScale;
        const totalWidth = visibleSlotCount * scaledSlotSize + (visibleSlotCount - 1) * slotGap;
        const startX = 512 - totalWidth / 2 + scaledSlotSize / 2;
        const y = 724;

        for (let slotIndex = 0; slotIndex < visibleSlotCount; slotIndex++) {
            const x = startX + slotIndex * (scaledSlotSize + slotGap);
            const slotView = new InventorySlotView(
                scene,
                x,
                y,
                slotScale,
                () => this.selectSlot(slotIndex),
                (pointer) => this.onSlotHovered(slotIndex, pointer),
                this.onSlotLeft
            );

            slotView.setDepth(1000);
            this.slotViews.push(slotView);
        }
    }
}
