import { Geom, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';

type BuildingEntrance = {
    zone: Geom.Rectangle;
    scene: string;
    message: string;
};

const buildings = [
    ['player_house_door', 'HouseInterior', 'E - Entrar em casa'],
    ['player_crop_market_door', 'CropMarket', 'E - Entrar no mercado'],
    ['player_seed_shop_door', 'SeedShop', 'E - Entrar na loja'],
    ['player_town_hall_door', 'TownHall', 'E - Entrar na camara']
] as const;

export class BuildingEntranceSystem {
    private entrances: BuildingEntrance[] = [];
    private prompt: Phaser.GameObjects.Text;

    constructor(
        private scene: Scene,
        map: Phaser.Tilemaps.Tilemap,
        private player: Player,
        private inventory: InventoryService,
        private money: MoneyService
    ) {
        const objects = map.getObjectLayer('Interactions')?.objects ?? [];

        for (const [objectName, scene, message] of buildings) {
            const object = objects.find((object) => object.name === objectName);

            if (object) {
                this.entrances.push({
                    zone: new Geom.Rectangle(
                        object.x,
                        object.y,
                        object.width ?? 0,
                        object.height ?? 0
                    ),
                    scene,
                    message
                });
            }
        }

        this.prompt = scene.add.text(0, 0, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1000)
            .setVisible(false);

        this.layout();
    }

    update(input: GameInput): void {
        const entrance = this.getCurrentEntrance();

        this.prompt
            .setText(entrance?.message ?? '')
            .setVisible(entrance !== undefined);

        if (entrance && input.interactPressed()) {
            this.scene.scene.sleep('Game');
            this.scene.scene.launch(entrance.scene, {
                inventory: this.inventory,
                money: this.money
            });
        }
    }

    layout(): void {
        this.prompt.setPosition(
            this.scene.scale.width / 2,
            this.scene.scale.height - 120
        );
    }

    getUiObjects(): Phaser.GameObjects.GameObject[] {
        return [this.prompt];
    }

    private getCurrentEntrance(): BuildingEntrance | undefined {
        const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;

        return this.entrances.find((entrance) =>
            entrance.zone.contains(body.center.x, body.center.y)
        );
    }
}
