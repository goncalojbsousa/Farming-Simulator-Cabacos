import { GameObjects, Scene } from 'phaser';
import {
    farmPurchaseOptions,
    FarmPurchaseOption,
    LandOwnershipService
} from '../services/LandOwnershipService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { MenuPanel } from './MenuPanel';

type FarmRowView = {
    farmOption: FarmPurchaseOption;
    priceText: GameObjects.Text;
    buttonBackground: GameObjects.Rectangle;
    buttonLabel: GameObjects.Text;
};

export class FarmPurchasePanel {
    private menu: MenuPanel;
    private statusMessage: GameObjects.Text;
    private farmRows: FarmRowView[] = [];

    constructor(
        private scene: Scene,
        private money: MoneyService,
        private landOwnership: LandOwnershipService,
        private onPurchase: () => void
    ) {
        this.menu = new MenuPanel(scene, {
            width: 560,
            height: 360,
            title: translate('farmPurchaseTitle'),
            depth: 1200,
            closeButton: true
        });

        this.statusMessage = scene.add.text(0, 135, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffe7a3',
            align: 'center',
            wordWrap: { width: 430 }
        }).setOrigin(0.5);

        this.menu.addContent(this.statusMessage);

        farmPurchaseOptions.forEach((farmOption, index) => {
            this.menu.addContent(this.createFarmRow(farmOption, -40 + index * 82));
        });

        this.layout();
        this.close();
    }

    toggle(): void {
        this.statusMessage.setText('');
        this.refreshRows();
        this.menu.toggle();
    }

    close(): void {
        this.menu.close();
    }

    isOpen(): boolean {
        return this.menu.isOpen();
    }

    layout(): void {
        this.menu.center(true);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.menu.container];
    }

    private createFarmRow(
        farmOption: FarmPurchaseOption,
        rowY: number
    ): GameObjects.Container {
        const rowBackground = this.scene.add.rectangle(0, 0, 460, 64, 0x263f30, 0.95)
            .setStrokeStyle(2, 0x8b6b3f);
        const farmIcon = this.createFarmIcon(-188, 0);
        const farmName = this.scene.add.text(-155, -7, translate(farmOption.nameKey), {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#fff4d7'
        }).setOrigin(0, 0.5);

        const coinIcon = this.createCoinIcon(30, 0);
        const priceText = this.scene.add.text(55, 0, `${farmOption.price}$`, {
            fontFamily: 'Arial Black',
            fontSize: 17,
            color: '#ffe7a3'
        }).setOrigin(0, 0.5);

        const buttonBackground = this.scene.add.rectangle(166, 0, 118, 34, 0x2f6d38)
            .setStrokeStyle(3, 0x332015)
            .setInteractive({ useHandCursor: true });

        const buttonLabel = this.scene.add.text(166, 0, translate('buy'), {
            fontFamily: 'Arial Black',
            fontSize: 15,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 2
        }).setOrigin(0.5).setResolution(2);

        const row: FarmRowView = {
            farmOption,
            priceText,
            buttonBackground,
            buttonLabel
        };

        buttonBackground.on('pointerover', () => {
            if (!this.landOwnership.isFarmOwned(farmOption.farmId)) {
                buttonBackground.setFillStyle(0xb47a3f);
            }
        });

        buttonBackground.on('pointerout', () => this.refreshRow(row));
        buttonBackground.on('pointerdown', () => this.buyFarm(farmOption));

        this.farmRows.push(row);
        this.refreshRow(row);

        return this.scene.add.container(0, rowY, [
            rowBackground,
            farmIcon,
            farmName,
            coinIcon,
            priceText,
            buttonBackground,
            buttonLabel
        ]);
    }

    private buyFarm(farmOption: FarmPurchaseOption): void {
        if (this.landOwnership.isFarmOwned(farmOption.farmId)) {
            this.statusMessage.setText(translate('alreadyOwned'));
            return;
        }

        if (!this.money.canAfford(farmOption.price)) {
            this.statusMessage.setText(translate('notEnoughMoney'));
            return;
        }

        this.money.spend(farmOption.price);
        this.landOwnership.buyFarm(farmOption.farmId);
        this.onPurchase();
        this.refreshRows();
        this.statusMessage.setText(
            `${translate('landPurchased')} ${translate(farmOption.nameKey)}`
        );
    }

    private refreshRows(): void {
        for (const row of this.farmRows) {
            this.refreshRow(row);
        }
    }

    private refreshRow(row: FarmRowView): void {
        const isOwned = this.landOwnership.isFarmOwned(row.farmOption.farmId);
        row.priceText.setText(`${row.farmOption.price}$`);
        row.buttonLabel.setText(isOwned ? translate('owned') : translate('buy'));
        row.buttonBackground
            .setFillStyle(isOwned ? 0x6b6258 : 0x8a5a31)
            .setStrokeStyle(2, isOwned ? 0x4a4038 : 0xe3a35a);
    }

    private createFarmIcon(x: number, y: number): GameObjects.Container {
        const soil = this.scene.add.rectangle(x, y + 5, 34, 24, 0x8a5a31)
            .setStrokeStyle(2, 0x4a2e1d);
        const fieldLineOne = this.scene.add.rectangle(x, y + 3, 26, 3, 0xd49b5c);
        const fieldLineTwo = this.scene.add.rectangle(x, y + 10, 22, 3, 0xd49b5c);
        const sproutStem = this.scene.add.rectangle(x, y - 8, 3, 14, 0x4f8d3b);
        const sproutLeft = this.scene.add.ellipse(x - 6, y - 11, 12, 7, 0x6abf4b);
        const sproutRight = this.scene.add.ellipse(x + 6, y - 11, 12, 7, 0x6abf4b);

        return this.scene.add.container(0, 0, [
            soil,
            fieldLineOne,
            fieldLineTwo,
            sproutStem,
            sproutLeft,
            sproutRight
        ]);
    }

    private createCoinIcon(x: number, y: number): GameObjects.Container {
        const coin = this.scene.add.circle(x, y, 10, 0xd6a84f)
            .setStrokeStyle(2, 0xffe7a3);
        const shine = this.scene.add.circle(x - 3, y - 3, 2, 0xfff1c9);

        return this.scene.add.container(0, 0, [coin, shine]);
    }
}
