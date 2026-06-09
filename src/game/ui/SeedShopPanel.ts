import { GameObjects, Scene } from 'phaser';
import { getSeedItems, SeedItem } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { SeedShopRow } from './SeedShopRow';
import { UiPanel } from './UiPanel';

export class SeedShopPanel {
    private panel: UiPanel;
    private purchaseMessage: GameObjects.Text;
    private panelIsOpen = false;

    constructor(
        private scene: Scene,
        private inventory: InventoryService,
        private money: MoneyService,
        private onPurchase: () => void
    ) {
        this.panel = new UiPanel(scene, {
            width: 560,
            height: 570,
            title: 'Loja de Sementes',
            depth: 1200
        });

        this.purchaseMessage = scene.add.text(0, 255, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffe7a3'
        }).setOrigin(0.5);

        this.panel.add(this.purchaseMessage);
        this.panel.add(this.createCloseButton());

        getSeedItems().forEach((seed, index) => {
            const seedRow = new SeedShopRow(
                scene,
                seed,
                -190 + index * 40,
                () => this.buySeed(seed)
            );

            this.panel.add(seedRow.container);
        });

        this.layout();
        this.close();
    }

    toggle(): void {
        this.panelIsOpen ? this.close() : this.open();
    }

    close(): void {
        this.panelIsOpen = false;
        this.panel.hide();
    }

    isOpen(): boolean {
        return this.panelIsOpen;
    }

    containsScreenPoint(x: number, y: number): boolean {
        return this.panel.containsPoint(x, y);
    }

    layout(): void {
        this.panel.centerOnScreen(true);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.panel.container];
    }

    private open(): void {
        this.panelIsOpen = true;
        this.purchaseMessage.setText('');
        this.panel.show();
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
            this.purchaseMessage.setText('Dinheiro insuficiente');
            return;
        }

        if (!this.inventory.addItem(seed.id, 1)) {
            this.purchaseMessage.setText('Inventario cheio');
            return;
        }

        this.money.spend(seed.buyPrice);
        this.onPurchase();
        this.purchaseMessage.setText(`Compraste ${translate(seed.nameKey)}`);
    }
}
