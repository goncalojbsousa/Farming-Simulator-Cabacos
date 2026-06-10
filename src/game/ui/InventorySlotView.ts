import { GameObjects, Scene } from 'phaser';
import { getItemById } from '../data/ItemData';
import { InventorySlot } from '../services/InventoryService';

export class InventorySlotView {
    readonly container: GameObjects.Container;
    private slotImage: GameObjects.Image;
    private selectorImage: GameObjects.Image;
    private itemImage: GameObjects.Image;
    private quantityText: GameObjects.Text;

    constructor(
        scene: Scene,
        scale: number
    ) {
        this.container = scene.add.container(0, 0).setScrollFactor(0);
        this.slotImage = scene.add.image(0, 0, 'inventorySlot', 0).setScale(scale);
        this.selectorImage = scene.add.image(0, 0, 'hotbarSelector').setScale(scale).setVisible(false);
        this.itemImage = scene.add.image(0, 0, 'inventorySlot', 0).setScale(scale).setVisible(false);
        this.quantityText = scene.add.text(8 * scale, 8 * scale, '', {
            fontFamily: 'Arial',
            fontSize: `${8 * scale}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'right'
        }).setOrigin(1, 1);

        this.slotImage.setInteractive({ useHandCursor: true });

        this.container.add([this.slotImage, this.itemImage, this.selectorImage, this.quantityText]);
    }

    containsPoint(x: number, y: number): boolean {
        return this.container.visible && this.container.getBounds().contains(x, y);
    }

    refresh(slot: InventorySlot, isSelected: boolean): void {
        this.selectorImage.setVisible(isSelected);

        if (slot.itemId === null) {
            this.itemImage.setVisible(false);
            this.quantityText.setVisible(false);
            return;
        }

        const slotItem = getItemById(slot.itemId);

        this.itemImage.setTexture(slotItem.id);
        this.itemImage.setVisible(true);
        this.quantityText.setText(String(slot.quantity));
        this.quantityText.setVisible(slot.quantity > 1);
    }
}
