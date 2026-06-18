import { translate } from '../services/LanguageService';
import { SeedShopPanel } from '../ui/SeedShopPanel';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class SeedShop extends BuildingInteriorScene {
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

        const shopPanel = new SeedShopPanel(
            this,
            this.inventory,
            this.money,
            () => this.hud.refresh()
        );

        this.setActivePanel('seed_shop', translate('buySeeds'), shopPanel);
    }
}
