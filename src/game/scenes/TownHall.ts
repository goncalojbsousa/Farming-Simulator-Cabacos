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
}
