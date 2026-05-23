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
    private onSlotHovered: (slotIndex: number, pointer: Phaser.Input.Pointer) => void;
    private onSlotLeft: () => void;

    constructor(
        scene: Scene,
        inventory: InventoryService,
        onSlotHovered: (slotIndex: number, pointer: Phaser.Input.Pointer) => void,
        onSlotLeft: () => void
    ) {
        this.scene = scene;
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

    layout(): void {
        const scaledSlotSize = slotSize * slotScale;
        const totalWidth = visibleSlotCount * scaledSlotSize + (visibleSlotCount - 1) * slotGap;
        const startX = this.scene.scale.width / 2 - totalWidth / 2 + scaledSlotSize / 2;
        const y = this.scene.scale.height - 44;

        this.slotViews.forEach((slotView, slotIndex) => {
            const x = startX + slotIndex * (scaledSlotSize + slotGap);

            slotView.setPosition(x, y);
        });
    }

    getSlotIndexAtPosition(x: number, y: number): number | null {
        const slotIndex = this.slotViews.findIndex((slotView) => slotView.containsPoint(x, y));

        if (slotIndex === -1) {
            return null;
        }

        return slotIndex;
    }

    getGameObjects(): Phaser.GameObjects.GameObject[] {
        return this.slotViews.map((slotView) => slotView.getGameObject());
    }

    private createSlots(scene: Scene): void {
        for (let slotIndex = 0; slotIndex < visibleSlotCount; slotIndex++) {
            const slotView = new InventorySlotView(
                scene,
                0,
                0,
                slotScale,
                () => this.selectSlot(slotIndex),
                (pointer) => this.onSlotHovered(slotIndex, pointer),
                this.onSlotLeft
            );

            slotView.setDepth(1000);
            this.slotViews.push(slotView);
        }

        this.layout();
    }
}
