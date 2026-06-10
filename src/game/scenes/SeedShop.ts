import { Geom } from 'phaser';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { MoneyDisplay } from '../ui/MoneyDisplay';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { SeedShopPanel } from '../ui/SeedShopPanel';
import { BuildingInteriorScene } from './BuildingInteriorScene';

type SeedShopData = {
    inventory: InventoryService;
    money: MoneyService;
};

export class SeedShop extends BuildingInteriorScene {
    private inventory: InventoryService;
    private money: MoneyService;
    private shopZone: Geom.Rectangle;
    private shopPrompt: InteractionPrompt;
    private shopPanel: SeedShopPanel;
    private moneyDisplay: MoneyDisplay;

    constructor() {
        super({
            sceneKey: 'SeedShop',
            mapKey: 'seedShopMap',
            imageKey: 'seedShopImage',
            exitObjectName: 'player_seed_shop_exit'
        });
    }

    init(data: SeedShopData): void {
        this.inventory = data.inventory;
        this.money = data.money;
    }

    create(): void {
        super.create();

        this.shopZone = this.getInteractionZone('seed_shop');
        this.shopPrompt = this.createPrompt(translate('buySeeds'));
        this.moneyDisplay = new MoneyDisplay(this, this.money);
        this.shopPanel = new SeedShopPanel(
            this,
            this.inventory,
            this.money,
            () => this.moneyDisplay.refresh()
        );

        this.setupUi([
            ...this.moneyDisplay.getUiObjects(),
            ...this.shopPanel.getUiObjects()
        ]);
    }

    update(): void {
        super.update();

        const canShop = this.isPlayerInside(this.shopZone);
        if (canShop && !this.shopPanel.isOpen()) {
            this.shopPrompt.show();
        } else {
            this.shopPrompt.hide();
        }

        if (!canShop) {
            this.shopPanel.close();
        } else if (this.gameInput.interactPressed()) {
            this.shopPanel.toggle();
        }

        if (this.gameInput.escapePressed()) {
            this.shopPanel.close();
        }
    }

    protected interactionIsBlocked(): boolean {
        return this.shopPanel?.isOpen() ?? false;
    }

    protected layoutUi(): void {
        this.shopPanel.layout();
    }
}
