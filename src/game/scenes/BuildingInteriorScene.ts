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
    // Shared scene services and runtime state.
    protected gameInput: GameInput;
    protected inventory: InventoryService;
    protected money: MoneyService;
    protected gameTime: TimeService;
    protected landOwnership: LandOwnershipService;
    protected energy: EnergyService;
    protected quests: QuestService;
    protected hud: GameHud;
    protected screenFade: ScreenFade;
    protected isFaintAnimationRunning = false;

    private player: Player;
    private map: Phaser.Tilemaps.Tilemap;
    private exitZone: Geom.Rectangle;
    private exitPrompt: InteractionPrompt;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;
    private onPlayerFaint: () => void;
    private activePanel?: {
        zone: Geom.Rectangle;
        prompt: InteractionPrompt;
        panel: InteriorPanel;
    };

    constructor(private interiorConfig: InteriorConfig) {
        super(interiorConfig.sceneKey);
    }

    // Scene lifecycle.
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
        this.isFaintAnimationRunning = false;

        this.map = this.make.tilemap({ key: this.interiorConfig.mapKey });
        this.add.image(0, 0, this.interiorConfig.imageKey).setOrigin(0);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.exitZone = this.getInteractionZone(this.interiorConfig.exitObjectName);

        this.player = new Player(this, 192, 238);
        this.player.sprite.setScale(1.5).setDepth(10);

        const walls = this.physics.add.staticGroup();
        const wallObjects = this.map.getObjectLayer('Collision')?.objects ?? [];
        for (const object of wallObjects) {
            const wall = this.add.rectangle(
                object.x! + object.width! / 2,
                object.y! + object.height! / 2,
                object.width,
                object.height
            ).setVisible(false);

            this.physics.add.existing(wall, true);
            walls.add(wall);
        }
        this.physics.add.collider(this.player.sprite, walls);

        this.createUi();

        this.cameras.main.setZoom(2).setBackgroundColor('#15151f');
        this.cameras.main
            .setViewport(0, 0, this.scale.width, this.scale.height)
            .centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);

        this.gameInput = new GameInput(this);
        this.scale.on('resize', this.resizeScene, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resizeScene, this);
        });
    }

    update(time: number): void {
        this.gameInput.update();

        if (this.gameInput.escapePressed()) {
            openPauseMenu(this);
            return;
        }

        if (this.isFaintAnimationRunning) {
            return;
        }

        this.gameTime.update(time);

        if (this.gameTime.isFaintTime()) {
            this.startFaintTransition();
            return;
        }

        this.player.update(this.gameInput);
        this.hud.update(this.gameInput);
        this.updateInteractions();
    }

    // Interaction zones and prompts.
    protected getInteractionZone(objectName: string): Geom.Rectangle {
        const object = this.map.getObjectLayer('Interactions')?.objects
            .find((object) => object.name?.trim() === objectName);

        if (!object) {
            throw new Error(`Interaction zone not found: ${objectName}`);
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

    protected setActivePanel(
        objectName: string,
        promptMessage: string,
        panel: InteriorPanel
    ): void {
        this.activePanel = {
            zone: this.getInteractionZone(objectName),
            prompt: this.createPrompt(promptMessage),
            panel
        };
        this.cameras.main.ignore(panel.container);
    }

    // UI and camera setup.
    private createUi(): void {
        this.uiCamera = this.cameras.add(
            0,
            0,
            this.scale.width,
            this.scale.height
        );
        this.uiCamera.ignore([...this.children.list]);

        this.exitPrompt = this.createPrompt(translate('exitBuilding'));
        this.hud = new GameHud(
            this,
            this.inventory,
            this.money,
            this.gameTime,
            this.energy,
            this.quests,
            () => this.activePanel?.panel.isOpen() ?? false
        );
        this.cameras.main.ignore(this.hud.uiObjects);
        this.screenFade = new ScreenFade(this);
        this.cameras.main.ignore(this.screenFade.gameObject);
    }

    // Per-frame interactions.
    private updateInteractions(): void {
        const isPlayerAtExit = this.isPlayerInside(this.exitZone);

        if (isPlayerAtExit) {
            this.exitPrompt.show();
        } else {
            this.exitPrompt.hide();
        }

        if (isPlayerAtExit && this.gameInput.interactPressed()) {
            playSound(this, 'doorOpen');
            this.scene.stop();
            this.scene.wake('Game');
        }

        if (this.isFaintAnimationRunning || !this.activePanel) {
            return;
        }

        const { zone, prompt, panel } = this.activePanel;
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

    // Responsive layout.
    private resizeScene(): void {
        this.cameras.main
            .setViewport(0, 0, this.scale.width, this.scale.height)
            .centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);
        this.uiCamera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.exitPrompt.container.setPosition(this.scale.width / 2, this.scale.height - 120);
        this.hud.layout();
        this.screenFade.layout();
        this.activePanel?.panel.layout();
    }

    // Scene transitions.
    private startFaintTransition(): void {
        // Fade back to the outside scene and let Game apply the penalty.
        this.isFaintAnimationRunning = true;
        this.player.sprite.setVelocity(0);
        playSound(this, 'faint');
        this.screenFade.fadeIn(() => {
            this.onPlayerFaint();
            this.scene.stop();
            this.scene.wake('Game');
        });
    }
}
