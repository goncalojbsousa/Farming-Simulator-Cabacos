import { translate } from '../services/LanguageService';
import { CropMarketPanel } from '../ui/CropMarketPanel';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class CropMarket extends BuildingInteriorScene {
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

        const marketPanel = new CropMarketPanel(
            this,
            this.inventory,
            this.money,
            this.quests,
            () => this.hud.refresh()
        );

        this.setActivePanel('crop_market', translate('sellCrops'), marketPanel);
    }
}
