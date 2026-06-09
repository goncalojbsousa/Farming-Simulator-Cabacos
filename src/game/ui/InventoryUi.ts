import { Scene } from 'phaser';
import { getItemById } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { Hotbar } from './Hotbar';
import { InventoryPanel } from './InventoryPanel';
import { InventoryTooltip } from './InventoryTooltip';

export class InventoryUi {
    private hotbar: Hotbar;
    private panel: InventoryPanel;
    private tooltip: InventoryTooltip;
    private draggedSlotIndex: number | null = null;
    private draggedItem: Phaser.GameObjects.Image;

    constructor(
        private scene: Scene,
        private inventory: InventoryService,
        private isBlocked: () => boolean
    ) {
        this.tooltip = new InventoryTooltip(scene);
        this.hotbar = new Hotbar(scene, inventory);
        this.panel = new InventoryPanel(scene, inventory, () => this.hotbar.refresh());
        this.draggedItem = scene.add.image(0, 0, 'inventorySlot')
            .setScale(3)
            .setAlpha(0.85)
            .setDepth(2000)
            .setScrollFactor(0)
            .setVisible(false);

        this.setupKeyboard();
        this.setupMouse();
    }

    update(pointer: Phaser.Input.Pointer): void {
        if (this.draggedSlotIndex !== null) {
            return;
        }

        const slotIndex = this.getSlotIndex(pointer.x, pointer.y);

        if (slotIndex === null) {
            this.tooltip.hide();
            return;
        }

        const slot = this.inventory.getSlot(slotIndex);

        if (!slot?.itemId) {
            this.tooltip.hide();
            return;
        }

        this.tooltip.show(translate(getItemById(slot.itemId).nameKey), pointer.x, pointer.y);
    }

    refresh(): void {
        this.hotbar.refresh();
        this.panel.refresh();
    }

    layout(): void {
        this.hotbar.layout();
        this.panel.layout();
        this.tooltip.hide();
    }

    containsPoint(x: number, y: number): boolean {
        return this.getSlotIndex(x, y) !== null;
    }

    getGameObjects(): Phaser.GameObjects.GameObject[] {
        return [
            ...this.hotbar.getGameObjects(),
            ...this.panel.getGameObjects(),
            this.tooltip.getGameObject(),
            this.draggedItem
        ];
    }

    private setupKeyboard(): void {
        this.scene.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
            const slotNumber = Number(event.key);

            if (slotNumber >= 1 && slotNumber <= 8) {
                this.hotbar.selectSlot(slotNumber - 1);
                this.panel.refresh();
            }

            if (event.key.toLowerCase() === 'i') {
                this.panel.toggle();
                this.tooltip.hide();
            }
        });
    }

    private setupMouse(): void {
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const slotIndex = this.getSlotIndex(pointer.x, pointer.y);
            const slot = slotIndex === null ? null : this.inventory.getSlot(slotIndex);

            if (slotIndex === null || !slot?.itemId) {
                return;
            }

            this.draggedSlotIndex = slotIndex;
            this.tooltip.hide();
            this.draggedItem
                .setTexture(getItemById(slot.itemId).id)
                .setPosition(pointer.x, pointer.y)
                .setVisible(true);
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.draggedSlotIndex !== null) {
                this.draggedItem.setPosition(pointer.x, pointer.y);
            }
        });

        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.draggedSlotIndex === null) {
                return;
            }

            const targetSlotIndex = this.getSlotIndex(pointer.x, pointer.y);

            if (targetSlotIndex !== null) {
                this.inventory.moveSlot(this.draggedSlotIndex, targetSlotIndex);
                this.refresh();
            }

            this.draggedSlotIndex = null;
            this.draggedItem.setVisible(false);
        });
    }

    private getSlotIndex(x: number, y: number): number | null {
        if (this.isBlocked()) {
            return null;
        }

        return this.panel.getSlotIndexAtPosition(x, y)
            ?? this.hotbar.getSlotIndexAtPosition(x, y);
    }
}
