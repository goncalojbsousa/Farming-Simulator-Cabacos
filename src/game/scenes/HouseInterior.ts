import { Geom } from 'phaser';
import { translate } from '../services/LanguageService';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { ScreenFade } from '../ui/ScreenFade';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class HouseInterior extends BuildingInteriorScene {
    private bedZone: Geom.Rectangle;
    private bedPrompt: InteractionPrompt;
    private sleepFade: ScreenFade;
    private sleepTransitionActive = false;

    constructor() {
        super({
            sceneKey: 'HouseInterior',
            mapKey: 'houseInteriorMap',
            imageKey: 'houseInteriorImage',
            exitObjectName: 'player_house_exit'
        });
    }

    create(): void {
        super.create();

        this.bedZone = this.getInteractionZone('player_house_bed');
        this.bedPrompt = this.createPrompt(translate('sleep'));
        this.sleepFade = new ScreenFade(this);
        this.registerUiObjects([this.sleepFade.getGameObject()]);
    }

    update(time: number): void {
        if (this.sleepTransitionActive) {
            this.gameInput.update();
            return;
        }

        super.update(time);

        const isPlayerNearBed = this.isPlayerInside(this.bedZone);
        if (isPlayerNearBed) {
            this.bedPrompt.show();
        } else {
            this.bedPrompt.hide();
        }

        if (isPlayerNearBed && this.gameInput.interactPressed()) {
            this.sleepTransitionActive = true;
            this.bedPrompt.hide();
            this.sleepFade.play(
                () => this.gameTime.startNextDay(),
                () => this.sleepTransitionActive = false
            );
        }
    }

    protected layoutInteriorUi(): void {
        this.sleepFade.layout();
    }
}
