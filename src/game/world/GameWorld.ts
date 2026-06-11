import { Scene } from 'phaser';
import { Player } from '../objects/Player';

const playerSpawnX = 672;
const playerSpawnY = 496;

export class GameWorld {
    readonly camera: Phaser.Cameras.Scene2D.Camera;
    readonly map: Phaser.Tilemaps.Tilemap;
    readonly player: Player;
    readonly farmLayer: Phaser.Tilemaps.TilemapLayer;
    readonly worldObjects: Phaser.GameObjects.GameObject[] = [];

    constructor(private scene: Scene) {
        this.camera = scene.cameras.main;
        this.map = scene.make.tilemap({ key: 'tilemap' });

        const tilesets = this.map.tilesets.map((tileset) =>
            this.map.addTilesetImage(tileset.name, tileset.name)!
        );

        let farmLayer!: Phaser.Tilemaps.TilemapLayer;

        for (const layerData of this.map.layers) {
            if (layerData.name === 'Collision') {
                continue;
            }

            const layer = this.map.createLayer(layerData.name, tilesets, 0, 0)!;
            const depthProperty = layerData.properties?.find(
                (property: { name?: string }) => property.name === 'gamemaker_depth'
            );

            if (depthProperty) {
                layer.setDepth(-(depthProperty as { value: number }).value);
            }

            if (layerData.name === 'farm') {
                farmLayer = layer;
            }

            this.worldObjects.push(layer);
        }

        this.farmLayer = farmLayer;

        const collisionLayer = this.map.createLayer('Collision', tilesets, 0, 0)!;
        collisionLayer.setCollisionByExclusion([-1]).setAlpha(0);
        this.worldObjects.push(collisionLayer);

        this.player = new Player(scene, playerSpawnX, playerSpawnY);
        this.player.sprite.setDepth(10);
        this.worldObjects.push(this.player.sprite);
        scene.physics.add.collider(this.player.sprite, collisionLayer);

        this.camera.setZoom(2);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    }

    resize(): void {
        this.camera.setViewport(0, 0, this.scene.scale.width, this.scene.scale.height);
    }

    movePlayerToSpawn(): void {
        this.player.sprite.setPosition(playerSpawnX, playerSpawnY).setVelocity(0);
    }
}
