import { Geom } from 'phaser';
import { translate } from '../services/LanguageService';
import { FarmPurchasePanel } from '../ui/FarmPurchasePanel';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class TownHall extends BuildingInteriorScene {
    private farmPurchaseZone?: Geom.Rectangle;
    private farmPurchasePrompt?: InteractionPrompt;
    private farmPurchasePanel?: FarmPurchasePanel;

    constructor() {
        super({
            sceneKey: 'TownHall',
            mapKey: 'townHallMap',
            imageKey: 'townHallImage',
            exitObjectName: 'player_town_hall_exit'
        });
    }

    create(): void {
        super.create();

        this.farmPurchaseZone = this.getOptionalInteractionZone('town_hall_buy_farms');

        if (!this.farmPurchaseZone) {
            return;
        }

        this.farmPurchasePrompt = this.createPrompt(translate('buyFarms'));
        this.farmPurchasePanel = new FarmPurchasePanel(
            this,
            this.money,
            this.landOwnership,
            () => this.hud.refresh()
        );

        this.registerUiObjects(this.farmPurchasePanel.getUiObjects());
    }

    update(time: number): void {
        super.update(time);

        if (!this.farmPurchaseZone || !this.farmPurchasePrompt || !this.farmPurchasePanel) {
            return;
        }

        const isPlayerInFarmPurchaseZone = this.isPlayerInside(this.farmPurchaseZone);

        if (isPlayerInFarmPurchaseZone && !this.farmPurchasePanel.isOpen()) {
            this.farmPurchasePrompt.show();
        } else {
            this.farmPurchasePrompt.hide();
        }

        if (!isPlayerInFarmPurchaseZone) {
            this.farmPurchasePanel.close();
        } else if (this.gameInput.interactPressed()) {
            this.farmPurchasePanel.toggle();
        }

        if (this.gameInput.escapePressed()) {
            this.farmPurchasePanel.close();
        }
    }

    protected isGameplayInteractionBlocked(): boolean {
        return this.farmPurchasePanel?.isOpen() ?? false;
    }

    protected layoutInteriorUi(): void {
        this.farmPurchasePanel?.layout();
    }
}
