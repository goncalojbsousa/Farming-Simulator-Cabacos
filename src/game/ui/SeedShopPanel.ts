import { GameObjects, Scene } from 'phaser';
import { getSeedItems, SeedItem } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { playSound } from '../services/SoundService';
import { MenuPanel } from './MenuPanel';
import { ShopRow } from './ShopRow';

const panelWidth = 600;
const panelHeight = 500;
const panelCenterOffsetY = -56;
const firstSeedRowY = -158;
const seedRowSpacing = 35;
const purchaseMessageY = 218;

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
            width: panelWidth,
            height: panelHeight,
            depth: 1200,
            title: translate('seedShopTitle'),
            closeButton: true
        });

        this.purchaseMessage = scene.add.text(0, purchaseMessageY, '', {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setResolution(2);

        this.menu.addContent(this.purchaseMessage);

        getSeedItems().forEach((seed, index) => {
            const seedRow = new ShopRow(
                scene,
                seed,
                firstSeedRowY + index * seedRowSpacing,
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
        this.menu.center(true, panelCenterOffsetY);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.menu.container];
    }

    private buySeed(seed: SeedItem): void {
        if (!this.money.canAfford(seed.buyPrice)) {
            this.purchaseMessage.setText(translate('notEnoughMoney'));
            playSound(this.scene, 'fail');
            return;
        }

        if (!this.inventory.addItem(seed.id, 1, true)) {
            this.purchaseMessage.setText(translate('inventoryFull'));
            playSound(this.scene, 'fail');
            return;
        }

        this.money.spend(seed.buyPrice);
        playSound(this.scene, 'purchaseClick');
        this.onPurchase();
        this.purchaseMessage.setText(
            `${translate('purchased')} ${translate(seed.nameKey)}`
        );
    }
}
