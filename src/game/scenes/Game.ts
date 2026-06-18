import { Scene } from 'phaser';
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
const debugMoneyReward = 50;
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
    private nightDarknessOverlay: Phaser.GameObjects.Rectangle;
    private isFaintAnimationRunning = false;
    private loadedSaveData?: SaveGameData;

    constructor() {
        super('Game');
    }

    init(data?: GameSceneData): void {
        this.loadedSaveData = data?.save;
    }

    create(): void {
        // Load data that changes the map before the map is created.
        this.landOwnership = new LandOwnershipService();
        if (this.loadedSaveData) {
            this.landOwnership.loadSnapshot(this.loadedSaveData.unlockedFarmIds);
        }

        // Main game objects and simple services.
        this.gameWorld = new GameWorld(this, this.landOwnership);
        this.gameInput = new GameInput(this);
        this.inventory = new InventoryService();
        this.money = new MoneyService(200);
        this.gameTime = new TimeService();
        this.energy = new EnergyService();
        this.wateringCan = new WateringCanService();
        this.quests = new QuestService();

        // Continue a saved game, otherwise start with an empty inventory.
        if (this.loadedSaveData) {
            this.inventory.loadSnapshot(this.loadedSaveData.inventory);
            this.money.setBalance(this.loadedSaveData.money);
            this.gameTime.loadSnapshot(this.loadedSaveData.time);
            this.energy.setEnergy(this.loadedSaveData.energy);
            this.wateringCan.setWater(this.loadedSaveData.wateringCanWater);
            if (this.loadedSaveData.quests) {
                this.quests.loadSnapshot(this.loadedSaveData.quests);
            }
        }

        // Dark rectangle above the map that becomes visible at night.
        this.nightDarknessOverlay = this.add.rectangle(0, 0, 1, 1, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(100);
        this.gameWorld.worldObjects.push(this.nightDarknessOverlay);
        this.nightDarknessOverlay.setSize(this.scale.width, this.scale.height);
        this.updateNightDarkness();

        // Interface and interaction systems.
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
            () => this.faintPlayerFromBuilding()
        );
        this.wateringCanSystem = new WateringCanSystem({
            scene: this,
            map: this.gameWorld.map,
            player: this.gameWorld.player,
            inventory: this.inventory,
            wateringCan: this.wateringCan
        });

        // One camera follows the world, another draws menus and HUD fixed on screen.
        const fixedScreenObjects = [
            ...this.hud.uiObjects,
            ...this.buildingEntrances.uiObjects,
            ...this.wateringCanSystem.uiObjects
        ];

        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.ignore(this.gameWorld.worldObjects);
        this.gameWorld.camera.ignore(fixedScreenObjects);

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
            savedState: this.loadedSaveData?.farming
        });

        if (this.loadedSaveData?.playerPosition) {
            this.gameWorld.movePlayerToPosition(
                this.loadedSaveData.playerPosition.x,
                this.loadedSaveData.playerPosition.y
            );
        }

        this.scale.on('resize', this.resizeGameScreen, this);
        this.events.on('wake', this.updateAfterReturningToGame, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resizeGameScreen, this);
            this.events.off('wake', this.updateAfterReturningToGame, this);
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

        if (this.isFaintAnimationRunning) {
            return;
        }

        if (this.gameInput.nextDayPressed()) {
            this.gameTime.advanceDay();
        }

        if (this.gameInput.addMoneyPressed()) {
            this.money.earn(debugMoneyReward);
        }

        this.gameTime.update(time);
        this.updateNightDarkness();

        if (this.gameTime.isFaintTime()) {
            this.isFaintAnimationRunning = true;
            this.gameWorld.player.sprite.setVelocity(0);
            playSound(this, 'faint');
            this.screenFade.play(
                () => this.sendPlayerHomeAfterFaint(),
                () => this.isFaintAnimationRunning = false
            );
            return;
        }

        this.gameWorld.player.update(this.gameInput);
        this.farmingSystem.update(this.gameInput, this.gameTime.day);
        this.hud.update(this.gameInput);
        this.wateringCanSystem.update(this.gameInput);
        this.buildingEntrances.update(this.gameInput);
    }

    private updateNightDarkness(): void {
        const currentHour = this.gameTime.hour + this.gameTime.minute / 60;
        let nightDarkness = 0;

        if (currentHour >= nightStartHour) {
            nightDarkness = Math.min(
                (currentHour - nightStartHour) / (fullyDarkHour - nightStartHour),
                1
            );
        } else if (currentHour < 2) {
            nightDarkness = 1;
        }

        this.nightDarknessOverlay.setAlpha(nightDarkness * maxNightAlpha);
    }

    private resizeGameScreen(): void {
        this.gameWorld.resize();
        this.nightDarknessOverlay.setSize(this.scale.width, this.scale.height);
        this.uiCamera.setViewport(0, 0, this.scale.width, this.scale.height);
        this.hud.layout();
        this.buildingEntrances.layout();
        this.wateringCanSystem.layout();
        this.screenFade.layout();
    }

    private updateAfterReturningToGame(): void {
        this.refreshMapAndHud();
        this.updateNightDarkness();

        if (this.isFaintAnimationRunning) {
            this.screenFade.fadeOut(() => this.isFaintAnimationRunning = false);
        }
    }

    private faintPlayerFromBuilding(): void {
        this.isFaintAnimationRunning = true;
        this.screenFade.showBlack();
        this.sendPlayerHomeAfterFaint();
    }

    private sendPlayerHomeAfterFaint(): void {
        const moneyPenalty = Math.floor(
            this.money.getBalance() * faintMoneyLossRate
        );

        this.money.spend(moneyPenalty);
        this.energy.restoreAfterFaint();
        this.gameTime.setMorningTime();
        this.updateNightDarkness();
        this.gameWorld.movePlayerToSpawn();
        this.refreshMapAndHud();
    }

    private refreshMapAndHud(): void {
        this.gameWorld.applyLandOwnership();
        this.hud.refresh();
    }
}
