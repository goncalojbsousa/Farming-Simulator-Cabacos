import { Geom } from 'phaser';
import { translate } from '../services/LanguageService';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { SeedShopPanel } from '../ui/SeedShopPanel';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class SeedShop extends BuildingInteriorScene {
    private shopZone: Geom.Rectangle;
    private shopPrompt: InteractionPrompt;
    private shopPanel: SeedShopPanel;

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

        this.shopZone = this.getInteractionZone('seed_shop');
        this.shopPrompt = this.createPrompt(translate('buySeeds'));
        this.shopPanel = new SeedShopPanel(
            this,
            this.inventory,
            this.money,
            () => this.hud.refresh()
        );

        this.registerUiObjects(this.shopPanel.getUiObjects());
    }

    update(time: number): void {
        super.update(time);

        if (this.faintTransitionActive) {
            return;
        }

        const isPlayerInShopZone = this.isPlayerInside(this.shopZone);
        if (isPlayerInShopZone && !this.shopPanel.isOpen()) {
            this.shopPrompt.show();
        } else {
            this.shopPrompt.hide();
        }

        if (!isPlayerInShopZone) {
            this.shopPanel.close();
        } else if (this.gameInput.interactPressed()) {
            this.shopPanel.toggle();
        }

        if (this.gameInput.escapePressed()) {
            this.shopPanel.close();
        }
    }

    protected isGameplayInteractionBlocked(): boolean {
        return this.shopPanel?.isOpen() ?? false;
    }

    protected layoutInteriorUi(): void {
        this.shopPanel.layout();
    }
}
