import { Player } from '../objects/Player';
import { getCropTextureKey, getItemById, SeedItem } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';

type FarmingSystemConfig = {
    scene: Phaser.Scene;
    worldCamera: Phaser.Cameras.Scene2D.Camera;
    uiCamera: Phaser.Cameras.Scene2D.Camera;
    player: Player;
    inventory: InventoryService;
    farmLayer: Phaser.Tilemaps.TilemapLayer | null;
    worldCameraObjects: Phaser.GameObjects.GameObject[];
    isPointerOverUi: (pointer: Phaser.Input.Pointer) => boolean;
    onInventoryChanged: () => void;
};

const shovelToolItemId = 'shovel';
const farmInteractionDepth = 9;
const cropOffsetY = -4;

export class FarmingSystem {
    private scene: Phaser.Scene;
    private worldCamera: Phaser.Cameras.Scene2D.Camera;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;
    private player: Player;
    private inventory: InventoryService;
    private farmLayer: Phaser.Tilemaps.TilemapLayer | null;
    private worldCameraObjects: Phaser.GameObjects.GameObject[];
    private isPointerOverUi: (pointer: Phaser.Input.Pointer) => boolean;
    private onInventoryChanged: () => void;
    private tileHighlight: Phaser.GameObjects.Graphics;
    private tilledTileKeys = new Set<string>();
    private plantedTileKeys = new Set<string>();

    constructor(config: FarmingSystemConfig) {
        this.scene = config.scene;
        this.worldCamera = config.worldCamera;
        this.uiCamera = config.uiCamera;
        this.player = config.player;
        this.inventory = config.inventory;
        this.farmLayer = config.farmLayer;
        this.worldCameraObjects = config.worldCameraObjects;
        this.isPointerOverUi = config.isPointerOverUi;
        this.onInventoryChanged = config.onInventoryChanged;

        this.tileHighlight = this.scene.add.graphics();
        this.tileHighlight.setDepth(farmInteractionDepth);
        this.tileHighlight.setVisible(false);
        this.worldCameraObjects.push(this.tileHighlight);
        this.uiCamera.ignore(this.tileHighlight);

        this.setupMouseControls();
    }

    update(pointer: Phaser.Input.Pointer): void {
        this.updateTileHighlight(pointer);
    }

    private setupMouseControls(): void {
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.isPointerOverUi(pointer)) {
                return;
            }

            this.interactWithTileAtPointer(pointer);
        });
    }

    private interactWithTileAtPointer(pointer: Phaser.Input.Pointer): void {
        const tile = this.getFarmTileAtPointer(pointer);

        if (tile === null) {
            return;
        }

        if (this.isShovelSelected()) {
            this.tillTile(tile);
            return;
        }

        const seed = this.getSelectedSeed();

        if (seed !== null) {
            this.plantSeed(tile, seed);
        }
    }

    private tillTile(tile: Phaser.Tilemaps.Tile): void {
        const tileKey = this.getTileKey(tile.x, tile.y);

        if (this.tilledTileKeys.has(tileKey)) {
            return;
        }

        const soil = this.scene.add.image(
            tile.getCenterX(),
            tile.getCenterY(),
            'soil'
        );

        soil.setDisplaySize(tile.width, tile.height);
        soil.setDepth(farmInteractionDepth);

        this.worldCameraObjects.push(soil);
        this.uiCamera.ignore(soil);
        this.tilledTileKeys.add(tileKey);
    }

    private plantSeed(tile: Phaser.Tilemaps.Tile, seed: SeedItem): void {
        const tileKey = this.getTileKey(tile.x, tile.y);

        if (!this.tilledTileKeys.has(tileKey) || this.plantedTileKeys.has(tileKey)) {
            return;
        }

        const selectedSlotIndex = this.inventory.getSelectedSlotIndex();

        if (!this.inventory.removeFromSlot(selectedSlotIndex, 1)) {
            return;
        }

        const crop = this.scene.add.image(
            tile.getCenterX(),
            tile.getCenterY() + cropOffsetY,
            getCropTextureKey(seed.cropId, 1)
        );

        crop.setDepth(farmInteractionDepth);
        this.worldCameraObjects.push(crop);
        this.uiCamera.ignore(crop);
        this.plantedTileKeys.add(tileKey);
        this.onInventoryChanged();
    }

    private updateTileHighlight(pointer: Phaser.Input.Pointer): void {
        this.tileHighlight.clear();

        const tile = this.getFarmTileAtPointer(pointer);

        if (tile === null) {
            this.tileHighlight.setVisible(false);
            return;
        }

        this.tileHighlight.setVisible(true);
        this.tileHighlight.lineStyle(2, 0xffffff, 0.9);
        this.tileHighlight.fillStyle(0xffffff, 0.2);
        this.tileHighlight.fillRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
        this.tileHighlight.strokeRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
    }

    private getFarmTileAtPointer(pointer: Phaser.Input.Pointer): Phaser.Tilemaps.Tile | null {
        if (this.farmLayer === null) {
            return null;
        }

        const worldPoint = pointer.positionToCamera(this.worldCamera) as Phaser.Math.Vector2;
        const tile = this.farmLayer.getTileAtWorldXY(worldPoint.x, worldPoint.y);

        if (tile === null || tile.index === -1) {
            return null;
        }

        if (!this.isTileWithinPlayerReach(tile)) {
            return null;
        }

        if (!this.canInteractWithTile(tile)) {
            return null;
        }

        return tile;
    }

    private canInteractWithTile(tile: Phaser.Tilemaps.Tile): boolean {
        const tileKey = this.getTileKey(tile.x, tile.y);

        if (this.isShovelSelected()) {
            return !this.tilledTileKeys.has(tileKey);
        }

        return this.getSelectedSeed() !== null
            && this.tilledTileKeys.has(tileKey)
            && !this.plantedTileKeys.has(tileKey);
    }

    private isShovelSelected(): boolean {
        const selectedSlot = this.inventory.getSlot(this.inventory.getSelectedSlotIndex());

        return selectedSlot?.itemId === shovelToolItemId;
    }

    private getSelectedSeed(): SeedItem | null {
        const selectedSlot = this.inventory.getSlot(this.inventory.getSelectedSlotIndex());

        if (selectedSlot === null || selectedSlot.itemId === null) {
            return null;
        }

        const item = getItemById(selectedSlot.itemId);

        return item.type === 'seed' ? item : null;
    }

    private isTileWithinPlayerReach(tile: Phaser.Tilemaps.Tile): boolean {
        if (this.farmLayer === null) {
            return false;
        }

        const playerTileX = this.farmLayer.worldToTileX(this.player.sprite.x);
        const playerTileY = this.farmLayer.worldToTileY(this.player.sprite.y);

        if (playerTileX === null || playerTileY === null) {
            return false;
        }

        const distanceX = Math.abs(tile.x - playerTileX);
        const distanceY = Math.abs(tile.y - playerTileY);

        // Allows interaction with the player's tile and the 8 surrounding tiles.
        return distanceX <= 1 && distanceY <= 1;
    }

    private getTileKey(tileX: number, tileY: number): string {
        return `${tileX},${tileY}`;
    }
}
