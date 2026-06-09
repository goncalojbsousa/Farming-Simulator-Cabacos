import { Scene } from 'phaser';
import { InventoryService } from '../services/InventoryService';
import { InventorySlotView } from './InventorySlotView';

const visibleSlotCount = 8;
const slotSize = 20;
const slotScale = 3;
const slotGap = 6;

export class Hotbar {
    private scene: Scene;
    private inventory: InventoryService;
    private slotViews: InventorySlotView[] = [];

    constructor(scene: Scene, inventory: InventoryService) {
        this.scene = scene;
        this.inventory = inventory;

        for (let slotIndex = 0; slotIndex < visibleSlotCount; slotIndex++) {
            const slotView = new InventorySlotView(scene, slotScale);
            slotView.container.setDepth(1000);
            this.slotViews.push(slotView);
        }

        this.layout();
        this.refresh();
    }

    refresh(): void {
        this.slotViews.forEach((slotView, slotIndex) => {
            slotView.refresh(
                this.inventory.slots[slotIndex],
                slotIndex === this.inventory.selectedSlotIndex
            );
        });
    }

    layout(): void {
        const scaledSlotSize = slotSize * slotScale;
        const totalWidth = visibleSlotCount * scaledSlotSize + (visibleSlotCount - 1) * slotGap;
        const startX = this.scene.scale.width / 2 - totalWidth / 2 + scaledSlotSize / 2;
        const y = this.scene.scale.height - 44;

        this.slotViews.forEach((slotView, slotIndex) => {
            const x = startX + slotIndex * (scaledSlotSize + slotGap);

            slotView.container.setPosition(x, y);
        });
    }

    findSlotAt(x: number, y: number): number | null {
        const slotIndex = this.slotViews.findIndex((slotView) => slotView.containsPoint(x, y));
        return slotIndex === -1 ? null : slotIndex;
    }

    getUiObjects(): Phaser.GameObjects.GameObject[] {
        return this.slotViews.map((slotView) => slotView.container);
    }
}
