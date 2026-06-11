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
    getAvailableFarmLayers: () => Phaser.Tilemaps.TilemapLayer[];
    worldObjects: Phaser.GameObjects.GameObject[];
    isPointerOverUi: (pointer: Phaser.Input.Pointer) => boolean;
    refreshInventory: () => void;
};

type PlantedCrop = {
    image: Phaser.GameObjects.Image;
    tileKey: string;
    cropId: CropId;
    stageGrowthDays: readonly number[];
    stageStartedDay: number;
    stage: CropStage;
};

type SelectedFarmTile = {
    tile: Phaser.Tilemaps.Tile;
    layer: Phaser.Tilemaps.TilemapLayer;
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

        const selectedFarmTile = this.getTile(pointer);

        this.tileHighlight.clear();

        if (!selectedFarmTile || !this.canUseSelectedItem(selectedFarmTile)) {
            return;
        }

        const tile = selectedFarmTile.tile;
        this.tileHighlight
            .lineStyle(2, 0xffffff)
            .fillStyle(0xffffff, 0.2)
            .fillRect(tile.pixelX, tile.pixelY, tile.width, tile.height)
            .strokeRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
    }

    private useSelectedItem(pointer: Phaser.Input.Pointer, currentDay: number): void {
        const selectedFarmTile = this.getTile(pointer);

        if (!selectedFarmTile || !this.canUseSelectedItem(selectedFarmTile)) {
            return;
        }

        const selectedSlot = this.game.inventory.slots[
            this.game.inventory.selectedSlotIndex
        ];

        if (selectedSlot.itemId === 'hoe') {
            this.tillTile(selectedFarmTile);
            return;
        }

        if (selectedSlot.itemId === 'sickle') {
            this.harvestCrop(selectedFarmTile);
            return;
        }

        const seed = getItemById(selectedSlot.itemId!) as SeedItem;
        this.plantSeed(selectedFarmTile, seed, currentDay);
    }

    private tillTile(selectedFarmTile: SelectedFarmTile): void {
        const tile = selectedFarmTile.tile;
        const soil = this.game.scene.add.image(tile.getCenterX(), tile.getCenterY(), 'soil')
            .setDisplaySize(tile.width, tile.height)
            .setDepth(9);

        this.game.worldObjects.push(soil);
        this.game.uiCamera.ignore(soil);
        this.tilledTiles.add(this.getTileKey(selectedFarmTile));
    }

    private plantSeed(
        selectedFarmTile: SelectedFarmTile,
        seed: SeedItem,
        currentDay: number
    ): void {
        const tile = selectedFarmTile.tile;
        const tileKey = this.getTileKey(selectedFarmTile);
        const selectedSlot = this.game.inventory.selectedSlotIndex;
        this.game.inventory.removeOneFromSlot(selectedSlot);

        const crop = this.game.scene.add.image(
            tile.getCenterX(),
            tile.getCenterY() - 4,
            getCropTextureKey(seed.cropId, 1)
        ).setDepth(9);

        this.game.worldObjects.push(crop);
        this.game.uiCamera.ignore(crop);
        this.plantedTiles.add(tileKey);
        this.crops.push({
            image: crop,
            tileKey,
            cropId: seed.cropId,
            stageGrowthDays: seed.stageGrowthDays,
            stageStartedDay: currentDay,
            stage: 1,
        });
        this.game.refreshInventory();
    }

    private harvestCrop(selectedFarmTile: SelectedFarmTile): void {
        const tileKey = this.getTileKey(selectedFarmTile);
        const cropIndex = this.crops.findIndex((crop) =>
            crop.tileKey === tileKey && crop.stage === 4
        );

        if (cropIndex === -1) {
            return;
        }

        const crop = this.crops[cropIndex];
        const harvestItemId = `${crop.cropId}Harvest`;

        if (!this.game.inventory.addItem(harvestItemId, 1)) {
            return;
        }

        crop.image.destroy();
        this.crops.splice(cropIndex, 1);
        this.plantedTiles.delete(tileKey);
        this.game.refreshInventory();
    }

    private growCrops(currentDay: number): void {
        for (const crop of this.crops) {
            if (crop.stage === 4) {
                continue;
            }

            const daysInCurrentStage = currentDay - crop.stageStartedDay;
            const daysNeeded = crop.stageGrowthDays[crop.stage - 1];

            if (daysInCurrentStage < daysNeeded) {
                continue;
            }

            crop.stage++;
            crop.stageStartedDay = currentDay;
            crop.image.setTexture(getCropTextureKey(crop.cropId, crop.stage));
        }
    }

    private getTile(pointer: Phaser.Input.Pointer): SelectedFarmTile | null {
        const position = pointer.positionToCamera(this.game.worldCamera) as Phaser.Math.Vector2;

        for (const farmLayer of this.game.getAvailableFarmLayers()) {
            const tile = farmLayer.getTileAtWorldXY(position.x, position.y);

            if (!tile) {
                continue;
            }

            const player = this.game.player.sprite;
            const playerTileX = farmLayer.worldToTileX(player.x)!;
            const playerTileY = farmLayer.worldToTileY(player.y)!;
            const isNearPlayer = Math.abs(tile.x - playerTileX) <= 1
                && Math.abs(tile.y - playerTileY) <= 1;

            if (isNearPlayer) {
                return {
                    tile,
                    layer: farmLayer
                };
            }
        }

        return null;
    }

    private canUseSelectedItem(selectedFarmTile: SelectedFarmTile): boolean {
        const itemId = this.game.inventory.slots[
            this.game.inventory.selectedSlotIndex
        ].itemId;
        const key = this.getTileKey(selectedFarmTile);

        if (itemId === 'hoe') {
            return !this.tilledTiles.has(key);
        }

        if (itemId === 'sickle') {
            return this.crops.some((crop) =>
                crop.tileKey === key && crop.stage === 4
            );
        }

        const item = itemId ? getItemById(itemId) : null;
        return item?.type === 'seed'
            && this.tilledTiles.has(key)
            && !this.plantedTiles.has(key);
    }

    private getTileKey(selectedFarmTile: SelectedFarmTile): string {
        return `${selectedFarmTile.layer.layer.name}:${selectedFarmTile.tile.x},${selectedFarmTile.tile.y}`;
    }

}
