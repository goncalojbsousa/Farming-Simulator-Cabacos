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
            width: 500,
            height: 300,
            title: translate('farmPurchaseTitle'),
            depth: 1200
        });

        this.statusMessage = scene.add.text(0, 105, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffe7a3'
        }).setOrigin(0.5);

        this.menu.addContent(this.statusMessage);
        this.menu.addContent(this.createCloseButton());

        farmPurchaseOptions.forEach((farmOption, index) => {
            this.menu.addContent(this.createFarmRow(farmOption, -35 + index * 52));
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

    private createCloseButton(): GameObjects.Text {
        return this.scene.add.text(220, -125, 'X', {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.close());
    }

    private createFarmRow(
        farmOption: FarmPurchaseOption,
        rowY: number
    ): GameObjects.Container {
        const farmName = this.scene.add.text(-205, 0, translate(farmOption.nameKey), {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const priceText = this.scene.add.text(65, 0, `${farmOption.price}$`, {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffe7a3'
        }).setOrigin(1, 0.5);

        const buttonBackground = this.scene.add.rectangle(155, 0, 120, 32, 0x2f5d2c)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });

        const buttonLabel = this.scene.add.text(155, 0, translate('buy'), {
            fontFamily: 'Arial',
            fontSize: 15,
            color: '#ffffff'
        }).setOrigin(0.5);

        const row: FarmRowView = {
            farmOption,
            priceText,
            buttonBackground,
            buttonLabel
        };

        buttonBackground.on('pointerover', () => {
            if (!this.landOwnership.isFarmOwned(farmOption.farmId)) {
                buttonBackground.setFillStyle(0x3f7a39);
            }
        });

        buttonBackground.on('pointerout', () => this.refreshRow(row));
        buttonBackground.on('pointerdown', () => this.buyFarm(farmOption));

        this.farmRows.push(row);
        this.refreshRow(row);

        return this.scene.add.container(0, rowY, [
            farmName,
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
        row.priceText.setText(isOwned ? translate('owned') : `${row.farmOption.price}$`);
        row.buttonLabel.setText(isOwned ? translate('owned') : translate('buy'));
        row.buttonBackground.setFillStyle(isOwned ? 0x58615b : 0x2f5d2c);
    }
}
