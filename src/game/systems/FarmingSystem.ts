import {
    CropId,
    CropStage,
    getCropTextureKey,
    getItemById,
    SeedItem
} from '../data/ItemData';
import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';
import { InventoryService } from '../services/InventoryService';

type FarmingConfig = {
    scene: Phaser.Scene;
    worldCamera: Phaser.Cameras.Scene2D.Camera;
    uiCamera: Phaser.Cameras.Scene2D.Camera;
    player: Player;
    inventory: InventoryService;
    farmLayer: Phaser.Tilemaps.TilemapLayer;
    worldObjects: Phaser.GameObjects.GameObject[];
    isPointerOverUi: (pointer: Phaser.Input.Pointer) => boolean;
    refreshInventory: () => void;
};

type PlantedCrop = {
    image: Phaser.GameObjects.Image;
    cropId: CropId;
    growthDays: number;
    plantedDay: number;
    stage: CropStage;
};

export class FarmingSystem {
    private tilledTiles = new Set<string>();
    private plantedTiles = new Set<string>();
    private crops: PlantedCrop[] = [];
    private tileHighlight: Phaser.GameObjects.Graphics;

    constructor(private game: FarmingConfig) {
        this.tileHighlight = game.scene.add.graphics().setDepth(9);
        game.worldObjects.push(this.tileHighlight);
        game.uiCamera.ignore(this.tileHighlight);

    }

    update(input: GameInput, currentDay: number): void {
        const pointer = input.pointer;

        this.growCrops(currentDay);

        if (input.mousePressed && !this.game.isPointerOverUi(pointer)) {
            this.useSelectedItem(pointer, currentDay);
        }

        const tile = this.getTile(pointer);

        this.tileHighlight.clear();

        if (!tile || !this.canUseSelectedItem(tile)) {
            return;
        }

        this.tileHighlight
            .lineStyle(2, 0xffffff)
            .fillStyle(0xffffff, 0.2)
            .fillRect(tile.pixelX, tile.pixelY, tile.width, tile.height)
            .strokeRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
    }

    private useSelectedItem(pointer: Phaser.Input.Pointer, currentDay: number): void {
        const tile = this.getTile(pointer);

        if (!tile || !this.canUseSelectedItem(tile)) {
            return;
        }

        const selectedSlot = this.game.inventory.slots[
            this.game.inventory.selectedSlotIndex
        ];

        if (selectedSlot.itemId === 'shovel') {
            this.tillTile(tile);
            return;
        }

        const seed = getItemById(selectedSlot.itemId!) as SeedItem;
        this.plantSeed(tile, seed, currentDay);
    }

    private tillTile(tile: Phaser.Tilemaps.Tile): void {
        const soil = this.game.scene.add.image(tile.getCenterX(), tile.getCenterY(), 'soil')
            .setDisplaySize(tile.width, tile.height)
            .setDepth(9);

        this.game.worldObjects.push(soil);
        this.game.uiCamera.ignore(soil);
        this.tilledTiles.add(`${tile.x},${tile.y}`);
    }

    private plantSeed(tile: Phaser.Tilemaps.Tile, seed: SeedItem, currentDay: number): void {
        const selectedSlot = this.game.inventory.selectedSlotIndex;
        this.game.inventory.removeOneFromSlot(selectedSlot);

        const crop = this.game.scene.add.image(
            tile.getCenterX(),
            tile.getCenterY() - 4,
            getCropTextureKey(seed.cropId, 1)
        ).setDepth(9);

        this.game.worldObjects.push(crop);
        this.game.uiCamera.ignore(crop);
        this.plantedTiles.add(`${tile.x},${tile.y}`);
        this.crops.push({
            image: crop,
            cropId: seed.cropId,
            growthDays: seed.growthDays,
            plantedDay: currentDay,
            stage: 1,
        });
        this.game.refreshInventory();
    }

    private growCrops(currentDay: number): void {
        for (const crop of this.crops) {
            const daysGrowing = currentDay - crop.plantedDay;
            const newStage = Math.min(
                4,
                Math.floor(daysGrowing * 3 / crop.growthDays) + 1
            );

            if (newStage !== crop.stage) {
                crop.stage = newStage;
                crop.image.setTexture(getCropTextureKey(crop.cropId, crop.stage));
            }
        }
    }

    private getTile(pointer: Phaser.Input.Pointer): Phaser.Tilemaps.Tile | null {
        const position = pointer.positionToCamera(this.game.worldCamera) as Phaser.Math.Vector2;
        const tile = this.game.farmLayer.getTileAtWorldXY(position.x, position.y);

        if (!tile) {
            return null;
        }

        const player = this.game.player.sprite;
        const playerTileX = this.game.farmLayer.worldToTileX(player.x)!;
        const playerTileY = this.game.farmLayer.worldToTileY(player.y)!;
        const isNearPlayer = Math.abs(tile.x - playerTileX) <= 1
            && Math.abs(tile.y - playerTileY) <= 1;

        return isNearPlayer ? tile : null;
    }

    private canUseSelectedItem(tile: Phaser.Tilemaps.Tile): boolean {
        const itemId = this.game.inventory.slots[
            this.game.inventory.selectedSlotIndex
        ].itemId;
        const key = `${tile.x},${tile.y}`;

        if (itemId === 'shovel') {
            return !this.tilledTiles.has(key);
        }

        const item = itemId ? getItemById(itemId) : null;
        return item?.type === 'seed'
            && this.tilledTiles.has(key)
            && !this.plantedTiles.has(key);
    }

}
