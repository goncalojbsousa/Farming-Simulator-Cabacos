import { translate } from '../services/LanguageService';
import { FarmPurchasePanel } from '../ui/FarmPurchasePanel';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class TownHall extends BuildingInteriorScene {
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

        const farmPurchasePanel = new FarmPurchasePanel(
            this,
            this.money,
            this.landOwnership,
            () => this.hud.refresh()
        );

        this.setActivePanel('town_hall_buy_farms', translate('buyFarms'), farmPurchasePanel);
    }
}
