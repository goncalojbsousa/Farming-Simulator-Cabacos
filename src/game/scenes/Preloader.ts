import { Scene } from 'phaser';
import { crops, gameItems } from '../data/ItemData';

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
        this.load.image('mainMenuBackground', 'main_menu_background.png');
        this.load.image('mainMenuLogo', 'logo_quinta_cabacos.png');
        this.load.image('menuBrownDarker', '9slice_menu_brown_darker.png');
        this.load.image('button', 'button.png');
        this.load.image('coin', 'coin.png');
        this.load.image('land', 'land.png');
        this.load.image('light', 'light.png');
        this.load.image('sun', 'sun.png');
        this.load.spritesheet('energyBar', 'energyBar.png', {
            frameWidth: 15,
            frameHeight: 7
        });
        this.load.image('hotbarSelector', 'inventory/hotbar_selector.png');
        this.load.spritesheet('inventorySlot', 'inventory/inventorySlot.png', {
            frameWidth: 20,
            frameHeight: 20
        });

        for (const item of gameItems) {
            if (item.type === 'tool') {
                this.load.image(item.textureKey, item.assetPath);
            }
        }

        for (const crop of crops) {
            this.load.spritesheet(crop.id, `plantation/crops/${crop.id}.png`, {
                frameWidth: crop.frameWidth,
                frameHeight: crop.frameHeight
            });
        }

        this.load.tilemapTiledJSON('tilemap', 'tilemap/Cabacos_map.tmj');
        this.load.tilemapTiledJSON('houseInteriorMap', 'tilemap/Casa_player.tmj');
        this.load.image('houseInteriorImage', 'tilemap/house_interior_sem_fundo.png');
        this.load.tilemapTiledJSON('cropMarketMap', 'tilemap/Crop_market.tmj');
        this.load.image('cropMarketImage', 'tilemap/crop_market_sem_fundo.png');
        this.load.tilemapTiledJSON('seedShopMap', 'tilemap/Seed_shop.tmj');
        this.load.image('seedShopImage', 'tilemap/seed_shop_sunnyside_style_384x288.png');
        this.load.tilemapTiledJSON('toolShopMap', 'tilemap/tool_shop.tmj');
        this.load.image('toolShopImage', 'tilemap/tool_shop_sunnyside_style_384x288.png');
        this.load.tilemapTiledJSON('townHallMap', 'tilemap/Town_hall.tmj');
        this.load.image('townHallImage', 'tilemap/town_hall_sunnyside_style_384x288.png');
        this.load.image('ts_map', 'tilemap/ts_map.png');
        this.load.image('ts_forest', 'tilemap/ts_forest.png');
        this.load.image('soil', 'plantation/soil.png');
        this.load.audio('buyLand', 'sounds/buyLand.mp3');
        this.load.audio('doorOpen', 'sounds/doorOpen.mp3');
        this.load.audio('fail', 'sounds/fail.mp3');
        this.load.audio('faint', 'sounds/faint.mp3');
        this.load.audio('getWater', 'sounds/getWater.mp3');
        this.load.audio('grassyStep', 'sounds/grassyStep.mp3');
        this.load.audio('hoe', 'sounds/hoe.mp3');
        this.load.audio('openMenu', 'sounds/openMenu.mp3');
        this.load.audio('plantSeed', 'sounds/plantSeed.mp3');
        this.load.audio('purchaseClick', 'sounds/purchaseClick.mp3');
        this.load.audio('select', 'sounds/select.mp3');
        this.load.audio('sickle', 'sounds/sickle.mp3');
        this.load.audio('sleep', 'sounds/sleep.mp3');
        this.load.audio('toolSwap', 'sounds/toolSwap.mp3');
        this.load.audio('waterPlants', 'sounds/waterPlants.mp3');

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
        this.textures.get('button').add('trimmed', 0, 12, 0, 24, 13);
        this.scene.start('MainMenu');
    }
}
