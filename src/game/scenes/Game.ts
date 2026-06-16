import { Scene } from 'phaser';
import { startingSeedIds, startingToolIds } from '../data/ItemData';
import { GameInput } from '../input/GameInput';
import { EnergyService } from '../services/EnergyService';
import { InventoryService } from '../services/InventoryService';
import { LandOwnershipService } from '../services/LandOwnershipService';
import { MoneyService } from '../services/MoneyService';
import { QuestService } from '../services/QuestService';
import { SaveGameData } from '../services/SaveService';
import { playSound } from '../services/SoundService';
import { TimeService } from '../services/TimeService';
import { WateringCanService } from '../services/WateringCanService';
import { BuildingEntranceSystem } from '../systems/BuildingEntranceSystem';
import { FarmingSystem } from '../systems/FarmingSystem';
import { WateringCanSystem } from '../systems/WateringCanSystem';
import { GameHud } from '../ui/GameHud';
import { ScreenFade } from '../ui/ScreenFade';
import { GameWorld } from '../world/GameWorld';
import { openPauseMenu } from './PauseMenu';

const faintMoneyLossRate = 0.25;
const nightStartHour = 17;
const fullyDarkHour = 22;
const maxNightAlpha = 0.6;

type GameSceneData = {
    save?: SaveGameData;
};

export class Game extends Scene {
    private gameWorld: GameWorld;
    private gameInput: GameInput;
    private inventory: InventoryService;
    private money: MoneyService;
    private gameTime: TimeService;
    private landOwnership: LandOwnershipService;
    private energy: EnergyService;
    private wateringCan: WateringCanService;
    private quests: QuestService;
    private hud: GameHud;
    private farmingSystem: FarmingSystem;
    private buildingEntrances: BuildingEntranceSystem;
    private wateringCanSystem: WateringCanSystem;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;
    private screenFade: ScreenFade;
    private nightOverlay: Phaser.GameObjects.Rectangle;
    private faintTransitionActive = false;
    private saveToLoad?: SaveGameData;

    constructor() {
        super('Game');
    }

    init(data?: GameSceneData): void {
        this.saveToLoad = data?.save;
    }

