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
    worldObjects: Phaser.GameObjects.GameObject[];
    isPointerOverUi: (pointer: Phaser.Input.Pointer) => boolean;
    refreshInventory: () => void;
};

type PlantedCrop = {
    image: Phaser.GameObjects.Image;
    wateredIndicator: Phaser.GameObjects.Container;
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
        this.updateWateredIndicators(currentDay);

        if (input.mousePressed && !this.game.isPointerOverUi(pointer)) {
            this.useSelectedItem(pointer, currentDay);
        }

        const selectedFarmTile = this.getTile(pointer);

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

    private useSelectedItem(pointer: Phaser.Input.Pointer, currentDay: number): void {
        const selectedFarmTile = this.getTile(pointer);

        if (!selectedFarmTile || !this.canUseSelectedItem(selectedFarmTile, currentDay)) {
            return;
        }

        const selectedSlot = this.game.inventory.slots[
            this.game.inventory.selectedSlotIndex
        ];

        if (selectedSlot.itemId === 'hoe') {
            if (!this.game.energy.hasEnergy(tillEnergyCost)) {
                return;
            }

            this.tillTile(selectedFarmTile, currentDay);
            this.game.energy.spend(tillEnergyCost);
            this.game.refreshInventory();
            return;
        }

        if (selectedSlot.itemId === 'sickle') {
            if (!this.game.energy.hasEnergy(harvestEnergyCost)) {
                return;
            }

            this.harvestCrop(selectedFarmTile);
            return;
        }

        if (selectedSlot.itemId === 'wateringCan') {
            if (!this.game.energy.hasEnergy(waterEnergyCost)) {
                return;
            }

            this.waterCrop(selectedFarmTile, currentDay);
            return;
        }

        if (!this.game.energy.hasEnergy(plantEnergyCost)) {
            return;
        }

        const seed = getItemById(selectedSlot.itemId!) as SeedItem;
        this.plantSeed(selectedFarmTile, seed, currentDay);
    }

    private tillTile(selectedFarmTile: SelectedFarmTile, currentDay: number): void {
        const tile = selectedFarmTile.tile;
        const tileKey = this.getTileKey(selectedFarmTile);
        const soil = this.game.scene.add.image(tile.getCenterX(), tile.getCenterY(), 'soil')
            .setDisplaySize(tile.width, tile.height)
            .setDepth(9);

        this.game.worldObjects.push(soil);
        this.game.uiCamera.ignore(soil);
        this.tilledTiles.set(tileKey, {
            image: soil,
            tilledDay: currentDay
        });
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
        const wateredIndicator = this.createWateredIndicator(
            tile.getCenterX(),
            tile.getCenterY()
        );

        this.game.worldObjects.push(crop);
        this.game.worldObjects.push(wateredIndicator);
        this.game.uiCamera.ignore(crop);
        this.game.uiCamera.ignore(wateredIndicator);
        this.plantedTiles.add(tileKey);
        this.crops.push({
            image: crop,
            wateredIndicator,
            tileKey,
            cropId: seed.cropId,
            stageGrowthDays: seed.stageGrowthDays,
            stage: 1,
            wateredDaysInCurrentStage: new Set(),
            lastWateredDay: null
        });
        this.game.energy.spend(plantEnergyCost);
        this.game.refreshInventory();
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
        crop.wateredIndicator.setVisible(true);
        this.game.energy.spend(waterEnergyCost);
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
        crop.wateredIndicator.destroy();
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

            const wateredDaysNeeded = crop.stageGrowthDays[crop.stage - 1];

            if (crop.wateredDaysInCurrentStage.size < wateredDaysNeeded) {
                continue;
            }

            crop.stage++;
            crop.wateredDaysInCurrentStage.clear();
            crop.image.setTexture(getCropTextureKey(crop.cropId, crop.stage));
        }
    }

    private updateWateredIndicators(currentDay: number): void {
        for (const crop of this.crops) {
            crop.wateredIndicator.setVisible(crop.lastWateredDay === currentDay);
        }
    }

    private createWateredIndicator(x: number, y: number): Phaser.GameObjects.Container {
        const wetSoil = this.game.scene.add.ellipse(0, 8, 15, 6, 0x36bff2, 0.42);
        const wetCenter = this.game.scene.add.ellipse(0, 8, 8, 3, 0x9beaff, 0.35);
        const smallShine = this.game.scene.add.circle(4, 6, 1.3, 0xffffff, 0.6);

        return this.game.scene.add.container(x, y, [
            wetSoil,
            wetCenter,
            smallShine
        ]).setDepth(8.8).setVisible(false);
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
