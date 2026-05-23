import { GameObjects, Scene } from 'phaser';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { InventorySlotView } from './InventorySlotView';

const columnCount = 4;
const slotSize = 20;
const slotScale = 3;
const slotGap = 8;

export class InventoryPanel {
    private inventory: InventoryService;
    private background: GameObjects.Rectangle;
    private titleText: GameObjects.Text;
    private slotViews: InventorySlotView[] = [];
    private isOpen = false;
    private onSlotSelected: () => void;
    private onSlotHovered: (slotIndex: number, pointer: Phaser.Input.Pointer) => void;
    private onSlotLeft: () => void;

    constructor(
        scene: Scene,
        inventory: InventoryService,
        onSlotSelected: () => void,
        onSlotHovered: (slotIndex: number, pointer: Phaser.Input.Pointer) => void,
        onSlotLeft: () => void
    ) {
        this.inventory = inventory;
        this.onSlotSelected = onSlotSelected;
        this.onSlotHovered = onSlotHovered;
        this.onSlotLeft = onSlotLeft;
        this.background = scene.add.rectangle(512, 384, 360, 430, 0x1f2d24, 0.95)
            .setStrokeStyle(4, 0xe2a36f)
            .setScrollFactor(0)
            .setDepth(900)
            .setVisible(false);

        this.titleText = scene.add.text(512, 220, translate('inventoryTitle'), {
            fontFamily: 'Arial Black',
            fontSize: 26,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setVisible(false);

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

    toggle(): void {
        this.setOpen(!this.isOpen);
    }

    getSlotIndexAtPosition(x: number, y: number): number | null {
        if (!this.isOpen) {
            return null;
        }

        const slotIndex = this.slotViews.findIndex((slotView) => slotView.containsPoint(x, y));

        if (slotIndex === -1) {
            return null;
        }

        return slotIndex;
    }

    private setOpen(isOpen: boolean): void {
        this.isOpen = isOpen;
        this.background.setVisible(isOpen);
        this.titleText.setVisible(isOpen);

        for (const slotView of this.slotViews) {
            slotView.setVisible(isOpen);
        }

        this.refresh();
    }

    private createSlots(scene: Scene): void {
        const scaledSlotSize = slotSize * slotScale;
        const startX = 512 - ((columnCount - 1) * (scaledSlotSize + slotGap)) / 2;
        const startY = 300;

        this.inventory.getSlots().forEach((_slot, slotIndex) => {
            const column = slotIndex % columnCount;
            const row = Math.floor(slotIndex / columnCount);
            const x = startX + column * (scaledSlotSize + slotGap);
            const y = startY + row * (scaledSlotSize + slotGap);
            const slotView = new InventorySlotView(
                scene,
                x,
                y,
                slotScale,
                () => {
                    this.inventory.selectSlot(slotIndex);
                    this.refresh();
                    this.onSlotSelected();
                },
                (pointer) => this.onSlotHovered(slotIndex, pointer),
                this.onSlotLeft
            );

            slotView.setDepth(902);
            slotView.setVisible(false);
            this.slotViews.push(slotView);
        });
    }
}
