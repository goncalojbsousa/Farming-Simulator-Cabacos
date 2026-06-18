import {
    CropId,
    CropStage,
    getItemById,
    SeedItem
} from '../data/ItemData';
import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';
import { EnergyService } from '../services/EnergyService';
import { InventoryService } from '../services/InventoryService';
import { QuestService } from '../services/QuestService';
import { playSound } from '../services/SoundService';
import { WateringCanService } from '../services/WateringCanService';

const tillEnergyCost = 2;
const plantEnergyCost = 1;
const harvestEnergyCost = 2;
const waterEnergyCost = 1;
const tilledSoilDuration = 2;

type FarmingConfig = {
    scene: Phaser.Scene;
    worldCamera: Phaser.Cameras.Scene2D.Camera;
    uiCamera: Phaser.Cameras.Scene2D.Camera;
    player: Player;
    inventory: InventoryService;
    getAvailableFarmLayers: () => Phaser.Tilemaps.TilemapLayer[];
    energy: EnergyService;
    wateringCan: WateringCanService;
    quests: QuestService;
    worldObjects: Phaser.GameObjects.GameObject[];
    isPointerOverInventory: (pointer: Phaser.Input.Pointer) => boolean;
    refreshInventory: () => void;
    savedState?: SavedFarmingState;
};

type PlantedCrop = {
    image: Phaser.GameObjects.Image;
    statusIndicator: Phaser.GameObjects.Image;
    tileKey: string;
    cropId: CropId;
    stageGrowthDays: readonly number[];
    stage: CropStage;
    wateredDaysInCurrentStage: Set<number>;
    lastWateredDay: number | null;
};

type SelectedFarmTile = {
    tile: Phaser.Tilemaps.Tile;
    layer: Phaser.Tilemaps.TilemapLayer;
};

type TilledSoil = {
    image: Phaser.GameObjects.Image;
    tilledDay: number;
};

export type SavedTilledSoil = {
    layerName: string;
    tileX: number;
    tileY: number;
    tilledDay: number;
};

export type SavedCrop = {
    layerName: string;
    tileX: number;
    tileY: number;
    cropId: CropId;
    stageGrowthDays: readonly number[];
    stage: CropStage;
    wateredDaysInCurrentStage: number[];
    lastWateredDay: number | null;
};

