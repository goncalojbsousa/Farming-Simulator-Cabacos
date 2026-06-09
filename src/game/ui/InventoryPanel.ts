import { Scene } from 'phaser';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { InventorySlotView } from './InventorySlotView';
import { UiPanel } from './UiPanel';

const columns = 4;
const slotScale = 3;
const slotSpacing = 68;

export class InventoryPanel {
    private panel: UiPanel;
    private slotViews: InventorySlotView[] = [];
    private panelIsOpen = false;

    constructor(
        private inventory: InventoryService,
        scene: Scene,
        private onSelectedSlotChanged: () => void
    ) {
        this.panel = new UiPanel(scene, {
            width: 360,
            height: 430,
            title: translate('inventoryTitle'),
            depth: 900
        });

        inventory.getSlots().forEach((_slot, slotIndex) => {
            const slotView = new InventorySlotView(
                scene,
                0,
                0,
                slotScale,
                () => this.selectSlot(slotIndex)
            );

            this.slotViews.push(slotView);
            this.panel.add(slotView.getGameObject());
        });

        this.layout();
        this.refresh();
        this.panel.hide();
    }

    refresh(): void {
        const inventorySlots = this.inventory.getSlots();
        const selectedSlotIndex = this.inventory.getSelectedSlotIndex();

        this.slotViews.forEach((slotView, slotIndex) => {
            slotView.refresh(inventorySlots[slotIndex], slotIndex === selectedSlotIndex);
        });
    }

    toggle(): void {
        this.panelIsOpen = !this.panelIsOpen;
        this.panelIsOpen ? this.panel.show() : this.panel.hide();
        this.refresh();
    }

    findSlotAt(x: number, y: number): number | null {
        if (!this.panelIsOpen) {
            return null;
        }

        const slotIndex = this.slotViews.findIndex((slotView) => slotView.containsPoint(x, y));
        return slotIndex === -1 ? null : slotIndex;
    }

    layout(): void {
        this.panel.centerOnScreen();

        this.slotViews.forEach((slotView, slotIndex) => {
            const column = slotIndex % columns;
            const row = Math.floor(slotIndex / columns);

            slotView.setPosition(
                (column - 1.5) * slotSpacing,
                -84 + row * slotSpacing
            );
        });
    }

    getUiObjects(): Phaser.GameObjects.GameObject[] {
        return [this.panel.container];
    }

    private selectSlot(slotIndex: number): void {
        this.inventory.selectSlot(slotIndex);
        this.refresh();
        this.onSelectedSlotChanged();
    }
}
