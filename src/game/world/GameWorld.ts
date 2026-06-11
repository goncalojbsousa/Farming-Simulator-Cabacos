import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { FarmId, LandOwnershipService } from '../services/LandOwnershipService';

export class GameWorld {
    readonly camera: Phaser.Cameras.Scene2D.Camera;
    readonly map: Phaser.Tilemaps.Tilemap;
    readonly player: Player;
    readonly farmLayersById = new Map<FarmId, Phaser.Tilemaps.TilemapLayer>();
    readonly worldObjects: Phaser.GameObjects.GameObject[] = [];

    private farm2PurchaseSignLayer?: Phaser.Tilemaps.TilemapLayer;
    private farm2CollisionCollider?: Phaser.Physics.Arcade.Collider;

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

            if (layerData.name === 'farm' || layerData.name === 'farm2') {
                this.farmLayersById.set(layerData.name, layer);
            }

            if (layerData.name === 'buy_farm2') {
                this.farm2PurchaseSignLayer = layer;
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

        const farm2CollisionLayer = this.createOptionalCollisionLayer(
            'buy_farm2_collision',
            tilesets
        );

        this.player = new Player(scene, 672, 496);
        this.player.sprite.setDepth(10);
        this.worldObjects.push(this.player.sprite);
        scene.physics.add.collider(this.player.sprite, collisionLayer);

        if (farm2CollisionLayer) {
            this.farm2CollisionCollider = scene.physics.add.collider(
                this.player.sprite,
                farm2CollisionLayer
            );
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
        const secondFarmLayer = this.farmLayersById.get('farm2');

        if (mainFarmLayer) {
            farmLayers.push(mainFarmLayer);
        }

        if (secondFarmLayer && this.landOwnership.isFarmOwned('farm2')) {
            farmLayers.push(secondFarmLayer);
        }

        return farmLayers;
    }

    applyLandOwnership(): void {
        const isFarm2Owned = this.landOwnership.isFarmOwned('farm2');

        this.farm2PurchaseSignLayer?.setVisible(!isFarm2Owned);

        if (isFarm2Owned && this.farm2CollisionCollider) {
            this.farm2CollisionCollider.destroy();
            this.farm2CollisionCollider = undefined;
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
        return layerName === 'Collision' || layerName === 'buy_farm2_collision';
    }
}