export type SavedFarmingState = {
    tilledSoils: SavedTilledSoil[];
    crops: SavedCrop[];
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
        this.loadSavedState();
    }

    update(input: GameInput, currentDay: number): void {
        const pointer = input.pointer;

        this.clearExpiredTilledTiles(currentDay);
        this.growCrops();
        this.updateCropIndicators(currentDay);

        const selectedFarmTile = this.getTile(pointer);

        if (input.mousePressed && !this.game.isPointerOverInventory(pointer)) {
            this.useSelectedItem(selectedFarmTile, currentDay);
        }

        this.tileHighlight.clear();

        if (!selectedFarmTile || !this.canUseSelectedItem(selectedFarmTile, currentDay)) {
            return;
        }

        const tile = selectedFarmTile.tile;
        this.tileHighlight
            .lineStyle(2, 0xffffff)
            .fillStyle(0xffffff, 0.2)
            .fillRect(tile.pixelX, tile.pixelY, tile.width, tile.height)
            .strokeRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
    }

    getSnapshot(): SavedFarmingState {
        const tilledSoils: SavedTilledSoil[] = [];
        const crops: SavedCrop[] = [];

        for (const [tileKey, soil] of this.tilledTiles) {
            const tilePosition = this.getTilePositionFromKey(tileKey);

            tilledSoils.push({
                ...tilePosition,
                tilledDay: soil.tilledDay
            });
        }

        for (const crop of this.crops) {
            const tilePosition = this.getTilePositionFromKey(crop.tileKey);

            crops.push({
                ...tilePosition,
                cropId: crop.cropId,
                stageGrowthDays: crop.stageGrowthDays,
                stage: crop.stage,
                wateredDaysInCurrentStage: [...crop.wateredDaysInCurrentStage],
                lastWateredDay: crop.lastWateredDay
            });
        }

        return {
            tilledSoils,
            crops
        };
    }

    private useSelectedItem(
        selectedFarmTile: SelectedFarmTile | null,
        currentDay: number
    ): void {
        if (!selectedFarmTile || !this.canUseSelectedItem(selectedFarmTile, currentDay)) {
            return;
        }

        const selectedSlot = this.game.inventory.slots[
            this.game.inventory.selectedSlotIndex
        ];

        if (selectedSlot.itemId === 'hoe') {
            if (!this.game.energy.hasEnergy(tillEnergyCost)) {
                playSound(this.game.scene, 'fail');
                return;
            }

            this.tillTile(selectedFarmTile, currentDay);
            this.game.energy.spend(tillEnergyCost);
            this.game.refreshInventory();
            return;
        }

        if (selectedSlot.itemId === 'sickle') {
            if (!this.game.energy.hasEnergy(harvestEnergyCost)) {
                playSound(this.game.scene, 'fail');
                return;
            }

            this.harvestCrop(selectedFarmTile);
            return;
        }

        if (selectedSlot.itemId === 'wateringCan') {
            if (!this.game.energy.hasEnergy(waterEnergyCost)) {
                playSound(this.game.scene, 'fail');
                return;
            }

            this.waterCrop(selectedFarmTile, currentDay);
            return;
        }

        if (!this.game.energy.hasEnergy(plantEnergyCost)) {
            playSound(this.game.scene, 'fail');
            return;
        }

        const seed = getItemById(selectedSlot.itemId!) as SeedItem;
        this.plantSeed(selectedFarmTile, seed);
    }

    private tillTile(selectedFarmTile: SelectedFarmTile, currentDay: number): void {
        const tile = selectedFarmTile.tile;
        const tileKey = this.getTileKey(selectedFarmTile);
        const soil = this.createSoilImage(tile);

        this.game.worldObjects.push(soil);
        this.game.uiCamera.ignore(soil);
        this.tilledTiles.set(tileKey, {
            image: soil,
            tilledDay: currentDay
        });
        playSound(this.game.scene, 'hoe');
    }

    private plantSeed(
        selectedFarmTile: SelectedFarmTile,
        seed: SeedItem
    ): void {
        const tile = selectedFarmTile.tile;
        const tileKey = this.getTileKey(selectedFarmTile);
        const selectedSlot = this.game.inventory.selectedSlotIndex;
        this.game.inventory.removeOneFromSlot(selectedSlot);

        const crop = this.game.scene.add.image(
            tile.getCenterX(),
            tile.getCenterY() - 4,
            seed.cropId,
            1
        ).setDepth(9);
        const statusIndicator = this.createStatusIndicator(
            tile.getCenterX(),
            tile.getCenterY()
        );

        this.game.worldObjects.push(crop);
        this.game.worldObjects.push(statusIndicator);
        this.game.uiCamera.ignore(crop);
        this.game.uiCamera.ignore(statusIndicator);
        this.plantedTiles.add(tileKey);
        this.crops.push({
            image: crop,
            statusIndicator,
            tileKey,
            cropId: seed.cropId,
            stageGrowthDays: seed.stageGrowthDays,
            stage: 1,
            wateredDaysInCurrentStage: new Set(),
            lastWateredDay: null
        });
        this.game.energy.spend(plantEnergyCost);
        this.game.quests.plantCrop(seed.cropId);
        this.game.refreshInventory();
        playSound(this.game.scene, 'plantSeed');
    }

    private waterCrop(selectedFarmTile: SelectedFarmTile, currentDay: number): void {
        const crop = this.getCropOnTile(selectedFarmTile);

        if (!crop || crop.lastWateredDay === currentDay) {
            return;
        }

        if (!this.game.wateringCan.useWater()) {
            return;
        }

        crop.wateredDaysInCurrentStage.add(currentDay);
        crop.lastWateredDay = currentDay;
        crop.statusIndicator.setVisible(false);
        this.game.energy.spend(waterEnergyCost);
        this.game.quests.waterPlant();
        this.game.refreshInventory();
        playSound(this.game.scene, 'waterPlants');
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

        if (!this.game.inventory.addItem(harvestItemId, 1, true)) {
            playSound(this.game.scene, 'fail');
            return;
        }

        crop.image.destroy();
        crop.statusIndicator.destroy();
        this.crops.splice(cropIndex, 1);
        this.plantedTiles.delete(tileKey);
        this.clearTilledTile(tileKey);
        this.game.energy.spend(harvestEnergyCost);
        this.game.refreshInventory();
        playSound(this.game.scene, 'sickle');
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

    private growCrops(): void {
        for (const crop of this.crops) {
            if (crop.stage === 4) {
                continue;
            }

            const wateredDaysNeeded = crop.stageGrowthDays[crop.stage - 1];

            if (crop.wateredDaysInCurrentStage.size < wateredDaysNeeded) {
                continue;
            }

            crop.stage++;
            crop.wateredDaysInCurrentStage.clear();
            crop.image.setFrame(crop.stage);
        }
    }

    private updateCropIndicators(currentDay: number): void {
        for (const crop of this.crops) {
            if (crop.stage === 4) {
                crop.statusIndicator
                    .setTexture('cropReadyToCollect')
                    .setVisible(true);
                continue;
            }

            crop.statusIndicator
                .setTexture('cropNeedsWater')
                .setVisible(crop.lastWateredDay !== currentDay);
        }
    }

    private createStatusIndicator(x: number, y: number): Phaser.GameObjects.Image {
        return this.game.scene.add.image(x + 5, y - 9, 'cropNeedsWater')
            .setDepth(9.5);
    }

    private createSoilImage(tile: Phaser.Tilemaps.Tile): Phaser.GameObjects.Image {
        return this.game.scene.add.image(tile.getCenterX(), tile.getCenterY(), 'soil')
            .setDisplaySize(tile.width, tile.height)
            .setDepth(9);
    }

    private loadSavedState(): void {
        const savedState = this.game.savedState;

        if (!savedState) {
            return;
        }

        for (const savedSoil of savedState.tilledSoils) {
            const selectedFarmTile = this.getSavedTile(savedSoil);

            if (!selectedFarmTile) {
                continue;
            }

            const tileKey = this.getTileKey(selectedFarmTile);
            const soil = this.createSoilImage(selectedFarmTile.tile);

            this.game.worldObjects.push(soil);
            this.game.uiCamera.ignore(soil);
            this.tilledTiles.set(tileKey, {
                image: soil,
                tilledDay: savedSoil.tilledDay
            });
        }

        for (const savedCrop of savedState.crops) {
            const selectedFarmTile = this.getSavedTile(savedCrop);

            if (!selectedFarmTile) {
                continue;
            }

            const tile = selectedFarmTile.tile;
            const tileKey = this.getTileKey(selectedFarmTile);
            const crop = this.game.scene.add.image(
                tile.getCenterX(),
                tile.getCenterY() - 4,
                savedCrop.cropId,
                savedCrop.stage
            ).setDepth(9);
            const statusIndicator = this.createStatusIndicator(
                tile.getCenterX(),
                tile.getCenterY()
            );

            this.game.worldObjects.push(crop);
            this.game.worldObjects.push(statusIndicator);
            this.game.uiCamera.ignore(crop);
            this.game.uiCamera.ignore(statusIndicator);
            this.plantedTiles.add(tileKey);
            this.crops.push({
                image: crop,
                statusIndicator,
                tileKey,
                cropId: savedCrop.cropId,
                stageGrowthDays: savedCrop.stageGrowthDays,
                stage: savedCrop.stage,
                wateredDaysInCurrentStage: new Set(savedCrop.wateredDaysInCurrentStage),
                lastWateredDay: savedCrop.lastWateredDay
            });
        }
    }

    private getSavedTile(savedTile: SavedTilledSoil | SavedCrop): SelectedFarmTile | null {
        const layer = this.game.getAvailableFarmLayers()
            .find((layer) => layer.layer.name === savedTile.layerName);
        const tile = layer?.getTileAt(savedTile.tileX, savedTile.tileY);

        if (!layer || !tile) {
            return null;
        }

        return {
            tile,
            layer
        };
    }

    private getTilePositionFromKey(tileKey: string): Omit<SavedTilledSoil, 'tilledDay'> {
        const [layerName, position] = tileKey.split(':');
        const [tileX, tileY] = position.split(',').map(Number);

        return {
            layerName,
            tileX,
            tileY
        };
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

    private canUseSelectedItem(selectedFarmTile: SelectedFarmTile, currentDay: number): boolean {
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

        if (itemId === 'wateringCan') {
            const crop = this.getCropOnTile(selectedFarmTile);

            return this.game.wateringCan.getWater() > 0
                && !!crop
                && crop.stage < 4
                && crop.lastWateredDay !== currentDay;
        }

        const item = itemId ? getItemById(itemId) : null;
        return item?.type === 'seed'
            && this.tilledTiles.has(key)
            && !this.plantedTiles.has(key);
    }

    private getCropOnTile(selectedFarmTile: SelectedFarmTile): PlantedCrop | undefined {
        const tileKey = this.getTileKey(selectedFarmTile);

        return this.crops.find((crop) => crop.tileKey === tileKey);
    }

    private getTileKey(selectedFarmTile: SelectedFarmTile): string {
        return `${selectedFarmTile.layer.layer.name}:${selectedFarmTile.tile.x},${selectedFarmTile.tile.y}`;
    }

}
