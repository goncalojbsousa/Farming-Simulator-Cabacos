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

        this.setActivePanel(this.farmPurchasePanel);
    }

    update(time: number): void {
        super.update(time);

        if (!this.farmPurchaseZone || !this.farmPurchasePrompt || !this.farmPurchasePanel) {
            return;
        }

        this.updatePanelInteraction(
            this.farmPurchaseZone,
            this.farmPurchasePrompt,
            this.farmPurchasePanel
        );
    }
}
