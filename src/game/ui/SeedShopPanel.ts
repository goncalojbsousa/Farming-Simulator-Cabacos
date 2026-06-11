import { GameObjects, Scene } from 'phaser';
import { getSeedItems, SeedItem } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { MenuPanel } from './MenuPanel';
import { SeedShopRow } from './SeedShopRow';

const panelWidth = 600;
const panelHeight = 500;
const panelCenterOffsetY = -56;
const firstSeedRowY = -138;
const seedRowSpacing = 31;
const purchaseMessageY = 218;
const titleY = -216;

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
            backgroundColor: 0x6b4428,
            backgroundAlpha: 1,
            borderColor: 0x332015,
            borderWidth: 4
        });

        const panelDetails = this.createPanelDetails();
        const title = scene.add.text(0, titleY, translate('seedShopTitle'), {
            fontFamily: 'Arial Black',
            fontSize: 26,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 5
        }).setOrigin(0.5).setResolution(2);

        this.purchaseMessage = scene.add.text(0, purchaseMessageY, '', {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setResolution(2);

        this.menu.addContent(panelDetails);
        this.menu.addContent(title);
        this.menu.addContent(this.purchaseMessage);
        this.menu.addContent(this.createCloseButton());

        getSeedItems().forEach((seed, index) => {
            const seedRow = new SeedShopRow(
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

    private createCloseButton(): GameObjects.Container {
        const buttonBackground = this.scene.add.rectangle(262, -216, 32, 30, 0x8d3d30)
            .setStrokeStyle(2, 0xffe3a3)
            .setInteractive({ useHandCursor: true });
        const buttonLabel = this.scene.add.text(262, -217, 'X', {
            fontFamily: 'Arial Black',
            fontSize: 17,
            color: '#ffffff',
            stroke: '#1a100b',
            strokeThickness: 2
        }).setOrigin(0.5).setResolution(2);

        buttonBackground.on('pointerover', () => buttonBackground.setFillStyle(0xb84d38));
        buttonBackground.on('pointerout', () => buttonBackground.setFillStyle(0x8d3d30));
        buttonBackground.on('pointerdown', () => this.close());

        return this.scene.add.container(0, 0, [buttonBackground, buttonLabel]);
    }

    private createPanelDetails(): GameObjects.Container {
        const shadow = this.scene.add.rectangle(8, 10, 588, 488, 0x000000, 0.25);
        const parchment = this.scene.add.rectangle(0, 18, 538, 402, 0xffefc5, 0.98)
            .setStrokeStyle(3, 0xd39a3c);
        const topTrim = this.scene.add.rectangle(0, -192, 548, 30, 0x8a5a31)
            .setStrokeStyle(2, 0x4a2e1d);
        const bottomTrim = this.scene.add.rectangle(0, 204, 548, 24, 0x8a5a31)
            .setStrokeStyle(2, 0x4a2e1d);
        const titleBoard = this.scene.add.rectangle(0, -216, 368, 46, 0x5a3822)
            .setStrokeStyle(3, 0xe3a35a);
        const titleHighlight = this.scene.add.rectangle(0, -233, 344, 4, 0xb47a3f, 0.75);
        const shelfLine = this.scene.add.rectangle(0, -158, 500, 3, 0xd49b5c, 0.9);

        const leftPost = this.scene.add.rectangle(-282, 4, 24, 452, 0x7a4a29)
            .setStrokeStyle(2, 0x3d2416);
        const rightPost = this.scene.add.rectangle(282, 4, 24, 452, 0x7a4a29)
            .setStrokeStyle(2, 0x3d2416);

        return this.scene.add.container(0, 0, [
            shadow,
            parchment,
            leftPost,
            rightPost,
            topTrim,
            bottomTrim,
            titleBoard,
            titleHighlight,
            shelfLine
        ]);
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
