import { GameObjects, Scene } from 'phaser';
import { getToolShopItems, ToolItem } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { MenuPanel } from './MenuPanel';
import { ToolShopRow } from './ToolShopRow';

const panelWidth = 600;
const panelHeight = 430;
const panelCenterOffsetY = -36;
const firstRowY = -108;
const rowSpacing = 39;
const messageY = 170;

export class ToolShopPanel {
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
            backgroundColor: 0x5a3822,
            backgroundAlpha: 1,
            borderColor: 0x332015,
            borderWidth: 4
        });

        const title = scene.add.text(0, -178, translate('toolShopTitle'), {
            fontFamily: 'Arial Black',
            fontSize: 26,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 5
        }).setOrigin(0.5).setResolution(2);

        const background = scene.add.rectangle(0, 10, 538, 320, 0xffefc5, 0.98)
            .setStrokeStyle(3, 0xd39a3c);

        this.purchaseMessage = scene.add.text(0, messageY, '', {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setResolution(2);

        this.menu.addContent(background);
        this.menu.addContent(title);
        this.menu.addContent(this.purchaseMessage);
        this.menu.addContent(this.createCloseButton());

        getToolShopItems().forEach((tool, index) => {
            const row = new ToolShopRow(
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

    getUiObjects(): GameObjects.GameObject[] {
        return [this.menu.container];
    }

    private createCloseButton(): GameObjects.Container {
        const background = this.scene.add.rectangle(262, -178, 32, 30, 0x8d3d30)
            .setStrokeStyle(2, 0xffe3a3)
            .setInteractive({ useHandCursor: true });
        const label = this.scene.add.text(262, -179, 'X', {
            fontFamily: 'Arial Black',
            fontSize: 17,
            color: '#ffffff',
            stroke: '#1a100b',
            strokeThickness: 2
        }).setOrigin(0.5).setResolution(2);

        background.on('pointerover', () => background.setFillStyle(0xb84d38));
        background.on('pointerout', () => background.setFillStyle(0x8d3d30));
        background.on('pointerdown', () => this.close());

        return this.scene.add.container(0, 0, [background, label]);
    }

    private buyTool(tool: ToolItem): void {
        if (this.inventory.hasItem(tool.id)) {
            this.purchaseMessage.setText(translate('itemAlreadyOwned'));
            return;
        }

        if (!this.money.canAfford(tool.buyPrice)) {
            this.purchaseMessage.setText(translate('notEnoughMoney'));
            return;
        }

        if (!this.inventory.addItem(tool.id, 1)) {
            this.purchaseMessage.setText(translate('inventoryFull'));
            return;
        }

        this.money.spend(tool.buyPrice);
        this.onPurchase();
        this.purchaseMessage.setText(
            `${translate('purchased')} ${translate(tool.nameKey)}`
        );
    }
}
