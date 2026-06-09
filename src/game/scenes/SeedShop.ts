import { Geom, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { SeedShopPanel } from '../ui/SeedShopPanel';

const cameraZoom = 2;
const playerDepth = 10;
const playerSeedShopScale = 1.5;

const playerStartX = 192;
const playerStartY = 238;

const defaultReturnX = 523;
const defaultReturnY = 384;
const seedShopExitObjectName = 'player_seed_shop_exit';
const seedShopCounterObjectName = 'seed_shop';

type SeedShopData = {
    returnX?: number;
    returnY?: number;
    inventory?: InventoryService;
    money?: MoneyService;
};

export class SeedShop extends Scene {
    uiCamera: Phaser.Cameras.Scene2D.Camera;
    worldCameraObjects: Phaser.GameObjects.GameObject[] = [];
    player: Player;
    gameInput: GameInput;
    exitZones: Geom.Rectangle[] = [];
    shopZones: Geom.Rectangle[] = [];
    exitText: Phaser.GameObjects.Text;
    shopText: Phaser.GameObjects.Text;
    moneyBackground: Phaser.GameObjects.Rectangle;
    moneyText: Phaser.GameObjects.Text;
    seedShopPanel: SeedShopPanel;
    returnX = defaultReturnX;
    returnY = defaultReturnY;
    inventory: InventoryService;
    money: MoneyService;
    mapWidth = 0;
    mapHeight = 0;

    constructor() {
        super('SeedShop');
    }

    init(data: SeedShopData = {}) {
        this.returnX = data.returnX ?? defaultReturnX;
        this.returnY = data.returnY ?? defaultReturnY;
        this.inventory = data.inventory ?? new InventoryService(16);
        this.money = data.money ?? new MoneyService(0);
    }

    create() {
        const map = this.make.tilemap({ key: 'seedShopMap' });
        this.exitZones = [];
        this.shopZones = [];
        this.worldCameraObjects = [];

        const backgroundImage = this.add.image(0, 0, 'seedShopImage')
            .setOrigin(0)
            .setDepth(0);
        this.worldCameraObjects.push(backgroundImage);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        const collisionGroup = this.createCollisionGroup(map);

        this.player = new Player(this, playerStartX, playerStartY);
        this.gameInput = new GameInput(this);
        this.player.sprite.setDepth(playerDepth);
        this.resizePlayerForSeedShop();
        this.worldCameraObjects.push(this.player.sprite);

        this.physics.add.collider(this.player.sprite, collisionGroup);

        this.loadExitInteractionZones(map);
        this.loadShopInteractionZones(map);
        this.createExitText();
        this.createShopText();
        this.createMoneyUi();
        this.createSeedShopPanel();
        this.setupCamera(map);
        this.setupUiCamera();
        this.scale.on('resize', this.handleResize, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });
    }

    update() {
        this.gameInput.update();
        this.player.update(this.gameInput);
        this.updateExitText();
        this.updateShopText();

        if (this.gameInput.shopPressed()) {
            this.tryInteract();
        }

        if (this.gameInput.escapePressed()) {
            this.seedShopPanel.close();
        }
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
            this.worldCameraObjects.push(collisionObject);
        }

        return collisionGroup;
    }

    private resizePlayerForSeedShop(): void {
        this.player.sprite.setScale(playerSeedShopScale);
        this.player.sprite.setBodySize(8, 8);
        this.player.sprite.setOffset(44, 28);
    }

    private loadExitInteractionZones(map: Phaser.Tilemaps.Tilemap): void {
        const interactionLayer = map.getObjectLayer('Interactions') ?? map.getObjectLayer('interactions');

        for (const tiledObject of interactionLayer?.objects ?? []) {
            const objectName = tiledObject.name?.trim();
            const width = tiledObject.width ?? 0;
            const height = tiledObject.height ?? 0;

            if (
                objectName !== seedShopExitObjectName
                && !this.hasTiledProperty(tiledObject, 'action', 'exit_seed_shop')
            ) {
                continue;
            }

            if (width <= 0 || height <= 0) {
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

    private loadShopInteractionZones(map: Phaser.Tilemaps.Tilemap): void {
        const interactionLayer = map.getObjectLayer('Interactions') ?? map.getObjectLayer('interactions');

        for (const tiledObject of interactionLayer?.objects ?? []) {
            const objectName = tiledObject.name?.trim();
            const width = tiledObject.width ?? 0;
            const height = tiledObject.height ?? 0;

            if (width <= 0 || height <= 0) {
                continue;
            }

            if (!this.isSeedShopInteraction(tiledObject, objectName)) {
                continue;
            }

            this.shopZones.push(new Geom.Rectangle(
                tiledObject.x,
                tiledObject.y,
                width,
                height
            ));
        }
    }

    private isSeedShopInteraction(
        tiledObject: Phaser.Types.Tilemaps.TiledObject,
        objectName?: string
    ): boolean {
        if (!this.hasTiledProperty(tiledObject, 'action', 'open_shop')) {
            return false;
        }

        return objectName === seedShopCounterObjectName
            || tiledObject.type === 'shop'
            || this.hasTiledProperty(tiledObject, 'shopType', 'seeds');
    }

    private hasTiledProperty(
        tiledObject: Phaser.Types.Tilemaps.TiledObject,
        propertyName: string,
        expectedValue: string
    ): boolean {
        return tiledObject.properties?.some(
            (property: { name?: string; value?: unknown }) =>
                property.name === propertyName && property.value === expectedValue
        ) ?? false;
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
        this.worldCameraObjects.push(this.exitText);
    }

    private createShopText(): void {
        const firstShopZone = this.shopZones[0];
        const textX = Math.round(firstShopZone ? firstShopZone.centerX : playerStartX);
        const textY = Math.round(firstShopZone ? firstShopZone.y - 6 : playerStartY + 2);

        this.shopText = this.add.text(textX, textY, 'E - Comprar sementes', {
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
        this.worldCameraObjects.push(this.shopText);
    }

    private createMoneyUi(): void {
        this.moneyBackground = this.add.rectangle(16, 16, 158, 36, 0x1f2d24, 0.85)
            .setOrigin(0)
            .setStrokeStyle(2, 0xe2a36f)
            .setScrollFactor(0)
            .setDepth(950);

        this.moneyText = this.add.text(28, 23, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(951);

        this.refreshMoneyUi();
    }

    private createSeedShopPanel(): void {
        this.seedShopPanel = new SeedShopPanel(
            this,
            this.inventory,
            this.money,
            () => this.refreshMoneyUi()
        );
    }

    private refreshMoneyUi(): void {
        this.moneyText.setText(`Dinheiro: ${this.money.getBalance()}`);
    }

    private updateExitText(): void {
        this.exitText.setVisible(
            this.isPlayerInExitZone() && !this.seedShopPanel.isOpen()
        );
    }

    private updateShopText(): void {
        const isInShopZone = this.isPlayerInShopZone();

        this.shopText.setVisible(
            isInShopZone && !this.seedShopPanel.isOpen()
        );

        if (!isInShopZone && this.seedShopPanel.isOpen()) {
            this.seedShopPanel.close();
        }
    }

    private setupCamera(map: Phaser.Tilemaps.Tilemap): void {
        this.mapWidth = map.widthInPixels;
        this.mapHeight = map.heightInPixels;

        this.cameras.main.setZoom(cameraZoom);
        this.cameras.main.setBackgroundColor('#15151f');
        this.updateCameraPosition();
    }

    private setupUiCamera(): void {
        const uiObjects = [
            this.moneyBackground,
            this.moneyText,
            ...this.seedShopPanel.getUiObjects()
        ];

        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.ignore(this.worldCameraObjects);
        this.cameras.main.ignore(uiObjects);
    }

    private handleResize(): void {
        this.updateCameraPosition();
        this.uiCamera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.seedShopPanel.layout();
    }

    private updateCameraPosition(): void {
        const camera = this.cameras.main;

        camera.setViewport(0, 0, this.scale.width, this.scale.height);
        camera.stopFollow();
        camera.removeBounds();
        camera.centerOn(this.mapWidth / 2, this.mapHeight / 2);
    }

    private tryInteract(): void {
        if (this.isPlayerInShopZone()) {
            this.seedShopPanel.toggle();
            return;
        }

        if (this.seedShopPanel.isOpen()) {
            return;
        }

        if (this.isPlayerInExitZone()) {
            this.scene.stop();
            this.scene.wake('Game');
        }
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

    private isPlayerInShopZone(): boolean {
        const playerBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;

        return this.shopZones.some((zone) =>
            zone.contains(playerBody.center.x, playerBody.center.y)
        );
    }
}
