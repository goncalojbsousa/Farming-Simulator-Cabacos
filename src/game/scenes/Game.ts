import { Scene } from 'phaser';
import { startingSeedIds, startingToolIds } from '../data/ItemData';
import { GameInput } from '../input/GameInput';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { TimeService } from '../services/TimeService';
import { BuildingEntranceSystem } from '../systems/BuildingEntranceSystem';
import { FarmingSystem } from '../systems/FarmingSystem';
import { GameHud } from '../ui/GameHud';
import { ScreenFade } from '../ui/ScreenFade';
import { GameWorld } from '../world/GameWorld';

const faintMoneyLossRate = 0.25;
const nightStartHour = 17;
const fullyDarkHour = 22;
const maxNightAlpha = 0.6;

export class Game extends Scene {
    private gameWorld: GameWorld;
    private gameInput: GameInput;
    private inventory: InventoryService;
    private money: MoneyService;
    private gameTime: TimeService;
    private hud: GameHud;
    private farmingSystem: FarmingSystem;
    private buildingEntrances: BuildingEntranceSystem;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;
    private screenFade: ScreenFade;
    private nightOverlay: Phaser.GameObjects.Rectangle;
    private faintTransitionActive = false;

    constructor() {
        super('Game');
    }

    create(): void {
        this.gameWorld = new GameWorld(this);
        this.gameInput = new GameInput(this);
        this.inventory = new InventoryService(16);
        this.money = new MoneyService(100);
        this.gameTime = new TimeService();
        this.addStartingItems();
        this.createNightOverlay();

        this.hud = new GameHud(
            this,
            this.inventory,
            this.money,
            this.gameTime,
            () => false
        );
        this.buildingEntrances = new BuildingEntranceSystem(
            this,
            this.gameWorld.map,
            this.gameWorld.player,
            this.inventory,
            this.money,
            this.gameTime,
            () => this.faintPlayerInsideBuilding()
        );

        this.createUiCamera();
        this.screenFade = new ScreenFade(this);
        this.gameWorld.camera.ignore(this.screenFade.getGameObject());
        this.farmingSystem = new FarmingSystem({
            scene: this,
            worldCamera: this.gameWorld.camera,
            uiCamera: this.uiCamera,
            player: this.gameWorld.player,
            inventory: this.inventory,
            farmLayer: this.gameWorld.farmLayer,
            worldObjects: this.gameWorld.worldObjects,
            isPointerOverUi: (pointer) =>
                this.hud.containsInteractiveElement(pointer.x, pointer.y),
            refreshInventory: () => this.hud.refresh()
        });

        this.scale.on('resize', this.resizeGame, this);
        this.events.on('wake', this.onWake, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resizeGame, this);
            this.events.off('wake', this.onWake, this);
        });
    }

    update(time: number): void {
        if (this.faintTransitionActive) {
            this.gameInput.update();
            return;
        }

        this.gameInput.update();

        if (this.gameInput.nextDayPressed()) {
            this.gameTime.advanceDay();
        }

        this.gameTime.update(time);
        this.updateNightOverlay();

        if (this.gameTime.isFaintTime()) {
            this.faintTransitionActive = true;
            this.gameWorld.player.sprite.setVelocity(0);
            this.screenFade.play(
                () => this.applyFaintConsequences(),
                () => this.faintTransitionActive = false
            );
            return;
        }

        this.gameWorld.player.update(this.gameInput);
        this.farmingSystem.update(this.gameInput, this.gameTime.day);
        this.hud.update(this.gameInput);
        this.buildingEntrances.update(this.gameInput);
    }

    private createUiCamera(): void {
        const uiObjects = [
            ...this.hud.getUiObjects(),
            ...this.buildingEntrances.getUiObjects()
        ];

        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.ignore(this.gameWorld.worldObjects);
        this.gameWorld.camera.ignore(uiObjects);
    }

    private createNightOverlay(): void {
        this.nightOverlay = this.add.rectangle(0, 0, 1, 1, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(100);
        this.gameWorld.worldObjects.push(this.nightOverlay);
        this.layoutNightOverlay();
        this.updateNightOverlay();
    }

    private updateNightOverlay(): void {
        const currentHour = this.gameTime.hour + this.gameTime.minute / 60;
        let darkness = 0;

        if (currentHour >= nightStartHour) {
            darkness = Math.min(
                (currentHour - nightStartHour) / (fullyDarkHour - nightStartHour),
                1
            );
        } else if (currentHour < 2) {
            darkness = 1;
        }

        this.nightOverlay.setAlpha(darkness * maxNightAlpha);
    }

    private layoutNightOverlay(): void {
        this.nightOverlay.setSize(this.scale.width, this.scale.height);
    }

    private addStartingItems(): void {
        for (const toolId of startingToolIds) {
            this.inventory.addItem(toolId, 1);
        }

        for (const seedId of startingSeedIds) {
            this.inventory.addItem(seedId, 5);
        }
    }

    private resizeGame(): void {
        this.gameWorld.resize();
        this.layoutNightOverlay();
        this.uiCamera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.hud.layout();
        this.buildingEntrances.layout();
        this.screenFade.layout();
    }

    private onWake(): void {
        this.hud.refresh();
        this.updateNightOverlay();

        if (this.faintTransitionActive) {
            this.screenFade.fadeOut(() => this.faintTransitionActive = false);
        }
    }

    private faintPlayerInsideBuilding(): void {
        this.faintTransitionActive = true;
        this.screenFade.showBlack();
        this.applyFaintConsequences();
    }

    private applyFaintConsequences(): void {
        const moneyLost = Math.floor(
            this.money.getBalance() * faintMoneyLossRate
        );

        this.money.spend(moneyLost);
        this.gameTime.setMorningTime();
        this.updateNightOverlay();
        this.gameWorld.movePlayerToSpawn();
        this.hud.refresh();
    }
}
