import { Geom } from 'phaser';
import { translate } from '../services/LanguageService';
import { CropMarketPanel } from '../ui/CropMarketPanel';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class CropMarket extends BuildingInteriorScene {
    private marketZone: Geom.Rectangle;
    private marketPrompt: InteractionPrompt;
    private marketPanel: CropMarketPanel;

    constructor() {
        super({
            sceneKey: 'CropMarket',
            mapKey: 'cropMarketMap',
            imageKey: 'cropMarketImage',
            exitObjectName: 'player_crop_market_exit'
        });
    }

    create(): void {
        super.create();

        this.marketZone = this.getInteractionZone('crop_market');
        this.marketPrompt = this.createPrompt(translate('sellCrops'));
        this.marketPanel = new CropMarketPanel(
            this,
            this.inventory,
            this.money,
            this.quests,
            () => this.hud.refresh()
        );

        this.setActivePanel(this.marketPanel);
    }

    update(time: number): void {
        super.update(time);

        this.updatePanelInteraction(this.marketZone, this.marketPrompt, this.marketPanel);
    }
}
