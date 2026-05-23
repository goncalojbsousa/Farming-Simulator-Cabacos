import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { getStartingItemIds } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { Hotbar } from '../ui/Hotbar';
import { InventoryPanel } from '../ui/InventoryPanel';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    player: Player;
    inventory: InventoryService;
    hotbar: Hotbar;
    inventoryPanel: InventoryPanel;

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;

        // Create tilemap and layers loaded in Preloader
        const map = this.make.tilemap({ key: 'tilemap' });
        const tileset = map.addTilesetImage('tiles1', 'tilesetImage');
        if (tileset) {
            map.createLayer('Tile Layer 1', tileset, 0, 0);
            map.createLayer('Tile Layer 2', tileset, 0, 0);
        }

        this.player = new Player(this, 512, 384);
        this.inventory = new InventoryService(16);
        this.addStartingItems();
        this.hotbar = new Hotbar(this, this.inventory);
        this.inventoryPanel = new InventoryPanel(this, this.inventory, () => this.hotbar.refresh());
        this.setupInventoryKeys();
    }
    update(_time: number, delta: number) {
        this.player.update(delta);
    }

    private addStartingItems(): void {
        for (const itemId of getStartingItemIds()) {
            this.inventory.addItem(itemId, 1);
        }
    }

    private setupInventoryKeys(): void {
        this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
            const slotNumber = Number(event.key);

            if (slotNumber >= 1 && slotNumber <= 8) {
                this.hotbar.selectSlot(slotNumber - 1);
                this.inventoryPanel.refresh();
                return;
            }

            if (event.key.toLowerCase() === 'i') {
                this.inventoryPanel.toggle();
            }
        });
    }
}
