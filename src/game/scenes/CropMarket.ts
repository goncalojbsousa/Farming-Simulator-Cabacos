import { Geom } from 'phaser';
import { translate } from '../services/LanguageService';
import { CropMarketPanel } from '../ui/CropMarketPanel';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class CropMarket extends BuildingInteriorScene {
    private marketZone: Geom.Rectangle;
    private marketPrompt: InteractionPrompt;
    private marketPanel: CropMarketPanel;

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

        this.marketZone = this.getInteractionZone('crop_market');
        this.marketPrompt = this.createPrompt(translate('sellCrops'));
        this.marketPanel = new CropMarketPanel(
            this,
            this.inventory,
            this.money,
            this.quests,
            () => this.refreshAfterMarketAction()
        );

        this.registerUiObjects(this.marketPanel.getUiObjects());
    }

    update(time: number): void {
        super.update(time);

        if (this.faintTransitionActive) {
            return;
        }

        const isPlayerInMarketZone = this.isPlayerInside(this.marketZone);
        if (isPlayerInMarketZone && !this.marketPanel.isOpen()) {
            this.marketPrompt.show();
        } else {
            this.marketPrompt.hide();
        }

        if (!isPlayerInMarketZone) {
            this.marketPanel.close();
        } else if (this.gameInput.interactPressed()) {
            this.marketPanel.toggle();
        }

        if (this.gameInput.escapePressed()) {
            this.marketPanel.close();
        }
    }

    protected isGameplayInteractionBlocked(): boolean {
        return this.marketPanel?.isOpen() ?? false;
    }

    protected layoutInteriorUi(): void {
        this.marketPanel.layout();
    }

    private refreshAfterMarketAction(): void {
        this.hud.refresh();

        const gameScene = this.scene.get('Game') as { refreshSharedHud?: () => void };
        gameScene.refreshSharedHud?.();
    }
}
