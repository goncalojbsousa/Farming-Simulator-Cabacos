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

        for (const layerData of this.map.layers) {
            if (this.isCollisionLayer(layerData.name)) {
                continue;
            }

            const layer = this.map.createLayer(
                layerData.name,
                tilesets,
                0,
                0
            ) as Phaser.Tilemaps.TilemapLayer;
            const depthProperty = layerData.properties?.find(
                (property: { name?: string }) => property.name === 'gamemaker_depth'
            );

            if (depthProperty) {
                layer.setDepth(-(depthProperty as { value: number }).value);
            }

            const farmId = this.getFarmIdFromLayerName(layerData.name);
            if (farmId) {
                this.farmLayersById.set(farmId, layer);
            }

            const purchaseSignFarmId = this.getFarmIdFromPurchaseSignLayerName(layerData.name);
            if (purchaseSignFarmId) {
                this.purchaseSignLayersByFarmId.set(purchaseSignFarmId, layer);
            }

            this.worldObjects.push(layer);
        }

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

        for (const farmOption of farmPurchaseOptions) {
            const farmCollisionLayer = this.createOptionalCollisionLayer(
                this.getPurchaseCollisionLayerName(farmOption.farmId),
                tilesets
            );

            if (farmCollisionLayer) {
                const collider = scene.physics.add.collider(
                    this.player.sprite,
                    farmCollisionLayer
                );
                this.collisionCollidersByFarmId.set(farmOption.farmId, collider);
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

    private createOptionalCollisionLayer(
        layerName: string,
        tilesets: Phaser.Tilemaps.Tileset[]
    ): Phaser.Tilemaps.TilemapLayer | undefined {
        if (!this.map.getLayer(layerName)) {
            return undefined;
        }

        const collisionLayer = this.map.createLayer(
            layerName,
            tilesets,
            0,
            0
        ) as Phaser.Tilemaps.TilemapLayer;
        collisionLayer.setCollisionByExclusion([-1]).setAlpha(0);
        this.worldObjects.push(collisionLayer);
        return collisionLayer;
    }

    private isCollisionLayer(layerName: string): boolean {
        return layerName === 'Collision'
            || farmPurchaseOptions.some((farmOption) =>
                layerName === this.getPurchaseCollisionLayerName(farmOption.farmId)
            );
    }

    private getFarmIdFromLayerName(layerName: string): FarmId | undefined {
        if (layerName === 'farm') {
            return 'farm';
        }

        return farmPurchaseOptions.find((farmOption) =>
            farmOption.farmId === layerName
        )?.farmId;
    }

    private getFarmIdFromPurchaseSignLayerName(layerName: string): FarmId | undefined {
        return farmPurchaseOptions.find((farmOption) =>
            layerName === this.getPurchaseSignLayerName(farmOption.farmId)
        )?.farmId;
    }

    private getPurchaseSignLayerName(farmId: FarmId): string {
        return `buy_${farmId}`;
    }

    private getPurchaseCollisionLayerName(farmId: FarmId): string {
        return `buy_${farmId}_collision`;
    }

    movePlayerToSpawn(): void {
        this.player.sprite.setPosition(playerSpawnX, playerSpawnY).setVelocity(0);
    }
}
