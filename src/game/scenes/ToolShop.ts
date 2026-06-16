import { Geom } from 'phaser';
import { translate } from '../services/LanguageService';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { ToolShopPanel } from '../ui/ToolShopPanel';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class ToolShop extends BuildingInteriorScene {
    private shopZone: Geom.Rectangle;
    private shopPrompt: InteractionPrompt;
    private shopPanel: ToolShopPanel;

    constructor() {
        super({
            sceneKey: 'ToolShop',
            mapKey: 'toolShopMap',
            imageKey: 'toolShopImage',
            exitObjectName: 'player_tool_shop_exit'
        });
    }

    create(): void {
        super.create();

        this.shopZone = this.getInteractionZone('tool_shop');
        this.shopPrompt = this.createPrompt(translate('buyTools'));
        this.shopPanel = new ToolShopPanel(
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
