import { translate } from '../services/LanguageService';
import { ToolShopPanel } from '../ui/ToolShopPanel';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class ToolShop extends BuildingInteriorScene {
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

        const shopPanel = new ToolShopPanel(
            this,
            this.inventory,
            this.money,
            () => this.hud.refresh()
        );

        this.setActivePanel('tool_shop', translate('buyTools'), shopPanel);
    }
}
