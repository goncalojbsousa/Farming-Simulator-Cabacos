import { GameObjects, Scene } from 'phaser';
import { getSeedItems, SeedItem } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { MenuPanel } from './MenuPanel';
import { SeedShopRow } from './SeedShopRow';

export class SeedShopPanel {
    private menu: MenuPanel;
    private purchaseMessage: GameObjects.Text;

    constructor(
        private scene: Scene,
        private inventory: InventoryService,
        private money: MoneyService,
        private onPurchase: () => void
    ) {
        this.menu = new MenuPanel(scene, {
            width: 560,
            height: 570,
            title: translate('seedShopTitle'),
            depth: 1200
        });

        this.purchaseMessage = scene.add.text(0, 255, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffe7a3'
        }).setOrigin(0.5);

        this.menu.addContent(this.purchaseMessage);
        this.menu.addContent(this.createCloseButton());

        getSeedItems().forEach((seed, index) => {
            const seedRow = new SeedShopRow(
                scene,
                seed,
                -190 + index * 40,
                () => this.buySeed(seed)
            );

            this.menu.addContent(seedRow.container);
        });

        this.layout();
        this.close();
    }

    toggle(): void {
        this.purchaseMessage.setText('');
        this.menu.toggle();
    }

    close(): void {
        this.menu.close();
    }

    isOpen(): boolean {
        return this.menu.isOpen();
    }

    containsScreenPoint(x: number, y: number): boolean {
        return this.menu.containsPoint(x, y);
    }

    layout(): void {
        this.menu.center(true);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.menu.container];
    }

    private createCloseButton(): GameObjects.Text {
        return this.scene.add.text(250, -255, 'X', {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.close());
    }

    private buySeed(seed: SeedItem): void {
        if (!this.money.canAfford(seed.buyPrice)) {
            this.purchaseMessage.setText(translate('notEnoughMoney'));
            return;
        }

        if (!this.inventory.addItem(seed.id, 1)) {
            this.purchaseMessage.setText(translate('inventoryFull'));
            return;
        }

        this.money.spend(seed.buyPrice);
        this.onPurchase();
        this.purchaseMessage.setText(
            `${translate('purchased')} ${translate(seed.nameKey)}`
        );
    }
}
