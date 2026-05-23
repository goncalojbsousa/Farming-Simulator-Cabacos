import { GameObjects, Scene } from 'phaser';
import { getItemById } from '../data/ItemData';
import { InventorySlot } from '../services/InventoryService';

export class InventorySlotView {
    private container: GameObjects.Container;
    private slotImage: GameObjects.Image;
    private selectorImage: GameObjects.Image;
    private itemImage: GameObjects.Image;
    private quantityText: GameObjects.Text;
    private hitSize: number;

    constructor(scene: Scene, x: number, y: number, scale: number, onClick: () => void) {
        this.hitSize = 20 * scale;
        this.container = scene.add.container(x, y).setScrollFactor(0);
        this.slotImage = scene.add.image(0, 0, 'inventorySlot', 0).setScale(scale);
        this.selectorImage = scene.add.image(0, 0, 'hotbarSelector').setScale(scale).setVisible(false);
        this.itemImage = scene.add.image(0, 0, 'inventorySlot', 0).setScale(scale).setVisible(false);
        this.quantityText = scene.add.text(17 * scale, 15 * scale, '', {
            fontFamily: 'Arial',
            fontSize: `${9 * scale}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'right'
        }).setOrigin(1, 1);

        this.slotImage.setInteractive({ useHandCursor: true });
        this.slotImage.on('pointerdown', onClick);

        this.container.add([this.slotImage, this.itemImage, this.selectorImage, this.quantityText]);
    }

    setDepth(depth: number): void {
        this.container.setDepth(depth);
    }

    setVisible(isVisible: boolean): void {
        this.container.setVisible(isVisible);
    }

    containsPoint(x: number, y: number): boolean {
        if (!this.container.visible) {
            return false;
        }

        const halfSize = this.hitSize / 2;
        const left = this.container.x - halfSize;
        const right = this.container.x + halfSize;
        const top = this.container.y - halfSize;
        const bottom = this.container.y + halfSize;

        return x >= left && x <= right && y >= top && y <= bottom;
    }

    refresh(slot: InventorySlot, isSelected: boolean): void {
        this.selectorImage.setVisible(isSelected);

        if (slot.itemId === null) {
            this.itemImage.setVisible(false);
            this.quantityText.setVisible(false);
            return;
        }

        const item = getItemById(slot.itemId);

        this.itemImage.setTexture(item.textureKey);
        this.itemImage.setVisible(true);
        this.quantityText.setText(String(slot.quantity));
        this.quantityText.setVisible(slot.quantity > 1);
    }
}
