import { Geom } from 'phaser';
import { translate } from '../services/LanguageService';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { SeedShopPanel } from '../ui/SeedShopPanel';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class SeedShop extends BuildingInteriorScene {
    private shopZone: Geom.Rectangle;
    private shopPrompt: InteractionPrompt;
    private shopPanel: SeedShopPanel;

    constructor() {
        super({
            sceneKey: 'SeedShop',
            mapKey: 'seedShopMap',
            imageKey: 'seedShopImage',
            exitObjectName: 'player_seed_shop_exit'
        });
    }

    create(): void {
        super.create();

        this.shopZone = this.getInteractionZone('seed_shop');
        this.shopPrompt = this.createPrompt(translate('buySeeds'));
        this.shopPanel = new SeedShopPanel(
            this,
            this.inventory,
            this.money,
            () => this.hud.refresh()
        );

        this.setActivePanel(this.shopPanel);
    }

    update(time: number): void {
        super.update(time);

        this.updatePanelInteraction(this.shopZone, this.shopPrompt, this.shopPanel);
    }
}