    create(): void {
        this.landOwnership = new LandOwnershipService();
        this.loadSavedLandOwnership();
        this.gameWorld = new GameWorld(this, this.landOwnership);
        this.gameInput = new GameInput(this);
        this.inventory = new InventoryService();
        this.money = new MoneyService(100);
        this.gameTime = new TimeService();
        this.energy = new EnergyService();
        this.wateringCan = new WateringCanService();
        this.quests = new QuestService();
        this.loadSavedServices();
        this.createNightOverlay();

        this.hud = new GameHud(
            this,
            this.inventory,
            this.money,
            this.gameTime,
            this.energy,
            this.quests,
            () => false
        );
        this.buildingEntrances = new BuildingEntranceSystem(
            this,
            this.gameWorld.map,
            this.gameWorld.player,
            this.inventory,
            this.money,
            this.gameTime,
            this.landOwnership,
            this.energy,
            this.quests,
            () => this.faintPlayerInsideBuilding()
        );
        this.wateringCanSystem = new WateringCanSystem({
            scene: this,
            map: this.gameWorld.map,
            player: this.gameWorld.player,
            inventory: this.inventory,
            wateringCan: this.wateringCan
        });

        this.createUiCamera();
        this.screenFade = new ScreenFade(this);
        this.gameWorld.camera.ignore(this.screenFade.gameObject);
        this.farmingSystem = new FarmingSystem({
            scene: this,
            worldCamera: this.gameWorld.camera,
            uiCamera: this.uiCamera,
            player: this.gameWorld.player,
            inventory: this.inventory,
            getAvailableFarmLayers: () => this.gameWorld.getAvailableFarmLayers(),
            energy: this.energy,
            wateringCan: this.wateringCan,
            quests: this.quests,
            worldObjects: this.gameWorld.worldObjects,
            isPointerOverInventory: (pointer) =>
                this.hud.isPointerOverInventory(pointer.x, pointer.y),
            refreshInventory: () => this.hud.refresh(),
            savedState: this.saveToLoad?.farming
        });
        this.loadSavedPlayerPosition();

        this.scale.on('resize', this.resizeGame, this);
        this.events.on('wake', this.onWake, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resizeGame, this);
            this.events.off('wake', this.onWake, this);
        });
    }

    createSaveGame(): SaveGameData {
        return {
            version: 1,
            savedAt: new Date().toISOString(),
            playerPosition: {
                x: this.gameWorld.player.sprite.x,
                y: this.gameWorld.player.sprite.y
            },
            inventory: this.inventory.getSnapshot(),
            time: this.gameTime.getSnapshot(),
            money: this.money.getBalance(),
            energy: this.energy.getEnergy(),
            wateringCanWater: this.wateringCan.getWater(),
            unlockedFarmIds: this.landOwnership.getSnapshot(),
            farming: this.farmingSystem.getSnapshot(),
            quests: this.quests.getSnapshot()
        };
    }

    update(time: number): void {
        this.gameInput.update();

        if (this.gameInput.escapePressed()) {
            openPauseMenu(this);
            return;
        }

        if (this.faintTransitionActive) {
            return;
        }

        if (this.gameInput.nextDayPressed()) {
            this.gameTime.advanceDay();
        }

        this.gameTime.update(time);
        this.updateNightOverlay();

        if (this.gameTime.isFaintTime()) {
            this.faintTransitionActive = true;
            this.gameWorld.player.sprite.setVelocity(0);
            playSound(this, 'faint');
            this.screenFade.play(
                () => this.applyFaintConsequences(),
                () => this.faintTransitionActive = false
            );
            return;
        }

        this.gameWorld.player.update(this.gameInput);
        this.farmingSystem.update(this.gameInput, this.gameTime.day);
        this.hud.update(this.gameInput);
        this.wateringCanSystem.update(this.gameInput);
        this.buildingEntrances.update(this.gameInput);
    }

    private createUiCamera(): void {
        const uiObjects = [
            ...this.hud.uiObjects,
            ...this.buildingEntrances.uiObjects,
            ...this.wateringCanSystem.uiObjects
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
            this.inventory.addItem(toolId, 1, true);
        }

        for (const seedId of startingSeedIds) {
            this.inventory.addItem(seedId, 5, true);
        }
    }

    private loadSavedLandOwnership(): void {
        if (this.saveToLoad) {
            this.landOwnership.loadSnapshot(this.saveToLoad.unlockedFarmIds);
        }
    }

    private loadSavedServices(): void {
        if (!this.saveToLoad) {
            this.addStartingItems();
            return;
        }

        this.inventory.loadSnapshot(this.saveToLoad.inventory);
        this.money.setBalance(this.saveToLoad.money);
        this.gameTime.loadSnapshot(this.saveToLoad.time);
        this.energy.setEnergy(this.saveToLoad.energy);
        this.wateringCan.setWater(this.saveToLoad.wateringCanWater);
        if (this.saveToLoad.quests) {
            this.quests.loadSnapshot(this.saveToLoad.quests);
        }
    }

    private loadSavedPlayerPosition(): void {
        if (this.saveToLoad?.playerPosition) {
            this.gameWorld.movePlayerToPosition(
                this.saveToLoad.playerPosition.x,
                this.saveToLoad.playerPosition.y
            );
        }
    }

    private resizeGame(): void {
        this.gameWorld.resize();
        this.layoutNightOverlay();
        this.uiCamera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.hud.layout();
        this.buildingEntrances.layout();
        this.wateringCanSystem.layout();
        this.screenFade.layout();
    }

    private onWake(): void {
        this.refreshUi();
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
        this.energy.restoreAfterFaint();
        this.gameTime.setMorningTime();
        this.updateNightOverlay();
        this.gameWorld.movePlayerToSpawn();
        this.refreshUi();
    }

    private refreshUi(): void {
        this.gameWorld.applyLandOwnership();
        this.hud.refresh();
    }
}
