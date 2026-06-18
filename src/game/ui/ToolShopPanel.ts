import { GameObjects, Scene } from 'phaser';
import { getToolShopItems, ToolItem } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { playSound } from '../services/SoundService';
import { MenuPanel } from './MenuPanel';
import { ShopRow } from './ShopRow';

const panelWidth = 600;
const panelHeight = 430;
const panelCenterOffsetY = -36;
const firstRowY = -108;
const rowSpacing = 39;
const messageY = 170;

export class ToolShopPanel {
    readonly container: GameObjects.Container;

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
            title: translate('toolShopTitle'),
            closeButton: true
        });
        this.container = this.menu.container;

        this.purchaseMessage = scene.add.text(0, messageY, '', {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setResolution(2);

        this.menu.addContent(this.purchaseMessage);

        getToolShopItems().forEach((tool, index) => {
            const row = new ShopRow(
                scene,
                tool,
                firstRowY + index * rowSpacing,
                () => this.buyTool(tool)
            );

            this.menu.addContent(row.container);
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

    layout(): void {
        this.menu.center(true, panelCenterOffsetY);
    }

    private buyTool(tool: ToolItem): void {
        if (this.inventory.hasItem(tool.id)) {
            this.purchaseMessage.setText(translate('itemAlreadyOwned'));
            playSound(this.scene, 'fail');
            return;
        }

        if (!this.money.canAfford(tool.buyPrice)) {
            this.purchaseMessage.setText(translate('notEnoughMoney'));
            playSound(this.scene, 'fail');
            return;
        }

        if (!this.inventory.addItem(tool.id, 1)) {
            this.purchaseMessage.setText(translate('inventoryFull'));
            playSound(this.scene, 'fail');
            return;
        }

        this.money.spend(tool.buyPrice);
        playSound(this.scene, 'purchaseClick');
        this.onPurchase();
        this.purchaseMessage.setText(
            `${translate('purchased')} ${translate(tool.nameKey)}`
        );
    }
}
