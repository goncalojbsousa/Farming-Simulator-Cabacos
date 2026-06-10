import { Scene } from 'phaser';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { InventorySlotView } from './InventorySlotView';
import { MenuPanel } from './MenuPanel';

const columns = 4;
const slotScale = 3;
const slotSpacing = 68;

export class InventoryPanel {
    private menu: MenuPanel;
    private slotViews: InventorySlotView[] = [];

    constructor(
        private inventory: InventoryService,
        scene: Scene
    ) {
        this.menu = new MenuPanel(scene, {
            width: 360,
            height: 430,
            title: translate('inventoryTitle'),
            depth: 900
        });

        inventory.slots.forEach(() => {
            const slotView = new InventorySlotView(scene, slotScale);

            this.slotViews.push(slotView);
            this.menu.addContent(slotView.container);
        });

        this.layout();
        this.refresh();
        this.menu.close();
    }

    refresh(): void {
        this.slotViews.forEach((slotView, slotIndex) => {
            slotView.refresh(
                this.inventory.slots[slotIndex],
                slotIndex === this.inventory.selectedSlotIndex
            );
        });
    }

    toggle(): void {
        this.menu.toggle();
        this.refresh();
    }

    findSlotAt(x: number, y: number): number | null {
        if (!this.menu.isOpen()) {
            return null;
        }

        const slotIndex = this.slotViews.findIndex((slotView) => slotView.containsPoint(x, y));
        return slotIndex === -1 ? null : slotIndex;
    }

    layout(): void {
        this.menu.center();

        this.slotViews.forEach((slotView, slotIndex) => {
            const column = slotIndex % columns;
            const row = Math.floor(slotIndex / columns);

            slotView.container.setPosition(
                (column - 1.5) * slotSpacing,
                -84 + row * slotSpacing
            );
        });
    }

    getUiObjects(): Phaser.GameObjects.GameObject[] {
        return [this.menu.container];
    }
}
