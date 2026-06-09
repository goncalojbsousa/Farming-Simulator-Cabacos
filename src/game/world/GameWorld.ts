import { Scene } from 'phaser';
import { Player } from '../objects/Player';

const cameraZoom = 2;
const playerDepth = 10;

export class GameWorld {
    readonly camera: Phaser.Cameras.Scene2D.Camera;
    readonly player: Player;
    readonly objects: Phaser.GameObjects.GameObject[] = [];
    readonly map: Phaser.Tilemaps.Tilemap;
    readonly farmLayer: Phaser.Tilemaps.TilemapLayer | null;

    constructor(private scene: Scene) {
        this.camera = scene.cameras.main;
        this.map = scene.make.tilemap({ key: 'tilemap' });

        const tilesets = this.createTilesets();
        this.farmLayer = this.createMapLayers(tilesets);
        const collisionLayer = this.createCollisionLayer(tilesets);

        this.player = new Player(scene, 672, 496);
        this.player.sprite.setDepth(playerDepth);
        this.objects.push(this.player.sprite);

        if (collisionLayer) {
            scene.physics.add.collider(this.player.sprite, collisionLayer);
        }

        this.camera.setZoom(cameraZoom);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    }

    resize(): void {
        this.camera.setViewport(0, 0, this.scene.scale.width, this.scene.scale.height);
    }

    private createTilesets(): Phaser.Tilemaps.Tileset[] {
        return this.map.tilesets
            .map((tileset) => this.map.addTilesetImage(tileset.name, tileset.name))
            .filter((tileset): tileset is Phaser.Tilemaps.Tileset => tileset !== null);
    }

    private createMapLayers(tilesets: Phaser.Tilemaps.Tileset[]): Phaser.Tilemaps.TilemapLayer | null {
        let farmLayer: Phaser.Tilemaps.TilemapLayer | null = null;

        for (const layerData of this.map.layers) {
            if (layerData.name === 'Collision') {
                continue;
            }

            const layer = this.map.createLayer(layerData.name, tilesets, 0, 0);

            if (!layer) {
                continue;
            }

            if (layerData.name === 'farm') {
                farmLayer = layer;
            }

            const depth = this.getLayerDepth(layerData);

            if (depth !== null) {
                layer.setDepth(depth);
            }

            this.objects.push(layer);
        }

        return farmLayer;
    }

    private createCollisionLayer(tilesets: Phaser.Tilemaps.Tileset[]): Phaser.Tilemaps.TilemapLayer | null {
        const layer = this.map.createLayer('Collision', tilesets, 0, 0);

        if (layer) {
            layer.setCollisionByExclusion([-1]);
            layer.setAlpha(0);
            this.objects.push(layer);
        }

        return layer;
    }

    private getLayerDepth(layer: Phaser.Tilemaps.LayerData): number | null {
        const properties = Array.isArray(layer.properties)
            ? layer.properties as { name?: string; value?: unknown }[]
            : [];
        const depthProperty = properties.find((property) => property.name === 'gamemaker_depth');

        return typeof depthProperty?.value === 'number' ? -depthProperty.value : null;
    }
}
