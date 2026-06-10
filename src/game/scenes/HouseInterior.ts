import { BuildingInteriorScene } from './BuildingInteriorScene';

export class HouseInterior extends BuildingInteriorScene {
    constructor() {
        super({
            sceneKey: 'HouseInterior',
            mapKey: 'houseInteriorMap',
            imageKey: 'houseInteriorImage',
            exitObjectName: 'player_house_exit'
        });
    }
}
