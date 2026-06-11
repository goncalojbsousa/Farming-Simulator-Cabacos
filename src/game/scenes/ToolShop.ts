import { Geom } from 'phaser';
import { translate } from '../services/LanguageService';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { ToolShopPanel } from '../ui/ToolShopPanel';
import { BuildingInteriorScene } from './BuildingInteriorScene';

export class ToolShop extends BuildingInteriorScene {
    private shopZone: Geom.Rectangle;
    private shopPrompt: InteractionPrompt;
    private shopPanel: ToolShopPanel;

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

        this.shopZone = this.getInteractionZone('tool_shop');
        this.shopPrompt = this.createPrompt(translate('buyTools'));
        this.shopPanel = new ToolShopPanel(
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
