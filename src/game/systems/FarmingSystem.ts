import {
    CropId,
    CropStage,
    getCropTextureKey,
    getItemById,
    SeedItem
} from '../data/ItemData';
import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';
import { EnergyService } from '../services/EnergyService';
import { InventoryService } from '../services/InventoryService';

const tillEnergyCost = 2;
const plantEnergyCost = 1;
const harvestEnergyCost = 2;
const tilledSoilDuration = 2;

type FarmingConfig = {
    scene: Phaser.Scene;
    worldCamera: Phaser.Cameras.Scene2D.Camera;
    uiCamera: Phaser.Cameras.Scene2D.Camera;
    player: Player;
    inventory: InventoryService;
    energy: EnergyService;
    farmLayer: Phaser.Tilemaps.TilemapLayer;
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

type TilledSoil = {
    image: Phaser.GameObjects.Image;
    tilledDay: number;
};

export class FarmingSystem {
    private tilledTiles = new Map<string, TilledSoil>();
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

        this.clearExpiredTilledTiles(currentDay);
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

        if (selectedSlot.itemId === 'hoe') {
            if (!this.game.energy.hasEnergy(tillEnergyCost)) {
                return;
            }

            this.tillTile(tile, currentDay);
            this.game.energy.spend(tillEnergyCost);
            this.game.refreshInventory();
            return;
        }

        if (selectedSlot.itemId === 'sickle') {
            if (!this.game.energy.hasEnergy(harvestEnergyCost)) {
                return;
            }

            this.harvestCrop(tile);
            return;
        }

        if (!this.game.energy.hasEnergy(plantEnergyCost)) {
            return;
        }

        const seed = getItemById(selectedSlot.itemId!) as SeedItem;
        this.plantSeed(tile, seed, currentDay);
    }

    private tillTile(tile: Phaser.Tilemaps.Tile, currentDay: number): void {
        const soil = this.game.scene.add.image(tile.getCenterX(), tile.getCenterY(), 'soil')
            .setDisplaySize(tile.width, tile.height)
            .setDepth(9);

        this.game.worldObjects.push(soil);
        this.game.uiCamera.ignore(soil);
        this.tilledTiles.set(`${tile.x},${tile.y}`, {
            image: soil,
            tilledDay: currentDay
        });
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
            tileKey: `${tile.x},${tile.y}`,
            cropId: seed.cropId,
            stageGrowthDays: seed.stageGrowthDays,
            stageStartedDay: currentDay,
            stage: 1,
        });
        this.game.energy.spend(plantEnergyCost);
        this.game.refreshInventory();
    }

    private harvestCrop(tile: Phaser.Tilemaps.Tile): void {
        const tileKey = `${tile.x},${tile.y}`;
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
        this.clearTilledTile(tileKey);
        this.game.energy.spend(harvestEnergyCost);
        this.game.refreshInventory();
    }

    private clearExpiredTilledTiles(currentDay: number): void {
        for (const [tileKey, soil] of this.tilledTiles) {
            const isEmpty = !this.plantedTiles.has(tileKey);

            if (isEmpty && currentDay - soil.tilledDay >= tilledSoilDuration) {
                this.clearTilledTile(tileKey);
            }
        }
    }

    private clearTilledTile(tileKey: string): void {
        const soil = this.tilledTiles.get(tileKey);

        if (!soil) {
            return;
        }

        soil.image.destroy();
        this.tilledTiles.delete(tileKey);
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

}
