import { Geom, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';
import { EnergyService } from '../services/EnergyService';
import { InventoryService } from '../services/InventoryService';
import { LandOwnershipService } from '../services/LandOwnershipService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { QuestService } from '../services/QuestService';
import { playSound } from '../services/SoundService';
import { TimeService } from '../services/TimeService';
import { GameHud } from '../ui/GameHud';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { ScreenFade } from '../ui/ScreenFade';
import { openPauseMenu } from './PauseMenu';

type InteriorConfig = {
    sceneKey: string;
    mapKey: string;
    imageKey: string;
    exitObjectName: string;
};

type InteriorPanel = {
    container: Phaser.GameObjects.GameObject;
    isOpen(): boolean;
    close(): void;
    toggle(): void;
    layout(): void;
};

export type BuildingInteriorData = {
    inventory: InventoryService;
    money: MoneyService;
    gameTime: TimeService;
    landOwnership: LandOwnershipService;
    energy: EnergyService;
    quests: QuestService;
    onPlayerFaint: () => void;
};

export class BuildingInteriorScene extends Scene {
    protected gameInput: GameInput;
    protected player: Player;
    protected map: Phaser.Tilemaps.Tilemap;
    protected worldObjects: Phaser.GameObjects.GameObject[] = [];
    protected inventory: InventoryService;
    protected money: MoneyService;
    protected gameTime: TimeService;
    protected landOwnership: LandOwnershipService;
    protected energy: EnergyService;
    protected quests: QuestService;
    protected hud: GameHud;
    protected screenFade: ScreenFade;
    protected faintTransitionActive = false;

    private exitZone: Geom.Rectangle;
    private exitPrompt: InteractionPrompt;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;
    private onPlayerFaint: () => void;
    private activePanel?: InteriorPanel;

    constructor(private interiorConfig: InteriorConfig) {
        super(interiorConfig.sceneKey);
    }

    init(data: BuildingInteriorData): void {
        this.inventory = data.inventory;
        this.money = data.money;
        this.gameTime = data.gameTime;
        this.landOwnership = data.landOwnership;
        this.energy = data.energy;
        this.quests = data.quests;
        this.onPlayerFaint = data.onPlayerFaint;
    }

    create(): void {
        this.faintTransitionActive = false;
        this.map = this.make.tilemap({ key: this.interiorConfig.mapKey });
        this.worldObjects = [];

        const background = this.add.image(0, 0, this.interiorConfig.imageKey).setOrigin(0);
        this.worldObjects.push(background);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.player = new Player(this, 192, 238);
        this.player.sprite.setScale(1.5).setDepth(10);
        this.worldObjects.push(this.player.sprite);

        const walls = this.createWalls();
        this.physics.add.collider(this.player.sprite, walls);
        this.createUiCamera();

        this.exitZone = this.getInteractionZone(this.interiorConfig.exitObjectName);
        this.exitPrompt = this.createPrompt(translate('exitBuilding'));
        this.hud = new GameHud(
            this,
            this.inventory,
            this.money,
            this.gameTime,
            this.energy,
            this.quests,
            () => this.isPanelOpen()
        );
        this.cameras.main.ignore(this.hud.uiObjects);
        this.screenFade = new ScreenFade(this);
        this.cameras.main.ignore(this.screenFade.gameObject);

        this.cameras.main.setZoom(2).setBackgroundColor('#15151f');
        this.centerCamera();

        this.gameInput = new GameInput(this);
        this.scale.on('resize', this.resizeScene, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resizeScene, this);
        });
    }

    update(time: number): void {
        this.gameInput.update();

        if (!this.isPanelOpen() && this.gameInput.escapePressed()) {
            openPauseMenu(this);
            return;
        }

        if (this.faintTransitionActive) {
            return;
        }
        this.gameTime.update(time);

        if (this.gameTime.isFaintTime()) {
            this.startFaintTransition();
            return;
        }

        this.player.update(this.gameInput);
        this.hud.update(this.gameInput);

        const canExit = this.isPlayerInside(this.exitZone)
            && !this.isPanelOpen();
        if (canExit) {
            this.exitPrompt.show();
        } else {
            this.exitPrompt.hide();
        }

        if (canExit && this.gameInput.interactPressed()) {
            playSound(this, 'doorOpen');
            this.scene.stop();
            this.scene.wake('Game');
        }
    }

    protected getInteractionZone(objectName: string): Geom.Rectangle {
        const zone = this.getOptionalInteractionZone(objectName);

        if (!zone) {
            throw new Error(`Interaction zone not found: ${objectName}`);
        }

        return zone;
    }

    protected getOptionalInteractionZone(objectName: string): Geom.Rectangle | undefined {
        const object = this.map.getObjectLayer('Interactions')?.objects
            .find((object) => object.name?.trim() === objectName);

        if (!object) {
            return undefined;
        }

        return new Geom.Rectangle(
            object.x,
            object.y,
            object.width!,
            object.height!
        );
    }

    protected createPrompt(message: string): InteractionPrompt {
        const prompt = new InteractionPrompt(this, message);
        prompt.container
            .setScrollFactor(0)
            .setPosition(this.scale.width / 2, this.scale.height - 120);

        this.cameras.main.ignore(prompt.container);
        return prompt;
    }

    protected isPlayerInside(zone: Geom.Rectangle): boolean {
        const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;

        return zone.contains(body.center.x, body.center.y);
    }

    protected setActivePanel(panel: InteriorPanel): void {
        this.activePanel = panel;
        this.cameras.main.ignore(panel.container);
    }

    protected updatePanelInteraction(
        zone: Geom.Rectangle,
        prompt: InteractionPrompt,
        panel: InteriorPanel
    ): void {
        if (this.faintTransitionActive) {
            return;
        }

        const isPlayerInZone = this.isPlayerInside(zone);

        if (isPlayerInZone && !panel.isOpen()) {
            prompt.show();
        } else {
            prompt.hide();
        }

        if (!isPlayerInZone) {
            panel.close();
            return;
        }

        if (this.gameInput.interactPressed()) {
            panel.toggle();
        }

        if (this.gameInput.escapePressed()) {
            panel.close();
        }
    }

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
        this.uiCamera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.exitPrompt.container.setPosition(this.scale.width / 2, this.scale.height - 120);
        this.hud.layout();
        this.screenFade.layout();
        this.activePanel?.layout();
    }

    private centerCamera(): void {
        this.cameras.main
            .setViewport(0, 0, this.scale.width, this.scale.height)
            .centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);
    }

    private isPanelOpen(): boolean {
        return this.activePanel?.isOpen() ?? false;
    }

    private createUiCamera(): void {
        this.uiCamera = this.cameras.add(
            0,
            0,
            this.scale.width,
            this.scale.height
        );

        this.uiCamera.ignore(this.worldObjects);
    }

    private startFaintTransition(): void {
        this.faintTransitionActive = true;
        this.player.sprite.setVelocity(0);
        playSound(this, 'faint');
        this.screenFade.fadeIn(() => {
            this.onPlayerFaint();
            this.scene.stop();
            this.scene.wake('Game');
        });
    }
}
