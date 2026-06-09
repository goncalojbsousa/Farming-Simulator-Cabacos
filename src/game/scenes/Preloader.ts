import { Scene } from 'phaser';
import { getAllItems } from '../data/ItemData';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.image(centerX, centerY, 'background').setDisplaySize(this.scale.width, this.scale.height);

        this.add.rectangle(centerX, centerY, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(centerX - 230, centerY, 4, 28, 0xffffff);

        this.load.on('progress', (progress: number) => {
            // The bar starts at 4px wide and grows to match the loader progress.
            bar.width = 4 + (460 * progress);
        });
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');
        this.load.image('hotbarSelector', 'inventory/hotbar_selector.png');
        this.load.spritesheet('inventorySlot', 'inventory/inventorySlot.png', {
            frameWidth: 20,
            frameHeight: 20
        });

        for (const item of getAllItems()) {
            this.load.image(item.id, item.assetPath);
        }

        this.load.tilemapTiledJSON('tilemap', 'tilemap/Cabacos_map.tmj');
        this.load.tilemapTiledJSON('houseInteriorMap', 'tilemap/Casa_player.tmj');
        this.load.image('houseInteriorImage', 'tilemap/house_interior_sunnyside_style_384x288.png');
        this.load.tilemapTiledJSON('cropMarketMap', 'tilemap/Crop_market.tmj');
        this.load.image('cropMarketImage', 'tilemap/crop_market_sunnyside_style_384x288_wide.png');
        this.load.tilemapTiledJSON('seedShopMap', 'tilemap/Seed_shop.tmj');
        this.load.image('seedShopImage', 'tilemap/seed_shop_sunnyside_style_384x288.png');
        this.load.tilemapTiledJSON('townHallMap', 'tilemap/Town_hall.tmj');
        this.load.image('townHallImage', 'tilemap/town_hall_sunnyside_style_384x288.png');
        this.load.image('ts_map', 'tilemap/ts_map.png');
        this.load.image('ts_forest', 'tilemap/ts_forest.png');
        this.load.image('soil', 'plantation/soil.png');

        this.load.spritesheet('idle', 'characters/player/idle/base_waiting_strip9.png', {
            frameWidth: 96,
            frameHeight: 64
        });

        this.load.spritesheet('walk', 'characters/player/walk/base_walk_strip8.png', {
            frameWidth: 96,
            frameHeight: 64
        });
    }

    create() {
        this.scene.start('MainMenu');
    }
}
