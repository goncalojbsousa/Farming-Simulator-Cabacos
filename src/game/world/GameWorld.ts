import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import {
    FarmId,
    farmPurchaseOptions,
    LandOwnershipService
} from '../services/LandOwnershipService';

const playerSpawnX = 672;
const playerSpawnY = 496;

export class GameWorld {
    readonly camera: Phaser.Cameras.Scene2D.Camera;
    readonly map: Phaser.Tilemaps.Tilemap;
    readonly player: Player;
    readonly farmLayersById = new Map<FarmId, Phaser.Tilemaps.TilemapLayer>();
    readonly worldObjects: Phaser.GameObjects.GameObject[] = [];

    private purchaseSignLayersByFarmId = new Map<FarmId, Phaser.Tilemaps.TilemapLayer>();
    private collisionCollidersByFarmId = new Map<FarmId, Phaser.Physics.Arcade.Collider>();

    constructor(
        private scene: Scene,
        private landOwnership: LandOwnershipService
    ) {
        this.camera = scene.cameras.main;
        this.map = scene.make.tilemap({ key: 'tilemap' });

        const tilesets = this.map.tilesets.map((tileset) =>
            this.map.addTilesetImage(tileset.name, tileset.name)!
        );

        // Create all visible map layers and remember special farm layers.
        for (const mapLayerInfo of this.map.layers) {
            const farmIdFromLayerName = mapLayerInfo.name === 'farm'
                || mapLayerInfo.name === 'farm2'
                || mapLayerInfo.name === 'farm3'
                ? mapLayerInfo.name
                : undefined;
            const farmSoldByThisSign = farmPurchaseOptions.find((farmOption) =>
                mapLayerInfo.name === `buy_${farmOption.farmId}`
            );
            const isLockedFarmCollisionLayer = farmPurchaseOptions.some((farmOption) =>
                mapLayerInfo.name === `buy_${farmOption.farmId}_collision`
            );

            if (mapLayerInfo.name === 'Collision' || isLockedFarmCollisionLayer) {
                continue;
            }

            const visibleMapLayer = this.map.createLayer(
                mapLayerInfo.name,
                tilesets,
                0,
                0
            ) as Phaser.Tilemaps.TilemapLayer;
            const tiledDepthProperty = mapLayerInfo.properties?.find(
                (property: { name?: string }) => property.name === 'gamemaker_depth'
            );

            if (tiledDepthProperty) {
                visibleMapLayer.setDepth(-(tiledDepthProperty as { value: number }).value);
            }

            if (farmIdFromLayerName) {
                this.farmLayersById.set(farmIdFromLayerName, visibleMapLayer);
            }

            if (farmSoldByThisSign) {
                this.purchaseSignLayersByFarmId.set(
                    farmSoldByThisSign.farmId,
                    visibleMapLayer
                );
            }

            this.worldObjects.push(visibleMapLayer);
        }

        // Invisible collision layer that blocks normal walls and objects.
        const collisionLayer = this.map.createLayer(
            'Collision',
            tilesets,
            0,
            0
        ) as Phaser.Tilemaps.TilemapLayer;
        collisionLayer.setCollisionByExclusion([-1]).setAlpha(0);
        this.worldObjects.push(collisionLayer);

        this.player = new Player(scene, playerSpawnX, playerSpawnY);
        this.player.sprite.setDepth(10);
        this.worldObjects.push(this.player.sprite);
        scene.physics.add.collider(this.player.sprite, collisionLayer);

        // Extra invisible walls block farm land until the player buys it.
        for (const farmOption of farmPurchaseOptions) {
            const lockedFarmCollisionLayerName = `buy_${farmOption.farmId}_collision`;

            if (this.map.getLayer(lockedFarmCollisionLayerName)) {
                const lockedFarmCollisionLayer = this.map.createLayer(
                    lockedFarmCollisionLayerName,
                    tilesets,
                    0,
                    0
                ) as Phaser.Tilemaps.TilemapLayer;

                lockedFarmCollisionLayer.setCollisionByExclusion([-1]).setAlpha(0);
                this.worldObjects.push(lockedFarmCollisionLayer);
                this.collisionCollidersByFarmId.set(
                    farmOption.farmId,
                    scene.physics.add.collider(this.player.sprite, lockedFarmCollisionLayer)
                );
            }
        }

        this.applyLandOwnership();

        this.camera.setZoom(2);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    }

    resize(): void {
        this.camera.setViewport(0, 0, this.scene.scale.width, this.scene.scale.height);
    }

    getAvailableFarmLayers(): Phaser.Tilemaps.TilemapLayer[] {
        const farmLayers: Phaser.Tilemaps.TilemapLayer[] = [];
        const mainFarmLayer = this.farmLayersById.get('farm');

        if (mainFarmLayer) {
            farmLayers.push(mainFarmLayer);
        }

        for (const farmOption of farmPurchaseOptions) {
            const farmLayer = this.farmLayersById.get(farmOption.farmId);

            if (farmLayer && this.landOwnership.isFarmOwned(farmOption.farmId)) {
                farmLayers.push(farmLayer);
            }
        }

        return farmLayers;
    }

    applyLandOwnership(): void {
        for (const farmOption of farmPurchaseOptions) {
            const isFarmOwned = this.landOwnership.isFarmOwned(farmOption.farmId);
            const purchaseSignLayer = this.purchaseSignLayersByFarmId.get(farmOption.farmId);
            purchaseSignLayer?.setVisible(!isFarmOwned);

            const collisionCollider = this.collisionCollidersByFarmId.get(farmOption.farmId);
            if (isFarmOwned && collisionCollider) {
                collisionCollider.destroy();
                this.collisionCollidersByFarmId.delete(farmOption.farmId);
            }
        }
    }

    movePlayerToSpawn(): void {
        this.player.sprite.setPosition(playerSpawnX, playerSpawnY).setVelocity(0);
    }

    movePlayerToPosition(x: number, y: number): void {
        this.player.sprite.setPosition(x, y).setVelocity(0);
    }
}
