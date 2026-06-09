import { Geom, Scene } from 'phaser';
import { Player } from '../objects/Player';
import type { InventoryService } from '../services/InventoryService';
import type { MoneyService } from '../services/MoneyService';

const cameraZoom = 2;
const playerDepth = 10;
const playerTownHallScale = 1.5;

const playerStartX = 192;
const playerStartY = 238;

const defaultReturnX = 736;
const defaultReturnY = 304;
const townHallExitObjectName = 'player_town_hall_exit';

type TownHallData = {
    returnX?: number;
    returnY?: number;
    inventory?: InventoryService;
    money?: MoneyService;
};

export class TownHall extends Scene {
    player: Player;
    exitZones: Geom.Rectangle[] = [];
    exitText: Phaser.GameObjects.Text;
    returnX = defaultReturnX;
    returnY = defaultReturnY;
    inventory?: InventoryService;
    money?: MoneyService;
    mapWidth = 0;
    mapHeight = 0;

    constructor() {
        super('TownHall');
    }

    init(data: TownHallData = {}) {
        this.returnX = data.returnX ?? defaultReturnX;
        this.returnY = data.returnY ?? defaultReturnY;
        this.inventory = data.inventory;
        this.money = data.money;
    }

    create() {
        const map = this.make.tilemap({ key: 'townHallMap' });
        this.exitZones = [];

        this.add.image(0, 0, 'townHallImage')
            .setOrigin(0)
            .setDepth(0);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        const collisionGroup = this.createCollisionGroup(map);

        this.player = new Player(this, playerStartX, playerStartY);
        this.player.sprite.setDepth(playerDepth);
        this.resizePlayerForTownHall();

        this.physics.add.collider(this.player.sprite, collisionGroup);

        this.loadExitInteractionZones(map);
        this.createExitText();
        this.setupCamera(map);
        this.setupKeys();

        this.scale.on('resize', this.updateCameraPosition, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.updateCameraPosition, this);
        });
    }

    update(_time: number, delta: number) {
        this.player.update(delta);
        this.exitText.setVisible(this.isPlayerInExitZone());
    }

    private createCollisionGroup(map: Phaser.Tilemaps.Tilemap): Phaser.Physics.Arcade.StaticGroup {
        const collisionGroup = this.physics.add.staticGroup();
        const collisionLayer = map.getObjectLayer('Collision');

        for (const object of collisionLayer?.objects ?? []) {
            const width = object.width ?? 0;
            const height = object.height ?? 0;

            if (width <= 0 || height <= 0) {
                continue;
            }

            const collisionObject = this.add.rectangle(
                (object.x ?? 0) + width / 2,
                (object.y ?? 0) + height / 2,
                width,
                height
            );

            this.physics.add.existing(collisionObject, true);
            collisionObject.setVisible(false);
            collisionGroup.add(collisionObject);
        }

        return collisionGroup;
    }

    private resizePlayerForTownHall(): void {
        this.player.sprite.setScale(playerTownHallScale);
        this.player.sprite.setBodySize(8, 8);
        this.player.sprite.setOffset(44, 28);
    }

    private loadExitInteractionZones(map: Phaser.Tilemaps.Tilemap): void {
        const interactionLayer = map.getObjectLayer('Interactions') ?? map.getObjectLayer('interactions');

        for (const tiledObject of interactionLayer?.objects ?? []) {
            const objectName = tiledObject.name?.trim();
            const width = tiledObject.width ?? 0;
            const height = tiledObject.height ?? 0;

            if (objectName !== townHallExitObjectName || width <= 0 || height <= 0) {
                continue;
            }

            this.exitZones.push(new Geom.Rectangle(
                tiledObject.x,
                tiledObject.y,
                width,
                height
            ));
        }
    }

    private createExitText(): void {
        const firstExitZone = this.exitZones[0];
        const textX = Math.round(firstExitZone ? firstExitZone.centerX : playerStartX);
        const textY = Math.round(firstExitZone ? firstExitZone.y - 6 : playerStartY + 2);

        this.exitText = this.add.text(textX, textY, 'E - Sair', {
            fontFamily: 'Arial Black',
            fontSize: 9,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            resolution: 4
        })
            .setOrigin(0.5)
            .setDepth(1000)
            .setVisible(false);
    }

    private setupCamera(map: Phaser.Tilemaps.Tilemap): void {
        this.mapWidth = map.widthInPixels;
        this.mapHeight = map.heightInPixels;

        this.cameras.main.setZoom(cameraZoom);
        this.cameras.main.setBackgroundColor('#15151f');
        this.updateCameraPosition();
    }

    private updateCameraPosition(): void {
        const camera = this.cameras.main;

        camera.setViewport(0, 0, this.scale.width, this.scale.height);
        camera.stopFollow();
        camera.removeBounds();
        camera.centerOn(this.mapWidth / 2, this.mapHeight / 2);
    }

    private setupKeys(): void {
        this.input.keyboard!.on('keydown-E', this.tryExitTownHall, this);

        this.events.once('shutdown', () => {
            this.input.keyboard?.off('keydown-E', this.tryExitTownHall, this);
        });
    }

    private tryExitTownHall(): void {
        if (!this.isPlayerInExitZone()) {
            return;
        }

        this.scene.start('Game', {
            spawnX: this.returnX,
            spawnY: this.returnY,
            inventory: this.inventory,
            money: this.money
        });
    }

    private isPlayerInExitZone(): boolean {
        const playerBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
        const playerRectangle = new Geom.Rectangle(
            playerBody.x,
            playerBody.y,
            playerBody.width,
            playerBody.height
        );

        return this.exitZones.some((zone) =>
            Geom.Intersects.RectangleToRectangle(zone, playerRectangle)
        );
    }
}
