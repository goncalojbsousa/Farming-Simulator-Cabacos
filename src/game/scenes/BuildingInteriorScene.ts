import { Geom, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';

type InteriorConfig = {
    sceneKey: string;
    mapKey: string;
    imageKey: string;
    exitObjectName: string;
};

export class BuildingInteriorScene extends Scene {
    protected gameInput: GameInput;
    protected player: Player;
    protected map: Phaser.Tilemaps.Tilemap;
    protected worldObjects: Phaser.GameObjects.GameObject[] = [];

    private exitZone: Geom.Rectangle;
    private exitPrompt: Phaser.GameObjects.Text;
    private uiCamera?: Phaser.Cameras.Scene2D.Camera;

    constructor(private config: InteriorConfig) {
        super(config.sceneKey);
    }

    create(): void {
        this.map = this.make.tilemap({ key: this.config.mapKey });
        this.worldObjects = [];

        const background = this.add.image(0, 0, this.config.imageKey).setOrigin(0);
        this.worldObjects.push(background);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.player = new Player(this, 192, 238);
        this.player.sprite.setScale(1.5).setDepth(10);
        this.worldObjects.push(this.player.sprite);

        const walls = this.createWalls();
        this.physics.add.collider(this.player.sprite, walls);

        this.exitZone = this.getInteractionZone(this.config.exitObjectName);
        this.exitPrompt = this.createPrompt(this.exitZone, 'E - Sair');

        this.cameras.main.setZoom(2).setBackgroundColor('#15151f');
        this.centerCamera();

        this.gameInput = new GameInput(this);
        this.scale.on('resize', this.resizeScene, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resizeScene, this);
        });
    }

    update(): void {
        this.gameInput.update();
        this.player.update(this.gameInput);

        const canExit = this.isPlayerInside(this.exitZone) && !this.interactionIsBlocked();
        this.exitPrompt.setVisible(canExit);

        if (canExit && this.gameInput.interactPressed()) {
            this.scene.stop();
            this.scene.wake('Game');
        }
    }

    protected getInteractionZone(objectName: string): Geom.Rectangle {
        const object = this.map.getObjectLayer('Interactions')!.objects
            .find((object) => object.name?.trim() === objectName)!;

        return new Geom.Rectangle(
            object.x,
            object.y,
            object.width!,
            object.height!
        );
    }

    protected createPrompt(zone: Geom.Rectangle, message: string): Phaser.GameObjects.Text {
        const prompt = this.add.text(zone.centerX, zone.y - 6, message, {
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

        this.worldObjects.push(prompt);
        return prompt;
    }

    protected isPlayerInside(zone: Geom.Rectangle): boolean {
        const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;

        return zone.contains(body.center.x, body.center.y);
    }

    protected interactionIsBlocked(): boolean {
        return false;
    }

    protected setupUi(uiObjects: Phaser.GameObjects.GameObject[]): void {
        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.ignore(this.worldObjects);
        this.cameras.main.ignore(uiObjects);
    }

    protected layoutUi(): void {}

    private createWalls(): Phaser.Physics.Arcade.StaticGroup {
        const walls = this.physics.add.staticGroup();
        const objects = this.map.getObjectLayer('Collision')?.objects ?? [];

        for (const object of objects) {
            const wall = this.add.rectangle(
                object.x! + object.width! / 2,
                object.y! + object.height! / 2,
                object.width,
                object.height
            ).setVisible(false);

            this.physics.add.existing(wall, true);
            walls.add(wall);
            this.worldObjects.push(wall);
        }

        return walls;
    }

    private resizeScene(): void {
        this.centerCamera();
        this.uiCamera?.setViewport(0, 0, this.scale.width, this.scale.height);
        this.layoutUi();
    }

    private centerCamera(): void {
        this.cameras.main
            .setViewport(0, 0, this.scale.width, this.scale.height)
            .centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);
    }
}
