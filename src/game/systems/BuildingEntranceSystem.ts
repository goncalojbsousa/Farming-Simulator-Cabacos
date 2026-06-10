import { Geom, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';
import { InventoryService } from '../services/InventoryService';
import { translate, TranslationKey } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { InteractionPrompt } from '../ui/InteractionPrompt';

type BuildingEntrance = {
    zone: Geom.Rectangle;
    scene: string;
    messageKey: TranslationKey;
};

const buildings = [
    ['player_house_door', 'HouseInterior', 'enterHouse'],
    ['player_crop_market_door', 'CropMarket', 'enterMarket'],
    ['player_seed_shop_door', 'SeedShop', 'enterSeedShop'],
    ['player_town_hall_door', 'TownHall', 'enterTownHall']
] as const;

export class BuildingEntranceSystem {
    private entrances: BuildingEntrance[] = [];
    private prompt: InteractionPrompt;

    constructor(
        private scene: Scene,
        map: Phaser.Tilemaps.Tilemap,
        private player: Player,
        private inventory: InventoryService,
        private money: MoneyService
    ) {
        const objects = map.getObjectLayer('Interactions')?.objects ?? [];

        for (const [objectName, scene, messageKey] of buildings) {
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
                    messageKey
                });
            }
        }

        this.prompt = new InteractionPrompt(scene);
        this.prompt.setScrollFactor(0);

        this.layout();
    }

    update(input: GameInput): void {
        const entrance = this.getCurrentEntrance();

        if (entrance) {
            this.prompt.show(translate(entrance.messageKey));
        } else {
            this.prompt.hide();
        }

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
        return [this.prompt.getGameObject()];
    }

    private getCurrentEntrance(): BuildingEntrance | undefined {
        const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;

        return this.entrances.find((entrance) =>
            entrance.zone.contains(body.center.x, body.center.y)
        );
    }
}
