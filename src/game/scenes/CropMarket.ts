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
}
