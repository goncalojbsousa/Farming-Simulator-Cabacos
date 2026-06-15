import { GameObjects, Scene } from 'phaser';
import { getHarvestItems, HarvestItem } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { playSound } from '../services/SoundService';
import { MenuPanel } from './MenuPanel';
import { ShopRow } from './ShopRow';

const panelWidth = 600;
const panelHeight = 500;
const panelCenterOffsetY = -56;
const firstCropRowY = -158;
const cropRowSpacing = 35;
const sellMessageY = 218;

export class CropMarketPanel {
    private menu: MenuPanel;
    private sellMessage: GameObjects.Text;

    constructor(
        private scene: Scene,
        private inventory: InventoryService,
        private money: MoneyService,
        private onSell: () => void
    ) {
        this.menu = new MenuPanel(scene, {
            width: panelWidth,
            height: panelHeight,
            depth: 1200,
            title: translate('cropMarketTitle'),
            closeButton: true
        });

        this.sellMessage = scene.add.text(0, sellMessageY, '', {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setResolution(2);

        this.menu.addContent(this.sellMessage);

        getHarvestItems().forEach((crop, index) => {
            const row = new ShopRow(
                scene,
                {
                    ...crop,
                    buyPrice: crop.sellPrice
                },
                firstCropRowY + index * cropRowSpacing,
                () => this.sellCrop(crop),
                translate('sell')
            );

            this.menu.addContent(row.container);
        });

        this.layout();
        this.close();
    }

    toggle(): void {
        this.sellMessage.setText('');
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

    private sellCrop(crop: HarvestItem): void {
        if (!this.inventory.removeOneItem(crop.id, this.inventory.selectedSlotIndex)) {
            this.sellMessage.setText(translate('noCropToSell'));
            playSound(this.scene, 'fail');
            return;
        }

        this.money.earn(crop.sellPrice);
        playSound(this.scene, 'sell');
        this.onSell();
        this.sellMessage.setText(
            `${translate('sold')} ${translate(crop.nameKey)}`
        );
    }
}
